import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  AddressText,
  AppText,
  Button,
  Card,
  EmptyState,
  Icon,
  InfoBanner,
} from '@/components';
import { RULES } from '@/config/rules';
import { t, tf } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { pincodeService } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectDefaultAddress, selectUserAddresses } from '@/store/selectors';
import { checkoutActions } from '@/store/slices/checkoutSlice';
import { spacing, useTheme } from '@/theme';
import { toast } from '@/utils/toast';
import { CheckoutLayout } from './CheckoutLayout';
import { useCheckoutTotals } from './useCheckoutTotals';

/** Checkout step 1 — address (CO-02, CO-03). */
export function CheckoutAddressScreen({
  navigation,
}: RootScreenProps<'CheckoutAddress'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const addresses = useAppSelector(selectUserAddresses);
  const def = useAppSelector(selectDefaultAddress);
  const selectedId = useAppSelector(s => s.checkout.addressId);
  const { breakup } = useCheckoutTotals();

  useEffect(() => {
    if (!selectedId && def) dispatch(checkoutActions.setAddress(def.id));
  }, [def, dispatch, selectedId]);

  const serviceable = useMemo(
    () =>
      Object.fromEntries(
        addresses.map(a => [a.id, pincodeService.check(a.pincode).serviceable]),
      ),
    [addresses],
  );
  const selected = addresses.find(a => a.id === selectedId);

  const next = () => {
    if (!selected) return toast.error(t.checkout.selectAddress);
    if (!serviceable[selected.id])
      return toast.error(t.validation.pincodeNotServiceable);
    navigation.navigate('CheckoutDelivery');
  };

  const addNew = () => {
    if (addresses.length >= RULES.addresses.max)
      return toast.error(tf(t.address.max, { n: RULES.addresses.max }));
    navigation.navigate('AddEditAddress', { fromCheckout: true });
  };

  return (
    <CheckoutLayout
      step={0}
      title={t.checkout.selectAddress}
      total={breakup.total}
      cta={t.checkout.deliverHere}
      onNext={next}
      disabled={!selected || !serviceable[selected.id]}
    >
      {!addresses.length ? (
        <EmptyState
          compact
          icon="location-outline"
          title={t.checkout.noAddress}
          body={t.address.emptyBody}
          actionLabel={t.checkout.addNewAddress}
          onAction={addNew}
        />
      ) : (
        <>
          {addresses.map(a => {
            const active = a.id === selectedId;
            const ok = serviceable[a.id];
            return (
              <Card
                key={a.id}
                onPress={() => dispatch(checkoutActions.setAddress(a.id))}
                style={{
                  borderColor: active ? colors.accent : colors.border,
                  borderWidth: active ? 1.5 : StyleSheet.hairlineWidth,
                }}
              >
                <View style={styles.row}>
                  <Icon
                    name={active ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={active ? colors.accent : colors.textMuted}
                  />
                  <AddressText address={a} />
                  <Pressable
                    onPress={() =>
                      navigation.navigate('AddEditAddress', {
                        addressId: a.id,
                        fromCheckout: true,
                      })
                    }
                    hitSlop={10}
                    accessibilityRole="button"
                  >
                    <AppText variant="label" color="accent">
                      {t.common.edit}
                    </AppText>
                  </Pressable>
                </View>
                {!ok ? (
                  <View style={styles.warn}>
                    <InfoBanner
                      tone="danger"
                      icon="close-circle-outline"
                      text={t.pdp.notDeliverable}
                    />
                  </View>
                ) : null}
              </Card>
            );
          })}
          <Button
            title={t.checkout.addNewAddress}
            icon="add"
            variant="outline"
            onPress={addNew}
          />
        </>
      )}
    </CheckoutLayout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  warn: { marginTop: spacing.md },
});
