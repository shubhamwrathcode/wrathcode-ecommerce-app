import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Icon } from '@/components';
import { t, tf } from '@/i18n';
import { spacing, useTheme } from '@/theme';
import type { RatingBreakdown } from '@/types/models';
import { formatIndianNumber } from '@/utils/format';

/** 5-star bar breakdown (PD-07). */
export function RatingSummary({
  rating,
  count,
  breakdown,
}: {
  rating: number;
  count: number;
  breakdown: RatingBreakdown;
}) {
  const { colors } = useTheme();
  const max = Math.max(1, ...Object.values(breakdown));
  const barColor = (s: number) =>
    s >= 4 ? colors.rating : s === 3 ? colors.warning : colors.danger;
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.avg}>
          <AppText variant="h1" style={styles.big}>
            {rating.toFixed(1)}
          </AppText>
          <Icon name="star" size={22} color={colors.rating} />
        </View>
        <AppText variant="caption" color="textMuted" align="center">
          {tf(t.pdp.ratings, { n: formatIndianNumber(count) })}
        </AppText>
      </View>
      <View style={styles.bars}>
        {([5, 4, 3, 2, 1] as const).map(s => (
          <View key={s} style={styles.barRow}>
            <AppText variant="caption" style={styles.star}>
              {s}★
            </AppText>
            <View style={[styles.track, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${(breakdown[s] / max) * 100}%`,
                    backgroundColor: barColor(s),
                  },
                ]}
              />
            </View>
            <AppText variant="caption" color="textMuted" style={styles.n}>
              {formatIndianNumber(breakdown[s])}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  left: { alignItems: 'center', width: 96 },
  avg: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  big: { fontSize: 34, lineHeight: 40 },
  bars: { flex: 1, gap: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  star: { width: 22 },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  n: { width: 48, textAlign: 'right' },
});
