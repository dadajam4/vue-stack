import Vue, { CreateElement, VNode } from 'vue';
import { Component, Inject } from 'vue-property-decorator';
import DemoMenu from './DemoMenu';

@Component({
  name: 'demo-menu-activator',
  inject: ['menu'],
})
export default class DemoMenuActivator extends Vue {
  @Inject({ from: 'menu' }) menu!: DemoMenu;

  protected render(h: CreateElement): VNode {
    return h(
      'div',
      {
        staticClass: 'demo-menu__activator',
        attrs: {
          tabindex: '0',
        },
        on: {
          // focus: (e: FocusEvent) => {
          //   this.menu.show(e);
          // },
          click: (e: MouseEvent) => {
            this.menu.toggle(e);
          },
        },
      },
      this.$slots.default,
    );
  }
}
