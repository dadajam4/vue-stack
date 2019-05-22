<template>
  <div class="app">
    <VStackContext/>
    <nuxt/>
  </div>
</template>

<script lang="ts">
import { VStackContext } from '~/lib';
export default {
  components: {
    VStackContext,
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
