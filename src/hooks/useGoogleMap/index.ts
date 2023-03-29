import { useContext } from 'react';
import MapContext from '../../context/CarouselMethodsContext';

const useGoogleMap = () => useContext(MapContext);

export default useGoogleMap;
