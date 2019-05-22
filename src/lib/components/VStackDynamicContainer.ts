import { VNode, CreateElement, VNodeData, VNodeChildren } from 'vue';
import { Vue, Component } from 'vue-property-decorator';
import { VStackContext, VStack } from './';

export interface VStackDynamicSetting {
  Ctor: typeof VStack;
  data?: VNodeData;
  children?: VNodeChildren;
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

  // protected created() {
  //   if (this.$vstack.dynamicContainer) {
  //     throw error(
  //       'VStackDynamicContainer must not be instantiated more than once in an application.',
  //     );
  //   }
  //   this.$vstack.dynamicContainer = this;
  // }

  // protected beforeDestroy() {
  //   if (this.$vstack.dynamicContainer === this) {
  //     this.$vstack.dynamicContainer = null;
  //   }
  // }

  protected render(h: CreateElement): VNode {
    const children = this.settings.map(({ id, setting, resolve }) => {
      const { Ctor, data: _data = {} } = setting;
      let { children } = setting;

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

      (data.on.close as Function[]).push((stack: VStack) => {
        resolve(stack.payload);
      });

      if (typeof children === 'string' && children.indexOf('\n') !== -1) {
        const tmp: VNodeChildren = [];
        const lines = children.trim().split('\n');
        lines.forEach((line, index) => {
          if (index !== 0) tmp.push(h('br'));
          tmp.push(line);
        });
        children = tmp;
      }

      return h(
        Ctor,
        {
          ...data,
          ref: 'stacks',
          refInFor: true,
          key: id,
        },
        children,
      );
    });

    return h(
      'div',
      {
        staticClass: 'vv-stack-dynamic-container',
      },
      children,
    );
  }
}
