import { CSSProperties } from 'react';

type Falsy = false | undefined | null | 0 | '';

export type SwipeModule = {
  (self: InnerSelf, isVertical?: boolean): () => void;
};
export type TransitionModule = {
  (
    this: InnerSelf,
    delta: number,
    timingFunction: TimingFunction,
    duration: number,
    resolve: () => void
  ): void;
};
export type TypeModule = {
  (self: InnerSelf, ctx: CarouselMethods): void;
};
export type AutoSizeModule = {
  (
    container: HTMLDivElement,
    viewOffset: number,
    isVertical?: boolean
  ): () => void;
};
export type LazyModule = { (self: InnerSelf): void };

export type CarouselProps<T = any> = {
  items: T[];
  renderItem: (value: T, index: number) => JSX.Element;
  className?: string;
  style?: CSSProperties;
  type: TypeModule;
  transition?: TransitionModule | Falsy;
  timingFunction?: TimingFunction;
  transitionDuration?: Duration;
  swipe?: SwipeModule | Falsy;
  autoSize?: AutoSizeModule | Falsy;
  lazy?: LazyModule;
  lazyOffset?: number;
  keepMounted?: number;
  name?: string;
  /**
   * @default 0
   */
  defaultIndex?: number;
  /**
   * if not provided - {@link CarouselProps.defaultIndex defaultIndex}
   */
  defaultActiveIndex?: number | null;
  vertical?: boolean;
  /**
   * Number of additional slides to display in the carousel view.
   * - If {@link Props.middle middle} is `true`, additional slides will be showed after the current slide, overwise additional slides will be showed before and after the current
   */
  viewOffset?: number;
  /**
   * @default "start"
   */
  translateAfter?: 'start' | 'middle' | 'end';
  gap?: string;
  swipeEndTransition?: string;
};

export type UintArray = Uint8Array | Uint16Array | Uint32Array;

/** @internal */
export type InnerSelf = {
  _jumpTo(index: number): void;
  _translate(index: number): void;
  _speedup(): void;
  _handleIndex(index: number): number;
  _forceRerender(_: {}): void;
  _lazy(currIndex: number, nextIndex: number): void;
  _cleanup(): void;
  _render(props: CarouselProps): JSX.Element[];
  _go: TransitionModule | Falsy;
  _translateAxis: string;
  _completion?: Promise<void>;
  _isFree: boolean;
  _currIndex: number;
  _props: CarouselProps;
  _container: HTMLDivElement;
};

export type CarouselMethods = {
  activeIndex: number | null;
  setActive(index: number | null): void;
  go(
    delta: number,
    timingFunction?: TimingFunction,
    duration?: Duration
  ): Promise<void>;
  goTo(
    index: number,
    timingFunction?: TimingFunction,
    duration?: Duration
  ): Promise<void>;
  jump(delta: number): void;
  jumpTo(index: number): void;
  parent: CarouselMethods | null;
  children: Partial<Record<string, CarouselMethods>>;
};

export type Duration = number | ((distance: number) => number);

export type TimingFunction = (progress: number) => number;
