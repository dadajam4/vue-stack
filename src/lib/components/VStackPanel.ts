import { CreateElement, VNode } from 'vue';
import { Component, Mixins, Prop } from 'vue-property-decorator';
import VStack, {
  RenderContentResult,
  VStackProps,
  VStackEmits,
  VStackScopedSlots,
} from './VStack';
import VStackTheme, {
  VStackThemeProps,
  VStackThemeEmits,
  VStackThemeScopedSlots,
} from './VStackTheme';
import bodyScrollLock from '../directives/body-scroll-lock';

export interface VStackPanelProps<V = any>
  extends VStackProps<V>,
    VStackThemeProps {}

export interface VStackPanelEmits<V = any>
  extends VStackEmits<V>,
    VStackThemeEmits {}

export interface VStackPanelScopedSlots<V = any>
  extends VStackScopedSlots<V>,
    VStackThemeScopedSlots {
  controls?: VStackPanel;
}

@Component({
  name: 'v-stack-panel',
  directives: {
    bodyScrollLock,
  },
})
export default class VStackPanel extends Mixins<VStack, VStackTheme>(
  VStack,
  VStackTheme,
) {
  @Prop({ type: String, default: 'v-stack-panel' }) baseClassName!: string;
  @Prop({ type: String, default: 'div' }) tag!: string;
  // @Prop({ type: Boolean, default: true }) stopDocumentScroll!: boolean;
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

    const panelChildren: VNode[] = [
      h(
        'div',
        {
          staticClass: `${baseClassName}__inner`,
          directives: [{ name: 'body-scroll-lock', value: this.isActive }],
        },
        children,
      ),
    ];

    if (this.$scopedSlots.controls) {
      panelChildren.push(
        h(
          'div',
          {
            staticClass: `${baseClassName}__controls`,
            on: {
              click: (e: MouseEvent) => {
                e.stopPropagation();
              },
            },
          },
          this.$scopedSlots.controls(this),
        ),
      );
    }

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
      children: panelChildren,
    };
  }
}
