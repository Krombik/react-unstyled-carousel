import { TypeModule } from '../types';
import handleGo from '../utils/handleGo';
import positiveOrZero from '../utils/positiveOrZero';

const infinity: TypeModule = (self, ctx) => {
  const styles: CSSStyleDeclaration[] = [];

  const children = self._container.children as HTMLCollectionOf<HTMLElement>;

  const removeOrder = (from: number) => {
    const l = styles.length;

    if (l) {
      for (let i = from; i < l; i++) {
        styles[i].removeProperty('order');
      }

      styles.length = from;
    }
  };

  const addOrder = (start: number, end: number) => {
    for (let i = start; i < end; i++) {
      const { style } = children[i];

      style.order = styles.push(style) as any;
    }
  };

  self._styles = styles;

  self._removeOrder = removeOrder;

  self._addOrder = addOrder;

  self._jumpTo = (index: number) => {
    const { items, viewOffset = 0 } = self._props;

    const l = items.length;

    const maxLength = l - viewOffset;

    const currIndex = ((index % l) + l) % l;

    self._currIndex = currIndex;

    removeOrder(0);

    if (currIndex < maxLength) {
      self._translate(currIndex);
    } else {
      addOrder(0, l - currIndex);

      self._translate(maxLength - 1);
    }
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
