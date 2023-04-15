import { TypeModule } from '../types';

const infinity: TypeModule = (self) => {
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
      const end = Math.ceil(currIndex) - maxLength;

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
};

export default infinity;
