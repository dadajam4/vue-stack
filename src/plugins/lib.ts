import Vue from 'vue';
import VueStack, { VueStackOptions } from '~/lib';

Vue.use<VueStackOptions>(VueStack, {
  snackbar: {
    closeBtn: '閉じる',
  },
});
