import {
  VNode,
  CreateElement,
  Component as VueComponent,
  AsyncComponent,
  VNodeChildren,
  VNodeData,
  FunctionalComponentOptions,
} from 'vue';
import { Component, Vue, Model, Watch, Prop } from 'vue-property-decorator';
import clickOutside from '../directives/click-outside';
import {
  toNumber,
  pushVNodeEvent,
  attemptFocus,
  focusFirstDescendant,
} from '../utils';
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
    backdrop: HTMLElement;
    content: HTMLElement;
  };

  @Model('change', { type: Boolean, default: false }) active!: boolean;
  @Prop({ type: [String, Object], default: 'v-stack-fade' }) transition!:
    | string
    | FunctionalComponentOptions;
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
  @Prop({ type: [String, Number] }) timeout?: string | number;
  @Prop({ type: Boolean }) noClickAnimation!: boolean;
  @Prop({ type: [Boolean, Function] }) navigationGuard?:
    | boolean
    | NavigationGuard;

  @Prop([String, Number]) zIndex?: string | number;
  @Prop() contentClass?: any;
  @Prop() contentStyle?: string | object[] | object;
  @Prop({ type: Boolean }) stopDocumentScroll!: boolean;
  @Prop() value!: V;
  @Prop({ type: Boolean }) focusTrap!: boolean;

  public needRender: boolean = false;
  private innerActive: boolean = this.active;
  public stackId: number = null as any;
  private lastActivatorElement: HTMLElement | null = null;
  private delayTimers: number[] = [];
  private internalCloseState: VStackCloseState = 'indeterminate';
  private internalMounted: boolean = false;
  private initialValue: V = (this.value || null) as any;
  private internalValue: V = (this.value || null) as any;
  private activatorNode?: VNode;
  private hasDetached: boolean = false;
  private stackIsDestroyed: boolean = false;
  private stackTimeoutId: number | null = null;

  nowShowing: boolean = false;
  nowClosing: boolean = false;
  activateOrder: number = 0;
  isBooted: boolean = false;

  get computedTimeout(): number | void {
    const { timeout } = this;
    if (!timeout) return;
    return toNumber(timeout);
  }

  get transitionProps(): any {
    return undefined;
  }

  get isMounted() {
    return this.internalMounted;
  }

  get hasContent() {
    return this.isMounted && this.isBooted;
  }

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
    this.setIsActive(active);
  }

  private setIsActive(active: boolean, withEmit = true) {
    if (active) this.isBooted = true;

    if (this.innerActive !== active) {
      this.clearStackTimeoutId();
      if (active) this.triggerContentReadyTick();
      this.innerActive = active;
      withEmit && this.$emit('change', active);
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

  private clearStackTimeoutId() {
    if (this.stackTimeoutId !== null) {
      clearTimeout(this.stackTimeoutId);
      this.stackTimeoutId = null;
    }
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

  @Watch('hasContent')
  protected onChangeHasContentHandler() {
    this.initDetach();
  }

  @Watch('innerActive', { immediate: true })
  protected onChangeInnerActive(active: boolean) {
    if (active) {
      this.setNeedRender(true);
    }
    this.checkFocusTrap();
  }

  private _focusTrapper?: (ev: FocusEvent) => void;

  private checkFocusTrap() {
    if (this.$isServer) return;
    if (this.isActive) {
      this.setupFocusTrapper();
    } else {
      this.removeFocusTrapper();
    }
  }

  private trapFocus(ev: FocusEvent) {
    const { content } = this.$refs;
    if (!content) return;
    if (content.contains(ev.target as any)) {
      return;
    }

    for (let i = 0; i < content.childNodes.length; i++) {
      const child = content.childNodes[i];
      if (
        attemptFocus(child as HTMLElement) ||
        focusFirstDescendant(child as HTMLElement)
      ) {
        return true;
      }
    }

    console.log('?????');
    return false;
    // console.warn(ev);
    // ev.preventDefault();
  }

  private setupFocusTrapper() {
    this.removeFocusTrapper();
    this._focusTrapper = (ev: FocusEvent) => {
      if (this.$vstack.isFront(this)) {
        this.trapFocus(ev);
      }
    };
    document.addEventListener('focus', this._focusTrapper, true);
  }

  private removeFocusTrapper() {
    if (this._focusTrapper) {
      document.removeEventListener('focus', this._focusTrapper, true);
      delete this._focusTrapper;
    }
  }

  @Watch('active', { immediate: true })
  protected onChangeActiveHandler(active: boolean) {
    this.setIsActive(active, false);
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
    if (!needRender) this.activateOrder = 0;
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
    if (content && this.hasDetached) {
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
    try {
      const { content, backdrop } = this.$refs;
      if (content) {
        const { parentNode } = content;
        if (parentNode) {
          parentNode.removeChild(content);
          parentNode.removeChild(backdrop);
        }
      }

      const { activatorNode } = this;
      if (activatorNode) {
        const { elm } = activatorNode;
        if (elm) {
          const { parentNode } = elm;
          if (parentNode) {
            parentNode.removeChild(elm);
          }
        }
      }
    } catch (e) {}

    this.removeFocusTrapper();
    this.clearStackTimeoutId();
    this.stackIsDestroyed = true;
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

  @Watch('alwaysRender', { immediate: true })
  protected onChangeAlwaysRenderHandler(alwaysRender: boolean) {
    if (alwaysRender) {
      this.isBooted = true;
      this.setNeedRender(true);
    }
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

  private initDetach() {
    this.$nextTick(() => {
      const { content, backdrop } = this.$refs;
      if (this.stackIsDestroyed || this.hasDetached || !content) return;

      const target =
        document.querySelector('[v-stack-container]') || document.body;

      target.insertBefore(content, target.firstChild);

      if (backdrop) {
        target.insertBefore(backdrop, target.firstChild);
      }
      this.hasDetached = true;
    });
  }

  protected beforeMount() {
    this.$nextTick(() => {
      const { activatorNode } = this;
      if (activatorNode) {
        const { parentNode } = this.$el;
        if (parentNode) {
          const { elm } = activatorNode;
          elm && parentNode.insertBefore(elm, this.$el);
        }
      }
    });
  }

  protected mounted() {
    this.internalMounted = true;
    this.initDetach();
    if (this.isActive) {
      this.setToFront();
      this.triggerContentReadyTick();
      this.checkFocusTrap();
    }
  }

  protected deactivated() {
    this.isActive = false;
  }

  isFrontStack() {
    return this.$vstack.isFront(this);
  }

  private genActivator(): VNode | undefined {
    const activatorSlot = this.$scopedSlots.activator;
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

  private genBackdrop() {
    const { backdrop, $createElement: h } = this;
    if (!backdrop) return;
    const $backdrop = h('div', {
      staticClass: 'v-stack-backdrop',
      style: {
        zIndex: this.computedZIndex,
        backgroundColor: this.$vstack.themeBackdropColor,
      },
      directives: [{ name: 'show', value: this.isActive }],
      ref: 'backdrop',
      key: `${this.stackId}-backdrop`,
    });
    return h(
      'transition',
      {
        props: {
          name: 'v-stack-fade',
        },
      },
      [$backdrop],
    );
  }

  private outsideClickAnimating: boolean = false;
  private outsideClickAnimateTimerId: number | null = null;

  protected animateByOutsideClick() {
    this.outsideClickAnimating = false;
    this.$nextTick(() => {
      this.outsideClickAnimating = true;
      if (this.outsideClickAnimateTimerId !== null) {
        clearTimeout(this.outsideClickAnimateTimerId);
      }
      this.outsideClickAnimateTimerId = window.setTimeout(
        () => (this.outsideClickAnimating = false),
        150,
      );
    });
  }

  protected closeConditional(e: MouseEvent) {
    if (
      this.nowShowing ||
      !this.isFrontStack() ||
      this.$vstack.hasAnyTransitioningStack
    ) {
      return false;
    }

    if (this.persistent) {
      if (!this.noClickAnimation && e.target === this.$refs.backdrop) {
        this.animateByOutsideClick();
      }

      return false;
    }

    return this.isActive;
  }

  private genContent(): VNode | undefined {
    const { needRender, $scopedSlots, hasContent, $createElement: h } = this;
    const defaultSlot = $scopedSlots.default;

    if (!needRender || !hasContent || !defaultSlot) return;

    const info = this.renderContent(h);
    if (!info) return;

    let { tag, data, children } = info;

    data = data || {};
    data.attrs = {
      ...this.$attrs,
      ...data.attrs,
    };
    data.attrs['v-stack'] = this.stackId;

    if (this.outsideClickAnimating) {
      data.attrs['v-stack--outside-click-animate'] = '';
    }

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
          this.close();
        },
        args: {
          closeConditional: this.closeConditional,
        },
      } as any);
    }

    if (this.openOnHover) {
      pushVNodeEvent(data, 'mouseenter', this.mouseEnterHandler);
      pushVNodeEvent(data, 'mouseleave', this.mouseLeaveHandler);
    }

    data.on = data.on || {};
    data.on.click = data.on.click || [];
    if (!Array.isArray(data.on.click)) data.on.click = [data.on.click];
    data.on.click.push((e: MouseEvent) => {
      e.stopPropagation();
    });

    data.ref = 'content';

    return h(tag, data, children);
  }

  protected render(h: CreateElement): VNode | void {
    const children: VNode[] = [];
    const activator = this.genActivator();
    const backdrop = this.genBackdrop();
    const content = this.genContent();

    if (activator) {
      children.push(activator);
      this.activatorNode = activator;
    } else {
      delete this.activatorNode;
    }

    if (backdrop) children.push(backdrop);

    const { computedTransition } = this;
    const transitionChildren = content ? [content] : undefined;

    const transitionListeners = {
      beforeEnter: (el: HTMLElement) => {
        this.$vstack.addTransitioningStack(this);
        this.$emit('beforeEnter', this, el);
      },
      afterEnter: (el: HTMLElement) => {
        this.nowShowing = false;
        this.nowClosing = false;
        this.$vstack.removeTransitioningStack(this);
        this.clearStackTimeoutId();
        if (this.computedTimeout) {
          this.stackTimeoutId = window.setTimeout(() => {
            this.clearStackTimeoutId();
            this.close({ force: true });
          }, this.computedTimeout);
        }
        this.$emit('afterEnter', this, el);
      },
      enterCancelled: (el: HTMLElement) => {
        this.nowShowing = false;
        this.nowClosing = false;
        this.$vstack.removeTransitioningStack(this);
      },
      beforeLeave: (el: HTMLElement) => {
        this.$vstack.addTransitioningStack(this);
        this.$emit('beforeLeave', this, el);
      },
      afterLeave: (el: HTMLElement) => {
        this.nowShowing = false;
        this.nowClosing = false;
        this.setNeedRender(false);
        this.$vstack.removeTransitioningStack(this);
        this.$emit('afterLeave', this, el);
      },
      leaveCancelled: (el: HTMLElement) => {
        this.nowShowing = false;
        this.nowClosing = false;
        this.$vstack.removeTransitioningStack(this);
      },
    };

    const transition =
      typeof computedTransition === 'string'
        ? h(
            'transition',
            {
              props: {
                name: computedTransition,
              },
              on: transitionListeners,
            },
            transitionChildren,
          )
        : h(
            computedTransition,
            {
              props: this.transitionProps,
              on: transitionListeners,
            },
            transitionChildren,
          );

    children.push(transition);

    return h(
      'div',
      {
        attrs: {
          'v-stack-flagment': '',
        },
        staticStyle: {
          display: 'none',
        },
      },
      children,
    );
  }
}
