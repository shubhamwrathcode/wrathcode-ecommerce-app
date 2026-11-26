import { Platform, StyleSheet, TextStyle } from 'react-native';

/**
 * Roboto (Android). The static TTFs live in android/app/src/main/assets/fonts
 * (copied from @expo-google-fonts/roboto, OFL). On Android each weight is a
 * separate family file, so we pick the file by weight and reset fontWeight to
 * avoid synthetic ("faux") bolding. iOS keeps the system font for now.
 */
const ROBOTO: Record<string, string> = {
  '100': 'Roboto-Light',
  '200': 'Roboto-Light',
  '300': 'Roboto-Light',
  '400': 'Roboto-Regular',
  normal: 'Roboto-Regular',
  '500': 'Roboto-Medium',
  '600': 'Roboto-SemiBold',
  '700': 'Roboto-Bold',
  bold: 'Roboto-Bold',
  '800': 'Roboto-ExtraBold',
  '900': 'Roboto-Black',
};

export const usesRoboto = Platform.OS === 'android';

export function robotoFamily(weight?: TextStyle['fontWeight']): string {
  return ROBOTO[String(weight ?? '400')] ?? 'Roboto-Regular';
}

/** Returns a style that applies the right Roboto file for the effective weight. */
export function robotoStyle(
  ...styles: (TextStyle | null | undefined | false)[]
): TextStyle | null {
  if (!usesRoboto) return null;
  const flat = StyleSheet.flatten(styles.filter(Boolean) as TextStyle[]);
  return { fontFamily: robotoFamily(flat?.fontWeight), fontWeight: 'normal' };
}
