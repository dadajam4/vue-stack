import { VNode, CreateElement, VNodeData } from 'vue';
import { Component, Prop, Mixins } from 'vue-property-decorator';
import { RawLocation } from 'vue-router';
import ripple, { RippleOptions } from '../mixins/ripple';
import VStackThemeItem from './VStackThemeItem';

export const CLICKABLE_TAGS = ['a', 'button', 'router-link', 'nuxt-link'];

@Component({
  name: 'v-stack-btn',
  directives: {
    ripple,
  },
})
export default class VStackBtn extends Mixins<VStackThemeItem>(
  VStackThemeItem,
) {
  $el!: HTMLAnchorElement | HTMLButtonElement;

  @Prop({ type: String, default: 'button' }) tag?: string;
  @Prop({ type: Boolean }) disabled!: boolean;
  @Prop({ type: Boolean }) append!: boolean;
  @Prop({ type: Boolean }) exact!: boolean;
  @Prop({ type: Boolean }) replace!: boolean;
  @Prop({ type: [String, Object] }) to?: RawLocation;
  @Prop({ type: String }) href?: string;
  @Prop({ type: String }) target?: string;
  @Prop({ type: String }) type?: string;
  @Prop({ type: [String, Number] }) tabindex?: string | number;
  @Prop({ type: Boolean }) depressed!: boolean;
  @Prop({
    type: [Boolean, Object],
    default: null,
  })
  ripple!: RippleOptions | boolean | null;

  get arrowAction() {
    return this.isClickableTag && !this.disabled;
  }

  get computedRipple(): RippleOptions | boolean {
    const defaultRipple = true;
    if (this.disabled) return false;
    else return this.ripple !== null ? this.ripple : defaultRipple;
  }

  get classes() {
    const classes: { [key: string]: boolean } = {
      'v-stack-btn--fill': this.fill,
      'v-stack-btn--flat': this.flat,
      'v-stack-btn--outline': this.outline,
      'v-stack-btn--noaction': !this.arrowAction,
      'v-stack-btn--disabled': this.disabled,
      'v-stack-btn--depressed': this.depressed,
    };
    return classes;
  }

  get computedColor() {
    if (this.disabled) return 'muted';
    return this.color || 'primary';
  }

  get styles() {
    return {
      ...this.contextColorStyles,
    };
  }

  get computedTag(): string {
    let { tag, to } = this;
    if (to) {
      tag = this.$nuxt ? 'nuxt-link' : 'router-link';
    } else if (this.href || !tag) {
      tag = 'a';
    }
    return tag;
  }

  get isClickableTag(): boolean {
    return CLICKABLE_TAGS.includes(this.computedTag);
  }

  focus() {
    return this.$el.focus();
  }

  blur() {
    return this.$el.blur();
  }
  private clickHandler(e: MouseEvent) {
    if (!this.arrowAction) {
      e.preventDefault();
      return;
    }
    this.$emit('click', e);
  }

  protected render(h: CreateElement): VNode {
    const {
      computedTag: tag,
      $listeners,
      disabled,
      to,
      exact,
      append,
      replace,
      href,
      target,
      type,
      tabindex,
      arrowAction,
    } = this;

    const data: VNodeData = {
      staticClass: 'v-stack-btn',
      class: this.classes,
      style: this.styles,
      attrs: {
        disabled,
        tabindex: arrowAction ? tabindex : '-1',
      },
      nativeOn: to
        ? {
            click: this.clickHandler,
          }
        : undefined,
      on: {
        ...$listeners,
        focus: (e: FocusEvent) => {
          this.$emit('focus', e);
        },
        blur: (e: FocusEvent) => {
          this.$emit('blur', e);
        },
        ...(!to
          ? {
              click: this.clickHandler,
            }
          : undefined),
      },
      directives: [
        {
          name: 'ripple',
          value: this.computedRipple,
        },
      ],
    };

    if (to) {
      data.props = {
        ...data.props,
        to,
        exact,
        append,
        replace,
      };
    } else {
      if (tag === 'a' && href) {
        data.attrs!.href = href;
      }

      if (tag === 'button') {
        data.attrs!.type = type;
      }
    }

    if (target) data.attrs!.target = target;

    return h(tag, data, [
      h(
        'span',
        {
          staticClass: 'v-stack-btn__content',
        },
        this.$slots.default,
      ),
    ]);
  }
}
