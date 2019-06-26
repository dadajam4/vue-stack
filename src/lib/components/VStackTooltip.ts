import { CreateElement } from 'vue';
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { RenderContentResult } from './VStack';
import VStackMenu from './VStackMenu';
import VStackThemeItem from './VStackThemeItem';

@Component({
  name: 'v-stack-tooltip',
})
export default class VStackTooltip extends Mixins<VStackMenu, VStackThemeItem>(
  VStackMenu,
  VStackThemeItem,
) {
  @Prop({ type: [String, Number], default: 200 }) openDelay!: string | number;
  @Prop({ type: Boolean, default: true }) openOnHover!: boolean;
  @Prop({ type: [String, Number], default: 0.9 }) opacity!: string | number;

  get computedColor() {
    return this.color || 'gray';
  }

  protected renderContent(h: CreateElement): RenderContentResult {
    const defaultSlot = this.$scopedSlots.default;

    return {
      tag: 'span',
      data: {
        staticClass: 'v-stack-tooltip',
        style: this.menuStyles,
      },
      children: [
        h(
          'span',
          {
            staticClass: 'v-stack-tooltip__body',
            style: {
              ...this.contextColorStyles,
              opacity: this.opacity,
            },
          },
          defaultSlot && defaultSlot(this),
        ),
      ],
    };
  }
}
