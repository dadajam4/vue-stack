import './styles/_index.scss';

import { PluginObject } from 'vue/types';
export * from './components';
export * from './directives';

import { VStackDefaults as VueStackOptions } from './components/VStackContext';
export { VStackDefaults as VueStackOptions } from './components/VStackContext';

const plugin: PluginObject<VueStackOptions> = {
  installed: false,

  install(Vue, opts = {}) {
    if (this.installed) return;

    Vue.prototype.$vstackDefaults = opts;

    this.installed = true;
  },
};

export default plugin;
