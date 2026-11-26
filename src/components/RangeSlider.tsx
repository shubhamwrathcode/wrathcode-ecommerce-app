import React, { useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import { gradients, linear, spacing, useTheme } from '@/theme';
import { formatPrice } from '@/utils/format';
import { AppText } from './AppText';

interface Props {
  min: number;
  max: number;
  low: number;
  high: number;
  step?: number;
  onChange: (low: number, high: number) => void;
}

const THUMB = 26;

/** Dual-thumb price range slider (pure JS, no native dependency). */
export function RangeSlider({
  min,
  max,
  low,
  high,
  step = 50,
  onChange,
}: Props) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const state = useRef({ low, high, startLow: low, startHigh: high, width: 0 });
  state.current.low = low;
  state.current.high = high;
  state.current.width = width;
  const span = Math.max(1, max - min);
  const toX = (v: number) => ((v - min) / span) * width;
  const snap = (v: number) =>
    Math.min(max, Math.max(min, Math.round(v / step) * step));

  const make = (which: 'low' | 'high') =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        state.current.startLow = state.current.low;
        state.current.startHigh = state.current.high;
      },
      onPanResponderMove: (_, g) => {
        const s = state.current;
        if (!s.width) return;
        const delta = (g.dx / s.width) * span;
        if (which === 'low')
          onChange(Math.min(snap(s.startLow + delta), s.high - step), s.high);
        else onChange(s.low, Math.max(snap(s.startHigh + delta), s.low + step));
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lowPan = useMemo(() => make('low'), [min, max, step]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const highPan = useMemo(() => make('high'), [min, max, step]);

  return (
    <View style={styles.wrap}>
      <View style={styles.labels}>
        <AppText variant="label">{formatPrice(low)}</AppText>
        <AppText variant="label">
          {formatPrice(high)}
          {high >= max ? '+' : ''}
        </AppText>
      </View>
      <View
        style={styles.trackWrap}
        onLayout={(e: LayoutChangeEvent) =>
          setWidth(e.nativeEvent.layout.width - THUMB)
        }
      >
        <View style={[styles.track, { backgroundColor: colors.border }]} />
        <View
          style={[
            styles.active,
            {
              backgroundColor: colors.primary,
              left: toX(low) + THUMB / 2,
              width: Math.max(0, toX(high) - toX(low)),
            },
            linear(gradients.brand, 90),
          ]}
        />
        <View
          {...lowPan.panHandlers}
          accessibilityLabel="Minimum price"
          style={[
            styles.thumb,
            {
              left: toX(low),
              borderColor: colors.primary,
              backgroundColor: colors.surface,
            },
          ]}
        />
        <View
          {...highPan.panHandlers}
          accessibilityLabel="Maximum price"
          style={[
            styles.thumb,
            {
              left: toX(high),
              borderColor: colors.primary,
              backgroundColor: colors.surface,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: spacing.sm },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  trackWrap: { height: 44, justifyContent: 'center' },
  track: {
    position: 'absolute',
    left: THUMB / 2,
    right: THUMB / 2,
    height: 4,
    borderRadius: 2,
  },
  active: { position: 'absolute', height: 4, borderRadius: 2 },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
  },
});
