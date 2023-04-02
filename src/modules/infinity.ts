import { TypeModule, UintArray } from '../types';
import handleGo from '../utils/handleGo';
import positiveOrZero from '../utils/positiveOrZero';

const infinity: TypeModule = (self, ctx) => {
  const styles: CSSStyleDeclaration[] = [];

  const children = self._container.children as HTMLCollectionOf<HTMLElement>;

  const removeOrder = (from: number) => {
    for (let i = from; i < styles.length; i++) {
      styles[i].removeProperty('order');
    }

    styles.length = from;
  };

  const addOrder = (start: number, end: number) => {
    for (let i = start; i < end; i++) {
      const { style } = children[i];

      style.order = styles.push(style) as any;
    }
  };

  const binarySearch = (arr: UintArray, value: number, end: number) => {
    let start = 0;

    while (start <= end) {
      const mid = Math.floor((start + end) / 2);

      const item = arr[mid];

      if (item == value) {
        return mid;
      } else if (item < value) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }

    // If the value is not found, return -1
    return -1;
  };

  self._styles = styles;

  self._removeOrder = removeOrder;

  self._addOrder = addOrder;

  self._jumpTo = (index: number) => {
    const props = self._props;

    const l = props.items.length;

    const maxLength = l - (props.viewOffset || 0) - 1;

    const currIndex = ((index % l) + l) % l;

    self._currIndex = currIndex;

    if (currIndex > maxLength) {
      const currEnd = styles.length;

      const end = Math.ceil(currIndex - Number.EPSILON) - maxLength;

      if (currEnd < end) {
        for (let i = currEnd; i < end; i++) {
          const { style } = children[i];

          style.order = styles.push(style) as any;
        }
      } else if (currEnd > end) {
        removeOrder(end);
      }
    } else if (styles.length) {
      removeOrder(0);
    }

    const kek = Math.floor(currIndex);

    self._translate(
      (props.lazy == undefined
        ? currIndex
        : binarySearch(self._indexes, kek, self._length) + currIndex - kek) -
        styles.length
    );
  };

  handleGo(
    self,
    ctx,
    (delta) => delta % self._props.items.length,
    (index) => {
      const l = self._props.items.length;

      const dist1 = positiveOrZero(Math.min(index, l - 1)) - self._currIndex;

      const dist2 = dist1 - Math.sign(dist1) * l;

      const absoluteDist1 = Math.abs(dist1);

      const absoluteDist2 = Math.abs(dist2);

      return absoluteDist1 == absoluteDist2
        ? absoluteDist1
        : absoluteDist1 < absoluteDist2
        ? dist1
        : dist2;
    }
  );
};

export default infinity;
