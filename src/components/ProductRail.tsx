import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { spacing } from '@/theme';
import type { Product } from '@/types/models';
import { SectionHeader } from './Card';
import { ProductCard } from './ProductCard';
import { RailSkeleton } from './Skeleton';

interface Props {
  title: string;
  products?: Product[];
  loading?: boolean;
  onSeeAll?: () => void;
  seeAllLabel?: string;
  subtitle?: string;
}

/** Horizontal product carousel used on Home, PDP, Cart. */
export function ProductRail({
  title,
  products,
  loading,
  onSeeAll,
  seeAllLabel = 'See all',
  subtitle,
}: Props) {
  if (!loading && (!products || !products.length)) return null;
  return (
    <View style={styles.wrap}>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        action={onSeeAll ? seeAllLabel : undefined}
        onAction={onSeeAll}
      />
      {loading ? (
        <RailSkeleton />
      ) : (
        <FlatList
          horizontal
          data={products}
          keyExtractor={p => p.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.content}
          renderItem={({ item }) => (
            <ProductCard product={item} layout="rail" />
          )}
          initialNumToRender={4}
          windowSize={5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.xl },
  content: { paddingHorizontal: spacing.lg, gap: spacing.sm },
});
