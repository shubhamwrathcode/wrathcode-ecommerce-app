import type { ViewStyle } from 'react-native';
import { brand } from './colors';

/** Brand gradients (colour stops) used across the app. */
export const gradients = {
  /** Main CTA / hero: violet → magenta, as in the Wrathcode mark. */
  brand: [brand.violet, brand.magenta],
  /** Deeper, calmer variant for large surfaces (splash, headers, cards). */
  deep: [brand.deepPlum, brand.violet, brand.orchid],
  /** Night background with a violet glow (dark hero areas). */
  night: [brand.night, '#1E0A3A', brand.plum],
  /** Subtle tint for soft chips / highlighted rows. */
  soft: ['#F6EAFD', '#FDEFFF'],
  softDark: ['#26153A', '#33123F'],
  danger: ['#C2264B', '#F2708A'],
  /** Rotating set for promo banners. */
  banners: [
    ['#410574', '#A218C2'],
    ['#7C03B2', '#DE24F8'],
    ['#54018B', '#B11BD8'],
    ['#2A0B52', '#7C03B2'],
    ['#8E0FB8', '#F06BFF'],
  ],
} as const;

export type GradientStops = readonly string[];

/**
 * Native CSS linear gradient (React Native New Architecture `backgroundImage`),
 * so no extra native library is needed.
 */
export function linear(stops: GradientStops, angle = 135): ViewStyle {
  return {
    experimental_backgroundImage: `linear-gradient(${angle}deg, ${stops.join(
      ', ',
    )})`,
  };
}
