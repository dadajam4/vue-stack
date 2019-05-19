<template>
  <div class="app">
    <VStackContainer/>
    <VStackDynamicContainer/>

    <!--
    <nav class="nav">
      <nuxt-link class="nav__link" to="/">Home</nuxt-link>
      <span class="nav__divider">|</span>
      <span class="nav__link" :class="{ 'nav__link--active': $route.name !== 'index' }">PlayGround</span>
    </nav>
    -->
    <nuxt/>
  </div>
</template>

<script lang="ts">
import { VStackContainer, VStackDynamicContainer } from '~/lib';
export default {
  components: {
    VStackContainer,
    VStackDynamicContainer,
  },
};
</script>

<style lang="scss">
// $nav-height: 80px;

// * {
//   box-sizing: border-box;
// }

// html,
// body {
//   margin: 0;
//   padding: 0;
// }

// .app {
//   font-family: 'Avenir', Helvetica, Arial, sans-serif;
//   -webkit-font-smoothing: antialiased;
//   -moz-osx-font-smoothing: grayscale;
//   text-align: center;
//   color: #2c3e50;
//   padding-top: $nav-height;
// }

// .nav {
//   position: fixed;
//   z-index: 32767;
//   top: 0;
//   left: 0;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   width: 100%;
//   height: $nav-height;
//   border-bottom: solid 1px rgba(0, 0, 0, 0.3);
//   background: rgba(255, 255, 255, 0.9);

//   &__link {
//     font-weight: bold;
//     color: #2c3e50;
//     text-decoration: none;

//     &--active,
//     &.nuxt-link-exact-active {
//       color: #42b983;
//       pointer-events: none;
//     }
//   }

//   &__divider {
//     margin: 0 1em;
//   }
// }
</style>
