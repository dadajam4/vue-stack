import './styles/_index.scss';

import { PluginObject } from 'vue/types';
export * from './components';
export * from './directives';

export interface VStackPluginOption {}

const plugin: PluginObject<VStackPluginOption> = {
  installed: false,

  install(Vue, opts = {}) {
    if (this.installed) return;
    this.installed = true;
  },
};

export default plugin;
