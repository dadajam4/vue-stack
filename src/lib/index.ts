import './styles/_index.scss';

import { PluginObject } from 'vue/types';
export * from './components';
export * from './directives';

import { VStackGlobalState, VStackPluginOption, factory } from './states';
export * from './states';
import { dialog, alert, confirm } from './dialog-service';
export * from './dialog-service';

declare module 'vue/types/vue' {
  interface Vue {
    $vstack: VStackGlobalState;
  }
}

const plugin: PluginObject<VStackPluginOption> = {
  installed: false,

  install(Vue, opts = {}) {
    if (this.installed) return;

    const states = factory(opts);

    Vue.prototype.$vstack = states;
    Vue.prototype.$dialog = dialog;
    Vue.prototype.$alert = alert;
    Vue.prototype.$confirm = confirm;

    this.installed = true;
  },
};

export default plugin;
