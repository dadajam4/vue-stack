import Vue from 'vue';
import {
  VStack,
  VStackDialog,
  VStackContainer,
  VStackDynamicContainer,
  VStackDynamicSetting,
} from './components';

import { VStackDynamicDialogOptions } from './dialog-service';

import { error } from '~/lib/utils';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface VStackStateSettings {
  zIndex: number;
  dialog: Omit<VStackDynamicDialogOptions, 'header' | 'actions' | 'content'>;
}

export type VStackPluginOption = Partial<VStackStateSettings>;

const DEFAULT_Z_INDEX = 32767;

export interface VStackGlobalState {
  uid: number;
  settings: VStackStateSettings;
  container: VStackContainer | null;
  containerWidth: number;
  containerHeight: number;
  dynamicContainer: VStackDynamicContainer | null;
  stacks: VStack[];
  createId: () => number;
  add: (stack: VStack) => number;
  remove: (stack: VStack) => VStack[];
  setToFront: (stack: VStack) => void;
  getFront: () => VStack | undefined;
  isFront: (stack: VStack) => boolean;
  updateContainerRect: () => void;
  dynnamic: <V = any>(setting: VStackDynamicSetting) => Promise<V>;
}

export function factory(options: VStackPluginOption = {}): VStackGlobalState {
  const { zIndex = DEFAULT_Z_INDEX, dialog = {} } = options;

  const settings: VStackStateSettings = {
    zIndex,
    dialog: {
      Ctor: VStackDialog,
      ...dialog,
    },
  };

  const states = Vue.observable<VStackGlobalState>({
    uid: 0,
    settings,
    container: null,
    containerWidth: 0,
    containerHeight: 0,
    dynamicContainer: null,
    stacks: [],

    createId(): number {
      this.uid = this.uid + 1;
      return this.uid;
    },

    add(stack: VStack): number {
      let index = -1;
      if (!this.stacks.includes(stack)) {
        stack.stackId = this.createId();
        index = this.stacks.push(stack);
      }
      return index;
    },

    remove(stack: VStack): VStack[] {
      const index = this.stacks.indexOf(stack);
      return this.stacks.splice(index, 1);
    },

    setToFront(stack: VStack) {
      const front = this.getFront();
      const maxActivateOrder = front ? front.activateOrder : 0;
      stack.activateOrder = maxActivateOrder + 1;
    },

    getFront(): VStack | undefined {
      const stacks = this.stacks.filter(stack => stack.isActive);
      const { length } = stacks;
      if (length === 0) return;
      let maxVm: VStack = null as any;
      let maxActivateOrder: number = 0;
      stacks.forEach(stack => {
        const { activateOrder } = stack;
        if (activateOrder > maxActivateOrder) {
          maxActivateOrder = activateOrder;
          maxVm = stack;
        }
      });
      return maxVm;
    },

    isFront(stack: VStack): boolean {
      const frontStack = this.getFront();
      return !!frontStack && frontStack.stackIs(stack);
    },

    updateContainerRect() {
      states.containerWidth = window.innerWidth;
      states.containerHeight = window.innerHeight;
    },

    dynnamic<V = any>(setting: VStackDynamicSetting) {
      const { dynamicContainer } = this;
      if (!dynamicContainer) {
        console.warn(setting);
        throw error('You need an instance of VStackDynamicContainer.');
      }
      return dynamicContainer.push<V>(setting);
    },
  });

  if (typeof window !== 'undefined') {
    states.updateContainerRect();
    window.addEventListener('load', states.updateContainerRect, false);
    window.addEventListener('resize', states.updateContainerRect, false);

    document.addEventListener(
      'keydown',
      e => {
        if (e.defaultPrevented) return;

        if (e.which === 27) {
          const frontStack = states.getFront();
          frontStack && frontStack.onEsc(e);
        }
      },
      false,
    );
  }
  return states;
}
