import './demo-menu.scss';
import Vue, { CreateElement, VNode } from 'vue';
import { Component } from 'vue-property-decorator';
import { VStackMenu } from '~/lib';
import DemoMenuActivator from './DemoMenuActivator';

@Component({
  name: 'demo-menu',
  inject: {
    injectedData: {
      from: 'test',
      default: null,
    },
  },
  provide() {
    return {
      menu: this,
    };
  },
})
export default class DemoMenu extends Vue {
  injectedData!: any;
  $refs!: {
    menu: VStackMenu;
  };

  value: string = '';

  toggle(e: MouseEvent) {
    return this.$refs.menu.toggle(e);
  }

  setValue(value: string) {
    this.value = value;
    this.$refs.menu.close();
  }

  protected render(h: CreateElement): VNode {
    return h(
      'div',
      {
        staticClass: 'demo-menu',
      },
      [
        h(
          'div',
          {
            staticClass: 'demo-menu__header',
          },
          [
            h(
              DemoMenuActivator,
              {
                staticClass: 'demo-menu__activator',
              },
              this.value || '選択してください',
            ),
          ],
        ),
        h(
          'div',
          {
            staticClass: 'demo-menu__body',
          },
          [
            h(
              VStackMenu,
              {
                props: {
                  contentClass: 'demo-menu__menu',
                  distance: 0,
                  width: 'fit',
                },
                ref: 'menu',
              },
              this.$slots.default,
            ),
          ],
        ),
      ],
    );
  }
}
