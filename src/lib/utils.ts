import { VNodeData } from 'vue';

// https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
let _supportsPassive = false;
try {
  const opts = Object.defineProperty({}, 'passive', {
    get: function() {
      _supportsPassive = true;
    },
  });
  (window as any).addEventListener('test', null, opts);
  (window as any).removeEventListener('test', null, opts);
} catch (e) {}

export const SUPPORTS_PASSIVE: boolean = _supportsPassive;

export function isPromise<T = any>(obj: any): obj is Promise<T> {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}

export function toNumber(value: string | number) {
  return typeof value === 'number' ? value : parseFloat(value);
}

export function warn(message: string) {
  console.warn(`[vue-stack] ${message}`);
}

export function error(message: string) {
  return new Error(`[vue-stack] ${message}`);
}

export function pushVNodeEvent(data: VNodeData, event: string, cb: Function) {
  data.on = data.on || {};
  data.on[event] = data.on[event] || [];
  if (!Array.isArray(data.on[event]))
    data.on[event] = [data.on[event] as Function];
  (data.on[event] as Function[]).push(cb);
}

export function isFocusable(element: HTMLElement): Boolean {
  if (
    element.tabIndex > 0 ||
    (element.tabIndex === 0 && element.getAttribute('tabIndex') !== null)
  ) {
    return true;
  }

  if ((element as any).disabled) {
    return false;
  }

  switch (element.nodeName) {
    case 'A':
      return !!(element as any).href && (element as any).rel != 'ignore';
    case 'INPUT':
      return (
        (element as any).type != 'hidden' && (element as any).type != 'file'
      );
    case 'BUTTON':
    case 'SELECT':
    case 'TEXTAREA':
      return true;
    default:
      return false;
  }
}

export function attemptFocus(element: HTMLElement): boolean {
  if (!isFocusable(element)) {
    return false;
  }

  // aria.Utils.IgnoreUtilFocusChanges = true;
  try {
    element.focus();
  } catch (e) {}
  // aria.Utils.IgnoreUtilFocusChanges = false;
  return document.activeElement === element;
}
export function focusFirstDescendant(element: HTMLElement): boolean {
  for (let i = 0; i < element.childNodes.length; i++) {
    let child = element.childNodes[i];
    if (
      attemptFocus(child as HTMLElement) ||
      focusFirstDescendant(child as HTMLElement)
    ) {
      return true;
    }
  }
  return false;
}
