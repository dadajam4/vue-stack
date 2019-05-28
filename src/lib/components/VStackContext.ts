import Vue, { CreateElement, VNode, VNodeChildren } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { NavigationGuard } from 'vue-router';
import {
  VStack,
  VStackContainer,
  VStackDynamicContainer,
  VStackDynamicSetting,
  VStackDialog,
  VStackDialogAction,
  VStackSnackbar,
} from './';
import { error } from '../utils';

export interface VStackDynamicDialogOptions {
  Ctor?: typeof VStackDialog;
  transition?: string;
  backdrop?: boolean | string;
  closeOnEsc?: boolean;
  persistent?: boolean;
  navigationGuard?: boolean | NavigationGuard;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  header?: VNodeChildren;
  actions?: VStackDialogAction[];
  content?: VNodeChildren;
}

export type VStackDialogBaseSetting = Omit<
  VStackDynamicDialogOptions,
  'header' | 'actions' | 'content'
>;

export interface VStackSnackbarDynamicSettings {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  closeBtn?: boolean | string;
  timeout?: number;
  content: VNodeChildren;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// import { error } from '../utils';
declare module 'vue/types/vue' {
  interface Vue {
    $vstack: VStackContext;
    $snackbar: VStackContext['snackbar'];
    $dialog: VStackContext['dialog'];
    $alert: VStackContext['alert'];
    $confirm: VStackContext['confirm'];
  }
}

@Component({
  name: 'v-stack-context',
  provide() {
    return {
      stackContext: this,
    };
  },
})
export default class VStackContext extends Vue {
  $refs!: {
    container: VStackContainer;
    dynamicContainer: VStackDynamicContainer;
  };

  @Prop({ type: Number, default: 32767 }) zIndex!: number;
  @Prop({ type: Object, default: (): VStackDialogBaseSetting => ({}) })
  dialogSetting!: VStackDialogBaseSetting;

  private uid: number = 0;
  stacks: VStack[] = [];
  width: number = 0;
  height: number = 0;
  private transitioningStackIds: number[] = [];

  get container() {
    return this.$refs.container;
  }

  get dynamicContainer() {
    return this.$refs.dynamicContainer;
  }

  createId(): number {
    const id = this.uid + 1;
    this.uid = id;
    return id;
  }

  add(stack: VStack): number {
    let index = -1;
    if (!this.stacks.includes(stack)) {
      stack.stackId = this.createId();
      index = this.stacks.push(stack);
    }
    return index;
  }

  remove(stack: VStack): VStack[] {
    const index = this.stacks.indexOf(stack);
    return this.stacks.splice(index, 1);
  }

  getFront(): VStack | undefined {
    const stacks = this.stacks.filter(stack => stack.isActive);
    const { length } = stacks;
    if (length === 0) return;
    let maxVm: VStack = null as any;
    let maxActivateOrder: number = 0;
    stacks.forEach(stack => {
      const { activateOrder } = stack;
      if (activateOrder > maxActivateOrder) {
        maxActivateOrder = activateOrder;
        maxVm = stack;
      }
    });
    return maxVm;
  }

  setToFront(stack: VStack) {
    const front = this.getFront();
    const maxActivateOrder = front ? front.activateOrder : 0;
    stack.activateOrder = maxActivateOrder + 1;
  }

  isFront(stack: VStack): boolean {
    const frontStack = this.getFront();
    return !!frontStack && frontStack.stackIs(stack);
  }

  addTransitioningStack(stackOrId: VStack | number) {
    const id = typeof stackOrId === 'number' ? stackOrId : stackOrId.stackId;
    if (!this.transitioningStackIds.includes(id)) {
      this.transitioningStackIds.push(id);
    }
  }

  removeTransitioningStack(stackOrId: VStack | number) {
    const id = typeof stackOrId === 'number' ? stackOrId : stackOrId.stackId;
    const index = this.transitioningStackIds.indexOf(id);
    if (index !== -1) {
      this.transitioningStackIds.splice(index, 1);
    }
  }

  get hasAnyTransitioningStack(): boolean {
    return this.transitioningStackIds.length > 0;
  }

