import React, {
  PropsWithChildren,
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import setRef from './utils/setRef';

type TCarouselContext = {
  currIndex: number;
  go(delta: number): void;
  goTo(index: number): void;
};

type Props<T> = {
  items: T[];
  renderItem: (value: T, index: number) => JSX.Element;
  className?: string;
  infinity?: boolean;
  lazy?: number;
  /**
   * @default 0
   */
  defaultIndex?: number;
  disabled?: boolean;
  vertical?: boolean;
  middle?: boolean;
  /**
   * Number of additional slides to display in the carousel view.
   * - If {@link Props.middle middle} is `true`, additional slides will be showed after the current slide, overwise additional slides will be showed before and after the current
   */
  viewOffset?: number;
  /**
   * @default "start"
   */
  translateAfter?: 'start' | 'middle' | 'end';
  gap?: string;
};

const handleItems = (props: Props<unknown>, prependIndex: number) => {
  const arr: JSX.Element[] = [];

  const { renderItem, items } = props;

  const l = items.length;

  // if (props.infinity && props.viewOffset) {
  //   const additionalSlides = Math.ceil(props.viewOffset);

  //   const endIndex = l + additionalSlides;
  //   const startIndex = l - additionalSlides;

  //   for (var i = 0; i < additionalSlides; i++) {
  //     const item = renderItem(items[i], i);

  //     arr[i + additionalSlides] = item;

  //     arr[i + endIndex] = { ...item, key: '$' + item.key };
  //   }

  //   for (; i < startIndex; i++) {
  //     arr[i + additionalSlides] = renderItem(items[i], i);
  //   }

  //   for (; i < l; i++) {
  //     const item = renderItem(items[i], i);

  //     arr[i - startIndex] = { ...item, key: '$' + item.key };

  //     arr[i + additionalSlides] = item;
  //   }
  // } else {
  if (prependIndex) {
    for (let i = prependIndex; i < l; i++) {
      arr.push(renderItem(items[i], i));
    }

    for (let i = 0; i < prependIndex; i++) {
      arr.push(renderItem(items[i], i));
    }
  } else {
    for (let i = 0; i < l; i++) {
      arr.push(renderItem(items[i], i));
    }
  }
  // }

  return arr;
};

const handleListener = (container: HTMLElement, callback: () => void) => {
  const listener = () => {
    container.removeEventListener('transitionend', listener);

    requestAnimationFrame(callback);
  };

  container.addEventListener('transitionend', listener);
};

const Carousel = forwardRef<
  TCarouselContext,
  PropsWithChildren<Props<unknown>>
>((props, ref) => {
  const [prependIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const enabled = !props.disabled;

  const { viewOffset, vertical, gap } = props;

  useLayoutEffect(() => {
    const style = containerRef.current!.style;

    style.gridAutoFlow = vertical ? 'row' : 'column';

    style.removeProperty(`grid-auto-${vertical ? 'columns' : 'rows'}`);

    style.removeProperty(vertical ? 'width' : 'height');

    const key = `gridAuto${vertical ? 'Rows' : 'Columns'}` as const;

    const percent = 100 / (1 + (viewOffset || 0)) + '%';

    if (gap) {
      style.gap = gap;

      style[key] = `calc(${percent} - ${gap})`;

      style[vertical ? 'height' : 'width'] = `calc(100% + ${gap})`;
    } else {
      style[key] = percent;
    }
  }, [viewOffset, vertical, gap]);

  useLayoutEffect(() => {
    const container = containerRef.current!;

    const wrapper = container.parentElement!;

    const translateAxis = `translate${vertical ? 'Y' : 'X'}(`;

    const style = container.style;

    let currIndex = props.defaultIndex || 0;

    let realIndex: number;

    const getPercent = (index: number) => {
      if (props.viewOffset) {
        index /= 1 + props.viewOffset;
      }

      return index * 100;
    };

    wrapper.style.overflow = 'hidden';

    style.display = 'grid';

    const translate = (index: number) => {
      realIndex = index;

      style.transform = translateAxis + -getPercent(index) + '%)';
    };

    const clamp = (index: number) =>
      Math.max(Math.min(index, props.items.length - 1), 0);

    const finalize = (index?: number) => {
      requestAnimationFrame(() => {
        style.removeProperty('transition');

        if (index !== undefined) {
          translate(index);
        }
      });
    };

    container.addEventListener('mousedown', (e) => {
      e.preventDefault();

      const width = wrapper.offsetHeight;

      const gap = container.offsetWidth - width;

      style.transition = 'none';

      let start = e.x;

      let handle: number;

      let offset: number;

      let swipeIndex = realIndex;

      const movingListener = (e: MouseEvent) => {
        cancelAnimationFrame(handle);

        offset = e.x - start;

        if (offset) {
          handle = requestAnimationFrame(() => {
            if (!realIndex && offset > 0) {
              container.children[]
            }

            console.log(offset);

            style.transform = `${translateAxis}calc(${-getPercent(
              realIndex
            )}% + ${offset}px))`;
          });
        }
      };

      container.addEventListener('mousemove', movingListener);

      const endListener = () => {
        window.removeEventListener('mouseup', endListener);

        container.removeEventListener('mousemove', movingListener);

        cancelAnimationFrame(handle);

        const offsetPercent =
          offset / (width / (1 + (props.viewOffset || 0)) + gap);

        console.log(wrapper.offsetWidth, offset, offsetPercent);

        finalize(Math.round(realIndex - offsetPercent));
      };

      window.addEventListener('mouseup', endListener);
    });

    const obj = {} as TCarouselContext;

    const styles: CSSStyleDeclaration[] = [];

    const go = (delta: number) => {
      if (delta) {
        const children = container.children;

        const viewOffset = props.viewOffset || 0;

        const prevIndex = currIndex;

        const fakeIndex = currIndex + delta;

        const l = props.items.length;

        obj.currIndex = currIndex = ((fakeIndex % l) + l) % l;

        if (currIndex == fakeIndex) {
          if (viewOffset && fakeIndex + viewOffset >= l) {
            if (delta > 0) {
              requestAnimationFrame(() => {
                style.transition = 'none';

                const end = ((fakeIndex + viewOffset) % l) + 1;

                translate(prevIndex - end);

                for (let i = styles.length; i < end; i++) {
                  const style = (children[i] as HTMLElement).style;

                  style.order = styles.push(style) as any;
                }

                finalize(realIndex + delta);
              });
            } else {
              handleListener(container, () => {
                style.transition = 'none';

                translate(realIndex - delta);

                for (let i = delta; i++; ) {
                  styles.pop()!.removeProperty('order');
                }

                finalize();
              });

              translate(realIndex + delta);
            }
          } else if (styles.length) {
            const l = styles.length;

            handleListener(container, () => {
              style.transition = 'none';

              translate(currIndex);

              for (let i = l; i--; ) {
                styles[i].removeProperty('order');
              }

              styles.length = 0;

              finalize();
            });

            translate(realIndex + delta);
          } else {
            translate(currIndex);
          }
        } else {
          handleListener(container, () => {
            style.transition = 'none';

            for (let i = styles.length; i--; ) {
              styles[i].removeProperty('order');
            }

            styles.length = 0;

            if (delta < 0 && viewOffset && currIndex + viewOffset >= l) {
              const end = ((currIndex + viewOffset) % l) + 1;

              translate(currIndex - end);

              for (let i = 0; i < end; i++) {
                const style = (children[i] as HTMLElement).style;

                style.order = styles.push(style) as any;
              }
            } else {
              translate(currIndex);
            }

            finalize();
          });

          requestAnimationFrame(() => {
            style.transition = 'none';

            if (delta > 0) {
              const end = ((fakeIndex + viewOffset) % l) + 1;

              for (let i = styles.length; i < end; i++) {
                const style = (children[i] as HTMLElement).style;

                style.order = styles.push(style) as any;
              }

              translate(prevIndex - end);
            } else {
              for (let i = l - 1; i >= currIndex; i--) {
                const style = (children[i] as HTMLElement).style;

                style.order = -styles.push(style) as any;
              }

              translate(prevIndex + styles.length);
            }

            finalize(realIndex + delta);
          });
        }
      }
    };

    obj.go = (delta) => {
      go(delta % props.items.length);
    };

    obj.goTo = (index) => {
      index = clamp(index);

      if (index != currIndex) {
        const dist1 = index - currIndex;

        const dist2 = dist1 - Math.sign(dist1) * props.items.length;

        const absoluteDist1 = Math.abs(dist1);

        const absoluteDist2 = Math.abs(dist2);

        go(
          absoluteDist1 == absoluteDist2
            ? absoluteDist1
            : absoluteDist1 < absoluteDist2
            ? dist1
            : dist2
        );
      }
    };
    // } else {
    //   const goTo: TCarouselContext['goTo'] = (index) => {
    //     obj.currIndex = currIndex = clamp(index);

    //     translate(currIndex);
    //   };

    //   obj.goTo = goTo;
    //   obj.go = (delta) => {
    //     goTo(currIndex + delta);
    //   };
    // }

    translate(currIndex);

    setRef(ref, obj);
  }, []);

  return (
    <div className={props.className}>
      <div ref={containerRef}>
        {enabled
          ? handleItems(props, prependIndex)
          : [props.renderItem(props.items[prependIndex], prependIndex)]}
      </div>
      {props.children}
    </div>
  );
});

export default Carousel;
