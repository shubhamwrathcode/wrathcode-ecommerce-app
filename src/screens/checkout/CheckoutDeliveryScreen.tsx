import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AppText,
  Card,
  Divider,
  InfoBanner,
  ProductImage,
  RadioRow,
} from '@/components';
import { RULES } from '@/config/rules';
import { t, tf } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { pincodeService } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCheckoutItems, selectUserAddresses } from '@/store/selectors';
import { checkoutActions } from '@/store/slices/checkoutSlice';
import { spacing } from '@/theme';
import { formatDeliveryDate } from '@/utils/date';
import { formatPrice } from '@/utils/format';
import { standardDeliveryCharge } from '@/utils/price';
import { CheckoutLayout } from './CheckoutLayout';
import { useCheckoutTotals } from './useCheckoutTotals';

/** Checkout step 2 — Standard or Express delivery (CO-04, section 7.2). */
export function CheckoutDeliveryScreen({
  navigation,
}: RootScreenProps<'CheckoutDelivery'>) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCheckoutItems);
  const addressId = useAppSelector(s => s.checkout.addressId);
  const deliveryType = useAppSelector(s => s.checkout.deliveryType);
  const address = useAppSelector(selectUserAddresses).find(
    a => a.id === addressId,
  );
  const { breakup } = useCheckoutTotals();

  const s = useMemo(
    () => (address ? pincodeService.check(address.pincode) : null),
    [address],
  );
  const expressOk = !!s?.serviceable && s.expressAvailable;
  const std = address
    ? pincodeService.expectedDate(address.pincode, 'standard')
    : null;
  const exp =
    address && expressOk
      ? pincodeService.expectedDate(address.pincode, 'express')
      : null;
  const stdCharge = standardDeliveryCharge(breakup.cartValue);
  const chosenDate = deliveryType === 'express' && exp ? exp : std;

  return (
    <CheckoutLayout
      step={1}
      title={t.checkout.deliveryOptions}
      total={breakup.total}
      cta={t.common.continue}
      onNext={() => navigation.navigate('CheckoutPayment')}
    >
      <Card>
        <RadioRow
          selected={deliveryType === 'standard'}
          onPress={() => dispatch(checkoutActions.setDeliveryType('standard'))}
          title={t.checkout.standard}
          subtitle={
            std
              ? tf(t.checkout.deliveryBy, { date: formatDeliveryDate(std) })
              : undefined
          }
          right={
            <AppText variant="label" color={stdCharge ? 'text' : 'success'}>
              {stdCharge ? formatPrice(stdCharge) : t.common.free}
            </AppText>
          }
        />
        <Divider />
        <RadioRow
          selected={deliveryType === 'express'}
          disabled={!expressOk}
          onPress={() => dispatch(checkoutActions.setDeliveryType('express'))}
          title={t.checkout.express}
          subtitle={
            exp
              ? tf(t.checkout.deliveryBy, { date: formatDeliveryDate(exp) })
              : t.checkout.expressUnavailable
          }
          right={
            <AppText variant="label">
              + {formatPrice(RULES.delivery.expressCharge)}
            </AppText>
          }
        />
      </Card>
      {!expressOk ? <InfoBanner text={t.checkout.expressUnavailable} /> : null}
      <AppText variant="h3">
        {tf(t.checkout.items, { n: items.length })}
      </AppText>
      {items.map(i => (
        <Card key={`${i.productId}:${i.variantId}`} style={styles.item}>
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
            {chosenDate ? (
              <AppText variant="caption" color="success" weight="600">
                {tf(t.checkout.deliveryBy, {
                  date: formatDeliveryDate(chosenDate),
                })}
              </AppText>
            ) : null}
          </View>
        </Card>
      ))}
    </CheckoutLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.xs },
  item: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  img: { width: 56 },
});
