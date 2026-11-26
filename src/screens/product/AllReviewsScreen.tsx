import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Chip, EmptyState, Header, ListSkeleton, Screen } from '@/components';
import { t } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { reviewService, ReviewSort } from '@/services';
import { spacing, useTheme } from '@/theme';
import type { Review } from '@/types/models';
import { ReviewItem } from './ReviewItem';

const SORTS: ReviewSort[] = ['helpful', 'recent', 'positive', 'critical'];

/** All reviews (screen 16) with sort, star filter and infinite scroll. */
export function AllReviewsScreen({ route }: RootScreenProps<'AllReviews'>) {
  const { productId, productName } = route.params;
  const { colors } = useTheme();
  const [sort, setSort] = useState<ReviewSort>('helpful');
  const [rating, setRating] = useState<number | null>(null);
  const [items, setItems] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      const res = await reviewService.getReviews(productId, {
        page: p,
        sort,
        rating,
      });
      setItems(prev => (p === 1 ? res.items : [...prev, ...res.items]));
      setPage(p);
      setHasMore(res.hasMore);
      setLoading(false);
    },
    [productId, sort, rating],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <Screen
      background="surface"
      header={<Header title={t.reviews.title} subtitle={productName} />}
    >
      <View style={[styles.filters, { borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {SORTS.map(s => (
            <Chip
              key={s}
              label={t.reviews.sort[s]}
              selected={sort === s}
              onPress={() => setSort(s)}
            />
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          <Chip
            label={t.reviews.all}
            selected={rating == null}
            onPress={() => setRating(null)}
          />
          {[5, 4, 3, 2, 1].map(r => (
            <Chip
              key={r}
              label={`${r}★`}
              selected={rating === r}
              onPress={() => setRating(r)}
            />
          ))}
        </ScrollView>
      </View>
      {loading && page === 1 && !items.length ? (
        <ListSkeleton />
      ) : (
        <FlatList
          data={items}
          keyExtractor={r => r.id}
          renderItem={({ item }) => <ReviewItem review={item} />}
          contentContainerStyle={styles.list}
          onEndReachedThreshold={0.3}
          onEndReached={() => hasMore && !loading && load(page + 1)}
          ListEmptyComponent={
            <EmptyState icon="chatbubbles-outline" title={t.reviews.empty} />
          }
          ListFooterComponent={
            loading && page > 0 && items.length ? (
              <ActivityIndicator color={colors.accent} style={styles.footer} />
            ) : undefined
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  footer: { paddingVertical: spacing.lg },
});
