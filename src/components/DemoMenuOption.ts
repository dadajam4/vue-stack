import Vue, { CreateElement, VNode } from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import DemoMenu from './DemoMenu';

@Component({
  name: 'demo-menu-option',
  inject: ['menu'],
})
export default class DemoMenuOption extends Vue {
  @Inject({ from: 'menu' }) menu!: DemoMenu;

  @Prop({ type: String, required: true }) value!: string;

  protected render(h: CreateElement): VNode {
    return h(
      'div',
      {
        staticClass: 'demo-menu__option',
        on: {
          click: (e: MouseEvent) => {
            this.menu.setValue(this.value);
          },
        },
      },
      this.$slots.default,
    );
  }
}
