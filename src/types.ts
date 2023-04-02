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

export type CarouselProps<T = any> = {
  items: T[];
  renderItem: (value: T, index: number) => JSX.Element;
  className?: string;
  style?: CSSProperties;
  type: TypeModule;
  transition?: TransitionModule | Falsy;
  swipe?: SwipeModule | Falsy;
  autoSize?: AutoSizeModule | Falsy;
  lazy?: number;
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
  _translate(index: number, offset?: number): void;
  _removeOrder(from: number): void;
  _addOrder(start: number, end: number): void;
  _handleTransition(
    transition: string,
    index: number,
    callback: () => void
  ): void;
  _setLazyRenderIndexes(value: [number, number]): void;
  _increase(): void;
  _go: TransitionModule | Falsy;
  _translateAxis: string;
  _completion?: Promise<void>;
  _isFree: boolean;
  _realIndex: number;
  _currIndex: number;
  _props: CarouselProps;
  _container: HTMLDivElement;
  _styles: CSSStyleDeclaration[];
  _indexes: UintArray;
  _length: number;
};

export type CarouselMethods = {
  activeIndex: number | null;
  setActive(index: number | null): void;
  go(delta: number): Promise<void>;
  go(
    delta: number,
    timingFunction: TimingFunction,
    duration: number
  ): Promise<void>;
  goTo(index: number): Promise<void>;
  goTo(
    index: number,
    timingFunction: TimingFunction,
    duration: number
  ): Promise<void>;
  parent: CarouselMethods | null;
  children: Partial<Record<string, CarouselMethods>>;
};

export type TimingFunction = (progress: number) => number;
