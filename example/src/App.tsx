import { VFC, useRef } from 'react';
import Carousel from 'react-unstuled-carousel';

const items = Array.from({ length: 10 }, (_, index) => index);

const Home: VFC = () => {
  const kek = useRef<any>(null);
  return (
    <>
      <Carousel
        ref={kek}
        className='carousel'
        items={items}
        infinity
        // defaultIndex={1}
        viewOffset={1}
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
          kek.current!.go(-1);
        }}
      >
        prev
      </button>
      <button
        onClick={() => {
          kek.current!.go(1);
        }}
      >
        next
      </button>
      <button
        onClick={() => {
          kek.current!.goTo(0);
        }}
      >
        0
      </button>
      <button
        onClick={() => {
          kek.current!.goTo(9);
        }}
      >
        9
      </button>
      <button
        onClick={() => {
          kek.current!.goTo(5);
        }}
      >
        5
      </button>
      <button
        onClick={() => {
          kek.current!.goTo(3);
        }}
      >
        3
      </button>
    </>
  );
};

export default Home;
