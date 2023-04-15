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
import noTransition from '../../utils/noTransition';

const Carousel = forwardRef<CarouselMethods, PropsWithChildren<CarouselProps>>(
  (props, outerRef) => {
    const {
      viewOffset = 0,
      lazyOffset = 0,
      vertical,
      gap,
      defaultIndex = 0,
      autoSize,
      transition,
      swipe,
      lazy,
      children,
    } = props;

    const t = useState<{}>();

    const parentCtx = useContext(CarouselMethodsContext);

    const [self, ref, ctx] = useConst<
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
        _lazy: noop as any,
        _currIndex: defaultIndex,
        _handleIndex: identity,
        _forceRerender: t[1],
        _props: props,
        _render(props) {
          return props.items.map(props.renderItem);
        },
      } as InnerSelf;

      if (lazy) {
        lazy(self);
      }

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

            props.type(self);

            container.parentElement!.style.overflow = 'hidden';

            style.display = 'grid';

            setRef(outerRef, ctx);

            self._finalize ||= self._jumpTo;
          } else {
            setRef(outerRef, null);
          }
        },
        ctx,
      ];
    });

    self._props = props;

    useLayoutEffect(() => {
      const style = self._container.style;

      const key = `gridAuto${
        vertical ? 'Rows' : 'Columns'
      }` satisfies keyof CSSStyleDeclaration;

      const sizeKey = (
        vertical ? 'height' : 'width'
      ) satisfies keyof CSSStyleDeclaration;

      const percent = 100 / (1 + viewOffset) + '%';

      style.gridAutoFlow = vertical ? 'row' : 'column';

      if (gap) {
        style.gap = gap;

        style[key] = `calc(${percent} - ${gap})`;

        style[sizeKey] = `calc(100% + ${gap})`;
      } else {
        style[key] = percent;
      }

      self._translateAxis = `translate${vertical ? 'Y' : 'X'}(`;

      self._jumpTo(self._currIndex);

      self._sizeKey = sizeKey;

      self._clientSizeKey = `client${vertical ? 'Height' : 'Width'}`;

      self._clientAxisKey = `client${vertical ? 'Y' : 'X'}`;

      return () => {
        style.removeProperty(`grid-auto-${vertical ? 'rows' : 'columns'}`);

        style.removeProperty(sizeKey);
      };
    }, [viewOffset, vertical, gap]);

    useLayoutEffect(
      () => {
        if (self._rendered) {
          self._finalize(self._currIndex);
        } else {
          self._rendered = true;
        }
      },
      lazy ? [viewOffset, lazyOffset] : []
    );

    useLayoutEffect(autoSize ? () => autoSize(self, viewOffset) : noop, [
      autoSize,
      viewOffset,
      vertical,
      gap,
    ]);

    useEffect(() => {
      (transition || noTransition)(ctx, self);
    }, [transition]);

    useEffect(swipe ? () => swipe(self) : noop, [swipe]);

    return (
      <>
        <div className={props.className} style={props.style}>
          <div ref={ref}>{self._render(props)}</div>
        </div>
        {children && (
          <CarouselMethodsContext.Provider value={ctx}>
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
