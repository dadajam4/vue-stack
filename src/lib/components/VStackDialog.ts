import { CreateElement, VNodeChildren, VNode } from 'vue';
import { NormalizedScopedSlot, ScopedSlotChildren } from 'vue/types/vnode';
import { Component, Mixins, Prop } from 'vue-property-decorator';
import VStack, {
  RenderContentResult,
  VStackProps,
  VStackEmits,
  VStackScopedSlots,
} from './VStack';
import VStackBtn from './VStackBtn';
import VStackTheme, {
  VStackThemeProps,
  VStackThemeEmits,
  VStackThemeScopedSlots,
} from './VStackTheme';
import bodyScrollLock from '../directives/body-scroll-lock';

export type VStackDialogActionSlot = (
  payload: VStackDialogActionSlotPayload,
) => ScopedSlotChildren;

export interface VStackDialogActionSlotPayload extends VStackDialogAction {
  dialog: VStackDialog;
  on: {
    click: (e: MouseEvent) => void;
  };
}

export interface VStackDialogAction {
  type: string;
  spacer?: boolean;
  autofocus?: boolean;
  color?: string;
  outline?: boolean;
  text?: VNodeChildren | ((dialog: VStackDialog) => VNodeChildren);
  slot?: VStackDialogActionSlot;
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

export type VStackDialogPromptType = 'text' | 'search' | 'tel' | 'email' | 'url' | 'password' | 'datetime' | 'date' | 'month' | 'week' | 'time' | 'datetime-local' | 'number' | 'color';

export interface VStackDialogPromptSettings {
  type?: VStackDialogPromptType;
  value?: string | number | null;
}

export type RawVStackDialogPromptSettings = VStackDialogPromptType | VStackDialogPromptSettings;

export function resoveRawVStackDialogPromptSettings(settings: RawVStackDialogPromptSettings): VStackDialogPromptSettings {
  if (typeof settings === 'string') {
    settings = {
      type: settings,
    }
  }

  return {
    ...settings,
    type: settings.type || 'text',
  }
}

export interface VStackDialogProps<V = any>
  extends VStackProps<V>,
    VStackThemeProps {
  header?: VNodeChildren | ((vm: VStackDialog) => VNodeChildren);
  actions?: VStackDialogAction[];
  baseClassName?: string;
  dialogType?: string;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  prompt?: RawVStackDialogPromptSettings;
}

export interface VStackDialogEmits<V = any>
  extends VStackEmits<V>,
    VStackThemeEmits {}

export interface VStackDialogScopedSlots<V = any>
  extends VStackScopedSlots<V>,
    VStackThemeScopedSlots {
  header?: VStackDialog;
  action?: VStackDialogActionSlotPayload;
}

@Component({
  name: 'v-stack-dialog',
  directives: {
    bodyScrollLock,
  },
})
export default class VStackDialog extends Mixins<VStack, VStackTheme>(
  VStack,
  VStackTheme,
) {
  $refs!: {
    promptInput: HTMLInputElement;
  } & VStack['$refs'];

  @Prop({ type: String, default: 'v-stack-slide-y' }) transition!: string;
  @Prop() header?: VNodeChildren | ((vm: VStackDialog) => VNodeChildren);
  @Prop({ type: Array }) actions?: VStackDialogAction[];
  @Prop({ type: String, default: 'v-stack-dialog' }) baseClassName!: string;
  @Prop({ type: String }) dialogType?: string;
  @Prop({ type: [Number, String] }) width?: number | string;
  @Prop({ type: [Number, String] }) minWidth?: number | string;
  @Prop({ type: [Number, String] }) maxWidth?: number | string;
  // @Prop({ type: Boolean, default: true }) stopDocumentScroll!: boolean;
  @Prop({ type: Boolean, default: true }) focusTrap!: boolean;
  @Prop([String, Object]) prompt?: RawVStackDialogPromptSettings;

  get computedPrompt() {
    const { prompt } = this;
    if (prompt) {
      return resoveRawVStackDialogPromptSettings(prompt);
    }
  }

  get contentStyles() {
    const styles: { [key: string]: string } = {
      ...this.themeStyles,
    };
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
    let { header } = this;
    if (typeof header === 'function') {
      header = header(this);
    }
    const children = this.tryGetVNodeChildren(this.$scopedSlots.header, header);
    if (!children) return;
    return this.$createElement(
      'div',
      {
        staticClass: `${this.baseClassName}__header`,
      },
      children,
    );
  }

  protected createAdditionalBody(h: CreateElement): VNodeChildren | void {}

  private genStackDialogBody(): VNode {
    const defaultSlot = this.$scopedSlots.default;
    const additionalBody = this.createAdditionalBody(this.$createElement);
    let children = additionalBody || (defaultSlot && defaultSlot(this));
    const h = this.$createElement;

    const { computedPrompt: prompt } = this;
    if (prompt) {
      // console.log(this.getThemeContextColor('field'))
      const filedColor = this.getThemeContextColor('field');
      const primaryColor = this.getThemeContextColor('primary');

      const _children = children;
      children = [
        h('form', {
          staticClass: 'v-stack-prompt-form',
          on: {
            submit: (e: Event) => {
              e.preventDefault();
              const { promptInput } = this.$refs;
              const value = promptInput && promptInput.value;
              this.resolve(value);
            },
          },
        }, [h('input', {
          staticClass: 'v-stack-prompt-input',
          style: {
            background: filedColor.base,
            color: filedColor.text,
            borderColor: primaryColor.base,
          },
          attrs: {
            type: prompt.type,
            autofocus: true,
          },
          domProps: {
            value: prompt.value == null ? '' : String(prompt.value),
          },
          ref: 'promptInput',
        })]),
      ];
      if (_children) {
        children.unshift(h('div', {
          staticClass: 'v-stack-prompt-content',
        }, _children));
      }
    }

    return this.$createElement(
      'div',
      {
        staticClass: `${this.baseClassName}__body`,
      },
      children,
    );
  }

  private genStackDialogActions(): VNode | undefined {
    const { actions, $createElement: h, $scopedSlots, baseClassName } = this;
    if (!actions || actions.length === 0) return;

    const defaultActionSlot = $scopedSlots.action;
    const children: VNode[] = [];

    actions.forEach(action => {
      const actionSlot = action.slot || defaultActionSlot;

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
            VStackBtn,
            {
              props: {
                type: 'button',
                color: action.color,
                outline: action.outline,
              },
              staticClass: `${baseClassName}__action ${baseClassName}__action--${
                action.type
              }`,
              class: {
                [`${baseClassName}__action--spacer`]: action.spacer,
              },
              attrs: {
                autofocus: action.autofocus,
              },
              on,
              key: action.type,
            },
            typeof action.text === 'function' ? action.text(this) : action.text,
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
        attrs: {
          tabindex: '0',
        },
        on: {
          click: (e: MouseEvent) => {
            e.stopPropagation();
          },
        },
      },
      children,
    );
  }

  protected renderContent(h: CreateElement): RenderContentResult {
    const { baseClassName, dialogType } = this;
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

    let staticClass = baseClassName;
    if (dialogType) {
      staticClass = `${staticClass} ${baseClassName}--${dialogType}`;
    }

    return {
      tag: 'div',
      data: {
        staticClass,
        directives: [{ name: 'body-scroll-lock', value: this.isActive }],
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
