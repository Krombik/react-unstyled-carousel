import { InnerSelf, CarouselMethods } from '../types';
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
    transition?: string
  ) => {
    self._isFree = false;

    let resolve!: () => void;

    const prevPromise = self._completion;

    const { style } = self._container;

    const promise = new Promise<void>((_resolve) => {
      resolve = () => {
        requestAnimationFrame(() => {
          if (promise == self._completion) {
            self._isFirst = true;

            delete self._completion;

            self._isFree = true;
          }

          _resolve();
        });
      };
    });

    self._completion = promise;

    if (prevPromise) {
      if (self._isFirst && style.transition) {
        style.transition = DEFAULT_FAST_TRANSITION;

        self._translate(self._realIndex, -0.001);

        self._isFirst = false;
      }

      transition &&= DEFAULT_FAST_TRANSITION;

      await prevPromise;
    }

    const delta = valueToDelta(value);

    if (!delta) {
      resolve();
    } else if (transition && self._go) {
      self._go(delta, transition, resolve);
    } else {
      requestAnimationFrame(() => {
        self._jumpTo(self._currIndex + delta);

        resolve();
      });
    }

    return promise;
  };

  ctx.go = (delta, transition) => go(transformGoValue, delta, transition);
  ctx.goTo = (index, transition) => go(transformGoToValue, index, transition);
};

/** @internal */
export default handleGo;
