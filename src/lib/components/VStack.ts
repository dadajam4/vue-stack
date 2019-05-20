import {
  VNode,
  CreateElement,
  Component as VueComponent,
  AsyncComponent,
  VNodeChildren,
  VNodeData,
} from 'vue';
import { Component, Vue, Model, Watch, Prop } from 'vue-property-decorator';
import clickOutside from '../directives/click-outside';
import { toNumber, pushVNodeEvent } from '../utils';
import { NavigationGuard } from 'vue-router';

export interface RenderContentResult {
  tag:
    | string
    | VueComponent<any, any, any, any>
    | AsyncComponent<any, any, any, any>
    | (() => VueComponent);
  data?: VNodeData;
  children?: VNodeChildren;
}

export type VStackActivateSource = Event | Event['target'] | HTMLElement;

export const getElementByActivateSource = (
  source: VStackActivateSource,
): HTMLElement | void => {
  if (!source) return;
  if (source instanceof HTMLElement) return source;
  if (source instanceof Event) source = source.target;
  if (source && source instanceof HTMLElement) return source;
};

export type VStackCloseState = 'indeterminate' | 'resolve' | 'cancel';

export interface VStackCloseOption {
  force?: boolean;
  state?: VStackCloseState;
}

type DelayTimerProps = 'openDelay' | 'closeDelay';

@Component({
  name: 'v-stack',
  inheritAttrs: false,
  directives: {
    clickOutside,
  },
})
export default class VStack<V = any> extends Vue {
  $refs!: {
    content: HTMLElement;
  };

  @Model('change', { type: Boolean, default: false }) active!: boolean;
  @Prop({ type: String, default: 'vv-stack-fade' }) transition!: string;
  @Prop({ type: Boolean, default: false }) alwaysRender!: boolean;
  @Prop({ type: [Boolean, String] }) backdrop?: boolean | string;
  @Prop({ type: Boolean }) openOnHover!: boolean;
  @Prop({ type: Boolean }) openOnContextmenu!: boolean;
  @Prop({ type: [String, Number], default: 0 }) openDelay!: string | number;
  @Prop({ type: [String, Number], default: 200 }) closeDelay!: string | number;
  @Prop({ type: Boolean, default: true }) closeOnClick!: boolean;
  @Prop({ type: Boolean, default: true }) closeOnEsc!: boolean;
  @Prop({ type: Boolean, default: true }) closeOnNavigation!: boolean;
  @Prop({ type: Boolean }) persistent!: boolean;
  @Prop({ type: [Boolean, Function] }) navigationGuard?:
    | boolean
    | NavigationGuard;

  @Prop([String, Number]) zIndex?: string | number;
  @Prop() contentClass?: any;
  @Prop() contentStyle?: string | object[] | object;
  @Prop() value!: V;

  public renderedContent: VNode | null = null;
  public needRender: boolean = false;
  private innerActive: boolean = this.active;
  public stackId: number = null as any;
  private lastActivatorElement: HTMLElement | null = null;
  private delayTimers: number[] = [];
  private internalCloseState: VStackCloseState = 'indeterminate';
  private stackBooted: boolean = false;
  private initialValue: V = (this.value || null) as any;
  private internalValue: V = (this.value || null) as any;
  nowShowing: boolean = false;
  nowClosing: boolean = false;
  activateOrder: number = 0;

  get nowTransitioning() {
    return this.nowShowing || this.nowClosing;
  }

  get computedTransition() {
    return this.transition;
  }

  get closeState() {
    return this.internalCloseState;
  }

  get isResolved() {
    return this.closeState === 'resolve';
  }

  get isCanceled() {
    return this.closeState === 'cancel';
  }

  get payload() {
    return this.isResolved ? this.internalValue : (undefined as any);
  }

  set payload(payload: V) {
    if (this.internalValue !== payload) {
      this.internalValue = payload;
      this.$emit('payload', payload);
    }
  }

  get computedZIndex(): number {
    const { zIndex } = this;
    if (typeof zIndex === 'string') return parseInt(zIndex, 10);
    if (typeof zIndex === 'number') return zIndex;
    return this.$vstack.zIndex + this.activateOrder;
  }

