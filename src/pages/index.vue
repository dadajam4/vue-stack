<template>
  <div class="test-page-1">
    <h1>Home</h1>
    <div>
      <nuxt-link to="/page2">page2</nuxt-link>
    </div>
    <VStackMenu content-class="my-menu" overlap>
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
      <template v-slot:activator>
        <button type="button">open on context menu</button>
      </template>
      <div>コンテキストメニュー</div>
    </VStackMenu>

    <div>
      <VStackDialog v-model="stack3" backdrop>ダイアログ</VStackDialog>
      <button type="button" @click="stack3 = !stack3">dialog</button>
    </div>

    <div>
      <DemoMenu>
        <DemoMenuOption v-for="n in 50" :key="n" :value="`項目${n}`">項目{{ n }}</DemoMenuOption>
      </DemoMenu>
    </div>

    <div>
      テキストが入ります。
      <VStackTooltip>
        <template v-slot:activator>
          <a href="javascript:void(0);">ここにツールチップ</a>
        </template>
        ツールチップメッセージ
      </VStackTooltip>
    </div>

    <div>
      <p>あいうえお</p>
      <VStackDialog backdrop>
        <template v-slot:activator>
          <a href="javascript:void(0);">ダイアログ</a>
        </template>
        <template v-slot:header>ダイアログへっだ</template>
        <template v-slot:default="dialog">
          <p>僕はダイアログボディです。</p>
          <div>
            テキストが入ります。
            <VStackTooltip>
              <template v-slot:activator>
                <a href="javascript:void(0);">ここにツールチップ</a>
              </template>
              ツールチップメッセージ
            </VStackTooltip>
          </div>

          <VStackDialog backdrop width="100">
            <template v-slot:activator>
              <a href="javascript:void(0);">ダイアログ</a>
            </template>
            <template v-slot:header>ダイアログへっだ</template>
            <template v-slot:default="dialog">
              <p>僕はダイアログボディです。</p>
              <div>
                テキストが入ります。
                <VStackTooltip>
                  <template v-slot:activator>
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
        <template v-slot:activator>
          <a href="javascript:void(0);">Click!!</a>
        </template>
        <div>StackですよStackですよStackですよStackですよ</div>
      </VStackMenu>
    </div>

    <VStackMenu content-class="my-menu" open-on-hover top>
      <template v-slot:activator>
        <a href="javascript:void(0);">Mouse Enter!!</a>
      </template>
      <div>Stack</div>
    </VStackMenu>

    <VStackMenu content-class="my-menu" top>
      <template v-slot:activator>
        <a href="javascript:void(0);">Click!!</a>
      </template>
      <div>Stack</div>
    </VStackMenu>

    <VStackMenu content-class="my-custom-menu">
      <template v-slot:activator>
        <a
          href="javascript:void(0);"
          style="display: inline-block; background: #fa0; padding: 10px;"
        >カスタムメニュー（スクロールエリアがカスタムです）</a>
      </template>
      <div class="my-custom-menu__header">ヘッダー（ここはスクロールしません）</div>
      <div class="my-custom-menu__body" v-bind="{[BODY_SCROLL_LOCK_SCROLL_ATTRIBUTE]: '1'}">
        <p v-for="n in 100" :key="n">段落({{ n }}) ここはスクロールします</p>
      </div>
    </VStackMenu>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import {
  VStackMenu,
  VStackTooltip,
  VStackDialog,
  BODY_SCROLL_LOCK_SCROLL_ATTRIBUTE,
} from '~/lib';
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
  stack3: boolean = false;

  get BODY_SCROLL_LOCK_SCROLL_ATTRIBUTE() {
    return BODY_SCROLL_LOCK_SCROLL_ATTRIBUTE;
  }

  fuga() {
    console.log(this.stack3);
  }
}
</script>

<style lang="scss">
.test-page-1 {
  width: 800px;
  background: #fcc;
  margin: 0 auto;
}

.my-custom-menu {
  display: flex;
  flex-direction: column;

  &__header {
    flex: 0 0 50px;
    display: flex;
    align-items: center;
    padding: 10px;
    white-space: nowrap;
    font-size: 12px;
    border-bottom: solid 1px #000;
  }

  &__body {
    flex: 1 1 100%;
    -webkit-overflow-scrolling: touch;
    overflow-y: auto;
  }
}
</style>
