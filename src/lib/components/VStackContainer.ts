import { VNode, CreateElement } from 'vue';
import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'v-stack-container',
})
export default class VStackContainer extends Vue {
  protected render(h: CreateElement): VNode {
    return h('div', {
      attrs: {
        'v-stack-container': '',
      },
    });
  }
}
