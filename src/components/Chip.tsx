import React from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { radius, spacing, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
  onRemove?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Chip = React.memo(function ChipView({
  label,
  selected,
  onPress,
  icon,
  onRemove,
  disabled,
  style,
}: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onRemove ?? onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      accessibilityLabel={onRemove ? `Remove ${label}` : label}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primarySoft : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {icon ? (
        <Icon
          name={icon}
          size={15}
          color={selected ? colors.primary : colors.textSecondary}
        />
      ) : null}
      <AppText
        variant="label"
        color={selected ? 'primary' : 'textSecondary'}
        strike={disabled}
        numberOfLines={1}
      >
        {label}
      </AppText>
      {onRemove ? <Icon name="close" size={14} color={colors.primary} /> : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
});
