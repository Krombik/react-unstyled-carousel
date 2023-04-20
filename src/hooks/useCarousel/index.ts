import { useContext } from 'react';
import { CarouselContext } from '../../providers/CarouselProvider';

const useCarousel = () => useContext(CarouselContext);

export default useCarousel;
