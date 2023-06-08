import { AutoSizeModule } from '../types';
import { ORIENTATION_CHANGE_EVENT, RESIZE_EVENT } from '../utils/constants';

const autoSize: AutoSizeModule = (innerData, viewOffset) => {
  let handle: number;

  const container = innerData._container;

  const wrapper = container.parentElement!;

  const sizeKey = innerData._sizeKey;

  const clientSizeKey = innerData._clientSizeKey;

  const { style } = wrapper;

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

  window.addEventListener(RESIZE_EVENT, listener);

  window.addEventListener(ORIENTATION_CHANGE_EVENT, listener);

  return () => {
    style.removeProperty(sizeKey);

    window.removeEventListener(RESIZE_EVENT, listener);

    window.removeEventListener(ORIENTATION_CHANGE_EVENT, listener);
  };
};

export default autoSize;
