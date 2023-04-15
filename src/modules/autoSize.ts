import { AutoSizeModule } from '../types';

const autoSize: AutoSizeModule = (self, viewOffset) => {
  let handle: number;

  const container = self._container;

  const wrapper = container.parentElement!;

  const { style } = wrapper;

  const sizeKey = self._sizeKey;

  const clientSizeKey = self._clientSizeKey;

  const setSize = () => {
    style[sizeKey] =
      container.children[0][clientSizeKey] * (viewOffset + 1) +
      (container[clientSizeKey] - wrapper[clientSizeKey]) * viewOffset +
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
    style.removeProperty(sizeKey);

    window.removeEventListener('resize', listener);

    window.removeEventListener('orientationchange', listener);
  };
};

export default autoSize;