  get $activator() {
    return this.lastActivatorElement;
  }

  get isActive(): boolean {
    return this.innerActive;
  }

  setToFront() {
    this.$vstack.setToFront(this);
  }

  stackIs(stack: VStack) {
    return this.stackId === stack.stackId;
  }

  set isActive(active: boolean) {
    if (this.innerActive !== active) {
      if (active) this.triggerContentReadyTick();
      this.innerActive = active;
      this.$emit('change', active);
      if (active) {
        this.nowShowing = true;
        this.setToFront();
        this.$emit('show', this);
      } else {
        this.nowClosing = true;
        this.$emit('close', this);
      }
    }
  }

  onEsc(event: KeyboardEvent) {
    this.closeOnEsc && this.cancel(false);
  }

  private clearDelay() {
    for (let timer of this.delayTimers) {
      clearTimeout(timer);
    }
    this.delayTimers = [];
  }

  private runDelay(prop: number | DelayTimerProps, cb: Function) {
    this.clearDelay();
    const ammount = typeof prop === 'number' ? prop : this[prop];
    if (!ammount) return cb();
    this.delayTimers.push(setTimeout(cb, toNumber(ammount)));
  }

  @Watch('innerActive', { immediate: true })
  protected onChangeInnerActive(active: boolean) {
    if (active) this.needRender = true;
  }

  @Watch('active')
  protected onChangeActiveHandler() {
    this.innerActive = this.active;
  }

  @Watch('value')
  protected onChangeValueHandler() {
    this.internalValue = this.value || (null as any);
    this.initialValue = this.internalValue;
  }

  @Watch('$route')
  protected onRouteChangeHandler() {
    this.closeOnNavigation && this.close();
  }

  resetValue() {
    this.payload = this.initialValue;
  }

  public setNeedRender(needRender: boolean) {
    this.activateOrder = 0;
    this.needRender = this.alwaysRender || needRender;
  }

  protected onContentReady() {}

  autofocus() {
    const { content } = this.$refs;
    if (!content) return;
    const target = content.querySelector('[autofocus]');
    if (target) {
      try {
        if (typeof (target as any).focus === 'function') {
          (target as any).focus();
        }
      } catch (err) {}
    }
  }

  protected triggerContentReadyTick(count: number = 0) {
    const { content } = this.$refs;
    if (content) {
      this.autofocus();
      this.onContentReady();
      return;
    }

    count++;

    if (count < 3) {
      this.$nextTick(() => {
        this.triggerContentReadyTick(count);
      });
    }
  }

  private setActivator(activator?: HTMLElement | null) {
    this.lastActivatorElement = activator || null;
  }

  public show(activateSource?: VStackActivateSource) {
    this.setActivator(
      (activateSource && getElementByActivateSource(activateSource)) ||
        undefined,
    );

    // Fix for bubbling cue.
    setTimeout(() => {
      this.isActive = true;
    }, 0);
  }

  public close(opts: VStackCloseOption = {}) {
    const { force = false, state = 'indeterminate' } = opts;
    if (!force && this.persistent) return;
    this.internalCloseState = state;
    this.isActive = false;
  }

  public resolve(payload?: V) {
    if (payload !== undefined) {
      this.payload = payload;
    }
    return this.close({
      force: true,
      state: 'resolve',
    });
  }

  public cancel(force?: boolean) {
    return this.close({
      force,
      state: 'cancel',
    });
  }

  public toggle(activateSource?: VStackActivateSource) {
    return this.isActive ? this.close() : this.show(activateSource);
  }

  protected created() {
    this.$vstack.add(this);
  }

  protected beforeDestroy() {
    this.clearNavigationGuard();
    this.$vstack.remove(this);
  }

  protected renderContent(h: CreateElement): RenderContentResult | void;
  protected renderContent(): RenderContentResult | void {
    const defaultSlot = this.$scopedSlots.default;
    return {
      tag: 'div',
      children: defaultSlot && defaultSlot(this),
    };
  }

  private mouseEnterHandler(e: MouseEvent) {
    if (this.nowTransitioning) return;
    this.clearDelay();
    !this.isActive &&
      this.runDelay('openDelay', () => {
        !this.isActive && this.show(e);
      });
  }

