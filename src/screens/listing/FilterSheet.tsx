import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  AppText,
  BottomSheet,
  Button,
  CheckboxRow,
  RadioRow,
  RangeSlider,
} from '@/components';
import { useDebounce } from '@/hooks/useDebounce';
import { t, tf } from '@/i18n';
import { EMPTY_FILTERS, Facets, productService } from '@/services';
import { spacing, useTheme } from '@/theme';
import type { ProductFilters, ProductQuery } from '@/types/models';

type Tab =
  | 'category'
  | 'brand'
  | 'price'
  | 'rating'
  | 'discount'
  | 'availability'
  | 'delivery';
const TABS: { key: Tab; label: string }[] = [
  { key: 'category', label: t.plp.category },
  { key: 'brand', label: t.plp.brand },
  { key: 'price', label: t.plp.price },
  { key: 'rating', label: t.plp.rating },
  { key: 'discount', label: t.plp.discount },
  { key: 'availability', label: t.plp.availability },
  { key: 'delivery', label: t.plp.delivery },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  base: Partial<ProductQuery>;
  value: ProductFilters;
  facets: Facets | undefined;
  onApply: (f: ProductFilters) => void;
}

/** Filter bottom sheet with live result count, Clear all and Apply (PL-04). */
export function FilterSheet({
  visible,
  onClose,
  base,
  value,
  facets,
  onApply,
}: Props) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState<ProductFilters>(value);
  const [tab, setTab] = useState<Tab>('category');
  const [count, setCount] = useState<number | null>(null);
  const debounced = useDebounce(draft, 200);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  useEffect(() => {
    if (!visible) return;
    let alive = true;
    setCount(null);
    productService
      .countProducts({ ...base, ...debounced })
      .then(n => alive && setCount(n));
    return () => {
      alive = false;
    };
  }, [debounced, base, visible]);

  const toggle = <K extends 'categoryIds' | 'brands'>(key: K, v: string) =>
    setDraft(d => ({
      ...d,
      [key]: d[key].includes(v) ? d[key].filter(x => x !== v) : [...d[key], v],
    }));

  const minP = facets?.priceMin ?? 0;
  const maxP = Math.max(minP + 100, facets?.priceMax ?? 1000);

  const body = () => {
    switch (tab) {
      case 'category':
        return (facets?.categories ?? []).map(c => (
          <CheckboxRow
            key={c.id}
            label={c.name}
            checked={draft.categoryIds.includes(c.id)}
            onPress={() => toggle('categoryIds', c.id)}
          />
        ));
      case 'brand':
        return (facets?.brands ?? []).map(b => (
          <CheckboxRow
            key={b}
            label={b}
            checked={draft.brands.includes(b)}
            onPress={() => toggle('brands', b)}
          />
        ));
      case 'price':
        return (
          <RangeSlider
            min={minP}
            max={maxP}
            step={maxP - minP > 20000 ? 500 : 50}
            low={draft.priceMin ?? minP}
            high={draft.priceMax ?? maxP}
            onChange={(lo, hi) =>
              setDraft(d => ({
                ...d,
                priceMin: lo <= minP ? null : lo,
                priceMax: hi >= maxP ? null : hi,
              }))
            }
          />
        );
      case 'rating':
        return [4, 3].map(r => (
          <RadioRow
            key={r}
            title={tf(t.plp.ratingAbove, { n: r })}
            selected={draft.minRating === r}
            onPress={() =>
              setDraft(d => ({ ...d, minRating: d.minRating === r ? null : r }))
            }
          />
        ));
      case 'discount':
        return [10, 25, 50].map(p => (
          <RadioRow
            key={p}
            title={tf(t.plp.discountAbove, { n: p })}
            selected={draft.minDiscount === p}
            onPress={() =>
              setDraft(d => ({
                ...d,
                minDiscount: d.minDiscount === p ? null : p,
              }))
            }
          />
        ));
      case 'availability':
        return (
          <CheckboxRow
            label={t.plp.hideOos}
            checked={draft.hideOutOfStock}
            onPress={() =>
              setDraft(d => ({ ...d, hideOutOfStock: !d.hideOutOfStock }))
            }
          />
        );
      case 'delivery':
        return (
          <CheckboxRow
            label={t.plp.freeDelivery}
            checked={draft.freeDelivery}
            onPress={() =>
              setDraft(d => ({ ...d, freeDelivery: !d.freeDelivery }))
            }
          />
        );
    }
  };

  const tabActive = (k: Tab) =>
    ({
      category: draft.categoryIds.length > 0,
      brand: draft.brands.length > 0,
      price: draft.priceMin != null || draft.priceMax != null,
      rating: draft.minRating != null,
      discount: draft.minDiscount != null,
      availability: draft.hideOutOfStock,
      delivery: draft.freeDelivery,
    }[k]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t.plp.filters}
      maxHeightRatio={0.9}
      headerRight={
        <Pressable
          onPress={() => setDraft(EMPTY_FILTERS)}
          hitSlop={10}
          accessibilityRole="button"
        >
          <AppText variant="label" color="accent">
            {t.common.clearAll}
          </AppText>
        </Pressable>
      }
      footer={
        <>
          <Button
            title={t.common.close}
            variant="outline"
            onPress={onClose}
            style={styles.flex}
          />
          <Button
            title={
              count == null
                ? t.common.apply
                : tf(t.plp.showResults, { n: count })
            }
            onPress={() => {
              onApply(draft);
              onClose();
            }}
            style={styles.flex2}
            testID="filter-apply"
          />
        </>
      }
    >
      <View style={styles.row}>
        <View style={[styles.tabs, { backgroundColor: colors.surfaceAlt }]}>
          {TABS.map(x => (
            <Pressable
              key={x.key}
              onPress={() => setTab(x.key)}
              style={[
                styles.tab,
                tab === x.key && {
                  backgroundColor: colors.surface,
                  borderLeftColor: colors.accent,
                },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === x.key }}
            >
              <AppText
                variant="label"
                color={tab === x.key ? 'primary' : 'textSecondary'}
              >
                {x.label}
              </AppText>
              {tabActive(x.key) ? (
                <View
                  style={[styles.dot, { backgroundColor: colors.accent }]}
                />
              ) : null}
            </Pressable>
          ))}
        </View>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
        >
          {body()}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex2: { flex: 2 },
  row: { flexDirection: 'row', height: 420 },
  tabs: { width: 128 },
  tab: {
    paddingHorizontal: spacing.md,
    minHeight: 52,
    justifyContent: 'center',
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  dot: {
    position: 'absolute',
    right: 10,
    top: 22,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  content: { flex: 1 },
  contentInner: { padding: spacing.lg },
});
