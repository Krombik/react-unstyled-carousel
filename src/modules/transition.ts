import { TransitionModule } from '../types';
import handleGo from '../utils/handleGo';
import identity from '../utils/identity';

const transition: TransitionModule = (ctx, self) => {
  handleGo(self, ctx, identity, (index) => {
    const l = self._props.items.length;

    const dist1 = (((index % l) + l) % l) - self._currIndex;

    const dist2 = dist1 - Math.sign(dist1) * l;

    const absoluteDist1 = Math.abs(dist1);

    const absoluteDist2 = Math.abs(dist2);

    return absoluteDist1 < absoluteDist2
      ? dist1
      : absoluteDist1 > absoluteDist2
      ? dist2
      : absoluteDist1;
  });
};

export default transition;
