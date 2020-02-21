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

.v-stack-dialog {
  &__content {
    border-radius: 9px;
  }
}
</style>
<style lang="scss">
// Customize example
.v-stack-context {
  font: inherit;
}

.v-stack-dynamic-dialog {
  @at-root .v-stack-dialog {
    &__content {
      border-radius: 9px;
      box-shadow: none;
      padding-top: 20px;
    }

    &__header {
      padding: 0 20px;
      position: relative;
      min-height: 30px;

      &__icon {
        color: #ffa100;
        pointer-events: none;
        width: 60px;
        height: 60px;
        border: solid 6px currentColor;
        border-radius: 50%;
        display: block;
        position: absolute;
        transform: scale(0.5);
        top: calc(50% - 30px);
        left: calc(50% - 30px);

        &::before,
        &::after {
          content: '';
          display: block;
          position: absolute;
          width: 6px;
          left: 21px;
          background: currentColor;
          overflow: hidden;
        }

        &::before {
          height: 6px;
          top: 10px;
          border-radius: 50%;
        }

        &:after {
          height: 16px;
          bottom: 10px;
          border-radius: 50% / 15%;
        }
      }
    }

    &__body {
      font-size: 14px;
      line-height: 1.5;
      padding: 10px 20px 0;
    }

    &__actions {
      padding: 10px;
      justify-content: stretch;
    }

    &__action {
      height: 40px;
      margin: 10px;
      font-size: 10px;
      border-radius: 2px;
    }

    &--confirm &__action {
      min-width: 106px;
      flex: 1 1 100%;
    }

    &--alert &__action--ok {
      background: #fff !important;
      color: #000 !important;
      width: calc(100% - 20px);
    }
  }
}
</style>
