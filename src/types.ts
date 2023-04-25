import { CSSProperties } from 'react';

type Falsy = false | undefined | null | 0 | '';

export type SwipeModule = {
  (innerData: InternalData, data: CarouselData): () => void;
};
export type TransitionModule = {
  (innerData: InternalData): () => void;
};
export type TypeModule = {
  (innerData: InternalData): void;
};
export type AutoSizeModule = {
  (innerData: InternalData, viewOffset: number): () => void;
};
export type LazyModule = { (innerData: InternalData): void };

export type CarouselProps<T = any> = {
  items: T[];
  renderItem: (value: T, index: number) => JSX.Element;
  className?: string;
  style?: CSSProperties;
  type: TypeModule;
  lazy?: LazyModule;
  transition?: TransitionModule | Falsy;
  mouseSwipe?: SwipeModule | Falsy;
  touchSwipe?: SwipeModule | Falsy;
  autoSize?: AutoSizeModule | Falsy;
  timingFunction?: TimingFunction;
  transitionDuration?: Duration;
  lazyOffset?: number;
  keepMounted?: number;
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
   */
  viewOffset?: number;
  gap?: string;
  onSwipeStart?(carousel: CarouselData): void;
  onSwipeEnd?(
    carousel: CarouselData,
    index: number,
    getMomentum: (
      velocityThreshold?: number,
      deceleration?: number
    ) => [delta: number, duration: number]
  ): void;
};

/** @internal */
export type ClientAxisKey = `client${'X' | 'Y'}`;

export type InternalData = {
  _jumpTo(index: number): void;
  _translate(index: number): void;
  _handleIndex(index: number): number;
  _forceRerender(_: {}): void;
  _lazy(currIndex: number, nextIndex: number): void;
  _finalize(currIndex: number): void;
  _speedup(duration: number): void;
  _speedupQueue(duration: number): void;
  _cancel(index: -1, jump?: true): void;
  _render(props: CarouselProps): JSX.Element[];
  _go: CarouselData['go'];
  _goTo: CarouselData['goTo'];
  _currIndex: number;
  _props: CarouselProps;
  _container: HTMLDivElement;
  _translateAxis: `translate${'X' | 'Y'}(`;
  _sizeKey: 'height' | 'width';
  _clientSizeKey: `client${'Height' | 'Width'}`;
  _clientAxisKey: ClientAxisKey;
  _rendered?: boolean;
  _isSwiping: boolean;
  _isGoing: boolean;
};

export type CarouselData = {
  activeIndex: number | null;
  setActive(index: number | null): void;
  go(
    delta: number,
    duration?: Duration,
    timingFunction?: TimingFunction
  ): Promise<number>;
  goTo(
    index: number,
    duration?: Duration,
    timingFunction?: TimingFunction
  ): Promise<number>;
  jumpTo(index: number): void;
  updateRunningDuration(newDuration: number): void;
  setDurationForRunningQueue(duration: number): void;
  cancelRunningQueue(): void;
  isGoing(): boolean;
  isSwiping(): boolean;
  getCurrentIndex(): number;
};

export type Duration = number | ((delta: number) => number);

export type TimingFunction = (progress: number) => number;
