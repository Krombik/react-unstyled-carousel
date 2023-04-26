import { InternalData, TimingFunction, Duration } from '../types';
import getCanceled from './getCanceled';
import isFunction from './isFunction';
import noop from './noop';

/** @internal */
const handleGo = (
  innerData: InternalData,
  transformGoValue: (value: number) => number,
  transformGoToValue: (value: number) => number
) => {
  let completion: Promise<number> | undefined;

  let queueDuration: number | undefined;

  const go = async (
    valueToDelta: (value: number) => number,
    value: number,
    duration?: Duration,
    timingFunction?: TimingFunction
  ) => {
    if (!innerData._isEnabled() || innerData._isSwiping) {
      return getCanceled();
    }

    let resolve!: (index: number, jump?: boolean) => void;

    const prevPromise = completion;

    const promise = new Promise<number>((_resolve) => {
      resolve = (index, jump) => {
        if (promise == completion) {
          innerData._isGoing = false;

          queueDuration = completion = undefined;
        } else {
          innerData._isGoing = index >= 0;
        }

        if (jump) {
          innerData._finalize(index < 0 ? innerData._currIndex : index);
        }

        innerData._cancel = noop;

        innerData._speedup = noop;

        innerData._speedupQueue = noop;

        _resolve(index);
      };
    });

    completion = promise;

    if (prevPromise && (await prevPromise) < 0) {
      resolve(-1);
    } else {
      innerData._cancel = resolve;

      const delta = valueToDelta(value);

      const prevIndex = innerData._currIndex;

      if (delta) {
        innerData._isGoing = true;

        const jumpTo = innerData._jumpTo;

        const nextIndex = prevIndex + delta;

        const props = innerData._props;

        timingFunction ||= props.timingFunction!;

        if (queueDuration) {
          duration = queueDuration;
        } else {
          duration ||= props.transitionDuration!;

          if (isFunction(duration)) {
            duration = duration(delta);
          }
        }

        innerData._speedup = (newDuration) => {
          duration = newDuration;
        };

        innerData._speedupQueue = (duration) => {
          queueDuration = duration;

          innerData._speedup(duration);
        };

        requestAnimationFrame((start) => {
          let currTime = start;

          let progress = 0;

          innerData._speedup = (newDuration) => {
            if (duration != newDuration) {
              duration = newDuration;

              start = currTime - progress * duration;
            }
          };

          const tick = (time: number) => {
            if (innerData._isGoing) {
              currTime = time;

              progress = (time - start) / (duration as number);

              if (progress < 1) {
                jumpTo(prevIndex + delta * timingFunction!(progress));

                requestAnimationFrame(tick);
              } else {
                resolve(nextIndex, true);
              }
            }
          };

          innerData._lazy(prevIndex, nextIndex);

          jumpTo(prevIndex);

          requestAnimationFrame(tick);
        });
      } else {
        resolve(prevIndex);
      }
    }

    return promise;
  };

  innerData._go = go.bind(null, transformGoValue);

  innerData._goTo = go.bind(null, transformGoToValue);

  return () => {
    innerData._cancel(-1);

    innerData._go = getCanceled;

    innerData._goTo = getCanceled;
  };
};

/** @internal */
export default handleGo;
