import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  AddressText,
  AppText,
  Button,
  Card,
  Divider,
  EmptyState,
  Header,
  Icon,
  InfoBanner,
  OrderStatusChip,
  PriceDetails,
  PriceTag,
  ProductImage,
  Screen,
} from '@/components';
import { t, tf } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { buyAgain, syncOrderStatuses } from '@/store/thunks';
import { spacing, useTheme } from '@/theme';
import { formatDate, formatDateTime } from '@/utils/date';
import { formatPrice } from '@/utils/format';
import {
  canCancel,
  canReturn,
  canReview,
  deliveredAt,
} from '@/utils/orderStatus';
import { toast } from '@/utils/toast';
import { orderSubtitle } from './OrdersScreen';

/** Order details (OR-02) with all post-order actions. */
export function OrderDetailsScreen({
  navigation,
  route,
}: RootScreenProps<'OrderDetails'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const order = useAppSelector(s =>
    s.orders.list.find(o => o.id === route.params.orderId),
  );
  const reviewed = useAppSelector(s => s.orders.reviewed);

  useFocusEffect(
    useCallback(() => {
      dispatch(syncOrderStatuses());
    }, [dispatch]),
  );

  if (!order) {
    return (
      <Screen header={<Header title={t.orders.detailsTitle} />}>
        <EmptyState icon="receipt-outline" title={t.orders.notFound} />
      </Screen>
    );
  }

  const prepaid = order.payment.method !== 'cod';
  const reviewable = canReview(order);
  const returnUntil = (() => {
    const d = deliveredAt(order);
    if (!d || !canReturn(order)) return null;
    const days = Math.max(...order.items.map(i => i.returnDays));
    return new Date(d.getTime() + days * 86400000);
  })();

  const onBuyAgain = async () => {
    const n = await dispatch(buyAgain(order));
    if (n)
      toast.success(tf(t.orders.buyAgainDone, { n }), {
        label: t.pdp.goToCart,
        onPress: () =>
          navigation.navigate('Main', {
            screen: 'CartTab',
            params: { screen: 'Cart' },
          }),
      });
    else toast.error(t.common.outOfStock);
  };

  return (
    <Screen
      header={<Header title={t.orders.detailsTitle} subtitle={order.id} />}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.gap}>
          <View style={styles.row}>
            <OrderStatusChip status={order.status} />
            <AppText variant="caption" color="textMuted">
              {formatDateTime(order.placedAt)}
            </AppText>
          </View>
          <AppText variant="h3">{orderSubtitle(order)}</AppText>
          {order.status === 'cancelled' ? (
            <InfoBanner
              tone={prepaid ? 'success' : 'info'}
              text={
                prepaid
                  ? tf(t.orders.refundNote, {
                      amount: formatPrice(order.priceBreakup.total),
                    })
                  : `${order.cancelReason ?? ''}`
              }
            />
          ) : null}
          {order.returnRequest ? (
            <InfoBanner
              tone="warning"
              text={
                order.returnRequest.type === 'return'
                  ? t.orders.returnRequested
                  : t.orders.replaceRequested
              }
            />
          ) : null}
          {returnUntil ? (
            <AppText variant="caption" color="textSecondary">
              {tf(t.orders.returnWindow, { date: formatDate(returnUntil) })}
            </AppText>
          ) : null}
          <View style={styles.actions}>
            {order.status !== 'cancelled' ? (
              <Button
                title={t.orders.trackOrder}
                icon="navigate-outline"
                size="sm"
                variant="secondary"
                fullWidth={false}
                onPress={() =>
                  navigation.navigate('TrackOrder', { orderId: order.id })
                }
              />
            ) : null}
            {canCancel(order) ? (
              <Button
                title={t.orders.cancelOrder}
                size="sm"
                variant="outline"
                fullWidth={false}
                onPress={() =>
                  navigation.navigate('CancelOrder', { orderId: order.id })
                }
                testID="cancel-order"
              />
            ) : null}
            {canReturn(order) ? (
              <Button
                title={t.orders.returnReplace}
                size="sm"
                variant="outline"
                fullWidth={false}
                onPress={() =>
                  navigation.navigate('ReturnRequest', { orderId: order.id })
                }
              />
            ) : null}
            {order.status === 'cancelled' ||
            order.status === 'delivered' ||
            order.returnRequest ? (
              <Button
                title={t.orders.buyAgain}
                icon="repeat"
                size="sm"
                variant="outline"
                fullWidth={false}
                onPress={onBuyAgain}
              />
            ) : null}
          </View>
        </Card>

        <Card style={styles.gap}>
          {order.items.map((i, idx) => {
            const done = reviewed[`${order.id}:${i.variantId}`];
            return (
              <View key={i.variantId}>
                {idx > 0 ? <Divider style={styles.divider} /> : null}
                <View style={styles.item}>
                  <View style={styles.img}>
                    <ProductImage source={i.image} />
                  </View>
                  <View style={styles.flex}>
                    <AppText
                      variant="bodySm"
                      numberOfLines={2}
                      onPress={() =>
                        navigation.navigate('ProductDetails', {
                          productId: i.productId,
                        })
                      }
                    >
                      {i.name}
                    </AppText>
                    <AppText variant="caption" color="textMuted">
                      {[i.variantLabel, `${t.cart.qty}: ${i.qty}`]
                        .filter(Boolean)
                        .join(' · ')}
                    </AppText>
                    <PriceTag
                      price={i.price * i.qty}
                      mrp={i.mrp * i.qty}
                      size="sm"
                    />
                  </View>
                </View>
                {reviewable ? (
                  done ? (
                    <View style={styles.reviewed}>
                      <Icon
                        name="checkmark-circle"
                        size={16}
                        color={colors.success}
                      />
                      <AppText variant="caption" color="success">
                        {t.orders.reviewed}
                      </AppText>
                    </View>
                  ) : (
                    <Button
                      title={t.orders.rateReview}
                      icon="star-outline"
                      size="sm"
                      variant="ghost"
                      fullWidth={false}
                      onPress={() =>
                        navigation.navigate('WriteReview', {
                          orderId: order.id,
                          productId: i.productId,
                          variantId: i.variantId,
                          name: i.name,
                          image: i.image,
                        })
                      }
                    />
                  )
                ) : null}
              </View>
            );
          })}
        </Card>

        <Card style={styles.gap}>
          <AppText variant="label" color="textMuted">
            {t.orders.shippingAddress.toUpperCase()}
          </AppText>
          <AddressText address={order.address} />
        </Card>
        <Card style={styles.gap}>
          <AppText variant="label" color="textMuted">
            {t.orders.payment.toUpperCase()}
          </AppText>
          <AppText>{order.payment.label}</AppText>
          {order.coupon ? (
            <AppText variant="caption" color="success">
              {tf(t.cart.couponApplied, { code: order.coupon })}
            </AppText>
          ) : null}
        </Card>
        <PriceDetails breakup={order.priceBreakup} />
        <Button
          title={t.orders.invoice}
          icon="download-outline"
          variant="outline"
          onPress={() => toast.info(t.orders.invoiceSoon)}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xs },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  gap: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  item: { flexDirection: 'row', gap: spacing.md },
  img: { width: 72 },
  divider: { marginVertical: spacing.md },
  reviewed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
});
