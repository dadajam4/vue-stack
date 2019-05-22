<template>
  <div class="test-page-2">
    <div>
      <nuxt-link to="/">back</nuxt-link>
    </div>
    <div>
      <input type="text" v-model="text">
    </div>
    <button type="button" @click="onClickAlert">alert</button>
    <button type="button" @click="onClickConfirm">confirm</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
// import { VStackMenu, VStackTooltip, VStackDialog } from '~/lib';
// import { DemoMenu, DemoMenuOption } from '~/components';

@Component({
  name: 'page2-view',
  // components: {
  //   VStackMenu,
  //   VStackTooltip,
  //   VStackDialog,
  //   DemoMenu,
  //   DemoMenuOption,
  // },
  // provide() {
  //   return {
  //     test: this,
  //   };
  // },
})
export default class HomeView extends Vue {
  text: string = '';

  async onClickAlert() {
    await this.$alert(this.text || 'alert');
    this.$alert('アラートしました');
  }

  async onClickConfirm() {
    const result = await this.$confirm(this.text || 'confirm');
    this.$alert(result ? 'YES!!!' : 'No...');
  }
}
</script>

<style lang="scss">
// body {
//   margin: 0;
//   min-width: 1000px;
//   background: #ccc;
// }

// .test-page-1 {
//   width: 800px;
//   background: #fcc;
//   margin: 0 auto;
// }

// .my-menu {
//   div {
//     padding: 20px;
//     border-radius: inherit;
//   }
// }
</style>
