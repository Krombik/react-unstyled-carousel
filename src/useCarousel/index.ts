import { useContext } from 'react';
import { CarouselContext } from '../utils/CarouselProvider';

const useCarousel = () => useContext(CarouselContext);

export default useCarousel;
