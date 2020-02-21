import Vue from 'vue';
import VueStack, { VueStackOptions } from '~/lib';

Vue.use<VueStackOptions>(VueStack, {
  // Customize example
  defaultTheme: 'light',
  usePrefersColorScheme: false,
  themes: {
    dark: {
      background: 'rgba(0, 0, 0, .8)',
      contexts: {
        primary: {
          base: '#00A0CB',
          text: '#fff',
        },
        gray: {
          base: '#999',
          text: '#fff',
        },
      },
    },
  },
  strings: {
    cancel: vm => {
      return ['キャンセル'];
    },
  },
  dialog: {
    minWidth: 275,
    maxWidth: 375,
    header: vm => {
      return [
        vm.$createElement('i', {
          staticClass: 'v-stack-dialog__header__icon',
        }),
      ];
    },
    theme: 'dark',
  },
  dialogActions: {
    cancel: {
      outline: false,
      color: 'gray',
    },
  },

  // useScrollStop: false,
  snackbar: {
    closeBtn: '閉じる',
  },
});
