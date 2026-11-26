import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { radius, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max: number;
  onLimit?: () => void;
  disabled?: boolean;
}

/** Quantity stepper: min 1, max min(5, stock); tapping beyond the limit reports it (CT-02). */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  onLimit,
  disabled,
}: Props) {
  const { colors } = useTheme();
  const btn = (
    icon: string,
    enabled: boolean,
    onPress: () => void,
    label: string,
  ) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={[styles.btn, { opacity: enabled && !disabled ? 1 : 0.35 }]}
    >
      <Icon name={icon} size={16} color={colors.primary} />
    </Pressable>
  );
  return (
    <View style={[styles.wrap, { borderColor: colors.border }]}>
      {btn(
        'remove',
        value > min,
        () => value > min && onChange(value - 1),
        'Decrease quantity',
      )}
      <AppText
        variant="label"
        style={styles.value}
        accessibilityLabel={`Quantity ${value}`}
      >
        {value}
      </AppText>
      {btn(
        'add',
        value < max,
        () => (value < max ? onChange(value + 1) : onLimit?.()),
        'Increase quantity',
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  btn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { minWidth: 28, textAlign: 'center' },
});
