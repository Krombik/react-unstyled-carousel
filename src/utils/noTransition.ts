import { TransitionModule } from '../types';
import getFalse from './getFalse';
import noop from './noop';

/** @internal */
const noTransition: TransitionModule = (data) => {
  // @ts-expect-error
  data.go = noop;
  // @ts-expect-error
  data.goTo = noop;

  data.updateRunningDuration = noop;

  data.cancelRunningQueue = noop;

  data.isGoing = getFalse;
};

/** @internal */
export default noTransition;
