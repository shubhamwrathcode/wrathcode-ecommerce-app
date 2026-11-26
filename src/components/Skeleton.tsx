import React, { useEffect, useRef } from 'react';
import {
  Animated,
  DimensionValue,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { radius, spacing, useTheme } from '@/theme';

export function Skeleton({
  width = '100%',
  height = 14,
  style,
  round,
}: {
  width?: DimensionValue;
  height?: DimensionValue;
  style?: StyleProp<ViewStyle>;
  round?: boolean;
}) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: round ? 999 : radius.sm,
          backgroundColor: colors.skeleton,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton({ width }: { width?: DimensionValue }) {
  return (
    <View style={[styles.card, width ? { width } : styles.flex]}>
      <View style={styles.img}>
        <Skeleton height="100%" />
      </View>
      <Skeleton width="85%" style={styles.gap} />
      <Skeleton width="60%" style={styles.gap} />
      <Skeleton width="40%" height={18} style={styles.gap} />
    </View>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.cell}>
          <ProductCardSkeleton />
        </View>
      ))}
    </View>
  );
}

export function RailSkeleton() {
  return (
    <View style={styles.rail}>
      {[0, 1, 2].map(i => (
        <ProductCardSkeleton key={i} width={150} />
      ))}
    </View>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <View style={{ padding: spacing.lg, gap: spacing.lg }}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.listRow}>
          <Skeleton width={72} height={72} />
          <View style={styles.flex}>
            <Skeleton width="80%" />
            <Skeleton width="50%" style={styles.gap} />
            <Skeleton width="30%" style={styles.gap} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { padding: spacing.sm },
  img: {
    aspectRatio: 1,
    width: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  gap: { marginTop: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.xs },
  cell: { width: '50%' },
  rail: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  listRow: { flexDirection: 'row', gap: spacing.md },
});
