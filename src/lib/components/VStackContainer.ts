import { VNode, CreateElement } from 'vue';
import { Vue, Component } from 'vue-property-decorator';
// import { VStackContext, VStack } from './';

@Component({
  name: 'v-stack-container',
})
export default class VStackContainer extends Vue {
  protected render(h: CreateElement): VNode {
    return h('div', {
      attrs: {
        'vv-stack-container': '',
      },
    });
  }
}
