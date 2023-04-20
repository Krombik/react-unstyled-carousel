import { TimingFunction } from '../types';
import identity from '../utils/identity';

export { type TimingFunction };

export const linear: TimingFunction = identity;

export const cubicBezier = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): TimingFunction => {
  const cX = 3 * x1;
  const bX = 3 * (x2 - x1) - cX;
  const aX = 1 - cX - bX;
  const cY = 3 * y1;
  const bY = 3 * (y2 - y1) - cY;
  const aY = 1 - cY - bY;

  return (progress) => {
    let start = 0;
    let end = 1;
    let mid = progress;
    let x: number;

    while (true) {
      x = ((aX * mid + bX) * mid + cX) * mid;

      if (Math.abs(progress - x) < 1e-6) {
        return ((aY * mid + bY) * mid + cY) * mid;
      }

      if (progress > x) {
        start = mid;
      } else {
        end = mid;
      }

      mid = (end + start) / 2;
    }
  };
};

export const ease = cubicBezier(0.25, 0.1, 0.25, 1);

export const easeIn = cubicBezier(0.42, 0, 1, 1);

export const easeOut = cubicBezier(0, 0, 0.58, 1);

export const easeInOut = cubicBezier(0.42, 0, 0.58, 1);

export const easeOutQuart: TimingFunction = (progress) =>
  1 - Math.pow(1 - progress, 4);
