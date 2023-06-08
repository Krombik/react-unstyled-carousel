import { LazyModule } from '../types';

const lazy: LazyModule = (innerData) => {
  const props = innerData._props;

  const itemsCount = props.items.length;

  const lazyOffset = props.lazyOffset || 0;

  const indexes = new (
    itemsCount < 256
      ? Uint8Array
      : itemsCount < 65536
      ? Uint16Array
      : Uint32Array
  )(itemsCount);

  let prevFrom: number;

  let prevTo: number;

  let lastNextIndex: number;

  let start = 0;

  let end = 0;

  let prevIndex = props.defaultIndex || 0;

  const binarySearch = (value: number, start: number, end: number) => {
    value++;

    while (start < end) {
      const mid = (start + end) >> 1;

      const item = indexes[mid];

      if (item < value) {
        start = mid + 1;
      } else if (item > value) {
        end = mid;
      } else {
        return mid;
      }
    }

    return -1;
  };

  const add = (
    from: number,
    to: number,
    prevStart: number,
    prevEnd: number
  ) => {
    while (from < to) {
      if (binarySearch(from++, prevStart, prevEnd) < 0) {
        indexes[start ? --start : end++] = from;
      }
    }
  };

  const handleLazy = (from: number, to: number) => {
    if (from != prevFrom || to != prevTo) {
      prevFrom = from;

      prevTo = to;

      const prevStart = start;

      const prevEnd = end;

      if (from < 0) {
        const end = itemsCount + from;

        if (end < to) {
          add(0, itemsCount, prevStart, prevEnd);
        } else {
          add(0, to, prevStart, prevEnd);

          add(end, itemsCount, prevStart, prevEnd);
        }
      } else if (to > itemsCount) {
        const start = to - itemsCount;

        if (start < from) {
          add(0, start, prevStart, prevEnd);

          add(from, itemsCount, prevStart, prevEnd);
        } else {
          add(0, itemsCount, prevStart, prevEnd);
        }
      } else {
        add(from, to, prevStart, prevEnd);
      }

      return end != prevEnd || prevStart != start;
    }
  };

  handleLazy(
    (prevIndex | 0) - lazyOffset,
    Math.ceil(prevIndex + (props.viewOffset || 0)) + lazyOffset + 1
  );

  innerData._handleIndex = (currIndex) => {
    const flooredIndex = currIndex | 0;

    return (
      binarySearch(flooredIndex, start, end) - start + currIndex - flooredIndex
    );
  };

  innerData._finalize = (currIndex) => {
    currIndex = ((currIndex % itemsCount) + itemsCount) % itemsCount;

    const flooredIndex = currIndex | 0;

    const {
      keepMounted = 0,
      lazyOffset = 0,
      viewOffset = 0,
    } = innerData._props;

    const ceiledEndIndex = Math.ceil(currIndex + viewOffset + lazyOffset);

    const maxItems = Math.max(
      keepMounted,
      lazyOffset + 1 + ceiledEndIndex - flooredIndex
    );

    let isUpdated =
      lazyOffset &&
      (start || end < itemsCount) &&
      handleLazy(flooredIndex - lazyOffset, ceiledEndIndex + 1);

    if (isUpdated) {
      indexes.subarray(start, end).sort();
    }

    if (end - start > maxItems) {
      isUpdated = true;

      if (lastNextIndex > prevIndex) {
        const endIndex =
          binarySearch(ceiledEndIndex % itemsCount, start, end) + 1;

        const overlap = endIndex - maxItems - start;

        if (overlap < 0) {
          indexes.copyWithin(endIndex, end + overlap, end);

          end = start + maxItems;
        } else {
          end = endIndex;

          start = endIndex - maxItems;
        }
      } else {
        const realIndex = (flooredIndex - lazyOffset + itemsCount) % itemsCount;

        const startIndex = binarySearch(realIndex, start, end);

        if (realIndex + maxItems > itemsCount) {
          const nextStart = end - maxItems;

          indexes.copyWithin(nextStart, start, startIndex - nextStart);

          start = nextStart;
        } else {
          start = startIndex;

          end = startIndex + maxItems;
        }
      }
    }

    if (isUpdated) {
      innerData._forceRerender({});
    }

    innerData._jumpTo((prevIndex = currIndex));
  };

  innerData._lazy = (currIndex, nextIndex) => {
    lastNextIndex = nextIndex;

    if (start || end < itemsCount) {
      const props = innerData._props;

      const lazyOffset = props.lazyOffset || 0;

      const viewOffset = props.viewOffset || 0;

      if (
        handleLazy(
          Math.min((currIndex | 0) - lazyOffset, Math.floor(nextIndex)),
          Math.max(
            Math.ceil(currIndex + viewOffset) + lazyOffset,
            Math.ceil(nextIndex + viewOffset)
          ) + 1
        )
      ) {
        indexes.subarray(start, end).sort();

        innerData._forceRerender({});
      }
    }
  };

  innerData._render = ({ items, renderItem }) => {
    const arr: JSX.Element[] = [];

    for (let i = start; i < end; i++) {
      const index = indexes[i] - 1;

      arr.push(renderItem(items[index], index));
    }

    return arr;
  };
};

export default lazy;
