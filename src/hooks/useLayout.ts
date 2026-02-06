import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { BREAKPOINT_TABLET } from '../utils/constants';

export function useLayout() {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => sub.remove();
  }, []);

  return {
    width: dimensions.width,
    height: dimensions.height,
    isWide: dimensions.width >= BREAKPOINT_TABLET,
  };
}
