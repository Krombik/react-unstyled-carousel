import { AutoSizeModule } from '../types';

const autoSize: AutoSizeModule = (container, viewOffset, isVertical) => {
  let handle: number;

  const wrapper = container.parentElement!;

  const { style } = wrapper;

  const property = isVertical ? 'height' : 'width';

  const clientProperty = isVertical ? 'clientHeight' : 'clientWidth';

  const setSize = () => {
    style[property] =
      container.children[0][clientProperty] * (viewOffset + 1) +
      (container[clientProperty] - wrapper[clientProperty]) * viewOffset +
      'px';
  };

  setSize();

  const listener = () => {
    cancelAnimationFrame(handle);

    handle = requestAnimationFrame(setSize);
  };

  window.addEventListener('resize', listener);

  window.addEventListener('orientationchange', listener);

  return () => {
    style.removeProperty(property);

    window.removeEventListener('resize', listener);

    window.removeEventListener('orientationchange', listener);
  };
};

export default autoSize;
