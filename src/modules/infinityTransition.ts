import { TransitionModule } from '../types';

const infinityTransition: TransitionModule = function (
  delta,
  timingFunction,
  duration,
  resolve
) {
  const self = this;

  let start: number;

  const prevIndex = self._currIndex;

  const tick = (time: number) => {
    const progress = (time - start) / duration;

    if (progress < 1) {
      self._jumpTo(prevIndex + delta * timingFunction(progress));

      requestAnimationFrame(tick);
    } else {
      const currIndex = prevIndex + delta;

      self._currIndex = currIndex;

      self._jumpTo(currIndex);

      resolve();
    }
  };

  requestAnimationFrame((time) => {
    start = time;

    requestAnimationFrame(tick);
  });
};

export default infinityTransition;
