import React from 'react';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { StyleProp, TextStyle } from 'react-native';
import { useTheme } from '@/theme';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  name: IconName | string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export const Icon = React.memo(function IconView({
  name,
  size = 22,
  color,
  style,
}: Props) {
  const { colors } = useTheme();
  return (
    <Ionicons
      name={name as IconName}
      size={size}
      color={color ?? colors.text}
      style={style}
    />
  );
});
