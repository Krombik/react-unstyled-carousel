import noop from 'lodash.noop';
import { ClientAxisKey, CarouselData, InternalData } from '../types';
import { ORIENTATION_CHANGE_EVENT, RESIZE_EVENT } from './constants';

/** @internal */
const handleSwipeListener = <
  K extends 'mouse' | 'touch',
  E extends MouseEvent | TouchEvent = K extends 'mouse'
    ? MouseEvent
    : TouchEvent
>(
  innerData: InternalData,
  data: CarouselData,
  startEvent: K extends 'mouse' ? `${K}down` : `${K}start`,
  moveEvent: K extends 'mouse' ? `${K}move` : `${K}move`,
  endEvent: K extends 'mouse' ? `${K}up` : `${K}end`,
  check: (e: E) => boolean,
  getPositionData: (e: E) => { [key in ClientAxisKey]: number }
) => {
  let endListener = noop;

  let isAlive = true;

  const container = innerData._container;

  const wrapper = container.parentElement!;

  const eventListenerOptions = {
    passive: false,
  } satisfies AddEventListenerOptions;

  const startListener = (e: E) => {
    if (innerData._isEnabled() && check(e)) {
      (innerData._props.onSwipeStart || noop)(data);

      if (!innerData._isGoing) {
        innerData._isSwiping = true;

        let handle: number;

        let diff = 0;

        const clientAxisKey = innerData._clientAxisKey;

        const start = getPositionData(e)[clientAxisKey];

        const startTime = performance.now();

        const prevIndex = innerData._currIndex;

        const clientSizeKey = innerData._clientSizeKey;

        const itemSize =
          container.children[0][clientSizeKey] +
          container[clientSizeKey] -
          wrapper[clientSizeKey];

        const jumpTo = innerData._jumpTo;

        const lazy = innerData._lazy;

        const movingListener = (e: E) => {
          if (check(e)) {
            cancelAnimationFrame(handle);

            handle = requestAnimationFrame(() => {
              diff = start - getPositionData(e)[clientAxisKey];

              const nextIndex = prevIndex + diff / itemSize;

              lazy(prevIndex, nextIndex);

              jumpTo(nextIndex);
            });
          }
        };

        endListener = () => {
          window.removeEventListener(endEvent, endListener);

          window.removeEventListener(RESIZE_EVENT, endListener);

          window.removeEventListener(ORIENTATION_CHANGE_EVENT, endListener);

          container.removeEventListener(moveEvent, movingListener);

          cancelAnimationFrame(handle);

          innerData._isSwiping = false;

          if (isAlive) {
            endListener = noop;

            const { onSwipeEnd } = innerData._props;

            if (onSwipeEnd) {
              onSwipeEnd(
                data,
                innerData._currIndex,
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

            if (!innerData._isGoing) {
              innerData._finalize(innerData._currIndex);
            }
          }
        };

        container.addEventListener(
          moveEvent,
          movingListener,
          eventListenerOptions
        );

        window.addEventListener(RESIZE_EVENT, endListener);

        window.addEventListener(ORIENTATION_CHANGE_EVENT, endListener);

        window.addEventListener(endEvent, endListener);
      }
    }
  };

  container.addEventListener(startEvent, startListener, eventListenerOptions);

  return () => {
    isAlive = false;

    container.removeEventListener(startEvent, startListener);

    endListener();
  };
};

/** @internal */
export default handleSwipeListener;
