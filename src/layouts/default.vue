<template>
  <div class="my app">
    <VStackContext />
    <button @click="panelActive = !panelActive">toggle panel</button>
    <VStackPanel v-model="panelActive" panel-classes="my-panel">
      <h2>VStackPanel</h2>

      <div>
        <DemoMenu>
          <DemoMenuOption v-for="n in 50" :key="n" :value="`項目${n}`">項目{{ n }}</DemoMenuOption>
        </DemoMenu>
      </div>

      <p v-for="n in 100" :key="n">This is text {{ n }}.</p>

      <template v-slot:controls>
        <button type="button" class="my-panel-control" @click="panelActive = false">close!!!</button>
      </template>
    </VStackPanel>
    <nuxt />
  </div>
</template>

<script lang="ts">
import { VStackContext, VStackPanel } from '~/lib';
import { DemoMenu, DemoMenuOption } from '~/components';

export default {
  components: {
    VStackContext,
    VStackPanel,
    DemoMenu,
    DemoMenuOption,
  },
  data() {
    return {
      panelActive: true,
    };
  },
};
</script>

<style lang="scss">
body {
  margin: 0;
  min-width: 1000px;
  background: #ccc;
}

.my-menu {
  div {
    padding: 20px;
    border-radius: inherit;
  }
}
</style>

<style lang="scss" scoped>
.my /deep/ .my-panel {
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
}

.my-panel-control {
  position: absolute;
  right: 20px;
  top: 20px;
}
</style>
