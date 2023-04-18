import { InnerSelf, CarouselMethods, TimingFunction, Duration } from '../types';
import isFunction from './isFunction';
import noop from './noop';

/** @internal */
const handleGo = (
  self: InnerSelf,
  ctx: CarouselMethods,
  transformGoValue: (value: number) => number,
  transformGoToValue: (value: number) => number
) => {
  let completion: Promise<boolean> | undefined;

  let queueDuration: number | undefined;

  const go = async (
    valueToDelta: (value: number) => number,
    value: number,
    duration?: Duration,
    timingFunction?: TimingFunction
  ) => {
    if (self._isSwiping) {
      return Promise.reject();
    }

    let resolve!: (isSuccessful: boolean) => void;

    const prevPromise = completion;

    const promise = new Promise<boolean>((_resolve) => {
      resolve = (value) => {
        if (promise == completion) {
          ctx.isGoing = false;

          queueDuration = completion = undefined;
        }

        _resolve(value);
      };
    });

    completion = promise;

    if (prevPromise && (await prevPromise)) {
      resolve(true);
    } else {
      const delta = valueToDelta(value);

      if (delta) {
        ctx.isGoing = true;

        let isGoing = true;

        const jumpTo = self._jumpTo;

        const prevIndex = self._currIndex;

        const nextIndex = prevIndex + delta;

        const props = self._props;

        timingFunction ||= props.timingFunction!;

        if (queueDuration) {
          duration = queueDuration;
        } else {
          duration ||= props.transitionDuration!;

          if (isFunction(duration)) {
            duration = duration(Math.abs(delta));
          }
        }

        self._speedup = (newDuration) => {
          duration = newDuration;
        };

        self._speedupQueue = (duration) => {
          queueDuration = duration;

          self._speedup(duration);
        };

        self._cancel = () => {
          isGoing = false;

          resolve(true);
        };

        requestAnimationFrame((start) => {
          let currTime = start;

          let progress = 0;

          self._speedup = (newDuration) => {
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
                self._finalize(nextIndex);

                self._speedup = noop;

                self._cancel = noop;

                self._speedupQueue = noop;

                resolve(false);
              }
            }
          };

          self._lazy(prevIndex, nextIndex);

          jumpTo(prevIndex);

          requestAnimationFrame(tick);
        });
      } else {
        resolve(false);
      }
    }

    return promise;
  };

  ctx.cancelRunningQueue = () => {
    if (ctx.isGoing) {
      self._cancel();

      self._finalize(self._currIndex);
    }
  };

  ctx.updateRunningDuration = (newDuration) => self._speedup(newDuration);

  ctx.go = go.bind(null, transformGoValue);

  ctx.goTo = go.bind(null, transformGoToValue);
};

/** @internal */
export default handleGo;
