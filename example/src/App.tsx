import { VFC, useRef } from 'react';
import {
  Carousel,
  autoSize,
  infinity,
  infinitySwipe,
  infinityTransition,
  ease,
  lazy,
  cubicBezier,
} from 'react-unstuled-carousel';

const items = Array.from({ length: 20 }, (_, index) => index);

const TRANSITION = ease;

const DURATION = 300;

const Home: VFC = () => {
  const kek = useRef<any>(null);
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
            swipe={infinitySwipe}
            transition={infinityTransition}
            // defaultIndex={7}
            keepMounted={10}
            viewOffset={3}
            lazy={lazy}
            lazyOffset={0}
            // lazy={1}
            gap='9px'
            renderItem={(item, index) => (
              <div
                className='item'
                key={index}
                style={{ background: index % 2 ? 'yellow' : 'blue' }}
              >
                {item as any}
              </div>
            )}
          />
        </div>
      </div>
      <button
        onClick={() => {
          kek.current!.go(-2, TRANSITION, DURATION);
        }}
      >
        prev2
      </button>
      <button
        onClick={() => {
          kek.current!.go(-1, TRANSITION, DURATION);
        }}
      >
        prev
      </button>
      <button
        onClick={() => {
          kek.current!.go(1, TRANSITION, DURATION);
        }}
      >
        next
      </button>
      <button
        onClick={() => {
          kek.current!.go(2, TRANSITION, DURATION);
        }}
      >
        next2
      </button>
      <button
        onClick={() => {
          kek.current!.go(4, TRANSITION, DURATION);
        }}
      >
        next4
      </button>
      <button
        onClick={() => {
          kek.current!.go(5, TRANSITION, DURATION);
        }}
      >
        next5
      </button>
      <br />
      {items.map((item) => (
        <button
          key={item}
          onClick={() => {
            kek.current!.goTo(item, TRANSITION, DURATION);
          }}
        >
          {item}
        </button>
      ))}
    </>
  );
};

export default Home;
