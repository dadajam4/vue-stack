import Vue, { VNodeChildren } from 'vue';
import { VStackDialog, VStackDialogAction } from './components';
import { NavigationGuard } from 'vue-router';

export interface VStackDynamicDialogOptions {
  Ctor?: typeof VStackDialog;
  transition?: string;
  backdrop?: boolean | string;
  closeOnEsc?: boolean;
  persistent?: boolean;
  navigationGuard?: boolean | NavigationGuard;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  header?: VNodeChildren;
  actions?: VStackDialogAction[];
  content?: VNodeChildren;
}

declare module 'vue/types/vue' {
  interface Vue {
    $dialog: typeof dialog;
    $alert: typeof alert;
  }
}

export function dialog<V = any>(
  this: Vue,
  opts: VStackDynamicDialogOptions,
): Promise<V> {
  const {
    transition = 'vv-stack-slide-y',
    backdrop = true,
    closeOnEsc = true,
    persistent = false,
    navigationGuard = true,
    minWidth = 280,
    maxWidth = 540,
  } = {
    ...this.$vstack.settings.dialog,
    ...opts,
  };

  return this.$vstack.dynnamic({
    Ctor: opts.Ctor || this.$vstack.settings.dialog.Ctor || VStackDialog,
    data: {
      props: {
        header: opts.header,
        actions: opts.actions,
        transition,
        backdrop,
        closeOnEsc,
        persistent,
        navigationGuard,
        width: opts.width,
        minWidth,
        maxWidth,
      },
    },
    children: opts.content,
  });
}

export function alert(
  this: Vue,
  opts: VStackDynamicDialogOptions | string,
): Promise<void> {
  const content: VNodeChildren = typeof opts === 'string' ? opts : opts.content;
  opts = {
    ...(typeof opts === 'string' ? undefined : opts),
    content,
  };
  opts.actions = opts.actions || [
    {
      type: 'ok',
      text: 'OK',
      autofocus: true,
      spacer: true,
      click: dialog => {
        dialog.resolve(true);
      },
    },
  ];
  return this.$dialog<void>(opts);
}

export function confirm(
  this: Vue,
  opts: VStackDynamicDialogOptions | string,
): Promise<boolean> {
  const content: VNodeChildren = typeof opts === 'string' ? opts : opts.content;
  opts = {
    ...(typeof opts === 'string' ? undefined : opts),
    content,
  };
  opts.actions = opts.actions || [
    {
      type: 'cancel',
      text: 'キャンセル',
      autofocus: true,
      spacer: true,
      click: dialog => {
        dialog.resolve(false);
      },
    },
    {
      type: 'ok',
      text: 'OK',
      click: dialog => {
        dialog.resolve(true);
      },
    },
  ];
  return this.$dialog<boolean>(opts);
}
