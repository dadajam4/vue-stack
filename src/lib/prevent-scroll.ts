import { SUPPORTS_PASSIVE } from './utils';

export const HAS_DOCUMENT = typeof document !== 'undefined';

export interface LockPosition {
  x: number;
  y: number;
}

// space: 32, page up: 33, page down: 34, end: 35, home: 36
// left: 37, up: 38, right: 39, down: 40
export const SCROLLABLE_KEY_CODES = [32, 33, 34, 35, 36, 37, 38, 39, 40];

export const lockPosition: LockPosition = {
  x: 0,
  y: 0,
};

let htmlOverflowOrigin: string | null = null;
let bodyOverflowOrigin: string | null = null;

const eventListenerOptions: AddEventListenerOptions | boolean = SUPPORTS_PASSIVE
  ? {
      passive: false,
      capture: false,
    }
  : false;

const handleScroll = (e: Event) => {
  window.scrollTo(lockPosition.x, lockPosition.y);
};

const handleKeydown = (e: KeyboardEvent) => {
  if (
    e.target &&
    ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
  ) {
    return;
  }
  if (SCROLLABLE_KEY_CODES.includes(e.which)) {
    e.preventDefault();
  }
};

export function enableScroll() {
  if (!HAS_DOCUMENT || !document.scrollingElement) return;
  const { scrollingElement: se } = document;

  se.removeEventListener('scroll', handleScroll, eventListenerOptions);
  document.removeEventListener('keydown', handleKeydown);

  document.documentElement.style.overflow = htmlOverflowOrigin;
  document.body.style.overflow = bodyOverflowOrigin;
  htmlOverflowOrigin = null;
  bodyOverflowOrigin = null;
}

export function disableScroll() {
  if (!HAS_DOCUMENT || !document.scrollingElement) return;
  const { scrollingElement: se } = document;
  lockPosition.x =
    se.scrollLeft === undefined ? (se as any).scrollX : se.scrollLeft;
  lockPosition.y =
    se.scrollTop === undefined ? (se as any).scrollY : se.scrollTop;

  const { documentElement } = document;
  htmlOverflowOrigin = documentElement.style.overflow;
  bodyOverflowOrigin = document.body.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  se.addEventListener('scroll', handleScroll, eventListenerOptions);
  document.addEventListener('keydown', handleKeydown);
}
