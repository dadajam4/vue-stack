<template>
  <div class="test-page-2">
    <div>
      <nuxt-link to="/">back</nuxt-link>
    </div>
    <div>
      <div>
        <label>
          body
          <input type="text" v-model="text">
        </label>

        <label>
          <input type="checkbox" v-model="persistent">
          persistent
        </label>
        <label>
          <input type="checkbox" v-model="left">
          left
        </label>
        <label>
          <input type="checkbox" v-model="right">
          right
        </label>
        <label>
          <input type="checkbox" v-model="top">
          top
        </label>
        <label>
          <input type="checkbox" v-model="bottom">
          bottom
        </label>
        <label>
          <input type="number" v-model="timeout">
          timeout
        </label>
      </div>
      <button type="button" @click="onClickAlert">alert</button>
      <button type="button" @click="onClickConfirm">confirm</button>
      <button type="button" @click="onClickPrompt">prompt</button>
      <button type="button" @click="onClickSnack">snackbar</button>
    </div>

    <div>
      <button type="button" @click="onClickDynamic1">dynamic1</button>
      <button type="button" @click="onClickDynamic2">dynamic2</button>
    </div>

    <div>
      <button type="button" @click="onSnackWithRouteChange">SnackWithRouteChange</button>
    </div>

    <div
      v-for="color in [
        'primary',
        'secondary',
        'accent',
        'error',
        'info',
        'success',
        'warning',
      ]"
      :key="color"
    >
      <VStackBtn :color="color" @click="() => {}">button</VStackBtn>
      <VStackBtn :color="color" disabled @click="() => {}">button</VStackBtn>
      <VStackBtn :color="color" flat @click="() => {}">button</VStackBtn>
      <VStackBtn :color="color" disabled flat @click="() => {}">button</VStackBtn>
      <VStackBtn :color="color" outline @click="() => {}">button</VStackBtn>
      <VStackBtn :color="color" disabled outline @click="() => {}">button</VStackBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import VStackBtn from '~/lib/components/VStackBtn';

@Component({
  name: 'page2-view',
  components: {
    VStackBtn,
  },
})
export default class HomeView extends Vue {
  text: string = '';
  persistent: boolean = false;
  left: boolean = false;
  right: boolean = false;
  top: boolean = false;
  bottom: boolean = false;
  timeout: number = 6000;

  async onClickAlert() {
    await this.$alert({
      content: this.text || 'alert',
      persistent: this.persistent,
    });
    this.$alert('アラートしました');
  }

  async onClickConfirm() {
    const result = await this.$confirm(this.text || 'confirm');
    this.$alert(result ? 'YES!!!' : 'No...');
  }

  async onClickPrompt() {
    const result = await this.$prompt({
      content: this.text,
      prompt: {
        value: '555',
      },
    });
    this.$alert(`${typeof result} : ${result}`);
  }

  onClickSnack() {
    const content = this.text || 'snack!!';
    this.$snackbar({
      content,
      left: this.left,
      right: this.right,
      top: this.top,
      bottom: this.bottom,
      timeout: this.timeout,
      closeBtn: 'クローづ',
    });
  }

  onClickDynamic1() {
    this.$alert({
      content: [this.$createElement('div', {}, 'あいう')],
      actions: [
        {
          type: 'ok',
          click: dialog => {
            dialog.close();
          },
          text: [this.$createElement('span', {}, 'XXXXX')],
        },
        {
          type: 'cancel',
          click: dialog => {
            dialog.close();
          },
          text: [this.$createElement('span', {}, 'cancel')],
        },
      ],
    });
  }

  onClickDynamic2() {
    this.$alert({
      content: (dialog) => {
        return [this.$createElement('div', {}, [
          'あいう',
          this.$createElement('button', {
            attrs: {
              type: 'button',
            },
            on: {
              click: (e) => {
                dialog.close();
              },
            },
          }, 'CLICK!')
        ])];
      },
      actions: [
        {
          type: 'ok',
          click: () => {
            this.$alert('ok');
          },
          slot: payload => {
            return [
              this.$createElement(
                'button',
                {
                  on: payload.on,
                },
                'slot button',
              ),
            ];
          },
        },
        {
          type: 'cancel',
          click: dialog => {
            dialog.close();
          },
          text: [this.$createElement('span', {}, 'cancel')],
        },
      ],
    });
  }

  onSnackWithRouteChange() {
    this.$snackbar('Snack!!!!!');
    this.$router.push('/');
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
