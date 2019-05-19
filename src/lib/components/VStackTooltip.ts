import { CreateElement } from 'vue';
import { Mixin, Mixins } from 'vue-mixin-decorator';
import { Prop } from 'vue-property-decorator';
import { RenderContentResult } from './VStack';
import VStackMenu from './VStackMenu';

@Mixin({
  name: 'v-stack-tooltip',
})
export default class VStackTooltip extends Mixins<VStackMenu>(VStackMenu) {
  @Prop({ type: [String, Number], default: 200 }) openDelay!: string | number;
  @Prop({ type: Boolean, default: true }) openOnHover!: boolean;

  protected renderContent(h: CreateElement): RenderContentResult {
    const defaultSlot = this.$scopedSlots.default;
    // const children: VNode[] = [];

    return {
      tag: 'span',
      data: {
        staticClass: 'vv-stack-tooltip',
        style: this.menuStyles,
      },
      children: [
        h(
          'span',
          {
            staticClass: 'vv-stack-tooltip__body',
          },
          defaultSlot && defaultSlot(this),
        ),
      ],
    };
  }
}
