import './styles/_index.scss';

import { PluginObject } from 'vue/types';
export * from './components';
export * from './directives';
export * from './components/VStackContext';

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
