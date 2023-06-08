import identity from 'lodash.identity';
import { TransitionModule } from '../types';
import handleGo from '../utils/handleGo';

const transition: TransitionModule = (innerData) =>
  handleGo(innerData, identity, (index) => {
    const l = innerData._props.items.length;

    const dist1 = (((index % l) + l) % l) - innerData._currIndex;

    const dist2 = dist1 - Math.sign(dist1) * l;

    const absoluteDist1 = Math.abs(dist1);

    const absoluteDist2 = Math.abs(dist2);

    return absoluteDist1 < absoluteDist2
      ? dist1
      : absoluteDist1 > absoluteDist2
      ? dist2
      : absoluteDist1;
  });

export default transition;
