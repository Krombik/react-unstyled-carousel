import { useContext } from 'react';
import { CarouselActiveContext } from '../utils/CarouselProvider';

const useActiveIndex = () => useContext(CarouselActiveContext);

export default useActiveIndex;
