import { VFC, useEffect, useRef } from 'react';
import {
  Carousel,
  autoSize,
  infinity,
  swipe,
  transition,
  ease,
  lazy,
  cubicBezier,
  easeOutQuart,
  CarouselData,
} from 'react-unstyled-carousel';

const items = Array.from({ length: 20 }, (_, index) => index);

const TRANSITION = ease;

const DURATION = 300;

const Home: VFC = () => {
  const kek = useRef<CarouselData>(null);
  return (
    <>
      <div>
        <div>
          <Carousel
            ref={kek}
            className='carousel'
            items={items}
            type={infinity}
            // autoSize={autoSize}
            swipe={swipe}
            transition={transition}
            // defaultIndex={7}
            keepMounted={10}
            // viewOffset={0.5}
            // transitionDuration={3000}
            lazy={lazy}
            // lazyOffset={1}
            // lazy={1}
            // gap='9px'
            renderItem={(item, index) => (
              <div
                className='item'
                key={index}
                style={{ background: index % 2 ? 'yellow' : 'blue' }}
              >
                {item as any}
              </div>
            )}
            onSwipeStart={(carousel) => {
              carousel.cancelRunningQueue();
            }}
            onSwipeEnd={(ctx, index, getMomentum) => {
              const momentum = getMomentum();

              ctx.go(
                Math.round(index + momentum[0]) - index,
                momentum[1] || 200,
                easeOutQuart
              );
            }}
          />
        </div>
      </div>
      <button
        onClick={() => {
          kek.current!.go(
            -2,

            DURATION,
            TRANSITION
          );
        }}
      >
        prev2
      </button>
      <button
        onClick={() => {
          kek.current!.go(-1, DURATION, TRANSITION);
        }}
      >
        prev
      </button>
      <button
        onClick={() => {
          kek.current!.setDurationForRunningQueue(100);
          kek.current!.go(1, DURATION, TRANSITION);
        }}
      >
        next
      </button>
      <button
        onClick={() => {
          kek.current!.go(2, DURATION, TRANSITION);
        }}
      >
        next2
      </button>
      <button
        onClick={() => {
          kek.current!.go(4, DURATION, TRANSITION);
        }}
      >
        next4
      </button>
      <button
        onClick={() => {
          kek.current!.go(5, DURATION, TRANSITION);
        }}
      >
        next5
      </button>
      <br />
      {items.map((item) => (
        <button
          key={item}
          onClick={() => {
            kek.current!.goTo(item, DURATION, TRANSITION);
          }}
        >
          {item}
        </button>
      ))}
      <Carousel
        // ref={kek}
        className='carousel'
        items={items}
        type={infinity}
        // autoSize={autoSize}
        swipe={swipe}
        transition={transition}
        // defaultIndex={7}
        keepMounted={10}
        // viewOffset={0.5}
        // transitionDuration={3000}
        lazy={lazy}
        lazyOffset={1}
        // lazy={1}
        gap='9px'
        renderItem={(item, index) => (
          <div
            className='item'
            key={index}
            style={{ background: index % 2 ? 'yellow' : 'blue' }}
            onClick={() => console.log('kek')}
          >
            {item as any}
          </div>
        )}
        // onSwipeEnd={(ctx, index, getMomentum) => {
        //   const momentum = getMomentum();

        //   ctx.go(
        //     Math.round(index + momentum[0]) - index,
        //     momentum[1] || 200,
        //     easeOutQuart
        //   );
        // }}
      />
      <div style={{ height: '100vh' }} />
    </>
  );
};

export default Home;
