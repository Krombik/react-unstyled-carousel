import { VFC, useRef } from 'react';
import Carousel from 'react-unstuled-carousel';

const items = Array.from({ length: 10 }, (_, index) => index);

const TRANSITION = 'transform 1s ease';

const Home: VFC = () => {
  const kek = useRef<any>(null);
  return (
    <>
      <Carousel
        ref={kek}
        className='carousel'
        items={items}
        infinity
        defaultIndex={7}
        viewOffset={3}
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
          kek.current!.goTo(0, TRANSITION);
        }}
      >
        0
      </button>
      <button
        onClick={() => {
          kek.current!.goTo(9, TRANSITION);
        }}
      >
        9
      </button>
      <button
        onClick={() => {
          kek.current!.goTo(5, TRANSITION);
        }}
      >
        5
      </button>
      <button
        onClick={() => {
          kek.current!.goTo(3, TRANSITION);
        }}
      >
        3
      </button>
    </>
  );
};

export default Home;
