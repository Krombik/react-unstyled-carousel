import React, {
  PropsWithChildren,
  RefAttributes,
  RefCallback,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import setRef from '../../utils/setRef';
import { CarouselProps, InternalData, CarouselData } from '../../types';
import noop from '../../utils/noop';
import useConst from '../../utils/useConst';
import CarouselProvider from '../../providers/CarouselProvider';
import identity from '../../utils/identity';
import getCanceled from '../../utils/getCanceled';

const Carousel = forwardRef<CarouselData, PropsWithChildren<CarouselProps>>(
  (props, outerRef) => {
    const {
      viewOffset = 0,
      lazyOffset = 0,
      vertical,
      gap,
      defaultIndex = 0,
      autoSize,
      transition,
      touchSwipe,
      mouseSwipe,
      lazy,
      children,
    } = props;

    const t = useState<{}>();

    const [innerData, data, ref, saveSetActive] = useConst<
      [
        InternalData,
        CarouselData,
        RefCallback<HTMLDivElement>,
        (setActiveIndex: (index: number | null) => void) => void
      ]
    >(() => {
      let setActive: (index: number | null) => void = noop;

      const data: CarouselData = {
        activeIndex:
          'defaultActiveIndex' in props
            ? props.defaultActiveIndex!
            : defaultIndex,
        setActive(index) {
          data.activeIndex = index;

          setActive(index);
        },
        jumpTo(index) {
          innerData._lazy(index, index);

          innerData._finalize(index);
        },
        go: (delta, duration, timingFunction) =>
          innerData._go(delta, duration, timingFunction),
        goTo: (index, duration, timingFunction) =>
          innerData._goTo(index, duration, timingFunction),
        isSwiping: () => innerData._isSwiping,
        isGoing: () => innerData._isGoing,
        cancelRunningQueue() {
          innerData._cancel(-1, true);
        },
        updateRunningDuration(newDuration) {
          innerData._speedup(newDuration);
        },
        setDurationForRunningQueue(duration) {
          innerData._speedupQueue(duration);
        },
        getCurrentIndex: () => innerData._currIndex,
      };

      const innerData = {
        _lazy: noop as any,
        _currIndex: defaultIndex,
        _handleIndex: identity,
        _forceRerender: t[1],
        _props: props,
        _render(props) {
          return props.items.map(props.renderItem);
        },
        _isGoing: false,
        _isSwiping: false,
        _go: getCanceled as any,
        _goTo: getCanceled as any,
        _cancel: noop as any,
        _speedup: noop as any,
        _speedupQueue: noop as any,
      } as InternalData;

      if (lazy) {
        lazy(innerData);
      }

      return [
        innerData,
        data,
        (container) => {
          if (container) {
            const { style } = container;

            innerData._container = container;

            innerData._translate = (index: number) => {
              style.transform = `${innerData._translateAxis}${
                (-100 * index) / (1 + (innerData._props.viewOffset || 0))
              }%)`;
            };

            props.type(innerData);

            container.parentElement!.style.overflow = 'hidden';

            style.display = 'grid';

            setRef(outerRef, data);

            innerData._finalize ||= innerData._jumpTo;
          } else {
            setRef(outerRef, container);
          }
        },
        (newSetActive) => {
          setActive = newSetActive;
        },
      ];
    });

    innerData._props = props;

    useLayoutEffect(() => {
      const style = innerData._container.style;

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

      innerData._translateAxis = `translate${vertical ? 'Y' : 'X'}(`;

      innerData._jumpTo(innerData._currIndex);

      innerData._sizeKey = sizeKey;

      innerData._clientSizeKey = `client${vertical ? 'Height' : 'Width'}`;

      innerData._clientAxisKey = `client${vertical ? 'Y' : 'X'}`;

      return () => {
        style.removeProperty(`grid-auto-${vertical ? 'rows' : 'columns'}`);

        style.removeProperty(sizeKey);
      };
    }, [viewOffset, vertical, gap]);

    if (lazy) {
      useLayoutEffect(() => {
        if (innerData._rendered) {
          innerData._finalize(innerData._currIndex);
        } else {
          innerData._rendered = true;
        }
      }, [viewOffset, lazyOffset]);
    }

    useLayoutEffect(autoSize ? () => autoSize(innerData, viewOffset) : noop, [
      autoSize,
      viewOffset,
      vertical,
      gap,
    ]);

    useEffect(transition ? () => transition(innerData) : noop, [transition]);

    useEffect(mouseSwipe ? () => mouseSwipe(innerData, data) : noop, [
      mouseSwipe,
    ]);

    useEffect(touchSwipe ? () => touchSwipe(innerData, data) : noop, [
      touchSwipe,
    ]);

    useEffect(
      touchSwipe
        ? () => {
            const { style } = innerData._container.parentElement!;

            style.touchAction = `pan-${vertical ? 'x' : 'y'}`;

            return () => {
              style.removeProperty('touch-action');
            };
          }
        : noop,
      [touchSwipe, vertical]
    );

    return (
      <>
        <div className={props.className} style={props.style}>
          <div ref={ref}>{innerData._render(props)}</div>
        </div>
        {children && (
          <CarouselProvider data={data} saveSetActive={saveSetActive}>
            {children}
          </CarouselProvider>
        )}
      </>
    );
  }
) as <T extends any>(
  props: PropsWithChildren<CarouselProps<T>> & RefAttributes<CarouselData>
) => JSX.Element;

export { type CarouselProps, type CarouselData };

export default Carousel;
