import { Platform, TextStyle } from 'react-native';

// Android uses bundled Roboto (see fonts.ts, applied per weight in AppText).
const family = Platform.select({
  ios: 'System',
  android: 'Roboto-Regular',
  default: 'System',
});

/** Five text sizes (section 9: "4-5 text sizes defined in the theme"). */
export const fontSize = { xs: 11, sm: 13, md: 15, lg: 18, xl: 24 } as const;

export const typography: Record<string, TextStyle> = {
  h1: {
    fontFamily: family,
    fontSize: fontSize.xl,
    fontWeight: '800',
    lineHeight: 31,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: family,
    fontSize: fontSize.lg,
    fontWeight: '700',
    lineHeight: 24,
  },
  h3: {
    fontFamily: family,
    fontSize: fontSize.md,
    fontWeight: '600',
    lineHeight: 21,
  },
  body: {
    fontFamily: family,
    fontSize: fontSize.md,
    fontWeight: '400',
    lineHeight: 21,
  },
  bodySm: {
    fontFamily: family,
    fontSize: fontSize.sm,
    fontWeight: '400',
    lineHeight: 18,
  },
  label: {
    fontFamily: family,
    fontSize: fontSize.sm,
    fontWeight: '600',
    lineHeight: 18,
  },
  caption: {
    fontFamily: family,
    fontSize: fontSize.xs,
    fontWeight: '500',
    lineHeight: 15,
  },
};
