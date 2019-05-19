import { VNode, CreateElement } from 'vue';
import { Vue, Component, Prop } from 'vue-property-decorator';
import VStack from './VStack';
import { error } from '~/lib/utils';

@Component({
  name: 'v-stack-container',
})
export default class VStackContainer extends Vue {
  @Prop([String, Number]) zIndex?: string | number;

  get computedZIndex(): number {
    return this.$vstack.settings.zIndex;
  }

  private genStackTransition(stack: VStack, h = this.$createElement) {
    const { renderedContent } = stack;
    return h(
      'transition',
      {
        props: {
          name: stack.computedTransition,
        },
        on: {
          afterEnter: (el: HTMLElement) => {
            stack.nowShowing = false;
            stack.nowClosing = false;
            this.$emit('afterEnter', el);
          },
          afterLeave: (el: HTMLElement) => {
            stack.nowShowing = false;
            stack.nowClosing = false;
            stack.setNeedRender(false);
            this.$emit('afterLeave', el);
          },
        },
      },
      renderedContent && [renderedContent],
    );
  }

  protected created() {
    if (this.$vstack.container) {
      throw error(
        'VStackContainer must not be instantiated more than once in an application.',
      );
    }
    this.$vstack.container = this;
    let { zIndex } = this;
    if (zIndex !== undefined) {
      if (typeof zIndex === 'string') zIndex = parseInt(zIndex, 10);
      this.$vstack.settings.zIndex = zIndex;
    }
  }

  protected beforeDestroy() {
    if (this.$vstack.container === this) {
      this.$vstack.container = null;
    }
  }

  protected render(h: CreateElement): VNode {
    const children: VNode[] = [];
    this.$vstack.stacks.forEach(stack => {
      const { backdrop } = stack;
      if (backdrop) {
        const $backdrop = h('div', {
          staticClass: 'vv-stack-backdrop',
          style: {
            zIndex: stack.computedZIndex,
          },
          directives: [
            { name: 'show', value: stack.isActive && stack.renderedContent },
          ],
          key: `${stack.stackId}-backdrop`,
        });
        children.push(
          h(
            'transition',
            {
              props: {
                name: 'v-stack-fade',
              },
            },
            [$backdrop],
          ),
        );
      }

      children.push(this.genStackTransition(stack));
    });
    return h(
      'div',
      {
        attrs: {
          'v-stack-container': '',
        },
      },
      children,
    );
  }
}
