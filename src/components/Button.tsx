import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  gradients,
  GradientStops,
  HIT,
  linear,
  radius,
  spacing,
  useTheme,
} from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  size?: 'md' | 'sm';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  icon,
  size = 'md',
  fullWidth = true,
  style,
  testID,
}: Props) {
  const { colors } = useTheme();
  const palette: Record<
    Variant,
    { bg: string; fg: string; border: string; gradient?: GradientStops }
  > = {
    primary: {
      bg: colors.primary,
      fg: '#FFFFFF',
      border: 'transparent',
      gradient: gradients.brand,
    },
    secondary: {
      bg: colors.primaryDark,
      fg: '#FFFFFF',
      border: 'transparent',
      gradient: gradients.deep,
    },
    outline: { bg: 'transparent', fg: colors.primary, border: colors.primary },
    ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
    danger: {
      bg: colors.danger,
      fg: '#FFFFFF',
      border: 'transparent',
      gradient: gradients.danger,
    },
  };
  const p = palette[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      accessibilityLabel={title}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        {
          backgroundColor: p.bg,
          borderColor: p.border,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        },
        p.gradient ? linear(p.gradient, 120) : null,
        p.gradient && !isDisabled ? styles.glow : null,
        !fullWidth && styles.inline,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? (
            <Icon name={icon} size={size === 'sm' ? 16 : 19} color={p.fg} />
          ) : null}
          <AppText
            variant={size === 'sm' ? 'label' : 'h3'}
            color={p.fg}
            numberOfLines={1}
          >
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: HIT + 4,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  sm: { minHeight: 36, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  inline: { alignSelf: 'flex-start' },
  glow: {
    boxShadow: '0px 6px 16px rgba(124, 3, 178, 0.28)',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