  updateContainerRect() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  dynnamic<V = any>(setting: VStackDynamicSetting) {
    const { dynamicContainer } = this;
    if (!dynamicContainer) {
      console.warn(setting);
      throw error('You need an instance of VStackDynamicContainer.');
    }
    return dynamicContainer.push<V>(setting);
  }

  snackbar(
    contentOrSettings: string | VStackSnackbarDynamicSettings,
  ): Promise<any> {
    const settings: VStackSnackbarDynamicSettings =
      typeof contentOrSettings === 'object'
        ? contentOrSettings
        : {
            content: contentOrSettings,
          };

    const { content } = settings;
    const props = {
      ...settings,
    };
    delete props.content;

    return this.dynnamic({
      Ctor: VStackSnackbar,
      data: {
        props,
      },
      children: content,
    });
  }

  dialog<V = any>(opts: VStackDynamicDialogOptions): Promise<V> {
    const {
      transition = 'vv-stack-slide-y',
      backdrop = true,
      closeOnEsc = true,
      persistent = false,
      navigationGuard = true,
      minWidth = 280,
      maxWidth = 540,
    } = {
      ...this.dialogSetting,
      ...opts,
    };

    return this.dynnamic({
      Ctor: opts.Ctor || this.dialogSetting.Ctor || VStackDialog,
      data: {
        props: {
          header: opts.header,
          actions: opts.actions,
          transition,
          backdrop,
          closeOnEsc,
          persistent,
          navigationGuard,
          width: opts.width,
          minWidth,
          maxWidth,
        },
      },
      children: opts.content,
    });
  }

  alert(opts: VStackDynamicDialogOptions | string): Promise<void> {
    const content: VNodeChildren =
      typeof opts === 'string' ? opts : opts.content;
    opts = {
      ...(typeof opts === 'string' ? undefined : opts),
      content,
    };
    opts.actions = opts.actions || [
      {
        type: 'ok',
        text: 'OK',
        autofocus: true,
        spacer: true,
        click: dialog => {
          dialog.resolve(true);
        },
      },
    ];
    return this.dialog<void>(opts);
  }

  confirm(opts: VStackDynamicDialogOptions | string): Promise<boolean> {
    const content: VNodeChildren =
      typeof opts === 'string' ? opts : opts.content;
    opts = {
      ...(typeof opts === 'string' ? undefined : opts),
      content,
    };
    opts.actions = opts.actions || [
      {
        type: 'cancel',
        text: 'キャンセル',
        autofocus: true,
        spacer: true,
        click: dialog => {
          dialog.resolve(false);
        },
      },
      {
        type: 'ok',
        text: 'OK',
        click: dialog => {
          dialog.resolve(true);
        },
      },
    ];
    return this.dialog<boolean>(opts);
  }

  protected render(h: CreateElement): VNode {
    const { stacks } = this;
    return h(
      'div',
      {
        staticClass: 'vv-stack-context',
      },
      [
        h(VStackContainer, {
          props: {
            stacks,
          },
          ref: 'container',
        }),
        h(VStackDynamicContainer, {
          ref: 'dynamicContainer',
        }),
      ],
    );
  }

  private keyDownHandler(e: KeyboardEvent) {
    if (e.defaultPrevented) return;

    if (e.which === 27) {
      const frontStack = this.getFront();
      frontStack && frontStack.onEsc(e);
    }
  }

  protected created() {
    if (this.$vstack) {
      this.$vstack.$destroy();
    }

    Object.defineProperty(Vue.prototype, '$vstack', {
      enumerable: true,
      configurable: true,
      get: () => {
        return this;
      },
    });

    Vue.prototype.$snackbar = this.snackbar;
    Vue.prototype.$dialog = this.dialog;
    Vue.prototype.$alert = this.alert;
    Vue.prototype.$confirm = this.confirm;

    if (typeof window !== 'undefined') {
      this.updateContainerRect();
      window.addEventListener('load', this.updateContainerRect, false);
      window.addEventListener('resize', this.updateContainerRect, false);
      document.addEventListener('keydown', this.keyDownHandler, false);
    }
  }

  protected beforeDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('load', this.updateContainerRect, false);
      window.removeEventListener('resize', this.updateContainerRect, false);
      document.removeEventListener('keydown', this.keyDownHandler, false);
    }
  }
}
