import { TransitionModule } from '../types';
import noop from './noop';

/** @internal */
const noTransition: TransitionModule = (ctx) => {
  ctx.jump = noop;
  ctx.jumpTo = noop;
};

/** @internal */
export default noTransition;
