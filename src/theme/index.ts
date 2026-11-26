import { useMemo } from 'react';
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { useAppSelector } from '@/store/hooks';
import { brand, darkColors, lightColors, Palette } from './colors';
import { gradients, linear } from './gradients';
import { robotoFamily, robotoStyle, usesRoboto } from './fonts';
import { shadows } from './shadows';
import { HIT, radius, spacing } from './spacing';
import { fontSize, typography } from './typography';

export {
  robotoFamily,
  robotoStyle,
  usesRoboto,
  brand,
  gradients,
  linear,
  lightColors,
  darkColors,
  spacing,
  radius,
  HIT,
  typography,
  fontSize,
  shadows,
};
export type { Palette };
export type { GradientStops } from './gradients';

export interface Theme {
  dark: boolean;
  colors: Palette;
}

export function useTheme(): Theme {
  const dark = useAppSelector(s => s.ui.darkMode);
  return useMemo(
    () => ({ dark, colors: dark ? darkColors : lightColors }),
    [dark],
  );
}

/** Creates a themed StyleSheet hook: `const useStyles = makeStyles(c => ({...}))`. */
type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

export function makeStyles<T extends NamedStyles>(
  factory: (c: Palette, dark: boolean) => T,
) {
  const cache = new Map<boolean, T>();
  return function useStyles(): T {
    const { dark, colors } = useTheme();
    let styles = cache.get(dark);
    if (!styles) {
      styles = StyleSheet.create(factory(colors, dark));
      cache.set(dark, styles);
    }
    return styles;
  };
}
