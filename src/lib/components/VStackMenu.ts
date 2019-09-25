import { CreateElement } from 'vue';
import { Component, Mixins, Prop } from 'vue-property-decorator';
import VStack, { RenderContentResult } from './VStack';
import VStackTheme from './VStackTheme';
import { warn, toNumber } from '../utils';
import bodyScrollLock from '../directives/body-scroll-lock';

const DEFAULT_CONTAINER_MARGIN = 20;
const DEFAULT_DISTANCE = 10;
const DEFAULT_RESIZE_WATCH_DEBOUNCE = 250;

interface ComputedRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

@Component({
  name: 'v-stack-menu',
  directives: {
    bodyScrollLock,
  },
})
export default class VStackMenu extends Mixins<VStack, VStackTheme>(
  VStack,
  VStackTheme,
) {
  @Prop({ type: String, default: 'auto' }) transition!: string;
  @Prop({ type: Boolean }) top!: boolean;
  @Prop({ type: Boolean }) bottom!: boolean;
  @Prop({ type: Boolean }) left!: boolean;
  @Prop({ type: Boolean }) right!: boolean;
  @Prop({ type: Boolean }) allowOverflow!: boolean;
  @Prop({ type: [Number, String] }) width?: number | string;
  @Prop({ type: [Number, String] }) height?: number | string;
  @Prop({ type: [Number, String] }) maxWidth?: number | string;
  @Prop({ type: [Number, String] }) maxHeight?: number | string;
  @Prop({ type: [Number, String], default: DEFAULT_DISTANCE }) distance!:
    | number
    | string;
  @Prop({ type: [Number, String], default: DEFAULT_CONTAINER_MARGIN })
  edgeMargin!: number | string;

  @Prop({ type: [Number, String], default: DEFAULT_RESIZE_WATCH_DEBOUNCE })
  resizeWatchDebounce!: number | string;

  private pageXOffset: number = 0;
  private pageYOffset: number = 0;
  private rect: ComputedRect | null = null;
  private activatorRect: ComputedRect | null = null;

  get computedDistance() {
    return toNumber(this.distance);
  }

  get computedResizeWatchDebounce() {
    return toNumber(this.resizeWatchDebounce);
  }

  get computedEdgeMargin() {
    return toNumber(this.edgeMargin);
  }

  get minLeft() {
    return this.computedEdgeMargin + this.pageXOffset;
  }

  get minTop() {
    return this.computedEdgeMargin + this.pageYOffset;
  }

  get maxRight() {
    return this.$vstack.width - this.computedEdgeMargin + this.pageXOffset;
  }

  get maxBottom() {
    return this.$vstack.height - this.computedEdgeMargin + this.pageYOffset;
  }

  get computedWidth(): number | 'fit' | undefined {
    const { width } = this;
    if (width === 'fit') return width;
    if (width !== undefined) return toNumber(width);
  }

  get computedHeight(): number | 'fit' | undefined {
    const { height } = this;
    if (height === 'fit') return height;
    if (height !== undefined) return toNumber(height);
  }

  get computedMaxWidth(): number | 'fit' | undefined {
    const { maxWidth } = this;
    if (maxWidth !== undefined) return toNumber(maxWidth);
  }

  get computedMaxHeight(): number | 'fit' | undefined {
    const { maxHeight } = this;
    if (maxHeight !== undefined) return toNumber(maxHeight);
  }

  get positionFlags() {
    let { left, right, top, bottom } = this;
    if (!top && !bottom && !left && !right) bottom = true;
    if (top && bottom)
      warn('top and bottom can not be specified at the same time.');
    if (left && right)
      warn('left and right can not be specified at the same time.');
    return {
      left,
      right,
      top,
      bottom,
    };
  }

  get computedTransition() {
    const { transition } = this;
    if (transition !== 'auto') return transition;
    const { right, top, bottom } = this.positionFlags;
    if (bottom) return 'v-stack-slide-y';
    if (top) return 'v-stack-slide-y-reverse';
    if (right) return 'v-stack-slide-x';
    return 'v-stack-slide-x-reverse';
  }

  get computedRect(): ComputedRect | null {
    const { rect, activatorRect } = this;
    if (!rect) return null;
    if (!activatorRect) return null;

    const {
      allowOverflow,
      pageXOffset,
      pageYOffset,
      minLeft,
      minTop,
      maxRight,
      maxBottom,
      computedDistance,
    } = this;

    let {
      computedWidth,
      computedHeight,
      computedMaxWidth,
      computedMaxHeight,
    } = this;

    let left: number, top: number, width: number, height: number;

    const { width: myWidth, height: myHeight } = rect;

    const {
      top: activatorTop,
      left: activatorLeft,
      right: activatorRight,
      bottom: activatorBottom,
      width: activatorWidth,
      height: activatorHeight,
    } = activatorRect;

    if (computedWidth === 'fit')
      computedWidth = Math.max(activatorWidth, myWidth);
    if (computedHeight === 'fit')
      computedHeight = Math.max(activatorHeight, myHeight);
    if (computedMaxWidth === 'fit') computedMaxWidth = activatorWidth;
    if (computedMaxHeight === 'fit') computedMaxHeight = activatorHeight;

    const {
      top: isTop,
      bottom: isBottom,
      left: isLeft,
      right: isRight,
    } = this.positionFlags;

    width = typeof computedWidth === 'number' ? computedWidth : myWidth;
    height = typeof computedHeight === 'number' ? computedHeight : myHeight;

    if (typeof computedMaxWidth === 'number' && width > computedMaxWidth) {
      width = computedMaxWidth;
    }
    if (typeof computedMaxHeight === 'number' && height > computedMaxHeight) {
      height = computedMaxHeight;
    }

    if (isTop) {
      top = activatorTop - height;
    } else if (isBottom) {
      top = activatorBottom;
    } else {
      top = activatorTop - (height - activatorHeight) / 2;
    }

    top += pageYOffset;

    if (isLeft) {
      left = activatorLeft - width;
    } else if (isRight) {
      left = activatorRight;
    } else {
      left = activatorLeft - (width - activatorWidth) / 2;
    }

    left += pageXOffset;

    if (isBottom) {
      top += computedDistance;
    } else if (isTop) {
      top -= computedDistance;
    }

    if (isRight) {
      left += computedDistance;
    } else if (isLeft) {
      left -= computedDistance;
    }

    let right = left + width;
    let bottom = top + height;

    const rightDiff = right - maxRight;
    if (rightDiff > 0) {
      left -= rightDiff;
      right -= rightDiff;
    }

    const bottomDiff = bottom - maxBottom;
    if (bottomDiff > 0) {
      top -= bottomDiff;
      bottom -= bottomDiff;
    }

    const leftDiff = minLeft - left;
    if (leftDiff > 0) {
      left += leftDiff;
      right += leftDiff;
    }

    const topDiff = minTop - top;
    if (topDiff > 0) {
      top += topDiff;
      bottom += topDiff;
    }

    if (!allowOverflow) {
      const overflowX = right - maxRight;
      if (overflowX > 0) {
        width -= overflowX;
        right -= overflowX;
      }
      const overflowY = bottom - maxBottom;
      if (overflowY > 0) {
        height -= overflowY;
        bottom -= overflowY;
      }
    }

    return {
      left,
      right,
      top,
      bottom,
      width,
      height,
    };
  }

  get menuStyles() {
    const styles: { [key: string]: string } = {
      position: 'absolute',
    };

    const { computedRect } = this;
    if (computedRect) {
      styles.left = computedRect.left + 'px';
      styles.top = computedRect.top + 'px';
      styles.width = computedRect.width + 'px';
      styles.height = computedRect.height + 'px';
    } else {
      styles.visibility = 'hidden';
    }

    return styles;
  }

  private updatePageOffset() {
    const { scrollingElement } = document;
    if (!scrollingElement) {
      warn('missing document.scrollingElement try use polyfill');
      return;
    }
    this.pageXOffset = scrollingElement.scrollLeft;
    this.pageYOffset = scrollingElement.scrollTop;
  }

  protected onContentReady() {
    this.updateRects();
    this.startResizeWatch();
  }

  private resizeWatchTimerId: number | null = null;
  private _resizeWatchHandler?: (e: Event) => void;

  private startResizeWatch() {
    if (typeof window === 'undefined') return;
    this.clearResizeWatch();
    this._resizeWatchHandler = () => {
      this.resizeWatchTimerId = window.setTimeout(() => {
        this.clearResizeWatch();
        this.updateRects();
      }, this.computedResizeWatchDebounce);
    };
    window.addEventListener('resize', this._resizeWatchHandler, false);
  }

  private clearResizeWatch() {
    if (this.resizeWatchTimerId !== null) {
      clearTimeout(this.resizeWatchTimerId);
      this.resizeWatchTimerId = null;
    }
  }

  private updateRects() {
    this.updatePageOffset();
    this.updateMyRect();
    this.updateActivatorRect();
  }

  private updateMyRect() {
    const { content } = this.$refs;

    if (!content) {
      this.rect = null;
      return;
    }

    const originalDisplay = content.style.display;
    const originalWidth = content.style.width;
    const originalHeight = content.style.height;
    const originalMaxWidth = content.style.maxWidth;
    const originalMaxHeight = content.style.maxHeight;

    content.style.display = '';
    content.style.width = '';
    content.style.height = '';
    content.style.maxWidth = '';
    content.style.maxHeight = '';

    const rect = content.getBoundingClientRect();

    content.style.display = originalDisplay;
    content.style.width = originalWidth;
    content.style.height = originalHeight;
    content.style.maxWidth = originalMaxWidth;
    content.style.maxHeight = originalMaxHeight;

    this.rect = {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  }

  private updateActivatorRect() {
    const { $activator } = this;
    if (!$activator) {
      this.activatorRect = null;
      return;
    }
    const rect = $activator.getBoundingClientRect();

    this.activatorRect = {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  }

  protected beforeDestroy() {
    this.clearResizeWatch();
  }

  protected renderContent(h: CreateElement): RenderContentResult {
    const defaultSlot = this.$scopedSlots.default;
    return {
      tag: 'div',
      data: {
        staticClass: 'v-stack-menu',
        directives: [{ name: 'body-scroll-lock', value: this.isActive }],
        style: {
          ...this.menuStyles,
          ...this.themeStyles,
        },
      },
      children: defaultSlot && defaultSlot(this),
    };
  }
}
