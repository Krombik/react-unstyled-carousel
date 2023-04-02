import React, {
  PropsWithChildren,
  RefAttributes,
  RefCallback,
  forwardRef,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import setRef from '../../utils/setRef';
import { CarouselProps, InnerSelf, CarouselMethods } from '../../types';
import noop from '../../utils/noop';
import useConst from '../../utils/useConst';
import CarouselProvider from '../../providers/CarouselProvider';
import CarouselMethodsContext from '../../context/CarouselMethodsContext';
import positiveOrZero from '../../utils/positiveOrZero';

const handleItems = (
  self: InnerSelf,
  props: CarouselProps,
  currLazyRenderIndex: number,
  nextLazyRenderIndex: number
) => {
  const arr: JSX.Element[] = [];

  const { renderItem, items, lazy, viewOffset = 0 } = props;

  const l = items.length;

  if (lazy == undefined || lazy * 2 + viewOffset + 1 >= l) {
    for (let i = 0; i < l; i++) {
      arr.push(renderItem(items[i], i));
    }
  } else {
    // currLazyRenderIndex = 0;
    // nextLazyRenderIndex = -4;
    // console.log(currLazyRenderIndex, nextLazyRenderIndex);
    let index = 0;

    const indexes = self._indexes;

    const start = Math.min(currLazyRenderIndex - lazy, nextLazyRenderIndex);

    const end =
      Math.max(currLazyRenderIndex + lazy, nextLazyRenderIndex) +
      viewOffset +
      1;

    // console.log(start, end);

    const overLeft = end - l;

    const clumpedEnd = Math.min(end, l);

    if (overLeft > 0) {
      // console.log(overLeft, start);

      for (let i = 0; i < overLeft; i++) {
        arr.push(renderItem(items[i], i));

        indexes[index++] = i;
      }
    }

    for (let i = Math.max(start, index); i < clumpedEnd; i++) {
      arr.push(renderItem(items[i], i));

      indexes[index++] = i;
    }

    if (start < 0) {
      const overRight = l + start;

      for (let i = Math.max(overRight, clumpedEnd); i < l; i++) {
        arr.push(renderItem(items[i], i));

        indexes[index++] = i;
      }
    }

    self._length = index;
  }

  return arr;
};

const Carousel = forwardRef<CarouselMethods, PropsWithChildren<CarouselProps>>(
  (props, outerRef) => {
    const {
      viewOffset = 0,
      vertical,
      gap,
      defaultIndex = 0,
      autoSize,
      transition,
      swipe,
      children,
    } = props;

    const [lazyRenderIndexes, setLazyRenderIndexes] = useState([
      defaultIndex,
      defaultIndex,
    ] as const);

    const parentCtx = useContext(CarouselMethodsContext);

    const data = useConst<
      [self: InnerSelf, ref: RefCallback<HTMLDivElement>, ctx: CarouselMethods]
    >(() => {
      const ctx = {
        activeIndex:
          'defaultActiveIndex' in props
            ? props.defaultActiveIndex!
            : defaultIndex,
        parent: parentCtx,
        children: {},
      } as CarouselMethods;

      const self = {
        _currIndex: props.defaultIndex || 0,
        _isFree: true,
        _isFirst: true,
      } as InnerSelf;

      const itemsCount = props.items.length;

      self._indexes = new (
        itemsCount < 256
          ? Uint8Array
          : itemsCount < 65536
          ? Uint16Array
          : Uint32Array
      )(itemsCount);

      return [
        self,
        (container) => {
          if (container) {
            const { style } = container;

            const translate = (index: number, offset?: number) => {
              self._realIndex = index;

              const percent =
                (-100 * index) / (1 + (self._props.viewOffset || 0)) + '%';

              style.transform = `${self._translateAxis}${
                offset ? `calc(${percent} + ${offset}px)` : percent
              })`;
            };

            self._container = container;

            self._setLazyRenderIndexes = setLazyRenderIndexes;

            self._translate = translate;

            self._handleTransition = (
              transition: string,
              index: number,
              callback: () => void
            ) => {
              const listener = () => {
                container.removeEventListener('transitionend', listener);

                requestAnimationFrame(() => {
                  style.removeProperty('transition');

                  callback();
                });
              };

              style.transition = transition;

              container.addEventListener('transitionend', listener);

              translate(index);
            };

            props.type(self, ctx);

            container.parentElement!.style.overflow = 'hidden';

            style.display = 'grid';

            setRef(outerRef, ctx);
          } else {
            setRef(outerRef, null);
          }
        },
        ctx,
      ];
    });

    const self = data[0];

    self._props = props;

    useLayoutEffect(() => {
      const style = self._container.style;

      const key = `gridAuto${
        vertical ? 'Rows' : 'Columns'
      }` satisfies keyof CSSStyleDeclaration;

      const percent = 100 / (1 + viewOffset) + '%';

      style.gridAutoFlow = vertical ? 'row' : 'column';

      if (gap) {
        style.gap = gap;

        style[key] = `calc(${percent} - ${gap})`;

        style[
          (vertical ? 'height' : 'width') satisfies keyof CSSStyleDeclaration
        ] = `calc(100% + ${gap})`;
      } else {
        style[key] = percent;
      }

      self._translateAxis = `translate${vertical ? 'Y' : 'X'}(`;

      self._jumpTo(self._currIndex);

      return () => {
        style.removeProperty(`grid-auto-${vertical ? 'rows' : 'columns'}`);

        style.removeProperty(vertical ? 'height' : 'width');
      };
    }, [viewOffset, vertical, gap]);

    useLayoutEffect(() => {
      self._go = transition;
    }, [transition]);

    useLayoutEffect(
      autoSize ? () => autoSize(self._container, viewOffset, vertical) : noop,
      [autoSize, viewOffset, vertical]
    );

    useEffect(swipe ? () => swipe(self, vertical) : noop, [swipe, vertical]);

    return (
      <>
        <div className={props.className} style={props.style}>
          <div ref={data[1]}>
            {handleItems(
              self,
              props,
              lazyRenderIndexes[0],
              lazyRenderIndexes[1]
            )}
          </div>
        </div>
        {children && (
          <CarouselMethodsContext.Provider value={data[2]}>
            {children}
          </CarouselMethodsContext.Provider>
        )}
      </>
    );
  }
) as <T extends any>(
  props: PropsWithChildren<CarouselProps<T>> & RefAttributes<CarouselMethods>
) => JSX.Element;

export default Carousel;
