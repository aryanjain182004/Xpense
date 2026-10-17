import { useWindowDimensions } from 'react-native';

/** Stack filter rows and use compact layouts below this width (typical phones). */
export const MOBILE_BREAKPOINT = 480;

export function useMobileLayout(breakpoint = MOBILE_BREAKPOINT) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < breakpoint;
  return { width, height, isMobile };
}
