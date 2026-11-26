import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  Header,
  Icon,
  InfoBanner,
  PriceDetails,
  PriceTag,
  ProductImage,
  ProductRail,
  QuantityStepper,
  Screen,
  SectionHeader,
} from '@/components';
import { RULES } from '@/config/rules';
import { useAsync } from '@/hooks/useAsync';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { t, tf } from '@/i18n';
import type { CartScreenProps } from '@/navigation/types';
import {
  cartKey,
  cartService,
  couponService,
  productService,
} from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCartItems,
  selectCartPricingLines,
  selectCoupon,
  selectIsFirstOrder,
  selectSavedForLater,
} from '@/store/selectors';
import { cartActions, maxQty } from '@/store/slices/cartSlice';
import { checkoutActions } from '@/store/slices/checkoutSlice';
import {
  changeQty,
  removeFromCart,
  restoreCartItem,
  saveForLater,
} from '@/store/thunks';
import { radius, shadows, spacing, useTheme } from '@/theme';
import type { CartItem } from '@/types/models';
import { formatPrice } from '@/utils/format';
import { amountForFreeDelivery, computePriceBreakup } from '@/utils/price';
import { toast } from '@/utils/toast';

/** Cart (CT-01…CT-09). */
export function CartScreen({ navigation }: CartScreenProps<'Cart'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const requireAuth = useRequireAuth();
  const items = useAppSelector(selectCartItems);
  const saved = useAppSelector(selectSavedForLater);
  const lines = useAppSelector(selectCartPricingLines);
  const couponCode = useAppSelector(selectCoupon);
  const isFirstOrder = useAppSelector(selectIsFirstOrder);
  const [stock, setStock] = useState<Record<string, number>>({});

  // CT-08: re-validate stock with the "server" whenever the cart is shown.
  const keys = [...items, ...saved]
    .map(i => cartKey(i.productId, i.variantId))
    .join('|');
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      cartService
        .validate([...items, ...saved])
        .then(s => alive && setStock(s));
      return () => {
        alive = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keys]),
  );

  const suggestions = useAsync(
    () => productService.getCollection('bestsellers', 8),
    [],
  );
  const coupon = couponCode ? couponService.findByCode(couponCode) : null;
  const breakup = useMemo(
    () =>
      computePriceBreakup({
        lines,
        coupon,
        deliveryType: 'standard',
        paymentMethod: null,
        isFirstOrder,
      }),
    [lines, coupon, isFirstOrder],
  );
  const stockOf = (i: CartItem) =>
    stock[cartKey(i.productId, i.variantId)] ?? RULES.cart.maxQtyPerItem;
  const blocked = items.some(i => stockOf(i) <= 0 || i.qty > stockOf(i));
  const freeGap = amountForFreeDelivery(breakup.cartValue);

  const onRemove = (item: CartItem) => {
    dispatch(removeFromCart(item));
    toast.show({
      message: t.cart.removed,
      action: {
        label: t.common.undo,
        onPress: () => dispatch(restoreCartItem(item)),
      },
    });
  };

  const onQty = (item: CartItem, q: number) => {
    const msg = dispatch(changeQty(item, q, stockOf(item)));
    if (msg) toast.info(msg);
  };

  const checkout = () => {
    if (blocked) return toast.error(t.cart.blockCheckout);
    requireAuth(() => {
      dispatch(checkoutActions.start({ mode: 'cart' }));
      navigation.navigate('CheckoutAddress');
    });
  };

  if (!items.length && !saved.length) {
    return (
      <Screen header={<Header title={t.cart.title} back={false} />}>
        <ScrollView contentContainerStyle={styles.emptyScroll}>
          <EmptyState
            icon="bag-handle-outline"
            title={t.cart.emptyTitle}
            body={t.cart.emptyBody}
            actionLabel={t.wishlist.startShopping}
            onAction={() =>
              navigation.navigate('Main', {
                screen: 'HomeTab',
                params: { screen: 'Home' },
              })
            }
            compact
          />
          <ProductRail
            title={t.cart.suggestions}
            products={suggestions.data}
            loading={suggestions.loading}
          />
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen
      header={
        <Header
          title={t.cart.title}
          subtitle={tf(t.cart.items, { n: breakup.itemCount })}
          back={navigation.canGoBack()}
        />
      }
      footer={
        items.length ? (
          <View
            style={[
              styles.footer,
              shadows.lg,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
              },
            ]}
          >
            <View style={styles.flex}>
              <AppText variant="h2">{formatPrice(breakup.total)}</AppText>
              <AppText variant="caption" color="success">
                {breakup.savings > 0
                  ? tf(t.cart.youSave, { amount: formatPrice(breakup.savings) })
                  : t.common.inclusiveTaxes}
              </AppText>
            </View>
            <Button
              title={t.cart.placeOrder}
              onPress={checkout}
              fullWidth={false}
              style={styles.cta}
              disabled={blocked}
              testID="cart-checkout"
            />
          </View>
        ) : undefined
      }
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {items.length ? (
          <>
            {/* CT-05 */}
            <View style={[styles.freeBox, { backgroundColor: colors.surface }]}>
              <AppText variant="label" color={freeGap > 0 ? 'text' : 'success'}>
                {freeGap > 0
                  ? tf(t.cart.freeDeliveryProgress, {
                      amount: formatPrice(freeGap),
                    })
                  : t.cart.freeDeliveryUnlocked}
              </AppText>
              <View
                style={[styles.progress, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor:
                        freeGap > 0 ? colors.accent : colors.success,
                      width: `${Math.min(
                        100,
                        (breakup.cartValue / RULES.delivery.freeThreshold) *
                          100,
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
            {blocked ? (
              <View style={styles.pad}>
                <InfoBanner
                  tone="danger"
                  icon="alert-circle-outline"
                  text={t.cart.blockCheckout}
                />
              </View>
            ) : null}
            {items.map(item => (
              <CartLine
                key={cartKey(item.productId, item.variantId)}
                item={item}
                stock={stockOf(item)}
                onQty={q => onQty(item, q)}
                onRemove={() => onRemove(item)}
                onSave={() => dispatch(saveForLater(item, true))}
                onOpen={() =>
                  navigation.navigate('ProductDetails', {
                    productId: item.productId,
                  })
                }
              />
            ))}

            {/* Coupon row (CT-06) */}
            <View style={styles.pad}>
              <Card
                onPress={() => navigation.navigate('ApplyCoupon')}
                style={styles.couponCard}
              >
                <Icon name="pricetag-outline" size={22} color={colors.accent} />
                <View style={styles.flex}>
                  {couponCode ? (
                    <>
                      <AppText variant="h3">
                        {tf(t.cart.couponApplied, { code: couponCode })}
                      </AppText>
                      <AppText variant="caption" color="success">
                        {tf(t.cart.couponSaved, {
                          amount: formatPrice(breakup.couponDiscount),
                        })}
                      </AppText>
                    </>
                  ) : (
                    <AppText variant="h3">{t.cart.applyCoupon}</AppText>
                  )}
                </View>
                {couponCode ? (
                  <Pressable
                    onPress={() => {
                      dispatch(cartActions.setCoupon(null));
                      toast.show(t.coupon.removed);
                    }}
                    hitSlop={10}
                    accessibilityRole="button"
                  >
                    <AppText variant="label" color="danger">
                      {t.coupon.remove}
                    </AppText>
                  </Pressable>
                ) : (
                  <Icon
                    name="chevron-forward"
                    size={18}
                    color={colors.textMuted}
                  />
                )}
              </Card>
            </View>
            <View style={styles.pad}>
              <PriceDetails breakup={breakup} itemCount={breakup.itemCount} />
            </View>
          </>
        ) : (
          <EmptyState
            compact
            icon="bag-handle-outline"
            title={t.cart.emptyTitle}
            body={t.cart.emptyBody}
          />
        )}

        {/* CT-07 */}
        {saved.length ? (
          <View style={styles.savedWrap}>
            <SectionHeader
              title={tf(t.cart.savedForLater, { n: saved.length })}
            />
            {saved.map(item => (
              <CartLine
                key={cartKey(item.productId, item.variantId)}
                item={item}
                stock={stockOf(item)}
                saved
                onRemove={() => onRemove(item)}
                onSave={() => {
                  if (stockOf(item) <= 0)
                    return toast.error(t.common.outOfStock);
                  dispatch(saveForLater(item, false));
                }}
                onOpen={() =>
                  navigation.navigate('ProductDetails', {
                    productId: item.productId,
                  })
                }
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function CartLine({
  item,
  stock,
  saved,
  onQty,
  onRemove,
  onSave,
  onOpen,
}: {
  item: CartItem;
  stock: number;
  saved?: boolean;
  onQty?: (q: number) => void;
  onRemove: () => void;
  onSave: () => void;
  onOpen: () => void;
}) {
  const { colors } = useTheme();
  const oos = stock <= 0;
  const over = !oos && item.qty > stock;
  const cap = maxQty(stock);
  return (
    <View
      style={[
        styles.line,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.lineTop}>
        <Pressable
          onPress={onOpen}
          style={styles.lineImg}
          accessibilityRole="button"
          accessibilityLabel={item.snapshot.name}
        >
          <ProductImage source={item.snapshot.image} dimmed={oos} />
        </Pressable>
        <View style={styles.lineBody}>
          <AppText variant="caption" color="textMuted">
            {item.snapshot.brand}
          </AppText>
          <AppText variant="bodySm" numberOfLines={2}>
            {item.snapshot.name}
          </AppText>
          {item.snapshot.variantLabel ? (
            <AppText variant="caption" color="textSecondary">
              {item.snapshot.variantLabel}
            </AppText>
          ) : null}
          <PriceTag
            price={item.snapshot.price}
            mrp={item.snapshot.mrp}
            size="sm"
          />
          {oos ? (
            <AppText variant="caption" color="danger" weight="700">
              {t.cart.oosFlag}
            </AppText>
          ) : over ? (
            <AppText variant="caption" color="warning" weight="700">
              {tf(t.common.onlyLeft, { n: stock })}
            </AppText>
          ) : stock <= RULES.stock.lowStockThreshold ? (
            <AppText variant="caption" color="warning">
              {tf(t.common.onlyLeft, { n: stock })}
            </AppText>
          ) : null}
          {!saved && onQty && !oos ? (
            <View style={styles.qtyRow}>
              <QuantityStepper
                value={item.qty}
                max={cap}
                onChange={onQty}
                onLimit={() =>
                  toast.info(
                    cap < RULES.cart.maxQtyPerItem
                      ? tf(t.common.onlyLeft, { n: cap })
                      : `Maximum ${cap} units allowed per item`,
                  )
                }
              />
              {over ? (
                <Button
                  title={`${t.cart.qty} ${stock}`}
                  size="sm"
                  variant="outline"
                  fullWidth={false}
                  onPress={() => onQty(stock)}
                />
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
      <View style={[styles.lineActions, { borderTopColor: colors.border }]}>
        <Pressable
          onPress={onSave}
          style={styles.lineAction}
          accessibilityRole="button"
        >
          <Icon
            name={saved ? 'bag-add-outline' : 'bookmark-outline'}
            size={16}
            color={colors.textSecondary}
          />
          <AppText variant="label" color="textSecondary">
            {saved ? t.cart.moveToCart : t.cart.saveForLater}
          </AppText>
        </Pressable>
        <View style={[styles.vsep, { backgroundColor: colors.border }]} />
        <Pressable
          onPress={onRemove}
          style={styles.lineAction}
          accessibilityRole="button"
        >
          <Icon name="trash-outline" size={16} color={colors.textSecondary} />
          <AppText variant="label" color="textSecondary">
            {t.common.remove}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: spacing.xxxl },
  emptyScroll: { paddingBottom: spacing.xxxl, paddingTop: spacing.xl },
  pad: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  freeBox: { padding: spacing.lg, gap: spacing.sm },
  progress: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  line: { marginTop: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  lineTop: { flexDirection: 'row', padding: spacing.lg, gap: spacing.md },
  lineImg: { width: 96 },
  lineBody: { flex: 1, gap: spacing.xs },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  lineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  lineAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 44,
  },
  vsep: { width: StyleSheet.hairlineWidth, height: 24 },
  couponCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  savedWrap: { marginTop: spacing.xxl },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  cta: { paddingHorizontal: spacing.xxl, borderRadius: radius.md },
});
