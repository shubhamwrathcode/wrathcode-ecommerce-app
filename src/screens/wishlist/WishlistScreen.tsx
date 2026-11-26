import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import {
  AppText,
  Button,
  EmptyState,
  GridSkeleton,
  Header,
  InfoBanner,
  PriceTag,
  ProductImage,
  Screen,
  StockLabel,
} from '@/components';
import { t, tf } from '@/i18n';
import type { WishlistScreenProps } from '@/navigation/types';
import { productService } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectIsLoggedIn,
  selectOwner,
  selectWishlist,
} from '@/store/selectors';
import { wishlistActions } from '@/store/slices/wishlistSlice';
import { addToCart } from '@/store/thunks';
import { radius, spacing, useTheme } from '@/theme';
import type { Product } from '@/types/models';
import { formatPrice } from '@/utils/format';
import { toast } from '@/utils/toast';

const SIZE_REQUIRED = ['Size', 'UK Size', 'Waist', 'Frame'];

/** Wishlist (WL-02, WL-03): move to cart, remove, price-drop tag. */
export function WishlistScreen({
  navigation,
}: WishlistScreenProps<'Wishlist'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const list = useAppSelector(selectWishlist);
  const owner = useAppSelector(selectOwner);
  const loggedIn = useAppSelector(selectIsLoggedIn);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const ids = list.map(i => i.productId).join(',');

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      productService.getProductsByIds(ids ? ids.split(',') : []).then(ps => {
        if (!alive) return;
        setProducts(Object.fromEntries(ps.map(p => [p.id, p])));
        setLoading(false);
      });
      return () => {
        alive = false;
      };
    }, [ids]),
  );

  const remove = (productId: string) => {
    const item = list.find(i => i.productId === productId);
    dispatch(wishlistActions.remove({ owner, productId }));
    if (item)
      toast.show({
        message: t.wishlist.removed,
        action: {
          label: t.common.undo,
          onPress: () => dispatch(wishlistActions.restore({ owner, item })),
        },
      });
  };

  const moveToCart = (p: Product) => {
    const multiSize =
      new Set(p.variants.map(v => v.size)).size > 1 &&
      SIZE_REQUIRED.includes(p.sizeLabel ?? '');
    if (multiSize) {
      toast.info(
        tf(t.pdp.pleaseSelectSize, {
          label: (p.sizeLabel ?? 'size').toLowerCase(),
        }),
      );
      navigation.navigate('ProductDetails', { productId: p.id });
      return;
    }
    const v = p.variants.find(x => x.stock > 0);
    if (!v) return toast.error(t.common.outOfStock);
    const res = dispatch(addToCart(p, v, 1));
    if (!res.ok) return toast.error(res.message);
    dispatch(wishlistActions.remove({ owner, productId: p.id }));
    toast.success(t.wishlist.movedToCart);
  };

  const data = list.filter(i => products[i.productId]);

  return (
    <Screen
      header={
        <Header
          title={t.wishlist.title}
          subtitle={
            list.length ? tf(t.wishlist.count, { n: list.length }) : undefined
          }
          back={false}
        />
      }
    >
      {loading && list.length ? (
        <GridSkeleton count={4} />
      ) : !list.length ? (
        <EmptyState
          icon="heart-outline"
          title={t.wishlist.emptyTitle}
          body={t.wishlist.emptyBody}
          actionLabel={t.wishlist.startShopping}
          onAction={() =>
            navigation.navigate('Main', {
              screen: 'HomeTab',
              params: { screen: 'Home' },
            })
          }
        />
      ) : (
        <FlatList
          data={data}
          numColumns={2}
          keyExtractor={i => i.productId}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            !loggedIn ? (
              <View style={styles.banner}>
                <InfoBanner icon="sync-outline" text={t.wishlist.loginSync} />
              </View>
            ) : undefined
          }
          renderItem={({ item }) => {
            const p = products[item.productId];
            const drop = item.priceAtAdd - p.price;
            return (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Pressable
                  onPress={() =>
                    navigation.navigate('ProductDetails', { productId: p.id })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={p.name}
                >
                  <ProductImage source={p.images[0]} dimmed={p.stock <= 0} />
                  {drop > 0 ? (
                    <View
                      style={[styles.drop, { backgroundColor: colors.success }]}
                    >
                      <AppText variant="caption" color="#FFFFFF" weight="700">
                        {tf(t.wishlist.priceDrop, {
                          amount: formatPrice(drop),
                        })}
                      </AppText>
                    </View>
                  ) : null}
                  <View style={styles.body}>
                    <AppText
                      variant="bodySm"
                      numberOfLines={2}
                      style={styles.name}
                    >
                      {p.name}
                    </AppText>
                    <PriceTag price={p.price} mrp={p.mrp} size="sm" />
                    <StockLabel stock={p.stock} />
                  </View>
                </Pressable>
                <View
                  style={[styles.actions, { borderTopColor: colors.border }]}
                >
                  <Button
                    title={t.wishlist.moveToCart}
                    size="sm"
                    variant="ghost"
                    onPress={() => moveToCart(p)}
                    disabled={p.stock <= 0}
                    style={styles.flex}
                  />
                  <View
                    style={[styles.vsep, { backgroundColor: colors.border }]}
                  />
                  <Button
                    title={t.common.remove}
                    size="sm"
                    variant="ghost"
                    onPress={() => remove(p.id)}
                    style={styles.flex}
                  />
                </View>
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.xs, paddingBottom: spacing.xxxl },
  banner: { padding: spacing.xs, paddingBottom: spacing.sm },
  card: {
    flex: 1,
    margin: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    maxWidth: '48%',
  },
  drop: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    paddingVertical: 3,
    alignItems: 'center',
  },
  body: { padding: spacing.sm, gap: spacing.xs },
  name: { minHeight: 36 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  vsep: { width: StyleSheet.hairlineWidth, height: 24 },
});
