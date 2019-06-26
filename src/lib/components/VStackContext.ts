import Vue, { CreateElement, VNode, VNodeChildren } from 'vue';
import { Component } from 'vue-property-decorator';
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
import {
  VueStackSettings,
  VueStackThemeName,
  vueStackThemeNames,
} from '../settings';
import { enableScroll, disableScroll } from '../prevent-scroll';
import { warn, error } from '../utils';

export interface VStackDynamicDialogOptions {
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
  theme?: VueStackThemeName;
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
  color?: string;
  content: VNodeChildren;
}

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

  private uid: number = 0;
  private internalTheme: VueStackThemeName = this.$vstackSettings.defaultTheme;
  stacks: VStack[] = [];
  width: number = 0;
  height: number = 0;
  private transitioningStackIds: number[] = [];
  private colorSchemeWatcherList: {
    list: MediaQueryList;
    handler: (ev: MediaQueryListEvent) => any;
  }[] = [];

  get theme() {
    return this.internalTheme;
  }

  get computedTheme() {
    return this.theme;
  }

  set theme(theme: VueStackThemeName) {
    if (this.internalTheme !== theme) {
      this.internalTheme = theme;
    }
  }

  get zIndex() {
    return this.$vstackSettings.zIndex;
  }

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

  private scrollStoppers: number[] = [];

  pushScrollStop(stack: VStack) {
    if (stack.stopDocumentScroll) {
      const { stackId } = stack;
      if (!this.scrollStoppers.includes(stackId)) {
        this.scrollStoppers.push(stackId);
        this.scrollStopCheck();
      }
    }
  }

  removeScrollStop(stack: VStack) {
    const index = this.scrollStoppers.indexOf(stack.stackId);
    if (index !== -1) {
      this.scrollStoppers.splice(index, 1);
      this.scrollStopCheck();
    }
  }

  private internalScrollStoped: boolean = false;

  private scrollStopCheck() {
    const before = this.internalScrollStoped;
    const now = this.scrollStoppers.length > 0;
    if (before === now) return;
    this.internalScrollStoped = now;
    if (now) {
      disableScroll();
    } else {
      enableScroll();
    }
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

  getString(key: keyof VueStackSettings['strings']): VNodeChildren {
    const string = this.$vstackSettings.strings[key];
    return typeof string === 'function' ? string(this) : string;
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
    const _settings: VStackSnackbarDynamicSettings =
      typeof contentOrSettings === 'object'
        ? contentOrSettings
        : {
            content: contentOrSettings,
          };

    const settings = {
      ...this.$vstackSettings.snackbar,
      ..._settings,
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
      transition,
      backdrop,
      closeOnEsc,
      persistent,
      navigationGuard,
      minWidth,
      maxWidth,
      theme,
    } = {
      ...this.$vstackSettings.dialog,
      ...opts,
    };

    return this.dynnamic({
      Ctor: VStackDialog,
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
          theme,
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
        text: this.getString('ok'),
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
        text: this.getString('cancel'),
        spacer: true,
        outline: true,
        click: dialog => {
          dialog.resolve(false);
        },
      },
      {
        type: 'ok',
        text: this.getString('ok'),
        autofocus: true,
        click: dialog => {
          dialog.resolve(true);
        },
      },
    ];
    return this.dialog<boolean>(opts);
  }

  get themeSettings() {
    return this.$vstackSettings.themes[this.computedTheme];
  }

  get themeBackgroundColor() {
    return this.themeSettings.background;
  }

  get themeTextColor() {
    return this.themeSettings.text;
  }

  get themeStyles() {
    return {
      backgroundColor: this.themeBackgroundColor,
      color: this.themeTextColor,
    };
  }

  get themeCaptionColor() {
    return this.themeSettings.text;
  }

  get themeBackdropColor() {
    return this.themeSettings.backdrop;
  }

  getThemeContextColor(key: string, theme = this.theme) {
    let colorMap = this.$vstackSettings.themes[theme].contexts[key];
    if (!colorMap && this.computedTheme !== this.$vstackSettings.defaultTheme) {
      colorMap = this.$vstackSettings.themes[this.$vstackSettings.defaultTheme]
        .contexts[key];
      if (!colorMap) {
        warn(`missing context color at ${key}`);
        colorMap = { base: '', text: '' };
      }
    }
    return colorMap;
  }

  protected render(h: CreateElement): VNode {
    const { stacks } = this;
    return h(
      'div',
      {
        staticClass: 'v-stack-context',
        style: this.themeStyles,
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

  private startWatchColorScheme() {
    if (!this.$vstackSettings.usePrefersColorScheme) return;
    this.stopWatchColorScheme();
    vueStackThemeNames.forEach(name => {
      const list = window.matchMedia(`(prefers-color-scheme: ${name})`);
      if (list.matches) {
        this.theme = name;
      }
      const handler = (ev: MediaQueryListEvent) => {
        if (ev.matches) {
          this.theme = name;
        }
      };
      list.addListener(handler);
      this.colorSchemeWatcherList.push({ list, handler });
    });
  }

  private stopWatchColorScheme() {
    this.colorSchemeWatcherList.forEach(row => {
      row.list.removeListener(row.handler);
    });
    this.colorSchemeWatcherList = [];
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
      this.startWatchColorScheme();
    }
  }

  protected beforeDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('load', this.updateContainerRect, false);
      window.removeEventListener('resize', this.updateContainerRect, false);
      document.removeEventListener('keydown', this.keyDownHandler, false);
      this.stopWatchColorScheme();
    }
  }
}
