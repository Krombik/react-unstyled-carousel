import React, {
  PropsWithChildren,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import setRef from './utils/setRef';

type TCarouselContext = {
  currIndex: number;
  go(delta: number, transition?: string): Promise<void>;
  goTo(index: number, transition?: string): Promise<void>;
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
  swipeEndTransition?: string;
  disableSwipe?: boolean;
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

const Carousel = forwardRef<
  TCarouselContext,
  PropsWithChildren<Props<unknown>>
>((props, ref) => {
  const [prependIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const enabled = !props.disabled;

  const { viewOffset, vertical, gap } = props;

  const propsRef = useRef(props);

  const handleSwipeRef = useRef<() => () => void>();

  propsRef.current = props;

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
      const { viewOffset } = propsRef.current;

      if (viewOffset) {
        index /= 1 + viewOffset;
      }

      return -index * 100 + '%';
    };

    wrapper.style.overflow = 'hidden';

    style.display = 'grid';

    const translate = (index: number) => {
      realIndex = index;

      style.transform = translateAxis + getPercent(index) + ')';
    };

    const clamp = (index: number) =>
      Math.max(Math.min(index, container.children.length - 1), 0);

    const handleSwipeListener = <
      K extends Extract<keyof HTMLElementEventMap, 'mousemove' | 'touchmove'>
    >(
      moveEvent: K,
      endEvent: K extends 'mousemove' ? 'mouseup' : 'touchend',
      getOffset: (e: HTMLElementEventMap[K]) => number
    ) => {
      const width = wrapper.offsetHeight;

      const gap = container.offsetWidth - width;

      const viewOffset = propsRef.current.viewOffset || 0;

      const itemWidth = width / (1 + viewOffset) + gap;

      let handle: number;

      let offset: number;

      let newCurrIndex = currIndex;

      let currRealIndex = realIndex;

      const children = container.children as HTMLCollectionOf<HTMLElement>;

      const childrenCount = children.length;

      const lastChildIndex = childrenCount - 1;

      const distToStart = currIndex * itemWidth;

      const distToEnd = (lastChildIndex - currIndex - viewOffset) * itemWidth;

      const movingListener = (e: HTMLElementEventMap[K]) => {
        cancelAnimationFrame(handle);

        offset = getOffset(e);

        if (offset) {
          handle = requestAnimationFrame(() => {
            const l = styles.length;

            if (offset > 0) {
              const dist = distToStart - offset;

              if (dist > 0) {
                console.log('1');
                const count = Math.ceil(dist / itemWidth - Number.EPSILON);

                const index = count - lastChildIndex + viewOffset;

                newCurrIndex = count;

                currRealIndex = count;

                if (index >= 0) {
                  currRealIndex -= index;

                  if (index > l) {
                    for (let i = l; i < index; i++) {
                      const style = children[i].style;

                      style.order = styles.push(style) as any;
                    }
                  } else if (index < l) {
                    removeOrder(index);
                  }
                } else {
                  removeOrder(0);
                }
              } else {
                console.log('2');

                const count = Math.floor(Number.EPSILON - dist / itemWidth) + 1;

                if (count > l) {
                  for (let i = l; i < count; i++) {
                    const style = children[lastChildIndex - i].style;

                    style.order = -styles.push(style) as any;
                  }
                } else if (count < l) {
                  removeOrder(count);
                }

                newCurrIndex = childrenCount - count + 1;

                currRealIndex = 1;
              }
            } else {
              const dist = distToEnd + offset;

              if (dist > 0) {
                console.log('3');
                currRealIndex = newCurrIndex =
                  lastChildIndex -
                  Math.ceil(dist / itemWidth - Number.EPSILON) -
                  viewOffset;

                removeOrder(0);
              } else {
                console.log('4');

                const count = Math.floor(Number.EPSILON - dist / itemWidth) + 1;

                if (count > l) {
                  for (let i = l; i < count; i++) {
                    const style = children[i].style;

                    style.order = styles.push(style) as any;
                  }
                } else if (count < l) {
                  removeOrder(count);
                }

                currRealIndex = lastChildIndex - viewOffset - 1;

                newCurrIndex = (currRealIndex + count) % childrenCount;
              }
            }

            style.transform = `${translateAxis}calc(${getPercent(
              currRealIndex
            )} + ${offset % itemWidth}px))`;
          });
        }
      };

      const endListener = () => {
        window.removeEventListener(endEvent, endListener);

        container.removeEventListener(moveEvent, movingListener);

        cancelAnimationFrame(handle);

        const additionalIndex = Math.round((offset % itemWidth) / itemWidth);

        console.log(
          newCurrIndex,
          additionalIndex,
          (offset % itemWidth) / itemWidth
        );

        handleTransition(
          'transform .1s ease',
          currRealIndex - additionalIndex,
          () => {
            goImmediately((newCurrIndex - additionalIndex) % childrenCount);
          }
        );
      };

      container.addEventListener(moveEvent, movingListener);

      window.addEventListener(endEvent, endListener);
    };

    handleSwipeRef.current = () => {
      const touchListener = (e: TouchEvent) => {
        if (e.touches.length == 1) {
          e.preventDefault();

          const start = e.changedTouches[0].clientX;

          handleSwipeListener(
            'touchmove',
            'touchend',
            (e) => e.changedTouches[0].clientX - start
          );
        }
      };

      const mouseListener = (e: MouseEvent) => {
        e.preventDefault();

        const start = e.clientX;

        handleSwipeListener('mousemove', 'mouseup', (e) => e.clientX - start);
      };

      container.addEventListener('touchstart', touchListener);

      container.addEventListener('mousedown', mouseListener);

      return () => {
        container.removeEventListener('touchstart', touchListener);

        container.removeEventListener('mousedown', mouseListener);
      };
    };

    const obj = {} as TCarouselContext;

    const styles: CSSStyleDeclaration[] = [];

    const removeOrder = (to: number) => {
      const l = styles.length;

      if (l) {
        for (let i = to; i < l; i++) {
          styles[i].removeProperty('order');
        }

        styles.length = to;
      }
    };

    const handleTransition = (
      transition: string,
      index: number,
      callback: () => void
    ) => {
      console.log(transition);
      const listener = () => {
        container.removeEventListener('transitionend', listener);

        requestAnimationFrame(() => {
          style.removeProperty('transition');

          callback!();
        });
      };

      style.transition = transition;

      container.addEventListener('transitionend', listener);

      translate(index);
    };

    const goImmediately = (index: number) => {
      const { items, viewOffset = 0 } = propsRef.current;

      const l = items.length;

      const children = container.children as HTMLCollectionOf<HTMLElement>;

      currIndex = ((index % l) + l) % l;

      const realIndex = currIndex % (l - viewOffset);

      removeOrder(0);

      if (realIndex == currIndex) {
        translate(currIndex);
      } else {
        for (let i = 0; i <= realIndex; i++) {
          const style = children[i].style;

          style.order = styles.push(style) as any;
        }

        translate(l - 1 - viewOffset);
      }
    };

    let currPromise: Promise<void> | undefined;

    let isFirst = true;

    const go = async (getDelta: () => number, transition?: string) => {
      const prevPromise = currPromise;

      let resolve!: () => void;

      const promise = new Promise<void>((_resolve) => {
        resolve = () => {
          requestAnimationFrame(() => {
            if (promise == currPromise) {
              isFirst = true;

              currPromise = undefined;
            }

            _resolve();
          });
        };
      });

      currPromise = promise;

      if (prevPromise) {
        if (isFirst && style.transition) {
          style.transition = '.1s ease';

          style.transform = `${translateAxis}calc(${getPercent(
            realIndex
          )} - 0.001px))`;

          isFirst = false;
        }

        transition &&= '.1s ease';

        await prevPromise;
      }

      const delta = getDelta();

      if (!delta) {
        resolve();
      } else if (transition) {
        const children = container.children as HTMLCollectionOf<HTMLElement>;

        const viewOffset = propsRef.current.viewOffset || 0;

        const prevIndex = currIndex;

        const fakeIndex = currIndex + delta;

        const l = children.length;

        currIndex = ((fakeIndex % l) + l) % l;

        if (currIndex == fakeIndex) {
          if (viewOffset && fakeIndex + viewOffset >= l) {
            if (delta > 0) {
              requestAnimationFrame(() => {
                const end = ((fakeIndex + viewOffset) % l) + 1;

                translate(prevIndex - end);

                for (let i = styles.length; i < end; i++) {
                  const style = children[i].style;

                  style.order = styles.push(style) as any;
                }

                requestAnimationFrame(() => {
                  handleTransition(transition!, realIndex + delta, resolve);
                });
              });
            } else {
              handleTransition(transition, realIndex + delta, () => {
                translate(realIndex - delta);

                removeOrder(styles.length + delta);

                resolve();
              });
            }
          } else if (styles.length) {
            handleTransition(transition, realIndex + delta, () => {
              translate(currIndex);

              removeOrder(0);

              resolve();
            });
          } else {
            handleTransition(transition, currIndex, resolve);
          }
        } else {
          requestAnimationFrame(() => {
            if (delta > 0) {
              const end = ((fakeIndex + viewOffset) % l) + 1;

              for (let i = styles.length; i < end; i++) {
                const style = children[i].style;

                style.order = styles.push(style) as any;
              }

              translate(prevIndex - end);
            } else {
              for (let i = l - 1; i >= currIndex; i--) {
                const style = children[i].style;

                style.order = -styles.push(style) as any;
              }

              translate(prevIndex + styles.length);
            }

            requestAnimationFrame(() => {
              handleTransition(transition!, realIndex + delta, () => {
                removeOrder(0);

                if (delta < 0 && viewOffset && currIndex + viewOffset >= l) {
                  const end = ((currIndex + viewOffset) % l) + 1;

                  translate(currIndex - end);

                  for (let i = 0; i < end; i++) {
                    const style = children[i].style;

                    style.order = styles.push(style) as any;
                  }
                } else {
                  translate(currIndex);
                }

                resolve();
              });
            });
          });
        }
      } else {
        requestAnimationFrame(() => {
          goImmediately(currIndex + delta);

          resolve();
        });
      }

      return promise;
    };

    obj.go = (delta, transition) =>
      go(() => delta % propsRef.current.items.length, transition);

    obj.goTo = (index, transition) =>
      go(() => {
        const dist1 = clamp(index) - currIndex;

        const dist2 = dist1 - Math.sign(dist1) * propsRef.current.items.length;

        const absoluteDist1 = Math.abs(dist1);

        const absoluteDist2 = Math.abs(dist2);

        return absoluteDist1 == absoluteDist2
          ? absoluteDist1
          : absoluteDist1 < absoluteDist2
          ? dist1
          : dist2;
      }, transition);

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

    goImmediately(currIndex);

    setRef(ref, obj);
  }, []);

  const enableSwipe = !props.disableSwipe;

  useEffect(() => {
    if (enableSwipe) {
      return handleSwipeRef.current!();
    }
  }, [enableSwipe]);

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
