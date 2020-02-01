import { CreateElement, VNode, VNodeChildren } from 'vue';
import { Component, Mixins, Prop } from 'vue-property-decorator';
import VStack, { RenderContentResult } from './VStack';
import VStackThemeItem from './VStackThemeItem';
import VStackBtn from './VStackBtn';
import VStackSnackbarTransition, {
  SnackPosition,
} from './VStackSnackbarTransition';

@Component({
  name: 'v-stack-snackbar',
})
export default class VStackSnackbar extends Mixins<VStack, VStackThemeItem>(
  VStack,
  VStackThemeItem,
) {
  @Prop({ type: Boolean }) top!: boolean;
  @Prop({ type: Boolean }) bottom!: boolean;
  @Prop({ type: Boolean }) left!: boolean;
  @Prop({ type: Boolean }) right!: boolean;
  @Prop() closeBtn?: VNodeChildren | boolean;
  @Prop({ type: Boolean, default: false }) closeOnClick!: boolean;
  @Prop({ type: Boolean, default: false }) closeOnEsc!: boolean;
  @Prop({ type: Boolean, default: false }) closeOnNavigation!: boolean;
  @Prop({ type: [String, Number], default: 6000 }) timeout?: string | number;

  get computedColor() {
    return this.color || this.$vstackSettings.snackbar.color || 'dark';
  }

  get snackStyles() {
    const { contextColor } = this;
    return {
      backgroundColor: contextColor.base,
      color: contextColor.text,
    };
  }

  get computedTransition() {
    /**
     * @todo
     *   any
     */
    return VStackSnackbarTransition as any;
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

  get computedCloseBtn(): VNodeChildren | false {
    const { closeBtn } = this;
    if (closeBtn === false || closeBtn === null) return false;
    if (closeBtn === true || closeBtn === undefined)
      return this.$vstack.getString('close');
    return closeBtn;
  }

  get hasHorizontal() {
    const { left, right } = this.computedPosition;
    return left || right;
  }

  get snackClasses() {
    const { left, right, top, bottom } = this.computedPosition;
    return {
      'v-stack-snackbar--top': top,
      'v-stack-snackbar--bottom': bottom,
      'v-stack-snackbar--left': left,
      'v-stack-snackbar--right': right,
      'v-stack-snackbar--x-center': !left && !right,
      'v-stack-snackbar--has-horizontal': this.hasHorizontal,
    };
  }

  protected renderContent(h: CreateElement): RenderContentResult {
    const children: VNode[] = [];

    const { $scopedSlots, computedCloseBtn } = this;
    const { default: defaultSlot, close: closeSlot } = $scopedSlots;

    const $body = h(
      'div',
      {
        staticClass: 'v-stack-snackbar__body',
      },
      defaultSlot ? defaultSlot(this) : undefined,
    );
    children.push($body);

    if (computedCloseBtn || closeSlot) {
      let $close: VNodeChildren;
      if (closeSlot) {
        $close = closeSlot(this);
      } else {
        if (typeof computedCloseBtn === 'string') {
          $close = [
            h(
              VStackBtn,
              {
                staticClass: 'v-stack-snackbar__close',
                attrs: {
                  autofocus: true,
                },
                props: {
                  type: 'button',
                  flat: true,
                  color: 'accent',
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
        } else {
          $close = computedCloseBtn;
        }
      }

      const $actions = h(
        'div',
        {
          staticClass: 'v-stack-snackbar__actions',
        },
        $close,
      );
      children.push($actions);
    }

    return {
      tag: 'div',
      data: {
        staticClass: 'v-stack-snackbar',
        class: this.snackClasses,
        style: this.snackStyles,
      },
      children: [
        h(
          'div',
          {
            staticClass: 'v-stack-snackbar__inner',
          },
          children,
        ),
      ],
    };
  }
}
