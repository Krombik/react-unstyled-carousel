import React, {
  FC,
  PropsWithChildren,
  createContext,
  useLayoutEffect,
  useState,
} from 'react';
import { CarouselData } from '../types';
import noop from '../utils/noop';

type Props = PropsWithChildren<{
  data: CarouselData;
  saveSetActive(setActiveIndex: (index: number | null) => void): void;
}>;

/** @internal */
export const CarouselContext = createContext<CarouselData>(null as any);
/** @internal */
export const CarouselActiveContext = createContext<number | null>(null);

/** @internal */
const CarouselProvider: FC<Props> = (props) => {
  const { data } = props;

  const [activeIndex, setActiveIndex] = useState<number | null>(
    data.activeIndex
  );

  useLayoutEffect(() => {
    const { saveSetActive } = props;

    saveSetActive(setActiveIndex);

    return () => {
      saveSetActive(noop);
    };
  }, []);

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
