import { VNode, CreateElement } from 'vue';
import { Vue, Component } from 'vue-property-decorator';
import { VStackContext, VStack } from './';

@Component({
  name: 'v-stack-container',
  inject: {
    context: {
      from: 'stackContext',
    },
  },
})
export default class VStackContainer extends Vue {
  readonly context!: VStackContext;

  get computedZIndex(): number {
    return this.context.zIndex;
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

  protected render(h: CreateElement): VNode {
    const children: VNode[] = [];
    this.context.stacks.forEach(stack => {
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
        staticClass: 'vv-stack-container',
      },
      children,
    );
  }
}
