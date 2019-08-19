import { VNodeDirective } from 'vue/types/vnode';
import { disableBodyScroll, enableBodyScroll } from '../bodyScrollLock';

export interface ClickOutsideDirective extends VNodeDirective {
  value?: boolean;
}

export default {
  name: 'body-scroll-lock',

  inserted(el: HTMLElement, binding: ClickOutsideDirective) {
    binding.value && disableBodyScroll(el);
  },

  componentUpdated(el, binding: ClickOutsideDirective) {
    if (binding.value) {
      disableBodyScroll(el);
    } else {
      enableBodyScroll(el);
    }
  },

  unbind(el: HTMLElement) {
    enableBodyScroll(el);
  },
};
