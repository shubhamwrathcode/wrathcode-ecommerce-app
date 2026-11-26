import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  AppText,
  Button,
  ErrorState,
  Header,
  ProductImage,
  ProductRail,
  Screen,
  Skeleton,
} from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { t, tf } from '@/i18n';
import type { CategoriesScreenProps } from '@/navigation/types';
import { categoryService, productService } from '@/services';
import { radius, spacing, useTheme } from '@/theme';

/** Sub-category list (screen 14). */
export function SubCategoriesScreen({
  navigation,
  route,
}: CategoriesScreenProps<'SubCategories'>) {
  const { categoryId, name } = route.params;
  const { colors } = useTheme();
  const { data, loading, error, reload } = useAsync(async () => {
    const [subs, top] = await Promise.all([
      categoryService.getSubCategories(categoryId),
      productService.getProducts({
        categoryIds: [categoryId],
        sort: 'rating',
        pageSize: 10,
      }),
    ]);
    return { subs, top: top.items };
  }, [categoryId]);

  return (
    <Screen header={<Header title={name} />}>
      {error ? (
        <ErrorState onRetry={reload} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.grid}>
            {loading || !data
              ? [0, 1, 2, 3].map(i => (
                  <View key={i} style={styles.cell}>
                    <Skeleton height={140} />
                  </View>
                ))
              : data.subs.map(s => (
                  <Pressable
                    key={s.id}
                    style={[
                      styles.cell,
                      styles.card,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() =>
                      navigation.navigate('ProductList', {
                        title: s.name,
                        subCategoryId: s.id,
                      })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={s.name}
                  >
                    <ProductImage source={s.image} />
                    <AppText
                      variant="label"
                      align="center"
                      style={styles.label}
                    >
                      {s.name}
                    </AppText>
                  </Pressable>
                ))}
          </View>
          <View style={styles.pad}>
            <Button
              title={tf(t.categories.viewAllIn, { name })}
              variant="outline"
              onPress={() =>
                navigation.navigate('ProductList', {
                  title: name,
                  filters: { categoryIds: [categoryId] },
                })
              }
            />
          </View>
          <ProductRail
            title={t.home.topRated}
            products={data?.top}
            loading={loading}
          />
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.sm },
  cell: { width: '46%', margin: '2%' },
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
  },
  label: { marginTop: spacing.sm },
  pad: { paddingHorizontal: spacing.lg },
});
