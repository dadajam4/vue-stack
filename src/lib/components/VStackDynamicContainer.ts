import { VNode, CreateElement, VNodeData, VNodeChildren } from 'vue';
import { Vue, Component } from 'vue-property-decorator';
import VStack from './VStack';
import { error } from '~/lib/utils';

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

// interface Resolver<V = any> {
//   id: number;
//   resolve: (value?: V | PromiseLike<V> | undefined) => void;
//   reject: () => void;
// }

@Component({
  name: 'v-stack-dynamic-container',
})
export default class VStackDynamicContainer extends Vue {
  $refs!: {
    stacks: VStack[];
  };

  private settings: InternalSettings[] = [];
  // private resolvers: { [key: number]: Resolver } = {};

  public push<V = any>(setting: VStackDynamicSetting): Promise<V> {
    return new Promise<V>((resolve, reject) => {
      const id = this.$vstack.createId();
      this.settings.push({
        id,
        setting,
        resolve,
        reject,
      });
    });
  }

  protected created() {
    if (this.$vstack.dynamicContainer) {
      throw error(
        'VStackDynamicContainer must not be instantiated more than once in an application.',
      );
    }
    this.$vstack.dynamicContainer = this;
  }

  protected beforeDestroy() {
    if (this.$vstack.dynamicContainer === this) {
      this.$vstack.dynamicContainer = null;
    }
  }

  // private getOrCreateResolver(id: number): Resolver {
  //   let resolver = this.resolvers[id];
  //   if (resolver) return resolver;

  //   resolver = {
  //     id,
  //     resolve,
  //     reject,
  //   };
  //   this.resolvers.push(resolver);

  //   const { id }
  //   if (this.reso)
  // }

  protected render(h: CreateElement): VNode {
    const children = this.settings.map(({ id, setting, resolve }) => {
      const { Ctor, data: _data = {} } = setting;
      let { children } = setting;
      // const isString =

      // if (typeof children === 'string') {

      // }

      const data = {
        ..._data,
      };

      data.props = {
        closeOnEsc: true,
        ...data.props,
        active: true,
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
        },
        children,
      );
    });

    return h(
      'div',
      {
        attrs: {
          'v-stack-dynamic-container': '',
        },
      },
      children,
    );
  }
}
