import { VNodeDirective, VNode } from 'vue/types/vnode';
import { disableBodyScroll, enableBodyScroll } from '../bodyScrollLock';

export interface ClickOutsideDirective extends VNodeDirective {
  value?: boolean;
}

export const BODY_SCROLL_LOCK_SCROLL_ATTRIBUTE =
  'data-vstack-scroll-lock-scroller';

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
      const lockElement =
        el.querySelector(`[${BODY_SCROLL_LOCK_SCROLL_ATTRIBUTE}]`) || el;

      disableBodyScroll(lockElement);
      this.els.push(el);
      this.check();
    }
  }

  remove(el: HTMLElement) {
    const index = this.els.indexOf(el);
    if (index !== -1) {
      const lockElement =
        el.querySelector(`[${BODY_SCROLL_LOCK_SCROLL_ATTRIBUTE}]`) || el;

      enableBodyScroll(lockElement);
      this.els.splice(index, 1);
      this.check();
    }
  }
}

const stacks = new Stacks();

export default {
  name: 'body-scroll-lock',

  inserted(el: HTMLElement, binding: ClickOutsideDirective, vnode: VNode) {
    if (vnode.context && !vnode.context.$vstackSettings.useScrollStop) {
      return;
    }
    binding.value && stacks.push(el);
  },

  componentUpdated(el, binding: ClickOutsideDirective, vnode: VNode) {
    if (vnode.context && !vnode.context.$vstackSettings.useScrollStop) {
      return;
    }
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
