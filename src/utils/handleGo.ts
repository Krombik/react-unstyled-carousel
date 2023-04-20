import { InternalData, CarouselData, TimingFunction, Duration } from '../types';
import isFunction from './isFunction';
import noop from './noop';

/** @internal */
const handleGo = (
  innerData: InternalData,
  data: CarouselData,
  transformGoValue: (value: number) => number,
  transformGoToValue: (value: number) => number
) => {
  let completion: Promise<boolean> | undefined;

  let queueDuration: number | undefined;

  let resolve: (isCanceled: boolean, index?: number) => void = noop;

  let speedup: (duration: number) => void = noop;

  let speedupQueue: (duration: number) => void = noop;

  let isGoing = false;

  const go = async (
    valueToDelta: (value: number) => number,
    value: number,
    duration?: Duration,
    timingFunction?: TimingFunction
  ) => {
    if (data.isSwiping()) {
      return Promise.reject();
    }

    let currResolve!: typeof resolve;

    const prevPromise = completion;

    const promise = new Promise<boolean>((_resolve) => {
      currResolve = (isCanceled, index) => {
        if (promise == completion) {
          isGoing = false;

          queueDuration = completion = undefined;
        } else {
          isGoing = !isCanceled;
        }

        if (index != undefined) {
          innerData._finalize(index);
        }

        speedupQueue = speedup = resolve = noop;

        _resolve(isCanceled);
      };
    });

    completion = promise;

    if (prevPromise && (await prevPromise)) {
      currResolve(true);
    } else {
      resolve = currResolve;

      const delta = valueToDelta(value);

      if (delta) {
        isGoing = true;

        const jumpTo = innerData._jumpTo;

        const prevIndex = innerData._currIndex;

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

        speedup = (newDuration) => {
          duration = newDuration;
        };

        speedupQueue = (duration) => {
          queueDuration = duration;

          speedup(duration);
        };

        requestAnimationFrame((start) => {
          let currTime = start;

          let progress = 0;

          speedup = (newDuration) => {
            if (duration != newDuration) {
              duration = newDuration;

              start = currTime - progress * duration;
            }
          };

          const tick = (time: number) => {
            if (isGoing) {
              currTime = time;

              progress = (time - start) / (duration as number);

              if (progress < 1) {
                jumpTo(prevIndex + delta * timingFunction!(progress));

                requestAnimationFrame(tick);
              } else {
                currResolve(false, nextIndex);
              }
            }
          };

          innerData._lazy(prevIndex, nextIndex);

          jumpTo(prevIndex);

          requestAnimationFrame(tick);
        });
      } else {
        currResolve(false);
      }
    }

    return promise;
  };

  data.cancelRunningQueue = () => {
    resolve(true, innerData._currIndex);
  };

  data.updateRunningDuration = (newDuration) => {
    speedup(newDuration);
  };

  data.setDurationForRunningQueue = (duration) => {
    speedupQueue(duration);
  };

  data.isGoing = () => isGoing;

  data.go = go.bind(null, transformGoValue);

  data.goTo = go.bind(null, transformGoToValue);

  return () => {
    resolve(true);
  };
};

/** @internal */
export default handleGo;
