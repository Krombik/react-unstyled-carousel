import identity from 'lodash.identity';
import { SwipeModule } from '../types';
import handleSwipeListener from '../utils/handleSwipeListener';

const mouseSwipe: SwipeModule = (innerData, data) =>
  handleSwipeListener(
    innerData,
    data,
    'mousedown',
    'mousemove',
    'mouseup',
    (e) => {
      e.preventDefault();

      return true;
    },
    identity<MouseEvent>
  );

export default mouseSwipe;
