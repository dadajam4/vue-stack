import Vue, { FunctionalComponentOptions } from 'vue';

export interface SnackPosition {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export interface SnackProps {
  position: {
    type: SnackPosition;
    required: true;
  };
}

const addOnceEventListener = (
  el: EventTarget,
  event: string,
  cb: (ev: Event) => void,
): void => {
  const once = (ev: Event) => {
    cb(ev);
    el.removeEventListener(event, once, false);
  };
  el.addEventListener(event, once, false);
};

const HORIZONTAL_MARGIN = 24;
const SAFE_TIMEOUT = 1000;

const getHeight = (el: HTMLElement): Promise<number> => {
  const { height } = el.getBoundingClientRect();
  if (height) return Promise.resolve(height);

  return new Promise(resolve => {
    const tick = () => {
      const { height } = el.getBoundingClientRect();
      if (height) {
        resolve(height);
      } else {
        Vue.nextTick(tick);
      }
    };
    tick();
  });
};

const VStackSnackbarTransition: FunctionalComponentOptions<{
  position: SnackPosition;
}> = {
  name: 'v-stack-snackbar-transition',
  functional: true,
  props: {
    position: {
      type: Object,
      required: true,
    },
  },

  render(h, { props, children, listeners }) {
    const { top, left, right } = props.position;
    const hasHorizontal = left || right;
    const marginProp = top ? 'marginTop' : 'marginBottom';
    let safeTimer: number | null = null;

    const kickListener = (event: string, ...payload: any) => {
      const listener = listeners[event];
      if (listener) {
        const list = Array.isArray(listener) ? listener : [listener];
        list.forEach(f => {
          f(...payload);
        });
      }
    };

    const setOffset = (
      el: HTMLElement,
      disableTransition = false,
    ): Promise<void> => {
      return new Promise(resolve => {
        getHeight(el).then(height => {
          let offset = -height;
          if (hasHorizontal) offset -= HORIZONTAL_MARGIN;
          if (!disableTransition) {
            el.style[marginProp] = offset + 'px';
            return resolve();
          }
          el.style.transition = 'none';
          el.style[marginProp] = offset + 'px';
          setTimeout(() => {
            el.style.transition = '';
            setTimeout(resolve, 0);
          }, 0);
        });
      });
    };

    const removeOffset = (
      el: HTMLElement,
      disableTransition = false,
    ): Promise<void> => {
      if (!disableTransition) {
        el.style[marginProp] = '';
        return Promise.resolve();
      }

      return new Promise(resolve => {
        el.style.transition = 'none';
        el.style[marginProp] = '';
        setTimeout(() => {
          el.style.transition = '';
          setTimeout(resolve, 0);
        }, 0);
      });
    };

    const clearSafeTimer = () => {
      if (safeTimer !== null) {
        clearTimeout(safeTimer);
        safeTimer = null;
      }
    };

    const data = {
      on: {
        beforeEnter: (el: HTMLElement) => {
          kickListener('beforeEnter', el);
        },
        enter: (el: HTMLElement, done: () => void) => {
          clearSafeTimer();
          safeTimer = window.setTimeout(() => {
            clearSafeTimer();
            done();
          }, SAFE_TIMEOUT);

          const beforeTimer = safeTimer;
          kickListener('enter', el, done);

          setOffset(el, true).then(() => {
            removeOffset(el);
            addOnceEventListener(el, 'transitionend', e => {
              if (beforeTimer !== safeTimer) return;

              const { propertyName } = e as TransitionEvent;
              if (propertyName.indexOf('margin') === 0) {
                clearSafeTimer();
                done();
              }
            });
          });
        },
        afterEnter: (el: HTMLElement) => {
          removeOffset(el);
          clearSafeTimer();
          kickListener('afterEnter', el);
        },
        enterCancelled: (el: HTMLElement) => {
          removeOffset(el);
          clearSafeTimer();
          kickListener('enterCancelled', el);
        },
        beforeLeave: (el: HTMLElement) => {
          kickListener('beforeLeave', el);
        },
        leave: (el: HTMLElement, done: () => void) => {
          clearSafeTimer();
          safeTimer = window.setTimeout(() => {
            clearSafeTimer();
            done();
          }, SAFE_TIMEOUT);

          const beforeTimer = safeTimer;
          kickListener('leave', el, done);

          setOffset(el).then(() => {
            addOnceEventListener(el, 'transitionend', e => {
              if (beforeTimer !== safeTimer) return;

              const { propertyName } = e as TransitionEvent;
              if (propertyName.indexOf('margin') === 0) {
                removeOffset(el, true);
                clearSafeTimer();
                done();
              }
            });
          });
        },
        afterLeave: (el: HTMLElement) => {
          clearSafeTimer();
          removeOffset(el);
          kickListener('afterLeave', el);
        },
        leaveCancelled: (el: HTMLElement) => {
          clearSafeTimer();
          removeOffset(el);
          kickListener('leaveCancelled', el);
        },
      },
    };
    return h('transition', data, children);
  },
};

export default VStackSnackbarTransition;
