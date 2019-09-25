import Vue from 'vue';
import VueStack, { VueStackOptions } from '~/lib';

Vue.use<VueStackOptions>(VueStack, {
  // useScrollStop: false,
  snackbar: {
    closeBtn: '閉じる',
  },
});
