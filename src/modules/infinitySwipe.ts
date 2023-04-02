import { SwipeModule } from '../types';
import { DEFAULT_FAST_TRANSITION } from '../utils/constants';

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

    let newCurrIndex = currIndex;

    let currRealIndex = self._realIndex;

    const clientProperty = isVertical ? 'clientHeight' : 'clientWidth';

    const gap = container[clientProperty] - wrapper[clientProperty];

    const props = self._props;

    const viewOffset = props.viewOffset || 0;

    const lazy = props.lazy;

    const itemSize = container.children[0][clientProperty] + gap;

    const itemsCount = props.items.length;

    // const lastItemIndex = itemsCount - 1;

    // const distToStart = currIndex * itemSize;

    // const distToEnd = (lastItemIndex - currIndex - viewOffset) * itemSize;

    const isLazy = lazy != undefined && lazy * 2 + 1 + viewOffset < itemsCount;

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

    let prevLazyIndex = currIndex;

    const jumpTo = self._jumpTo;

    const setLazyRenderIndexes = self._setLazyRenderIndexes;

    const movingListener = (e: HTMLElementEventMap[K]) => {
      cancelAnimationFrame(handle);

      offset = getOffset(e);

      if (offset && self._isFree) {
        self._completion ||= promise;

        handle = requestAnimationFrame(() => {
          const nextIndex = currIndex - offset / itemSize;

          if (isLazy) {
            const isGoNext = nextIndex > currIndex + lazy;

            if (isGoNext || nextIndex < currIndex - lazy) {
              const nextLazyIndex =
                Math[isGoNext ? 'ceil' : 'floor'](nextIndex);

              if (prevLazyIndex != nextLazyIndex) {
                prevLazyIndex = nextLazyIndex;

                setLazyRenderIndexes([currIndex, nextLazyIndex]);
              }
            }
          }

          jumpTo(nextIndex);
        });
      }
    };

    const endListener = () => {
      window.removeEventListener(endEvent, endListener);

      container.removeEventListener(moveEvent, movingListener);

      cancelAnimationFrame(handle);

      // const additionalIndex = Math.round((offset % itemSize) / itemSize);

      // self._handleTransition(
      //   DEFAULT_FAST_TRANSITION,
      //   currRealIndex - additionalIndex,
      //   () => {
      //     self._jumpTo(Math.round(currIndex - offset / itemSize));

      //     resolve();
      //   }
      // );
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
