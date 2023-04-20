import React, { FC, PropsWithChildren, createContext, useState } from 'react';
import { CarouselData } from '../types';

type Props = PropsWithChildren<{
  data: CarouselData;
}>;

/** @internal */
export const CarouselContext = createContext<CarouselData>(null as any);
/** @internal */
export const CarouselActiveContext = createContext<number | null>(null);

/** @internal */
const CarouselProvider: FC<Props> = (props) => {
  const { data } = props;

  const [activeIndex, setActiveIndex] = useState<number | null>(() => {
    data.setActive = (index) => {
      data.activeIndex = index;

      setActiveIndex(index);
    };

    return data.activeIndex;
  });

  return (
    <CarouselContext.Provider value={data}>
      <CarouselActiveContext.Provider value={activeIndex}>
        {props.children}
      </CarouselActiveContext.Provider>
    </CarouselContext.Provider>
  );
};

/** @internal */
export default CarouselProvider;
