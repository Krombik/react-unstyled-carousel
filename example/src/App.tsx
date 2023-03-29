import { VFC, useRef } from 'react';
import {
  Carousel,
  autoSize,
  infinity,
  infinitySwipe,
  infinityTransition,
} from 'react-unstuled-carousel';

const items = Array.from({ length: 10 }, (_, index) => index);

const TRANSITION = 'transform .3s ease';

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
            viewOffset={3}
            lazy={1}
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
          kek.current!.go(-2, TRANSITION);
        }}
      >
        prev2
      </button>
      <button
        onClick={() => {
          kek.current!.go(-1, TRANSITION);
        }}
      >
        prev
      </button>
      <button
        onClick={() => {
          kek.current!.go(1, TRANSITION);
        }}
      >
        next
      </button>
      <button
        onClick={() => {
          kek.current!.go(2, TRANSITION);
        }}
      >
        next2
      </button>
      <button
        onClick={() => {
          kek.current!.go(4, TRANSITION);
        }}
      >
        next4
      </button>
      <button
        onClick={() => {
          kek.current!.go(5, TRANSITION);
        }}
      >
        next5
      </button>
      <br />
      {items.map((item) => (
        <button
          key={item}
          onClick={() => {
            kek.current!.goTo(item, TRANSITION);
          }}
        >
          {item}
        </button>
      ))}
    </>
  );
};

export default Home;
