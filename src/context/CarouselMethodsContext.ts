import { createContext } from 'react';
import { CarouselMethods } from '../types';

/** @internal */
const CarouselMethodsContext = createContext<CarouselMethods>(null as any);

/** @internal */
export default CarouselMethodsContext;
