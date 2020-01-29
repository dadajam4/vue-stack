import Vue, { VNodeChildren } from 'vue';
import { VStackDynamicDialogOptions, VStackSnackbarDynamicSettings } from './';

export interface VueStackContextColor {
  base: string;
  text: string;
}

export type VueStackThemeName = 'light' | 'dark';
export const vueStackThemeNames: VueStackThemeName[] = ['light', 'dark'];

export type VueStackString = VNodeChildren | ((vm: Vue) => VNodeChildren);

export interface VueStackTheme {
  background: string;
  text: string;
  caption: string;
  backdrop: string;
  contexts: {
    [key: string]: VueStackContextColor;
  };
}

export interface VueStackPartialdTheme extends Partial<VueStackTheme> {}

export interface VueStackSettings {
  defaultTheme: VueStackThemeName;
  usePrefersColorScheme: boolean;
  useScrollStop: boolean;
  zIndex: number;
  ripple: boolean;
  themes: {
    light: VueStackTheme;
    dark: VueStackTheme;
  };
  strings: {
    ok?: VueStackString;
    cancel?: VueStackString;
    close?: VueStackString;
  };
  dialog: VStackDynamicDialogOptions;
  dialogActions: {
    cancel: {
      outline: boolean;
      color?: string;
    };
  };
  snackbar: Omit<VStackSnackbarDynamicSettings, 'content'>;
}

export interface VueStackPartialedSettings
  extends Omit<Partial<VueStackSettings>, 'themes'> {
  themes?: {
    light?: VueStackPartialdTheme;
    dark?: VueStackPartialdTheme;
  };
}

const merge = <T = object>(target: T, source: object): T => {
  for (const key of Object.keys(source)) {
    if (key in target) {
      const sourceValue = source[key];
      if (sourceValue === undefined) continue;

      if (sourceValue instanceof Object && typeof sourceValue !== 'function') {
        target[key] = merge(target[key], sourceValue);
      } else {
        target[key] = sourceValue;
      }
    }
  }
  return target;
};

export const vueStackThemeSettingsDefaults = (
  source?: VueStackPartialedSettings,
): VueStackSettings => {
  const settings: VueStackSettings = {
    defaultTheme: 'light',
    usePrefersColorScheme: true,
    useScrollStop: true,
    zIndex: 32767,
    ripple: true,
    themes: {
      light: {
        background: '#fff',
        text: 'rgba(0, 0, 0, 0.87)',
        caption: 'rgba(0, 0, 0, 0.87)',
        backdrop: 'rgba(33, 33, 33, 0.46)',
        contexts: {
          primary: {
            base: '#1976d2',
            text: '#fff',
          },
          secondary: {
            base: '#424242',
            text: '#fff',
          },
          gray: {
            base: '#616161',
            text: '#fff',
          },
          accent: {
            base: '#82b1ff',
            text: '#fff',
          },
          dark: {
            base: '#323232',
            text: '#fff',
          },
          error: {
            base: '#ff5252',
            text: '#fff',
          },
          info: {
            base: '#2196f3',
            text: '#fff',
          },
          success: {
            base: '#4caf50',
            text: '#fff',
          },
          warning: {
            base: '#ffc107',
            text: '#fff',
          },
          muted: {
            base: 'rgba(0, 0, 0, 0.26)',
            text: 'rgba(0, 0, 0, 0.12)',
          },
        },
      },
      dark: {
        background: '#292a2d',
        text: '#e1e1e1',
        caption: '#a5a5a5',
        backdrop: 'rgba(33, 33, 33, 0.46)',
        contexts: {
          primary: {
            base: '#1976d2',
            text: '#fff',
          },
          secondary: {
            base: '#424242',
            text: '#fff',
          },
          gray: {
            base: '#616161',
            text: '#fff',
          },
          accent: {
            base: '#82b1ff',
            text: '#fff',
          },
          dark: {
            base: '#121212',
            text: '#fff',
          },
          error: {
            base: '#ff5252',
            text: '#fff',
          },
          info: {
            base: '#2196f3',
            text: '#fff',
          },
          success: {
            base: '#4caf50',
            text: '#fff',
          },
          warning: {
            base: '#ffc107',
            text: '#fff',
          },
          muted: {
            base: 'rgba(255, 255, 255, 0.26)',
            text: 'rgba(255, 255, 255, 0.12)',
          },
        },
      },
    },
    strings: {
      ok: 'OK',
      cancel: 'CANCEL',
      close: 'CLOSE',
    },
    snackbar: {
      color: 'dark',
    },
    dialog: {
      transition: 'v-stack-slide-y',
      backdrop: true,
      closeOnEsc: true,
      persistent: false,
      navigationGuard: true,
      minWidth: 280,
      maxWidth: 540,
      header: '',
    },
    dialogActions: {
      cancel: {
        outline: true,
        color: 'primary',
      },
    },
  };

  return source ? merge<typeof settings>(settings, source) : settings;
};

declare module 'vue/types/vue' {
  interface Vue {
    $vstackSettings: VueStackSettings;
  }
}
