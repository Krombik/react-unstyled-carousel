import { SwipeModule } from '../types';

const infinitySwipe: SwipeModule = (self) => {
  const container = self._container;

  const wrapper = container.parentElement!;

  // const children = container.children as HTMLCollectionOf<HTMLElement>;

  const handleSwipeListener = <
    K extends Extract<keyof HTMLElementEventMap, 'mousemove' | 'touchmove'>
  >(
    moveEvent: K,
    endEvent: K extends 'mousemove' ? 'mouseup' : 'touchend',
    e: HTMLElementEventMap[K],
    getPosition: (e: HTMLElementEventMap[K]) => number
  ) => {
    self._isSwiping = true;

    let handle: number;

    let start = getPosition(e);

    let currIndex = self._currIndex;

    const clientSizeKey = self._clientSizeKey;

    const itemSize =
      container.children[0][clientSizeKey] +
      container[clientSizeKey] -
      wrapper[clientSizeKey];

    const jumpTo = self._jumpTo;

    const lazy = self._lazy;

    const movingListener = (e: HTMLElementEventMap[K]) => {
      const currPos = getPosition(e);

      if (!self._completion) {
        cancelAnimationFrame(handle);

        handle = requestAnimationFrame(() => {
          const nextIndex = currIndex + (start - currPos) / itemSize;

          lazy(currIndex, nextIndex);

          jumpTo(nextIndex);
        });
      } else {
        start = currPos;

        currIndex = self._currIndex;
      }
    };

    const endListener = () => {
      window.removeEventListener(endEvent, endListener);

      container.removeEventListener(moveEvent, movingListener);

      if (!self._completion) {
        cancelAnimationFrame(handle);

        self._finalize(self._currIndex);

        self._isSwiping = false;
      }
    };

    container.addEventListener(moveEvent, movingListener);

    window.addEventListener(endEvent, endListener);
  };

  const touchListener = (e: TouchEvent) => {
    if (e.touches.length == 1) {
      e.preventDefault();

      handleSwipeListener(
        'touchmove',
        'touchend',
        e,
        (e) => e.changedTouches[0][self._clientAxisKey]
      );
    }
  };

  const mouseListener = (e: MouseEvent) => {
    e.preventDefault();

    handleSwipeListener(
      'mousemove',
      'mouseup',
      e,
      (e) => e[self._clientAxisKey]
    );
  };

  container.addEventListener('touchstart', touchListener);

  container.addEventListener('mousedown', mouseListener);

  return () => {
    container.removeEventListener('touchstart', touchListener);

    container.removeEventListener('mousedown', mouseListener);
  };
};

export default infinitySwipe;
