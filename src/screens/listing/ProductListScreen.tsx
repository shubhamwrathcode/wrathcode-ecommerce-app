import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  AppText,
  Chip,
  EmptyState,
  ErrorState,
  GridSkeleton,
  Header,
  Icon,
  IconButton,
  ProductCard,
  Screen,
} from '@/components';
import { t, tf } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import {
  categoryService,
  DEFAULT_QUERY,
  EMPTY_FILTERS,
  Facets,
  productService,
} from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCartCount } from '@/store/selectors';
import { uiActions } from '@/store/slices/uiSlice';
import { gradients, linear, radius, spacing, useTheme } from '@/theme';
import type {
  Category,
  Product,
  ProductFilters,
  ProductQuery,
  SortOption,
} from '@/types/models';
import { FilterSheet } from './FilterSheet';
import { activeFilterCount, filterChips } from './filterUtils';
import { SortSheet } from './SortSheet';

/** Search results / PLP (PL-01…PL-05, SR-04). */
export function ProductListScreen({
  navigation,
  route,
}: RootScreenProps<'ProductList'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const grid = useAppSelector(s => s.ui.gridView);
  const cartCount = useAppSelector(selectCartCount);
  const p = route.params;

  const base = useMemo<Partial<ProductQuery>>(
    () => ({
      query: p.query ?? '',
      subCategoryId: p.subCategoryId ?? null,
      collection: p.collection ?? null,
    }),
    [p.query, p.subCategoryId, p.collection],
  );
  const [filters, setFilters] = useState<ProductFilters>({
    ...EMPTY_FILTERS,
    ...p.filters,
  });
  const [sort, setSort] = useState<SortOption>('relevance');
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [facets, setFacets] = useState<Facets>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [sheet, setSheet] = useState<'sort' | 'filter' | null>(null);
  const [suggested, setSuggested] = useState<Product[]>([]);
  const reqId = useRef(0);

  useEffect(() => {
    categoryService.getAll().then(setCategories);
    productService.getFacets(base).then(setFacets);
  }, [base]);

  const load = useCallback(
    async (nextPage: number) => {
      const id = ++reqId.current;
      if (nextPage === 1) setLoading(true);
      else setLoadingMore(true);
      setError(false);
      try {
        const res = await productService.getProducts({
          ...base,
          ...filters,
          sort,
          page: nextPage,
          pageSize: DEFAULT_QUERY.pageSize,
        });
        if (id !== reqId.current) return;
        setItems(prev =>
          nextPage === 1 ? res.items : [...prev, ...res.items],
        );
        setTotal(res.total);
        setPage(nextPage);
        setHasMore(res.hasMore);
        if (nextPage === 1 && res.total === 0)
          productService.getCollection('toprated', 8).then(setSuggested);
      } catch {
        if (id === reqId.current) setError(true);
      } finally {
        if (id === reqId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [base, filters, sort],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const catName = useCallback(
    (id: string) => categories.find(c => c.id === id)?.name ?? id,
    [categories],
  );
  const chips = filterChips(filters, catName);
  const badge = activeFilterCount(filters);
  const title = p.title ?? (p.query ? `"${p.query}"` : t.categories.products);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard product={item} layout={grid ? 'grid' : 'list'} />
    ),
    [grid],
  );

  const toolbar = (
    <View
      style={[
        styles.toolbar,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      <Pressable
        onPress={() => setSheet('sort')}
        style={styles.tool}
        accessibilityRole="button"
        testID="plp-sort"
      >
        <Icon name="swap-vertical" size={18} color={colors.text} />
        <View>
          <AppText variant="label">{t.plp.sort}</AppText>
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {t.plp.sortOptions[sort]}
          </AppText>
        </View>
      </Pressable>
      <View style={[styles.sep, { backgroundColor: colors.border }]} />
      <Pressable
        onPress={() => setSheet('filter')}
        style={styles.tool}
        accessibilityRole="button"
        testID="plp-filter"
      >
        <View>
          <Icon name="options-outline" size={18} color={colors.text} />
          {badge ? (
            <View style={[styles.badge, linear(gradients.brand, 135)]}>
              <AppText
                variant="caption"
                color="#FFFFFF"
                style={styles.badgeText}
              >
                {badge}
              </AppText>
            </View>
          ) : null}
        </View>
        <AppText variant="label">{t.plp.filter}</AppText>
      </Pressable>
      <View style={[styles.sep, { backgroundColor: colors.border }]} />
      <IconButton
        name={grid ? 'list-outline' : 'grid-outline'}
        accessibilityLabel={grid ? 'List view' : 'Grid view'}
        onPress={() => dispatch(uiActions.toggleGridView())}
      />
    </View>
  );

  const header = (
    <View>
      {chips.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {chips.map(c => (
            <Chip
              key={c.key}
              label={c.label}
              selected
              onRemove={() => setFilters(c.remove(filters))}
            />
          ))}
        </ScrollView>
      ) : null}
      {!loading ? (
        <AppText variant="caption" color="textMuted" style={styles.count}>
          {tf(t.plp.results, { n: total })}
        </AppText>
      ) : null}
    </View>
  );

  const empty = () => {
    const hasFilters = badge > 0;
    return (
      <View>
        <EmptyState
          compact
          icon="search-outline"
          title={
            hasFilters
              ? t.plp.noResults
              : tf(t.search.noResultsTitle, { q: p.query ?? title })
          }
          body={hasFilters ? t.plp.noResultsBody : t.search.noResultsBody}
          actionLabel={hasFilters ? t.plp.clearFilters : undefined}
          onAction={hasFilters ? () => setFilters(EMPTY_FILTERS) : undefined}
        />
        {suggested.length ? (
          <>
            <AppText variant="h2" style={styles.youMay}>
              {t.search.youMayLike}
            </AppText>
            <View style={styles.suggestGrid}>
              {suggested.map(s => (
                <View key={s.id} style={styles.half}>
                  <ProductCard product={s} />
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>
    );
  };

  return (
    <Screen
      header={
        <Header
          title={title}
          right={
            <>
              <IconButton
                name="search"
                accessibilityLabel="Search"
                onPress={() => navigation.navigate('Search')}
              />
              <IconButton
                name="bag-handle-outline"
                accessibilityLabel={t.tabs.cart}
                badge={cartCount}
                onPress={() =>
                  navigation.navigate('Main', {
                    screen: 'CartTab',
                    params: { screen: 'Cart' },
                  })
                }
              />
            </>
          }
        />
      }
    >
      {toolbar}
      {loading && !items.length ? (
        <GridSkeleton />
      ) : error && !items.length ? (
        <ErrorState onRetry={() => load(1)} />
      ) : (
        <FlatList
          key={grid ? 'grid' : 'list'}
          data={items}
          numColumns={grid ? 2 : 1}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          ListHeaderComponent={header}
          ListEmptyComponent={empty}
          contentContainerStyle={grid ? styles.gridPad : undefined}
          onEndReachedThreshold={0.4}
          onEndReached={() =>
            hasMore && !loadingMore && !loading && load(page + 1)
          }
          ListFooterComponent={
            items.length ? (
              loadingMore ? (
                <ActivityIndicator
                  style={styles.footer}
                  color={colors.accent}
                />
              ) : !hasMore ? (
                <AppText
                  variant="caption"
                  color="textMuted"
                  align="center"
                  style={styles.footer}
                >
                  {t.plp.endOfList}
                </AppText>
              ) : undefined
            ) : undefined
          }
          initialNumToRender={8}
          windowSize={7}
          removeClippedSubviews
        />
      )}
      <SortSheet
        visible={sheet === 'sort'}
        value={sort}
        onClose={() => setSheet(null)}
        onSelect={setSort}
      />
      <FilterSheet
        visible={sheet === 'filter'}
        onClose={() => setSheet(null)}
        base={base}
        value={filters}
        facets={facets}
        onApply={setFilters}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 52,
  },
  tool: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: '100%',
  },
  sep: { width: StyleSheet.hairlineWidth, height: 28 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 10, lineHeight: 12 },
  chips: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  count: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  gridPad: { paddingHorizontal: spacing.xs, paddingBottom: spacing.xl },
  footer: { paddingVertical: spacing.xl },
  youMay: { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  suggestGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  half: { width: '50%', borderRadius: radius.lg },
});
