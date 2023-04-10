import { TypeModule } from '../types';
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

  self._jumpTo = (index: number) => {
    const props = self._props;

    const l = props.items.length;

    const maxLength = l - (props.viewOffset || 0) - 1;

    const currIndex = ((index % l) + l) % l;

    const currEnd = styles.length;

    self._currIndex = currIndex;

    if (currIndex > maxLength) {
      const end = Math.ceil(currIndex - Number.EPSILON) - maxLength;

      if (currEnd < end) {
        for (let i = currEnd; i < end; i++) {
          const { style } = children[i];

          style.order = styles.push(style) as any;
        }
      } else if (currEnd > end) {
        removeOrder(end);
      }
    } else if (currEnd) {
      removeOrder(0);
    }

    self._translate(self._handleIndex(currIndex) - styles.length);
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
