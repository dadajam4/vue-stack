import './styles/_index.scss';
import './polyfills';

import { PluginObject } from 'vue/types';
export * from './components';
export * from './directives';
export * from './components/VStackContext';

export { BODY_SCROLL_LOCK_SCROLL_ATTRIBUTE } from './directives/body-scroll-lock';

import {
  VueStackPartialedSettings,
  vueStackThemeSettingsDefaults,
} from './settings';
export * from './settings';

export interface VueStackOptions extends VueStackPartialedSettings {}

const plugin: PluginObject<VueStackOptions> = {
  installed: false,

  install(Vue, opts) {
    if (this.installed) return;

    Vue.prototype.$vstackSettings = vueStackThemeSettingsDefaults(opts);

    this.installed = true;
  },
};

export default plugin;
