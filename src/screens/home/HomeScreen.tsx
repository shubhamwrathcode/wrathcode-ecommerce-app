import React, { useCallback } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  AppText,
  BannerCarousel,
  CountdownTimer,
  ErrorState,
  Icon,
  IconButton,
  Logo,
  ProductCard,
  ProductImage,
  ProductRail,
  RailSkeleton,
  Screen,
  Skeleton,
} from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { t, tf } from '@/i18n';
import type { HomeScreenProps } from '@/navigation/types';
import { bannerService, categoryService, productService } from '@/services';
import { useAppSelector } from '@/store/hooks';
import { selectDeliveryAddress, selectUnreadCount } from '@/store/selectors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gradients, linear, radius, spacing, useTheme } from '@/theme';
import type { Banner, Collection } from '@/types/models';

/** Home (HM-01…HM-07). */
export function HomeScreen({ navigation }: HomeScreenProps<'Home'>) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const unread = useAppSelector(selectUnreadCount);
  const address = useAppSelector(selectDeliveryAddress);
  const guestPincode = useAppSelector(s => s.address.guestPincode);
  const recentIds = useAppSelector(s => s.history.recentlyViewed);
  const recentKey = recentIds.join(',');

  const home = useAsync(async () => {
    const [
      banners,
      categories,
      deals,
      bestsellers,
      toprated,
      newest,
      under999,
    ] = await Promise.all([
      bannerService.getHomeBanners(),
      categoryService.getCategories(),
      productService.getDealsOfDay(),
      productService.getCollection('bestsellers'),
      productService.getCollection('toprated'),
      productService.getCollection('new'),
      productService.getCollection('under999'),
    ]);
    return {
      banners,
      categories,
      deals,
      bestsellers,
      toprated,
      newest,
      under999,
    };
  }, []);

  const personal = useAsync(async () => {
    const ids = recentKey ? recentKey.split(',') : [];
    const [recommended, recent] = await Promise.all([
      productService.getRecommended(ids),
      productService.getProductsByIds(ids),
    ]);
    return { recommended, recent };
  }, [recentKey]);

  const openList = useCallback(
    (title: string, collection: Collection) =>
      navigation.navigate('ProductList', { title, collection }),
    [navigation],
  );

  const onBanner = (b: Banner) => {
    if (b.target.type === 'category') {
      const cat = home.data?.categories.find(
        c => c.id === (b.target as { categoryId: string }).categoryId,
      );
      navigation.navigate('ProductList', {
        title: cat?.name ?? b.title,
        filters: { categoryIds: [b.target.categoryId] },
      });
    } else {
      navigation.navigate('ProductList', {
        title: b.target.title,
        filters: b.target.filters,
      });
    }
  };

  const refresh = () => {
    home.refresh();
    personal.refresh();
  };

  const deliverText = address
    ? `${address.name.split(' ')[0]} — ${address.city} ${address.pincode}`
    : guestPincode
    ? guestPincode
    : t.home.selectLocation;

  const d = home.data;
  return (
    <Screen background="background" edges={[]} lightStatusBar>
      {/* HM-01 top bar (brand gradient) */}
      <View
        style={[
          styles.top,
          linear(dark ? gradients.night : gradients.deep, 150),
          { paddingTop: insets.top },
        ]}
      >
        <View style={styles.topRow}>
          <Logo size={30} showName light />
          <View style={styles.flex} />
          <IconButton
            name="notifications-outline"
            color="#FFFFFF"
            accessibilityLabel={t.notifications.title}
            badge={unread}
            onPress={() => navigation.navigate('Notifications')}
          />
        </View>
        <Pressable
          onPress={() => navigation.navigate('Search')}
          style={[
            styles.search,
            { backgroundColor: colors.surface, borderColor: 'transparent' },
          ]}
          accessibilityRole="search"
          testID="home-search"
        >
          <Icon name="search" size={18} color={colors.textMuted} />
          <AppText color="textMuted" style={styles.flex} numberOfLines={1}>
            {t.home.searchPlaceholder}
          </AppText>
          <Icon name="mic-outline" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
      {/* HM-02 deliver to */}
      <Pressable
        onPress={() => navigation.navigate('AddressPicker')}
        style={[styles.deliver, { backgroundColor: colors.primarySoft }]}
        accessibilityRole="button"
      >
        <Icon name="location" size={16} color={colors.primary} />
        <AppText variant="bodySm" color="textSecondary">
          {t.home.deliverTo}
        </AppText>
        <AppText
          variant="label"
          color="primary"
          numberOfLines={1}
          style={styles.flex}
        >
          {deliverText}
        </AppText>
        <Icon name="chevron-down" size={16} color={colors.primary} />
      </Pressable>

      {home.error && !d ? (
        <ErrorState onRetry={home.reload} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={home.refreshing}
              onRefresh={refresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          contentContainerStyle={styles.scroll}
        >
          {/* HM-03 banners */}
          <View style={styles.block}>
            {d ? (
              <BannerCarousel banners={d.banners} onPress={onBanner} />
            ) : (
              <Skeleton height={160} style={styles.bannerSkel} />
            )}
          </View>

          {/* HM-04 categories */}
          <FlatList
            horizontal
            data={
              d?.categories ??
              Array.from({ length: 8 }).map(
                (_, i) => ({ id: `s${i}` } as never),
              )
            }
            keyExtractor={c => c.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cats}
            renderItem={({ item }) =>
              d ? (
                <Pressable
                  onPress={() =>
                    navigation.navigate('ProductList', {
                      title: item.name,
                      filters: { categoryIds: [item.id] },
                    })
                  }
                  style={styles.cat}
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                >
                  {/* story-style gradient ring around a real photo */}
                  <View style={[styles.catRing, linear(gradients.brand, 135)]}>
                    <View
                      style={[
                        styles.catIcon,
                        {
                          backgroundColor: '#FFFFFF',
                          borderColor: colors.surface,
                        },
                      ]}
                    >
                      <ProductImage
                        source={item.image}
                        size={52}
                        rounded={false}
                      />
                    </View>
                  </View>
                  <AppText
                    variant="caption"
                    align="center"
                    weight="600"
                    numberOfLines={2}
                  >
                    {item.name}
                  </AppText>
                </Pressable>
              ) : (
                <View style={styles.cat}>
                  <Skeleton width={66} height={66} round />
                  <Skeleton width={50} height={10} style={styles.catSkelText} />
                </View>
              )
            }
          />

          {/* HM-05 deal of the day */}
          <View style={[styles.deal, { backgroundColor: colors.surface }]}>
            <View style={styles.dealHead}>
              <View style={styles.flex}>
                <AppText variant="h2">{t.home.dealOfDay}</AppText>
                <CountdownTimer />
              </View>
              <Pressable
                onPress={() => openList(t.home.dealOfDay, 'deals')}
                hitSlop={10}
                accessibilityRole="button"
              >
                <AppText variant="label" color="accent">
                  {t.common.viewAll}
                </AppText>
              </Pressable>
            </View>
            {d ? (
              <FlatList
                horizontal
                data={d.deals}
                keyExtractor={p => p.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dealList}
                renderItem={({ item }) => (
                  <ProductCard product={item} layout="rail" />
                )}
              />
            ) : (
              <RailSkeleton />
            )}
          </View>

          {/* HM-06 merchandising rails */}
          <ProductRail
            title={t.home.bestSellers}
            products={d?.bestsellers}
            loading={!d}
            onSeeAll={() => openList(t.home.bestSellers, 'bestsellers')}
            seeAllLabel={t.common.seeAll}
          />
          <ProductRail
            title={t.home.topRated}
            products={d?.toprated}
            loading={!d}
            onSeeAll={() => openList(t.home.topRated, 'toprated')}
            seeAllLabel={t.common.seeAll}
          />
          <ProductRail
            title={t.home.newArrivals}
            products={d?.newest}
            loading={!d}
            onSeeAll={() => openList(t.home.newArrivals, 'new')}
            seeAllLabel={t.common.seeAll}
          />
          <ProductRail
            title={t.home.under999}
            products={d?.under999}
            loading={!d}
            onSeeAll={() => openList(t.home.under999, 'under999')}
            seeAllLabel={t.common.seeAll}
          />
          <ProductRail
            title={t.home.recommended}
            products={personal.data?.recommended}
            loading={personal.loading && !personal.data}
            onSeeAll={() => openList(t.home.recommended, 'recommended')}
            seeAllLabel={t.common.seeAll}
          />
          <ProductRail
            title={t.home.recentlyViewed}
            products={personal.data?.recent}
            subtitle={
              personal.data?.recent.length
                ? tf(t.wishlist.count, { n: personal.data.recent.length })
                : undefined
            }
          />
          <Pressable
            onPress={() => navigation.navigate('Offers')}
            style={[styles.offers, { backgroundColor: colors.accentSoft }]}
            accessibilityRole="button"
          >
            <Icon name="pricetags" size={22} color={colors.accent} />
            <AppText variant="h3" color="accentDark" style={styles.flex}>
              {t.home.allOffers}
            </AppText>
            <Icon name="arrow-forward" size={18} color={colors.accent} />
          </Pressable>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', height: 50 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 46,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  deliver: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.pill,
    minHeight: 38,
  },
  scroll: { paddingBottom: spacing.xxxl },
  block: { marginTop: spacing.lg },
  bannerSkel: {
    marginHorizontal: spacing.lg,
    width: undefined,
    borderRadius: radius.lg,
  },
  cats: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    gap: spacing.xs,
  },
  cat: { width: 78, alignItems: 'center', gap: spacing.xs },
  catRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    padding: 2.5,
  },
  catIcon: {
    flex: 1,
    borderRadius: 33,
    borderWidth: 2.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catSkelText: { marginTop: 4 },
  deal: { marginTop: spacing.xl, paddingVertical: spacing.lg },
  dealHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  dealList: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  offers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    margin: spacing.lg,
    marginTop: spacing.xxl,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
});
