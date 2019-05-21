<template>
  <div class="test-page-1">
    <h1>Home</h1>
    <VStackMenu content-class="my-menu">
      <template v-slot:activator="stack">
        <a href="javascript:void(0);">Stack1 Activator {{ stack.isActive }}</a>
      </template>
      <div>
        Stack1
        {{ count1 }}
      </div>
    </VStackMenu>
    <button @click="count1 = count1 + 1">stack1({{ count1 }})</button>

    <VStackMenu content-class="my-menu" ref="stack2" width="2500">
      <div>
        Stack2
        {{ count2 }}
      </div>
    </VStackMenu>
    <p>
      <a href="javascript:void(0);" @click.stop="$refs.stack2.toggle">Stack2 Activator</a>
    </p>

    <button @click="count2 = count2 + 1">stack2({{ count2 }})</button>

    <VStackMenu content-class="my-menu" open-on-contextmenu>
      <template v-slot:activator="stack">
        <button type="button">open on context menu</button>
      </template>
      <div>コンテキストメニュー</div>
    </VStackMenu>

    <div>
      <DemoMenu>
        <DemoMenuOption value="項目1">項目1</DemoMenuOption>
        <DemoMenuOption value="項目2">項目2</DemoMenuOption>
        <DemoMenuOption value="項目3">項目3です</DemoMenuOption>
      </DemoMenu>
    </div>

    <div>
      テキストが入ります。
      <VStackTooltip>
        <template v-slot:activator="stack">
          <a href="javascript:void(0);">ここにツールチップ</a>
        </template>
        ツールチップメッセージ
      </VStackTooltip>
    </div>

    <div>
      <p>あいうえお</p>
      <VStackDialog backdrop>
        <template v-slot:activator="stack">
          <a href="javascript:void(0);">ダイアログ</a>
        </template>
        <template v-slot:header>ダイアログへっだ</template>
        <template v-slot:default="dialog">
          <p>僕はダイアログボディです。</p>
          <div>
            テキストが入ります。
            <VStackTooltip>
              <template v-slot:activator="stack">
                <a href="javascript:void(0);">ここにツールチップ</a>
              </template>
              ツールチップメッセージ
            </VStackTooltip>
          </div>

          <VStackDialog backdrop width="100">
            <template v-slot:activator="stack">
              <a href="javascript:void(0);">ダイアログ</a>
            </template>
            <template v-slot:header>ダイアログへっだ</template>
            <template v-slot:default="dialog">
              <p>僕はダイアログボディです。</p>
              <div>
                テキストが入ります。
                <VStackTooltip>
                  <template v-slot:activator="stack">
                    <a href="javascript:void(0);">ここにツールチップ</a>
                  </template>
                  ツールチップメッセージ
                </VStackTooltip>
              </div>

              <button type="button" @click.stop="dialog.close">close</button>
            </template>
          </VStackDialog>

          <button type="button" @click.stop="dialog.close">close</button>
        </template>
      </VStackDialog>
    </div>

    <div>
      右の方にある感じ。右の方にある感じ。右の方にある感じ。右の方にある感じ。
      <VStackMenu content-class="my-menu" top>
        <template v-slot:activator="stack">
          <a href="javascript:void(0);">Click!!</a>
        </template>
        <div>StackですよStackですよStackですよStackですよ</div>
      </VStackMenu>
    </div>

    <VStackMenu content-class="my-menu" open-on-hover top>
      <template v-slot:activator="stack">
        <a href="javascript:void(0);">Mouse Enter!!</a>
      </template>
      <div>Stack</div>
    </VStackMenu>

    <VStackMenu content-class="my-menu" top>
      <template v-slot:activator="stack">
        <a href="javascript:void(0);">Click!!</a>
      </template>
      <div>Stack</div>
    </VStackMenu>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { VStackMenu, VStackTooltip, VStackDialog } from '~/lib';
import { DemoMenu, DemoMenuOption } from '~/components';

@Component({
  name: 'home-view',
  components: {
    VStackMenu,
    VStackTooltip,
    VStackDialog,
    DemoMenu,
    DemoMenuOption,
  },
  provide() {
    return {
      test: this,
    };
  },
})
export default class HomeView extends Vue {
  count1: number = 0;
  count2: number = 0;
}
</script>

<style lang="scss">
body {
  margin: 0;
  min-width: 1000px;
  background: #ccc;
}

.test-page-1 {
  width: 800px;
  background: #fcc;
  margin: 0 auto;
}

.my-menu {
  div {
    padding: 20px;
    border-radius: inherit;
  }
}
</style>
