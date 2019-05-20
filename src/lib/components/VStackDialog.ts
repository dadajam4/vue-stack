import { CreateElement, VNodeChildren, VNode } from 'vue';
import { NormalizedScopedSlot } from 'vue/types/vnode';
import { Component, Mixins, Prop } from 'vue-property-decorator';
import VStack, { RenderContentResult } from './VStack';

export interface VStackDialogAction {
  type: string;
  spacer?: boolean;
  autofocus?: boolean;
  color?: string;
  text?: VNodeChildren;
  click?: (
    dialog: VStackDialog,
    action: VStackDialogAction,
    ev: MouseEvent,
  ) => any;
}

const toStyleWidth = (width: number | string): string => {
  if (typeof width === 'number') return width + 'px';
  return isNaN(width as any) ? width : width + 'px';
};

@Component({
  name: 'v-stack-dialog',
})
export default class VStackDialog extends Mixins<VStack>(VStack) {
  @Prop({ type: String, default: 'vv-stack-slide-y' }) transition!: string;
  @Prop() header?: VNodeChildren;
  @Prop({ type: Array }) actions?: VStackDialogAction[];
  @Prop({ type: String, default: 'vv-stack-dialog' }) baseClassName!: string;
  @Prop({ type: [Number, String] }) width?: number | string;
  @Prop({ type: [Number, String] }) minWidth?: number | string;
  @Prop({ type: [Number, String] }) maxWidth?: number | string;

  get contentStyles() {
    const styles: { [key: string]: string } = {};
    const { width, minWidth, maxWidth } = this;
    if (width !== undefined) styles.width = toStyleWidth(width);
    if (minWidth !== undefined) styles.minWidth = toStyleWidth(minWidth);
    if (maxWidth !== undefined) styles.maxWidth = toStyleWidth(maxWidth);
    return styles;
  }

  private tryGetVNodeChildren(
    scopedSlot: NormalizedScopedSlot | undefined,
    children: VNodeChildren,
  ): VNodeChildren {
    if (typeof scopedSlot === 'function') return scopedSlot(this);
    return children;
  }

  private genStackDialogHeader(): VNode | undefined {
    const children = this.tryGetVNodeChildren(
      this.$scopedSlots.header,
      this.header,
    );
    if (!children) return;
    return this.$createElement(
      'div',
      {
        staticClass: `${this.baseClassName}__header`,
      },
      children,
    );
  }

  private genStackDialogBody(): VNode {
    const defaultSlot = this.$scopedSlots.default;
    return this.$createElement(
      'div',
      {
        staticClass: `${this.baseClassName}__body`,
      },
      defaultSlot && defaultSlot(this),
    );
  }

  private genStackDialogActions(): VNode | undefined {
    const { actions, $createElement: h, $scopedSlots, baseClassName } = this;
    if (!actions || actions.length === 0) return;

    const actionSlot = $scopedSlots.action;
    const children: VNode[] = [];

    actions.forEach(action => {
      const on = {
        click: (e: MouseEvent) => {
          if (!e.defaultPrevented && action.click)
            action.click(this, action, e);
        },
      };

      if (actionSlot) {
        const vNodes = actionSlot({
          ...action,
          dialog: this,
          on,
        });
        if (vNodes) children.push(...vNodes);
      } else {
        children.push(
          h(
            'button',
            {
              staticClass: `${baseClassName}__action ${baseClassName}__action--${
                action.type
              }`,
              class: {
                [`${baseClassName}__action--spacer`]: action.spacer,
              },
              style: {
                color: action.color ? action.color : undefined,
              },
              attrs: {
                type: 'button',
                autofocus: action.autofocus ? '' : undefined,
              },
              on,
              key: action.type,
            },
            [
              h(
                'span',
                {
                  staticClass: `${baseClassName}__action__content`,
                },
                action.text,
              ),
            ],
          ),
        );
      }
    });

    return this.$createElement(
      'div',
      {
        staticClass: `${this.baseClassName}__actions`,
      },
      children,
    );
  }

  private genStackDialogContent(): VNode {
    const children: VNode[] = [];
    const $header = this.genStackDialogHeader();
    const $body = this.genStackDialogBody();
    const $actions = this.genStackDialogActions();

    if ($header) children.push($header);
    children.push($body);
    if ($actions) children.push($actions);

    return this.$createElement(
      'div',
      {
        staticClass: `${this.baseClassName}__content`,
        style: this.contentStyles,
      },
      children,
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
          [this.genStackDialogContent()],
        ),
      ],
    );

    children.push($scroller);

    return {
      tag: 'div',
      data: {
        staticClass: baseClassName,
      },
      children,
    };
  }
}
