import { SwipeModule } from '../types';
import handleSwipeListener from '../utils/handleSwipeListener';

const touchSwipe: SwipeModule = (innerData, data) =>
  handleSwipeListener(
    innerData,
    data,
    'touchstart',
    'touchmove',
    'touchend',
    (e) => e.touches.length == 1,
    (e) => e.touches[0]
  );

export default touchSwipe;
