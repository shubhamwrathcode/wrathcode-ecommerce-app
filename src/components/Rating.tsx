import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { radius, spacing, useTheme } from '@/theme';
import { formatCount } from '@/utils/format';
import { AppText } from './AppText';
import { Icon } from './Icon';

export const RatingBadge = React.memo(function RatingBadgeView({
  rating,
  count,
}: {
  rating: number;
  count?: number;
}) {
  const { colors } = useTheme();
  const bg =
    rating >= 4 ? colors.rating : rating >= 3 ? colors.warning : colors.danger;
  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <AppText variant="caption" color="#FFFFFF" weight="700">
          {rating.toFixed(1)}
        </AppText>
        <Icon name="star" size={10} color="#FFFFFF" />
      </View>
      {count != null ? (
        <AppText variant="caption" color="textMuted">
          ({formatCount(count)})
        </AppText>
      ) : null}
    </View>
  );
});

export function RatingStars({
  rating,
  size = 14,
}: {
  rating: number;
  size?: number;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessibilityLabel={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Icon
          key={i}
          name={
            rating >= i
              ? 'star'
              : rating >= i - 0.5
              ? 'star-half'
              : 'star-outline'
          }
          size={size}
          color={colors.accent}
        />
      ))}
    </View>
  );
}

/** Tappable 1–5 star input for reviews. */
export function StarInput({
  value,
  onChange,
  size = 36,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { gap: spacing.sm }]}>
      {[1, 2, 3, 4, 5].map(i => (
        <Pressable
          key={i}
          onPress={() => onChange(i)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`${i} star`}
        >
          <Icon
            name={value >= i ? 'star' : 'star-outline'}
            size={size}
            color={value >= i ? colors.accent : colors.textMuted}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
});
