import { InnerSelf, CarouselMethods, TimingFunction } from '../types';
import { DEFAULT_FAST_TRANSITION } from './constants';

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
    duration?: number
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
      self._increase();

      duration = 100;

      await prevPromise;
    }

    const delta = valueToDelta(value);

    if (!delta) {
      resolve();
    } else if (timingFunction) {
      let start: number;

      let currTime: number;

      let progress = 0;

      const prevIndex = self._currIndex;

      self._increase = () => {
        duration = 100;

        start = currTime - progress * duration;
      };

      const tick = (time: number) => {
        currTime = time;

        progress = (time - start) / duration!;

        if (progress < 1) {
          self._jumpTo(prevIndex + delta * timingFunction(progress));

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
      requestAnimationFrame(() => {
        self._jumpTo(self._currIndex + delta);

        resolve();
      });
    }

    return promise;
  };

  // @ts-ignore
  ctx.go = (delta, timingFunction, duration) =>
    go(transformGoValue, delta, timingFunction, duration);
  // @ts-ignore
  ctx.goTo = (index, timingFunction, duration) =>
    go(transformGoToValue, index, timingFunction, duration);
};

/** @internal */
export default handleGo;
