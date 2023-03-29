import React, { FC, PropsWithChildren, createContext, useState } from 'react';
import { CarouselMethods } from '../types';

type Props = PropsWithChildren<{
  methods: CarouselMethods;
  saveSetActiveMethod(setActive: (value: number | null) => void): void;
}>;

const CarouselMethodsContext = createContext<CarouselMethods>(null as any);
const CarouselActiveContext = createContext<number | null>(null);

/** @internal */
const CarouselProvider: FC<Props> = (props) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(() => {
    props.saveSetActiveMethod(setActiveIndex);

    return props.methods.activeIndex;
  });

  return (
    <CarouselMethodsContext.Provider value={props.methods}>
      <CarouselActiveContext.Provider value={activeIndex}>
        {props.children}
      </CarouselActiveContext.Provider>
    </CarouselMethodsContext.Provider>
  );
};

/** @internal */
export default CarouselProvider;
