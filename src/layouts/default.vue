<template>
  <div class="my app">
    <VStackContext />
    <button @click="drawer = !drawer">toggle panel</button>
    <VStackPanel v-model="drawer" panel-classes="my-panel">
      <h2>VStackPanel</h2>
      <p v-for="n in 100" :key="n">This is text {{ n }}.</p>
    </VStackPanel>
    <nuxt />
  </div>
</template>

<script lang="ts">
import { VStackContext, VStackPanel } from '~/lib';

export default {
  components: {
    VStackContext,
    VStackPanel,
  },
  data() {
    return {
      drawer: true,
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
</style>
