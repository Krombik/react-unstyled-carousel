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
  const go = async (
    valueToDelta: (value: number) => number,
    value: number,
    timingFunction?: TimingFunction,
    duration?: Duration
  ) => {
    self._isFree = false;

    let resolve!: () => void;

    const prevPromise = self._completion;

    const promise = new Promise<void>((_resolve) => {
      resolve = () => {
        requestAnimationFrame(() => {
          if (promise == self._completion) {
            delete self._completion;

            self._isFree = true;
          }

          _resolve();
        });
      };
    });

    self._completion = promise;

    if (prevPromise) {
      self._speedup();

      duration = 100;

      await prevPromise;
    }

    const delta = valueToDelta(value);

    if (delta) {
      let start: number;

      let currTime: number;

      let progress = 0;

      const prevIndex = self._currIndex;

      const props = self._props;

      timingFunction ||= props.timingFunction!;

      duration ||= props.transitionDuration!;

      if (isFunction(duration)) {
        duration = duration(Math.abs(delta));
      }

      self._speedup = () => {
        self._speedup = noop;

        duration = 100;

        start = currTime - progress * duration;
      };

      const tick = (time: number) => {
        currTime = time;

        progress = (time - start) / (duration as number);

        if (progress < 1) {
          self._jumpTo(prevIndex + delta * timingFunction!(progress));

          requestAnimationFrame(tick);
        } else {
          self._jumpTo(prevIndex + delta);

          resolve();
        }
      };

      requestAnimationFrame((time) => {
        currTime = start = time;

        requestAnimationFrame(tick);
      });
    } else {
      resolve();
    }

    return promise;
  };

  ctx.go = go.bind(null, transformGoValue);

  ctx.goTo = go.bind(null, transformGoToValue);
};

/** @internal */
export default handleGo;
