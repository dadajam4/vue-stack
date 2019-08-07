import { CreateElement, VNode } from 'vue';
import { Component, Mixins, Prop } from 'vue-property-decorator';
import VStack, { RenderContentResult } from './VStack';
import VStackTheme from './VStackTheme';

@Component({
  name: 'v-stack-panel',
})
export default class VStackPanel extends Mixins<VStack, VStackTheme>(
  VStack,
  VStackTheme,
) {
  @Prop({ type: String, default: 'v-stack-panel' }) baseClassName!: string;
  @Prop({ type: String, default: 'div' }) tag!: string;
  @Prop({ type: Boolean, default: true }) stopDocumentScroll!: boolean;
  @Prop() panelClasses?: any;
  @Prop() contentClasses?: any;
  @Prop({ type: Boolean, default: true }) focusTrap!: boolean;

  private genStackPanelContent(): VNode {
    const defaultSlot = this.$scopedSlots.default;

    return this.$createElement(
      'div',
      {
        staticClass: `${this.baseClassName}__content`,
        class: this.contentClasses,
        attrs: {
          tabindex: '0',
        },
        on: {
          click: (e: MouseEvent) => {
            e.stopPropagation();
          },
        },
      },
      defaultSlot && defaultSlot(this),
    );
  }

  protected renderContent(h: CreateElement): RenderContentResult {
    const { baseClassName } = this;

    const children: VNode[] = [];

    const $scroller = h(
      'div',
      {
        staticClass: `${baseClassName}__scroller`,
      },
      [
        h(
          'div',
          {
            staticClass: `${baseClassName}__centerer`,
          },
          [this.genStackPanelContent()],
        ),
      ],
    );

    children.push($scroller);

    return {
      tag: this.tag,
      data: {
        staticClass: baseClassName,
        class: this.panelClasses,
        on: {
          click: (e: MouseEvent) => {
            if (this.closeOnClick && this.closeConditional(e)) {
              this.close();
            }
          },
        },
      },
      children,
    };
  }
}
