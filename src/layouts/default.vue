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
