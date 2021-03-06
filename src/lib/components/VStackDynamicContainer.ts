import { VNode, CreateElement, VNodeData, VNodeChildren } from 'vue';
import { ScopedSlotChildren } from 'vue/types/vnode';
import { Vue, Component } from 'vue-property-decorator';
import { VStackContext, VStack } from './';

export interface VStackDynamicSetting {
  Ctor: typeof VStack;
  data?: VNodeData;
  children?: VNodeChildren | ((stack: VStack) => ScopedSlotChildren);
  closeOnNavigation?: boolean;
  tag?: any;
}

interface InternalSettings {
  id: number;
  setting: VStackDynamicSetting;
  resolve: Function;
  reject: Function;
}

@Component({
  name: 'v-stack-dynamic-container',
  inject: {
    context: {
      from: 'stackContext',
    },
  },
})
export default class VStackDynamicContainer extends Vue {
  readonly context!: VStackContext;
  $refs!: {
    stacks: VStack[];
  };

  private settings: InternalSettings[] = [];

  public push<V = any>(setting: VStackDynamicSetting): Promise<V> {
    return new Promise<V>((resolve, reject) => {
      const id = this.context.createId();
      this.settings.push({
        id,
        setting,
        resolve,
        reject,
      });
    });
  }

  protected render(h: CreateElement): VNode {
    const children = this.settings.map(_s => {
      const { id, setting, resolve } = _s;
      const { Ctor, data: _data = {} } = setting;
      let { children } = setting;

      this.$scopedSlots

      const data = {
        ..._data,
      };

      data.props = {
        closeOnEsc: true,
        ...data.props,
        active: true,
        alwaysRender: true,
      };

      data.on = data.on || {};
      data.on.close = data.on.close || [];
      if (!Array.isArray(data.on.close)) data.on.close = [data.on.close];

      data.on.close.push((stack: VStack) => {
        resolve(stack.payload);
      });

      data.on.afterLeave = data.on.afterLeave || [];
      if (!Array.isArray(data.on.afterLeave))
        data.on.afterLeave = [data.on.afterLeave];
      data.on.afterLeave.push((stack: VStack) => {
        const index = this.settings.indexOf(_s);
        if (index !== -1) {
          this.settings.splice(index, 1);
        }
      });

      let defaultSlot: ((stack: VStack) => ScopedSlotChildren) | undefined;

      if (typeof children === 'function') {
        defaultSlot = children;
      } else {
        if (typeof children === 'string' && children.indexOf('\n') !== -1) {
          const tmp: VNodeChildren = [];
          const lines = children.trim().split('\n');
          lines.forEach((line, index) => {
            if (index !== 0) tmp.push(h('br'));
            tmp.push(line);
          });
          children = tmp;
        }
      }

      // if (typeof children === 'string' && children.indexOf('\n') !== -1) {
      //   const tmp: VNodeChildren = [];
      //   const lines = children.trim().split('\n');
      //   lines.forEach((line, index) => {
      //     if (index !== 0) tmp.push(h('br'));
      //     tmp.push(line);
      //   });
      //   children = tmp;
      // } else if (typeof children === 'function') {
      //   children = children();
      // }

      return h(
        Ctor,
        {
          ...data,
          ref: 'stacks',
          refInFor: true,
          key: id,
          scopedSlots: defaultSlot ? {
            default: defaultSlot,
          } : undefined,
        },
        defaultSlot ? undefined : (children as VNodeChildren),
      );
    });

    return h(
      'div',
      {
        staticClass: 'v-stack-dynamic-container',
      },
      children,
    );
  }
}
