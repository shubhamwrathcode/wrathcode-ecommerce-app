import { Platform, ViewStyle } from 'react-native';

const make = (
  elevation: number,
  opacity: number,
  radiusPx: number,
  y: number,
): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0A1520',
      shadowOpacity: opacity,
      shadowRadius: radiusPx,
      shadowOffset: { width: 0, height: y },
    },
    default: { elevation },
  }) as ViewStyle;

export const shadows = {
  sm: make(2, 0.06, 4, 1),
  md: make(4, 0.1, 8, 3),
  lg: make(10, 0.16, 16, 6),
};
