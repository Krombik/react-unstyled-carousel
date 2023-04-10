import { UintArray } from '../types';

/** @internal */
const binarySearch = (
  arr: UintArray,
  value: number,
  start: number,
  end: number
) => {
  while (start < end) {
    const mid = Math.floor((start + end) / 2);

    const item = arr[mid];

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

/** @internal */
export default binarySearch;
