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
