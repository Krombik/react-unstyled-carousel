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
import identity from '../../utils/identity';

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

    const t = useState<{}>();

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
        _handleIndex: identity,
        _forceRerender: t[1],
        _props: props,
        _render(props) {
          return props.items.map(props.renderItem);
        },
      } as InnerSelf;

      props.lazy!(self);

      return [
        self,
        (container) => {
          if (container) {
            const { style } = container;

            const translate = (index: number) => {
              style.transform = `${self._translateAxis}${
                (-100 * index) / (1 + (self._props.viewOffset || 0))
              }%)`;
            };

            self._container = container;

            self._translate = translate;

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
          <div ref={data[1]}>{self._render(props)}</div>
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
