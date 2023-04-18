import { TransitionModule } from '../types';
import noop from './noop';

/** @internal */
const noTransition: TransitionModule = (ctx) => {
  // @ts-expect-error
  ctx.go = noop;
  // @ts-expect-error
  ctx.goTo = noop;

  ctx.updateRunningDuration = noop;

  ctx.cancelRunningQueue = noop;
};

/** @internal */
export default noTransition;
