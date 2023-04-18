import { CSSProperties } from 'react';

type Falsy = false | undefined | null | 0 | '';

export type SwipeModule = {
  (self: InnerSelf, ctx: CarouselMethods): () => void;
};
export type TransitionModule = {
  (ctx: CarouselMethods, self: InnerSelf): void;
};
export type TypeModule = {
  (self: InnerSelf): void;
};
export type AutoSizeModule = {
  (self: InnerSelf, viewOffset: number): () => void;
};
export type LazyModule = { (self: InnerSelf): void };

export type CarouselProps<T = any> = {
  items: T[];
  renderItem: (value: T, index: number) => JSX.Element;
  className?: string;
  style?: CSSProperties;
  type: TypeModule;
  lazy?: LazyModule;
  transition?: TransitionModule | Falsy;
  swipe?: SwipeModule | Falsy;
  autoSize?: AutoSizeModule | Falsy;
  timingFunction?: TimingFunction;
  transitionDuration?: Duration;
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
  gap?: string;
  swipeEndTransition?: string;
  onSwipeEnd?(
    ctx: CarouselMethods,
    index: number,
    getMomentum: (
      velocityThreshold?: number,
      deceleration?: number
    ) => [delta: number, duration: number]
  ): void;
};

export type UintArray = Uint8Array | Uint16Array | Uint32Array;

/** @internal */
export type InnerSelf = {
  _jumpTo(index: number): void;
  _translate(index: number): void;
  _speedup(newDuration: number): void;
  _speedupQueue(newDuration: number): void;
  _handleIndex(index: number): number;
  _forceRerender(_: {}): void;
  _lazy(currIndex: number, nextIndex: number): void;
  _finalize(currIndex: number): void;
  _render(props: CarouselProps): JSX.Element[];
  _cancel(): void;
  _isSwiping: boolean;
  _currIndex: number;
  _props: CarouselProps;
  _container: HTMLDivElement;
  _translateAxis: `translate${'X' | 'Y'}(`;
  _sizeKey: 'height' | 'width';
  _clientSizeKey: `client${'Height' | 'Width'}`;
  _clientAxisKey: `client${'X' | 'Y'}`;
  _rendered?: boolean;
};

export type CarouselMethods = {
  activeIndex: number | null;
  setActive(index: number | null): void;
  go(
    delta: number,
    duration?: Duration,
    timingFunction?: TimingFunction
  ): Promise<void>;
  goTo(
    index: number,
    duration?: Duration,
    timingFunction?: TimingFunction
  ): Promise<void>;
  jumpTo(index: number): void;
  updateRunningDuration(newDuration: number): void;
  setDurationForRunningQueue(duration: number): void;
  cancelRunningQueue(): void;
  parent: CarouselMethods | null;
  children: Partial<Record<string, CarouselMethods>>;
  isGoing: boolean;
};

export type Duration = number | ((distance: number) => number);

export type TimingFunction = (progress: number) => number;
