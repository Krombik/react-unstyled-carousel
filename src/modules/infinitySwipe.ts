import { SwipeModule } from '../types';
import { DEFAULT_FAST_TRANSITION } from '../utils/constants';

const infinitySwipe: SwipeModule = (self, isVertical) => {
  const container = self._container;

  const wrapper = container.parentElement!;

  const children = container.children as HTMLCollectionOf<HTMLElement>;

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

    // const lazy = props.lazy;

    const itemSize = container.children[0][clientProperty] + gap;

    const itemsCount = props.items.length;

    const lastItemIndex = itemsCount - 1;

    const distToStart = currIndex * itemSize;

    const distToEnd = (lastItemIndex - currIndex - viewOffset) * itemSize;

    // const isLazy =
    //   lazy != undefined && lazy * 2 + 1 + viewOffset < itemsCount;

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

    const movingListener = (e: HTMLElementEventMap[K]) => {
      cancelAnimationFrame(handle);

      offset = getOffset(e);

      if (offset && self._isFree) {
        self._completion ||= promise;

        handle = requestAnimationFrame(() => {
          const l = self._styles.length;

          if (offset > 0) {
            const dist = distToStart - offset;

            if (dist > 0) {
              const count = Math.ceil(dist / itemSize - Number.EPSILON);

              const index = count - lastItemIndex + viewOffset;

              // if (isLazy) {

              // }

              newCurrIndex = count;

              currRealIndex = count;

              if (index >= 0) {
                currRealIndex -= index;

                if (index > l) {
                  self._addOrder(l, index);
                } else if (index < l) {
                  self._removeOrder(index);
                }
              } else {
                self._removeOrder(0);
              }
            } else {
              const count = Math.floor(Number.EPSILON - dist / itemSize) + 1;

              if (count > l) {
                const styles = self._styles;

                for (let i = l; i < count; i++) {
                  const style = children[lastItemIndex - i].style;

                  style.order = -styles.push(style) as any;
                }
              } else if (count < l) {
                self._removeOrder(count);
              }

              newCurrIndex = itemsCount - count + 1;

              currRealIndex = 1;
            }
          } else {
            const dist = distToEnd + offset;

            if (dist > 0) {
              currRealIndex = newCurrIndex =
                lastItemIndex -
                Math.ceil(dist / itemSize - Number.EPSILON) -
                viewOffset;

              self._removeOrder(0);
            } else {
              const count = Math.floor(Number.EPSILON - dist / itemSize) + 1;

              if (count > l) {
                self._addOrder(l, count);
              } else if (count < l) {
                self._removeOrder(count);
              }

              currRealIndex = lastItemIndex - viewOffset - 1;

              newCurrIndex = (currRealIndex + count) % itemsCount;
            }
          }

          self._translate(currRealIndex, offset % itemSize);
        });
      }
    };

    const endListener = () => {
      window.removeEventListener(endEvent, endListener);

      container.removeEventListener(moveEvent, movingListener);

      cancelAnimationFrame(handle);

      const additionalIndex = Math.round((offset % itemSize) / itemSize);

      self._handleTransition(
        DEFAULT_FAST_TRANSITION,
        currRealIndex - additionalIndex,
        () => {
          self._jumpTo((newCurrIndex - additionalIndex) % itemsCount);

          resolve();
        }
      );
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
