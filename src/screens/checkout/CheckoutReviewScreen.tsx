import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  AddressText,
  AppText,
  Card,
  InfoBanner,
  PriceDetails,
  PriceTag,
  ProductImage,
} from '@/components';
import { t, tf } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { pincodeService } from '@/services';
import { useAppSelector } from '@/store/hooks';
import {
  selectCheckoutItems,
  selectCoupon,
  selectUserAddresses,
} from '@/store/selectors';
import { spacing } from '@/theme';
import { formatDeliveryDate } from '@/utils/date';
import { formatPrice } from '@/utils/format';
import { toast } from '@/utils/toast';
import { CheckoutLayout } from './CheckoutLayout';
import { useCheckoutTotals } from './useCheckoutTotals';

/** Checkout step 4 — review & place order (CO-08). */
export function CheckoutReviewScreen({
  navigation,
}: RootScreenProps<'CheckoutReview'>) {
  const checkout = useAppSelector(s => s.checkout);
  const items = useAppSelector(selectCheckoutItems);
  const address = useAppSelector(selectUserAddresses).find(
    a => a.id === checkout.addressId,
  );
  const couponCode = useAppSelector(selectCoupon);
  const { breakup } = useCheckoutTotals();
  const date = address
    ? pincodeService.expectedDate(address.pincode, checkout.deliveryType)
    : null;

  const place = () => {
    if (!address) return navigation.navigate('CheckoutAddress');
    if (!checkout.payment) return navigation.navigate('CheckoutPayment');
    if (checkout.payment.method === 'cod' && !breakup.codAllowed)
      return toast.error(t.checkout.codNotAllowed);
    navigation.navigate('PaymentProcessing');
  };

  const section = (
    title: string,
    onChange: () => void,
    body: React.ReactNode,
  ) => (
    <Card>
      <View style={styles.head}>
        <AppText variant="label" color="textMuted" style={styles.flex}>
          {title.toUpperCase()}
        </AppText>
        <Pressable onPress={onChange} hitSlop={10} accessibilityRole="button">
          <AppText variant="label" color="accent">
            {t.checkout.change}
          </AppText>
        </Pressable>
      </View>
      {body}
    </Card>
  );

  return (
    <CheckoutLayout
      step={3}
      title={t.checkout.reviewTitle}
      total={breakup.total}
      cta={tf(t.checkout.placeOrder, { amount: formatPrice(breakup.total) })}
      onNext={place}
    >
      {section(
        t.checkout.deliveringTo,
        () => navigation.navigate('CheckoutAddress'),
        address ? <AddressText address={address} /> : null,
      )}
      {section(
        t.checkout.deliveryOptions,
        () => navigation.navigate('CheckoutDelivery'),
        <AppText>
          {checkout.deliveryType === 'express'
            ? t.checkout.express
            : t.checkout.standard}
          {date
            ? ` · ${tf(t.checkout.deliveryBy, {
                date: formatDeliveryDate(date),
              })}`
            : ''}
        </AppText>,
      )}
      {section(
        t.checkout.payingWith,
        () => navigation.navigate('CheckoutPayment'),
        <AppText>{checkout.payment?.label}</AppText>,
      )}
      <Card>
        <AppText variant="label" color="textMuted" style={styles.itemsTitle}>
          {tf(t.checkout.items, { n: items.length }).toUpperCase()}
        </AppText>
        {items.map(i => (
          <View key={`${i.productId}:${i.variantId}`} style={styles.item}>
            <View style={styles.img}>
              <ProductImage source={i.snapshot.image} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodySm" numberOfLines={2}>
                {i.snapshot.name}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {[i.snapshot.variantLabel, `${t.cart.qty}: ${i.qty}`]
                  .filter(Boolean)
                  .join(' · ')}
              </AppText>
              <PriceTag
                price={i.snapshot.price * i.qty}
                mrp={i.snapshot.mrp * i.qty}
                size="sm"
              />
            </View>
          </View>
        ))}
      </Card>
      {checkout.mode === 'cart' && couponCode && breakup.couponError ? (
        <InfoBanner
          tone="danger"
          text={`${couponCode}: ${breakup.couponError}`}
        />
      ) : null}
      <PriceDetails breakup={breakup} itemCount={breakup.itemCount} />
    </CheckoutLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemsTitle: { marginBottom: spacing.sm },
  item: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm },
  img: { width: 56 },
});
