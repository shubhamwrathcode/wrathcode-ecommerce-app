import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { gradients, HIT, linear, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

interface Props {
  name: string;
  onPress?: () => void;
  size?: number;
  color?: string;
  badge?: number;
  dot?: boolean;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function IconButton({
  name,
  onPress,
  size = 22,
  color,
  badge,
  dot,
  accessibilityLabel,
  style,
  disabled,
}: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={({ pressed }) => [
        styles.btn,
        { opacity: pressed ? 0.6 : disabled ? 0.4 : 1 },
        style,
      ]}
    >
      <Icon name={name} size={size} color={color ?? colors.text} />
      {badge ? (
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.accent, borderColor: colors.surface },
            linear(gradients.brand, 135),
          ]}
        >
          <AppText variant="caption" color="#FFFFFF" style={styles.badgeText}>
            {badge > 99 ? '99+' : badge}
          </AppText>
        </View>
      ) : dot ? (
        <View
          style={[styles.dot, { backgroundColor: colors.accent }, linear(gradients.brand, 135)]}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: HIT,
    height: HIT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  badgeText: { fontSize: 10, lineHeight: 13, fontWeight: '700' },
  dot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
