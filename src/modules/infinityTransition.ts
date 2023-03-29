import { TransitionModule } from '../types';
import positiveOrZero from '../utils/positiveOrZero';

const infinityTransition: TransitionModule = function (
  delta,
  transition,
  resolve
) {
  const self = this;

  const props = self._props;

  const lazy = props.lazy;

  const itemsCount = props.items.length;

  const viewOffset = props.viewOffset || 0;

  const isLazy = lazy != undefined && lazy * 2 + 1 + viewOffset < itemsCount;

  const prevIndex = self._currIndex;

  const fakeIndex = prevIndex + delta;

  const isCycledGoPrevious = fakeIndex < 0;

  const maxNonOrderedIndex = itemsCount - viewOffset - 1;

  const prevOrderedCount = positiveOrZero(prevIndex - maxNonOrderedIndex);

  const currIndex = ((fakeIndex % itemsCount) + itemsCount) % itemsCount;

  const cycledPrevIndex = isCycledGoPrevious
    ? self._currIndex - delta
    : prevIndex;

  const currOrderedCount = positiveOrZero(
    (isCycledGoPrevious ? cycledPrevIndex : fakeIndex) - maxNonOrderedIndex
  );

  const beforeTransitionOffset =
    cycledPrevIndex +
    (isLazy && Math.abs(delta) + lazy + viewOffset < itemsCount
      ? positiveOrZero(
          Math.max(
            cycledPrevIndex + lazy,
            isCycledGoPrevious ? currIndex : fakeIndex
          ) - maxNonOrderedIndex
        ) -
        positiveOrZero(
          Math.min(
            cycledPrevIndex - lazy,
            isCycledGoPrevious ? currIndex : fakeIndex
          )
        )
      : 0) -
    Math.max(prevOrderedCount, currOrderedCount);

  const isNextFrameNeeded =
    beforeTransitionOffset != self._realIndex ||
    currOrderedCount != prevOrderedCount;

  const runTransition = () => {
    if (isLazy && !isNextFrameNeeded) {
      self._setLazyRenderIndexes([prevIndex, fakeIndex]);
    }

    self._handleTransition(transition!, beforeTransitionOffset + delta, () => {
      const orderOffset = positiveOrZero(currIndex - maxNonOrderedIndex);

      const afterTransitionOffset =
        (isLazy && currIndex > lazy
          ? lazy + positiveOrZero(currIndex + lazy - maxNonOrderedIndex)
          : currIndex) - orderOffset;

      const removeIndex = isCycledGoPrevious
        ? orderOffset
        : fakeIndex >= itemsCount
        ? 0
        : currOrderedCount < prevOrderedCount
        ? currOrderedCount
        : -1;

      if (removeIndex >= 0) {
        self._removeOrder(removeIndex);
      }

      if (self._realIndex != afterTransitionOffset) {
        self._translate(afterTransitionOffset);
      }

      if (isLazy) {
        self._setLazyRenderIndexes([currIndex, currIndex]);
      }

      resolve();
    });
  };

  self._currIndex = currIndex;

  if (isNextFrameNeeded) {
    requestAnimationFrame(() => {
      if (isLazy) {
        self._setLazyRenderIndexes([prevIndex, fakeIndex]);
      }

      if (currOrderedCount > prevOrderedCount) {
        self._addOrder(prevOrderedCount, currOrderedCount);
      }

      self._translate(beforeTransitionOffset);

      requestAnimationFrame(runTransition);
    });
  } else {
    runTransition();
  }
};

export default infinityTransition;
