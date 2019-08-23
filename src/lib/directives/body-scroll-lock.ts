import { VNodeDirective } from 'vue/types/vnode';
import { disableBodyScroll, enableBodyScroll } from '../bodyScrollLock';

export interface ClickOutsideDirective extends VNodeDirective {
  value?: boolean;
}

class Stacks {
  els: HTMLElement[] = [];
  active: boolean = false;

  private check() {
    const active = this.els.length > 0;
    if (active && !this.active) {
      this.activate();
    } else if (!active && this.active) {
      this.deactivate();
    }
  }

  private activate() {
    document.documentElement.setAttribute('data-vstack-body-scroll-lock', '');
    this.active = true;
  }

  private deactivate() {
    document.documentElement.removeAttribute('data-vstack-body-scroll-lock');
    this.active = false;
  }

  push(el: HTMLElement) {
    if (!this.els.includes(el)) {
      disableBodyScroll(el);
      this.els.push(el);
      this.check();
    }
  }

  remove(el: HTMLElement) {
    const index = this.els.indexOf(el);
    if (index !== -1) {
      enableBodyScroll(el);
      this.els.splice(index, 1);
      this.check();
    }
  }
}

const stacks = new Stacks();

export default {
  name: 'body-scroll-lock',

  inserted(el: HTMLElement, binding: ClickOutsideDirective) {
    binding.value && stacks.push(el);
  },

  componentUpdated(el, binding: ClickOutsideDirective) {
    if (binding.value) {
      stacks.push(el);
    } else {
      stacks.remove(el);
    }
  },

  unbind(el: HTMLElement) {
    stacks.remove(el);
  },
};
