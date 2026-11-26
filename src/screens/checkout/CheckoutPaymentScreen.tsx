import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  AppText,
  Card,
  Divider,
  Icon,
  InfoBanner,
  RadioRow,
} from '@/components';
import { t } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectSavedPayments } from '@/store/selectors';
import { checkoutActions } from '@/store/slices/checkoutSlice';
import { radius, spacing, useTheme } from '@/theme';
import type { PaymentInfo, PaymentMethodType } from '@/types/models';
import { toast } from '@/utils/toast';
import { CheckoutLayout } from './CheckoutLayout';
import { useCheckoutTotals } from './useCheckoutTotals';

const BANKS = [
  'DemoBank',
  'Sunrise Bank',
  'Metro Co-operative Bank',
  'Unity National Bank',
  'Harbour Bank',
];
const WALLETS = ['ShopVerse Pay', 'PayNest', 'Zippy Wallet'];

const METHODS: { key: PaymentMethodType; icon: string; label: string }[] = [
  { key: 'upi', icon: 'phone-portrait-outline', label: t.checkout.upi },
  { key: 'card', icon: 'card-outline', label: t.checkout.card },
  { key: 'netbanking', icon: 'business-outline', label: t.checkout.netbanking },
  { key: 'wallet', icon: 'wallet-outline', label: t.checkout.wallet },
  { key: 'cod', icon: 'cash-outline', label: t.checkout.cod },
];

/** Checkout step 3 — payment method (CO-05). All payments are simulated. */
export function CheckoutPaymentScreen({
  navigation,
}: RootScreenProps<'CheckoutPayment'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const saved = useAppSelector(selectSavedPayments);
  const current = useAppSelector(s => s.checkout.payment);
  const { breakup } = useCheckoutTotals();
  const [method, setMethod] = useState<PaymentMethodType | `saved:${string}`>(
    current?.method ?? 'upi',
  );
  const [bank, setBank] = useState(current?.bank ?? BANKS[0]);
  const [wallet, setWallet] = useState(current?.wallet ?? WALLETS[0]);
  const codAllowed = breakup.codAllowed;

  const next = () => {
    if (method.startsWith('saved:')) {
      const sp = saved.find(x => `saved:${x.id}` === method);
      if (!sp) return;
      const payment: PaymentInfo =
        sp.type === 'upi'
          ? { method: 'upi', label: `UPI (${sp.upiId})`, upiId: sp.upiId }
          : {
              method: 'card',
              label: sp.label,
              cardLast4: sp.last4,
              cardBrand: sp.cardBrand,
            };
      dispatch(checkoutActions.setPayment({ payment }));
      return navigation.navigate('CheckoutReview');
    }
    switch (method) {
      case 'upi':
      case 'card':
        return navigation.navigate('PaymentEntry', { method });
      case 'netbanking':
        dispatch(
          checkoutActions.setPayment({
            payment: {
              method,
              label: `${t.checkout.netbanking} · ${bank}`,
              bank,
            },
          }),
        );
        return navigation.navigate('CheckoutReview');
      case 'wallet':
        dispatch(
          checkoutActions.setPayment({
            payment: { method, label: wallet, wallet },
          }),
        );
        return navigation.navigate('CheckoutReview');
      case 'cod':
        if (!codAllowed) return toast.error(t.checkout.codNotAllowed);
        dispatch(
          checkoutActions.setPayment({
            payment: { method, label: t.checkout.cod },
          }),
        );
        return navigation.navigate('CheckoutReview');
    }
  };

  return (
    <CheckoutLayout
      step={2}
      title={t.checkout.paymentTitle}
      total={breakup.total}
      cta={t.checkout.proceed}
      onNext={next}
    >
      <InfoBanner
        icon="shield-checkmark-outline"
        text={t.checkout.demoFailHint}
        tone="warning"
      />
      {saved.length ? (
        <Card>
          <AppText variant="h3">{t.checkout.savedMethods}</AppText>
          {saved.map(sp => (
            <RadioRow
              key={sp.id}
              selected={method === `saved:${sp.id}`}
              onPress={() => setMethod(`saved:${sp.id}`)}
              title={sp.type === 'upi' ? sp.upiId ?? '' : sp.label}
              subtitle={sp.type === 'upi' ? t.checkout.upi : t.checkout.card}
            />
          ))}
        </Card>
      ) : null}
      <Card padded={false}>
        {METHODS.map((m, i) => {
          const active = method === m.key;
          const disabled = m.key === 'cod' && !codAllowed;
          return (
            <View key={m.key}>
              {i > 0 ? <Divider /> : null}
              <Pressable
                onPress={() => setMethod(m.key)}
                disabled={disabled}
                style={[styles.method, { opacity: disabled ? 0.5 : 1 }]}
                accessibilityRole="radio"
                accessibilityState={{ checked: active, disabled }}
              >
                <Icon
                  name={active ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={active ? colors.accent : colors.textMuted}
                />
                <Icon name={m.icon} size={22} color={colors.primary} />
                <View style={styles.flex}>
                  <AppText weight={active ? '600' : '400'}>{m.label}</AppText>
                  {m.key === 'cod' ? (
                    <AppText
                      variant="caption"
                      color={disabled ? 'danger' : 'textMuted'}
                    >
                      {disabled ? t.checkout.codNotAllowed : t.checkout.codFee}
                    </AppText>
                  ) : null}
                </View>
              </Pressable>
              {active && m.key === 'netbanking' ? (
                <View style={styles.sub}>
                  <AppText variant="label" color="textSecondary">
                    {t.checkout.selectBank}
                  </AppText>
                  <View style={styles.grid}>
                    {BANKS.map(b => (
                      <Pressable
                        key={b}
                        onPress={() => setBank(b)}
                        style={[
                          styles.opt,
                          {
                            borderColor:
                              bank === b ? colors.accent : colors.border,
                            backgroundColor:
                              bank === b ? colors.accentSoft : colors.surface,
                          },
                        ]}
                      >
                        <Icon
                          name="business"
                          size={18}
                          color={colors.primary}
                        />
                        <AppText
                          variant="caption"
                          align="center"
                          numberOfLines={2}
                        >
                          {b}
                        </AppText>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}
              {active && m.key === 'wallet' ? (
                <View style={styles.sub}>
                  <AppText variant="label" color="textSecondary">
                    {t.checkout.selectWallet}
                  </AppText>
                  {WALLETS.map(w => (
                    <RadioRow
                      key={w}
                      selected={wallet === w}
                      onPress={() => setWallet(w)}
                      title={w}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </Card>
      <AppText variant="caption" color="textMuted" align="center">
        {t.checkout.secureNote}
      </AppText>
    </CheckoutLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    minHeight: 56,
  },
  sub: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  opt: {
    width: '31%',
    minHeight: 68,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    gap: 2,
  },
});
