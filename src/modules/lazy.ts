import { LazyModule } from '../types';
import binarySearch from '../utils/binarySearch';

const lazy: LazyModule = (self) => {
  const props = self._props;

  let prevFrom: number;

  let prevTo: number;

  let lastNextIndex: number;

  let start = 0;

  let end = 0;

  let prevIndex = props.defaultIndex || 0;

  const itemsCount = props.items.length;

  const lazyOffset = props.lazyOffset || 0;

  const indexes = new (
    itemsCount < 256
      ? Uint8Array
      : itemsCount < 65536
      ? Uint16Array
      : Uint32Array
  )(itemsCount);

  const add = (from: number, to: number) => {
    const prevEnd = end;

    let currStart = start;

    while (from < to) {
      const index = binarySearch(indexes, ++from, currStart, prevEnd);

      if (index < 0) {
        indexes[start ? --start : end++] = from;
      } else {
        currStart = index;
      }
    }
  };

  const handleLazy = (from: number, to: number) => {
    prevFrom = from;

    prevTo = to;

    if (from < 0) {
      const end = itemsCount + from;

      if (end < to) {
        add(0, itemsCount);
      } else {
        add(0, to);

        add(end, itemsCount);
      }
    } else if (to > itemsCount) {
      const start = to - itemsCount;

      if (start < from) {
        add(0, start);

        add(from, itemsCount);
      } else {
        add(0, itemsCount);
      }
    } else {
      add(from, to);
    }
  };

  handleLazy(
    (prevIndex | 0) - lazyOffset,
    Math.ceil(prevIndex) + lazyOffset + (props.viewOffset || 0) + 1
  );

  self._handleIndex = (currIndex) => {
    const flooredIndex = currIndex | 0;

    return (
      binarySearch(indexes, flooredIndex + 1, start, end) -
      start +
      currIndex -
      flooredIndex
    );
  };

  self._cleanup = () => {
    const currIndex = self._currIndex;

    const { keepMounted = 0, lazyOffset = 0, viewOffset = 0 } = self._props;

    const itemsRendered = end - start;

    const maxItems = Math.max(
      keepMounted,
      lazyOffset * 2 + viewOffset + 1 + Math.ceil(currIndex - (currIndex | 0))
    );

    if (itemsRendered > maxItems) {
      const itemsToRemove = itemsRendered - maxItems;

      if (lastNextIndex > prevIndex) {
        const endIndex = Math.ceil(currIndex) + lazyOffset + viewOffset;

        if (endIndex < maxItems) {
          const item = itemsCount + endIndex - maxItems + 2;

          let left = start;
          let right = end;

          while (left < right) {
            const mid = (left + right) >> 1;

            if (indexes[mid] < item) {
              left = mid + 1;
            } else {
              right = mid;
            }
          }

          if (right != end) {
            indexes.copyWithin(
              binarySearch(indexes, endIndex + 1, start, end) + 1,
              right,
              end
            );
          }

          end = maxItems + start;
        } else {
          if (endIndex < itemsCount) {
            const currentEnd =
              binarySearch(indexes, endIndex + 1, start, end) + 1;

            if (currentEnd != end) {
              start += currentEnd - end;

              end = currentEnd;
            }
          } else {
            indexes.copyWithin(
              start + itemsToRemove,
              start,
              start + endIndex - itemsCount + 1
            );
          }

          start += itemsToRemove;
        }
      } else {
        const startIndex = (currIndex | 0) - lazyOffset;

        if (startIndex < 0) {
          indexes.copyWithin(
            end - itemsToRemove + startIndex,
            end + startIndex,
            end
          );
        }

        end -= itemsToRemove;
      }

      console.log(indexes, start, end);

      self._jumpTo(currIndex);

      self._forceRerender({});
    }

    prevIndex = currIndex;
  };

  self._lazy = (currIndex, nextIndex) => {
    lastNextIndex = nextIndex;

    if (start || end < itemsCount) {
      const props = self._props;

      const lazyOffset = props.lazyOffset || 0;

      const from = Math.min(
        Math.floor(currIndex) - lazyOffset,
        Math.floor(nextIndex)
      );

      const to =
        Math.max(Math.ceil(currIndex) + lazyOffset, Math.ceil(nextIndex)) +
        (props.viewOffset || 0) +
        1;

      if (from != prevFrom || to != prevTo) {
        const prevStart = start;

        const prevEnd = end;

        handleLazy(from, to);

        if (end != prevEnd || prevStart != start) {
          indexes.subarray(start, end).sort();

          self._forceRerender({});
        }
      }
    }
  };

  self._render = ({ items, renderItem }) => {
    const arr: JSX.Element[] = [];

    for (let i = start; i < end; i++) {
      const index = indexes[i] - 1;

      arr.push(renderItem(items[index], index));
    }

    return arr;
  };
};

export default lazy;
