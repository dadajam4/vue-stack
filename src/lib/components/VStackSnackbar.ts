import { CreateElement, VNode, VNodeChildren } from 'vue';
import { Component, Mixins, Prop } from 'vue-property-decorator';
import VStack, { RenderContentResult } from './VStack';
import VStackSnackbarTransition, {
  SnackPosition,
} from './VStackSnackbarTransition';

@Component({
  name: 'v-stack-snackbar',
})
export default class VStackSnackbar extends Mixins<VStack>(VStack) {
  @Prop({ type: Boolean }) top!: boolean;
  @Prop({ type: Boolean }) bottom!: boolean;
  @Prop({ type: Boolean }) left!: boolean;
  @Prop({ type: Boolean }) right!: boolean;
  @Prop() closeBtn?: boolean | string;
  @Prop({ type: Boolean, default: false }) closeOnClick!: boolean;
  @Prop({ type: Boolean, default: false }) closeOnEsc!: boolean;
  @Prop({ type: Boolean, default: false }) closeOnNavigation!: boolean;
  @Prop({ type: [String, Number], default: 6000 }) timeout?: string | number;

  get computedTransition() {
    return VStackSnackbarTransition;
  }

  get computedPosition(): SnackPosition {
    let { top, bottom, left, right } = this;

    if (top === bottom) {
      top = false;
      bottom = true;
    }

    if (left && right) {
      left = false;
    }

    return {
      top,
      bottom,
      left,
      right,
    };
  }

  get transitionProps() {
    return {
      position: this.computedPosition,
    };
  }

  get computedCloseBtn(): string | false {
    const { closeBtn } = this;
    if (closeBtn === false) return false;
    return 'CLOSE';
  }

  get hasHorizontal() {
    const { left, right } = this.computedPosition;
    return left || right;
  }

  get snackClasses() {
    const { left, right, top, bottom } = this.computedPosition;
    return {
      'vv-stack-snackbar--top': top,
      'vv-stack-snackbar--bottom': bottom,
      'vv-stack-snackbar--left': left,
      'vv-stack-snackbar--right': right,
      'vv-stack-snackbar--x-center': !left && !right,
      'vv-stack-snackbar--has-horizontal': this.hasHorizontal,
    };
  }

  protected renderContent(h: CreateElement): RenderContentResult {
    const children: VNode[] = [];

    const { $scopedSlots, computedCloseBtn } = this;
    const { default: defaultSlot, close: closeSlot } = $scopedSlots;

    const $body = h(
      'div',
      {
        staticClass: 'vv-stack-snackbar__body',
      },
      defaultSlot ? defaultSlot(this) : undefined,
    );
    children.push($body);

    if (computedCloseBtn || closeSlot) {
      const actionChildren = closeSlot
        ? closeSlot(this)
        : [
            h(
              'button',
              {
                staticClass: 'vv-stack-snackbar__close',
                attrs: {
                  type: 'button',
                },
                on: {
                  click: (e: MouseEvent) => {
                    this.close();
                  },
                },
              },
              computedCloseBtn,
            ),
          ];

      const $actions = h(
        'div',
        {
          staticClass: 'vv-stack-snackbar__actions',
        },
        actionChildren,
      );
      children.push($actions);
    }

    return {
      tag: 'div',
      data: {
        staticClass: 'vv-stack-snackbar',
        class: this.snackClasses,
      },
      children: [
        h(
          'div',
          {
            staticClass: 'vv-stack-snackbar__inner',
          },
          children,
        ),
      ],
    };
  }
}
