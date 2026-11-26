import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import {
  AppText,
  ErrorState,
  Header,
  Icon,
  IconButton,
  ListSkeleton,
  ProductImage,
  Screen,
} from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { t } from '@/i18n';
import type { CategoriesScreenProps } from '@/navigation/types';
import { bannerService, categoryService } from '@/services';
import { gradients, linear, radius, spacing, useTheme } from '@/theme';

/** Category list (screen 13) with category banners. */
export function CategoriesScreen({
  navigation,
}: CategoriesScreenProps<'Categories'>) {
  const { colors } = useTheme();
  const { data, loading, error, reload } = useAsync(async () => {
    const [categories, banners] = await Promise.all([
      categoryService.getCategories(),
      bannerService.getCategoryBanners(),
    ]);
    return { categories, banners };
  }, []);

  return (
    <Screen
      header={
        <Header
          title={t.categories.title}
          back={false}
          right={
            <IconButton
              name="search"
              accessibilityLabel="Search"
              onPress={() => navigation.navigate('Search')}
            />
          }
        />
      }
    >
      {loading ? (
        <ListSkeleton rows={8} />
      ) : error || !data ? (
        <ErrorState onRetry={reload} />
      ) : (
        <FlatList
          data={data.categories}
          keyExtractor={c => c.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <FlatList
              horizontal
              data={data.banners}
              keyExtractor={b => b.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.banners}
              renderItem={({ item, index }) => (
                <Pressable
                  onPress={() =>
                    navigation.navigate('ProductList', {
                      title: item.title,
                      filters: { categoryIds: [item.categoryId ?? ''] },
                    })
                  }
                  style={[
                    styles.banner,
                    linear(
                      gradients.banners[index % gradients.banners.length],
                      125,
                    ),
                  ]}
                  accessibilityRole="button"
                >
                  <View style={styles.flex}>
                    <AppText variant="h3" color="#FFFFFF">
                      {item.title}
                    </AppText>
                    <AppText variant="caption" color="#FFFFFFCC">
                      {item.subtitle}
                    </AppText>
                  </View>
                  {item.image ? (
                    <View style={styles.bannerPhoto}>
                      <ProductImage source={item.image} size={60} />
                    </View>
                  ) : (
                    <Icon name={item.icon} size={40} color="#FFFFFF" />
                  )}
                </Pressable>
              )}
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate('SubCategories', {
                  categoryId: item.id,
                  name: item.name,
                })
              }
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: pressed ? colors.surfaceAlt : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={item.name}
            >
              <View style={styles.thumb}>
                <ProductImage source={item.image} />
              </View>
              <AppText variant="h3" style={styles.flex}>
                {item.name}
              </AppText>
              <Icon name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.lg, gap: spacing.sm },
  banners: { gap: spacing.sm, paddingBottom: spacing.lg },
  bannerPhoto: {
    padding: 3,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-6deg' }],
  },
  banner: {
    width: 240,
    height: 84,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thumb: { width: 56 },
});
