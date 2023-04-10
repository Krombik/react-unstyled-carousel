import { SwipeModule } from '../types';

const infinitySwipe: SwipeModule = (self, isVertical) => {
  const container = self._container;

  const wrapper = container.parentElement!;

  // const children = container.children as HTMLCollectionOf<HTMLElement>;

  const handleSwipeListener = <
    K extends Extract<keyof HTMLElementEventMap, 'mousemove' | 'touchmove'>
  >(
    moveEvent: K,
    endEvent: K extends 'mousemove' ? 'mouseup' : 'touchend',
    getOffset: (e: HTMLElementEventMap[K]) => number
  ) => {
    let resolve!: () => void;

    let handle: number;

    let offset: number;

    const currIndex = self._currIndex;

    const clientProperty = isVertical ? 'clientHeight' : 'clientWidth';

    const gap = container[clientProperty] - wrapper[clientProperty];

    const itemSize = container.children[0][clientProperty] + gap;

    const promise = new Promise<void>((_resolve) => {
      resolve = () => {
        requestAnimationFrame(() => {
          if (promise == self._completion) {
            delete self._completion;
          }

          _resolve();
        });
      };
    });

    const jumpTo = self._jumpTo;

    const movingListener = (e: HTMLElementEventMap[K]) => {
      cancelAnimationFrame(handle);

      offset = getOffset(e);

      if (offset && self._isFree) {
        self._completion ||= promise;

        handle = requestAnimationFrame(() => {
          const nextIndex = currIndex - offset / itemSize;

          self._lazy(currIndex, nextIndex);

          jumpTo(nextIndex);
        });
      }
    };

    const endListener = () => {
      window.removeEventListener(endEvent, endListener);

      container.removeEventListener(moveEvent, movingListener);

      cancelAnimationFrame(handle);

      self._cleanup();
    };

    container.addEventListener(moveEvent, movingListener);

    window.addEventListener(endEvent, endListener);
  };

  const clientProp = `client${isVertical ? 'Y' : 'X'}` as const;

  const touchListener = (e: TouchEvent) => {
    if (e.touches.length == 1) {
      e.preventDefault();

      const start = e.changedTouches[0][clientProp];

      handleSwipeListener(
        'touchmove',
        'touchend',
        (e) => e.changedTouches[0][clientProp] - start
      );
    }
  };

  const mouseListener = (e: MouseEvent) => {
    e.preventDefault();

    const start = e[clientProp];

    handleSwipeListener('mousemove', 'mouseup', (e) => e[clientProp] - start);
  };

  container.addEventListener('touchstart', touchListener);

  container.addEventListener('mousedown', mouseListener);

  return () => {
    container.removeEventListener('touchstart', touchListener);

    container.removeEventListener('mousedown', mouseListener);
  };
};

export default infinitySwipe;
