import { SwipeModule } from '../types';

const swipe: SwipeModule = (self, ctx) => {
  const container = self._container;

  const wrapper = container.parentElement!;

  const handleSwipeListener =
    <
      K extends 'mouse' | 'touch',
      E extends MouseEvent | TouchEvent = K extends 'mouse'
        ? MouseEvent
        : TouchEvent
    >(
      moveEvent: K extends 'mouse' ? `${K}move` : `${K}move`,
      endEvent: K extends 'mouse' ? `${K}up` : `${K}end`,
      check: (e: E) => boolean,
      getPosition: (e: E) => number
    ) =>
    (e: E) => {
      if (check(e)) {
        e.preventDefault();

        self._cancel();

        self._isSwiping = true;

        let handle: number;

        let diff = 0;

        const start = getPosition(e);

        const startTime = performance.now();

        const prevIndex = self._currIndex;

        const clientSizeKey = self._clientSizeKey;

        const itemSize =
          container.children[0][clientSizeKey] +
          container[clientSizeKey] -
          wrapper[clientSizeKey];

        const jumpTo = self._jumpTo;

        const lazy = self._lazy;

        const movingListener = (e: E) => {
          if (check(e)) {
            e.preventDefault();

            cancelAnimationFrame(handle);

            handle = requestAnimationFrame(() => {
              diff = start - getPosition(e);

              const nextIndex = prevIndex + diff / itemSize;

              lazy(prevIndex, nextIndex);

              jumpTo(nextIndex);
            });
          }
        };

        const endListener = () => {
          window.removeEventListener(endEvent, endListener);

          container.removeEventListener(moveEvent, movingListener);

          self._isSwiping = false;

          const { onSwipeEnd } = self._props;

          if (onSwipeEnd) {
            onSwipeEnd(
              ctx,
              self._currIndex,
              (velocityThreshold = 0.2, deceleration = 0.0006) => {
                const velocity = diff / (performance.now() - startTime);

                const absoluteVelocity = Math.abs(velocity);

                if (absoluteVelocity > velocityThreshold) {
                  const duration = absoluteVelocity / deceleration;

                  return [(velocity * duration) / (2 * itemSize), duration];
                }

                return [0, 0];
              }
            );
          }

          if (!ctx.isGoing) {
            self._finalize(self._currIndex);
          }
        };

        container.addEventListener(moveEvent, movingListener);

        window.addEventListener(endEvent, endListener);
      }
    };

  const touchListener = handleSwipeListener(
    'touchmove',
    'touchend',
    (e) => e.touches.length == 1,
    (e) => e.touches[0][self._clientAxisKey]
  );

  const mouseListener = handleSwipeListener(
    'mousemove',
    'mouseup',
    () => true,
    (e) => e[self._clientAxisKey]
  );

  container.addEventListener('touchstart', touchListener);

  container.addEventListener('mousedown', mouseListener);

  return () => {
    container.removeEventListener('touchstart', touchListener);

    container.removeEventListener('mousedown', mouseListener);
  };
};

export default swipe;
