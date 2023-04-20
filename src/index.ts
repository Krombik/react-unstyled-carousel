export { default as Carousel } from './components/Carousel';

export { default as useActiveIndex } from './hooks/useActiveIndex';
export { default as useCarousel } from './hooks/useCarousel';

export { default as autoSize } from './modules/autoSize';
export { default as lazy } from './modules/lazy';
export { default as infinity } from './modules/infinity';
export { default as swipe } from './modules/swipe';
export { default as transition } from './modules/transition';

export * from './timingFunctions';

export {
  type CarouselData,
  type Duration,
  type TimingFunction,
  type CarouselProps,
  type LazyModule,
  type TypeModule,
  type SwipeModule,
  type AutoSizeModule,
  type TransitionModule,
} from './types';
