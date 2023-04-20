import { useContext } from 'react';
import { CarouselActiveContext } from '../../providers/CarouselProvider';

const useActiveIndex = () => useContext(CarouselActiveContext);

export default useActiveIndex;