  private mouseLeaveHandler(e: MouseEvent) {
    this.clearDelay();
    this.isActive &&
      this.runDelay('closeDelay', () => {
        if (
          (this.$refs.content &&
            (e.relatedTarget === this.$refs.content ||
              this.$refs.content.contains(<HTMLElement>e.relatedTarget))) ||
          (this.$activator &&
            (e.relatedTarget === this.$activator ||
              this.$activator.contains(<HTMLElement>e.relatedTarget)))
        )
          return;
        this.isActive && this.close();
      });
  }

  private _navigationGuardRemover?: Function;
  private clearNavigationGuard() {
    this._navigationGuardRemover && this._navigationGuardRemover();
    delete this._navigationGuardRemover;
  }

  @Watch('navigationGuard', { immediate: true })
  protected onChangeNavigationGuardHandler() {
    const { $router } = this;
    if (!$router) return;

    const { navigationGuard } = this;
    this.clearNavigationGuard();
    if (!navigationGuard) return;

    const guard =
      typeof navigationGuard === 'function'
        ? navigationGuard
        : (((to, from, next) => {
            this.isActive ? next(false) : next();
          }) as NavigationGuard);

    $router.beforeEach(guard);
  }

  protected mounted() {
    this.stackBooted = true;
    if (this.isActive) {
      this.setToFront();
      this.triggerContentReadyTick();
    }
  }

  isFrontStack() {
    return this.$vstack.isFront(this);
  }

  protected render(h: CreateElement): VNode | void {
    const { $scopedSlots, needRender, stackBooted } = this;

    const defaultSlot = $scopedSlots.default;
    const activatorSlot = $scopedSlots.activator;

    if (!needRender || !defaultSlot) {
      this.renderedContent = null;
      this.isActive = false;
    } else {
      if (stackBooted) {
        const info = this.renderContent(h);

        if (info) {
          let { tag, data, children } = info;

          data = data || {};
          data.attrs = {
            ...this.$attrs,
            ...data.attrs,
          };
          data.attrs['v-stack'] = this.stackId;

          let { contentClass, contentStyle } = this;

          if (contentClass) {
            data.class = data.class || [];
            if (!Array.isArray(data.class)) data.class = [data.class];
            if (!Array.isArray(contentClass)) contentClass = [contentClass];
            data.class = [...data.class, ...contentClass];
          }

          data.style = data.style || [];
          if (!Array.isArray(data.style)) data.style = [data.style];
          (data.style as object[]).push({
            zIndex: this.computedZIndex,
          });
          if (contentStyle) {
            if (!Array.isArray(contentStyle)) contentStyle = [contentStyle];
            data.style = (data.style as Array<any>).concat(contentStyle);
          }

          data.key = this.stackId;
          data.directives = data.directives || [];
          data.directives.push({
            name: 'show',
            value: this.isActive,
          });

          if (this.closeOnClick) {
            data.directives.push({
              name: 'click-outside',
              value: () => {
                if (!this.isFrontStack()) return;
                this.close();
              },
              args: {
                closeConditional: (e: MouseEvent) => {
                  return this.isActive;
                },
              },
            } as any);
          }

          if (this.openOnHover) {
            pushVNodeEvent(data, 'mouseenter', this.mouseEnterHandler);
            pushVNodeEvent(data, 'mouseleave', this.mouseLeaveHandler);
          }

          data.ref = 'content';
          this.renderedContent = h(tag, data, children);
        } else {
          this.renderedContent = null;
          this.isActive = false;
        }
      }
    }

    if (!activatorSlot) return;

    const activators = activatorSlot(this);
    const activator = activators && activators[0];

    if (!activator) return;

    activator.data = activator.data || {};
    const { data } = activator;

    const primaryTrigger = this.openOnContextmenu ? 'contextmenu' : 'click';
    pushVNodeEvent(data, primaryTrigger, (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      this.openOnContextmenu && e.preventDefault();
      this.toggle(e);
    });

    if (this.openOnHover) {
      pushVNodeEvent(data, 'mouseenter', this.mouseEnterHandler);
      pushVNodeEvent(data, 'mouseleave', this.mouseLeaveHandler);
    }
    return activator;
  }
}
