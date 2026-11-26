import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { robotoStyle, typography, useTheme } from '@/theme';
import type { Palette } from '@/theme';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySm'
  | 'label'
  | 'caption';

interface Props extends TextProps {
  variant?: TextVariant;
  color?: keyof Palette | (string & {});
  weight?: '400' | '500' | '600' | '700' | '800';
  align?: 'left' | 'center' | 'right';
  strike?: boolean;
}

export function AppText({
  variant = 'body',
  color = 'text',
  weight,
  align,
  strike,
  style,
  ...rest
}: Props) {
  const { colors } = useTheme();
  const resolved =
    (colors as unknown as Record<string, string>)[color] ?? color;
  const base = [
    typography[variant],
    weight ? { fontWeight: weight } : null,
    style as TextStyle,
  ];
  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={1.4}
      {...rest}
      style={[
        typography[variant],
        { color: resolved },
        weight ? { fontWeight: weight } : null,
        align ? { textAlign: align } : null,
        strike ? { textDecorationLine: 'line-through' } : null,
        style,
        robotoStyle(...base),
      ]}
    />
  );
}
