import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import * as yup from 'yup';
import {
  AppText,
  Button,
  CheckboxRow,
  FormField,
  Header,
  Icon,
  InfoBanner,
  Screen,
} from '@/components';
import { t } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { useAppDispatch } from '@/store/hooks';
import { checkoutActions } from '@/store/slices/checkoutSlice';
import { gradients, linear, radius, spacing, useTheme } from '@/theme';
import {
  cardBrandLabel,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  isExpiryValid,
  luhnCheck,
  UPI_REGEX,
} from '@/utils/validators';

const v = t.validation;
const cardSchema = yup.object({
  number: yup
    .string()
    .required(v.cardNumber)
    .test('luhn', v.cardNumber, val => luhnCheck(val ?? '')),
  name: yup.string().trim().required(v.name),
  expiry: yup
    .string()
    .required(v.expiryFormat)
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, v.expiryFormat)
    .test('notPast', v.expiry, val => isExpiryValid(val ?? '')),
  cvv: yup
    .string()
    .required(v.cvv)
    .matches(/^\d{3}$/, v.cvv),
  save: yup.boolean().default(false),
});
const upiSchema = yup.object({
  upiId: yup.string().trim().required(v.upi).matches(UPI_REGEX, v.upi),
  save: yup.boolean().default(false),
});

/** Card / UPI entry (CO-06). Nothing is stored except the last 4 digits / UPI ID. */
export function PaymentEntryScreen({
  navigation,
  route,
}: RootScreenProps<'PaymentEntry'>) {
  return route.params.method === 'card' ? (
    <CardForm navigation={navigation} />
  ) : (
    <UpiForm navigation={navigation} />
  );
}

type Nav = RootScreenProps<'PaymentEntry'>['navigation'];

function CardForm({ navigation }: { navigation: Nav }) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { control, handleSubmit, watch } = useForm<
    yup.InferType<typeof cardSchema>
  >({
    resolver: yupResolver(cardSchema),
    defaultValues: { number: '', name: '', expiry: '', cvv: '', save: false },
  });
  const brand = detectCardBrand(watch('number') ?? '');
  const submit = handleSubmit(({ number, save }) => {
    const digits = number.replace(/\D/g, '');
    const last4 = digits.slice(-4);
    const label = `${cardBrandLabel[brand]} •••• ${last4}`;
    // Only the masked label and last 4 digits leave this screen.
    dispatch(
      checkoutActions.setPayment({
        payment: {
          method: 'card',
          label,
          cardLast4: last4,
          cardBrand: cardBrandLabel[brand],
        },
        save,
      }),
    );
    navigation.navigate('CheckoutReview');
  });
  return (
    <Screen
      keyboard
      edges={['top', 'bottom']}
      header={<Header title={t.checkout.cardTitle} />}
      footer={
        <View
          style={[
            styles.footer,
            { borderTopColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Button
            title={t.common.continue}
            onPress={submit}
            testID="card-continue"
          />
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, linear(gradients.deep, 135)]}>
          <Icon name="card" size={28} color="#FFFFFFAA" />
          <AppText variant="h2" color="#FFFFFF" style={styles.cardNum}>
            {formatCardNumber(watch('number') ?? '') || '•••• •••• •••• ••••'}
          </AppText>
          <View style={styles.cardRow}>
            <AppText
              variant="label"
              color="#FFFFFFCC"
              numberOfLines={1}
              style={styles.flex}
            >
              {(watch('name') || t.checkout.nameOnCard).toUpperCase()}
            </AppText>
            <AppText variant="label" color="#FFFFFFCC">
              {watch('expiry') || 'MM/YY'}
            </AppText>
          </View>
          <AppText variant="h3" color="#FFFFFF" style={styles.brand}>
            {brand !== 'unknown' ? cardBrandLabel[brand] : ''}
          </AppText>
        </View>
        <FormField
          control={control}
          name="number"
          label={t.checkout.cardNumber}
          keyboardType="number-pad"
          maxLength={19}
          transform={formatCardNumber}
          leftIcon="card-outline"
          placeholder="4111 1111 1111 1111"
        />
        <FormField
          control={control}
          name="name"
          label={t.checkout.nameOnCard}
          autoCapitalize="characters"
        />
        <View style={styles.row}>
          <FormField
            control={control}
            name="expiry"
            label={t.checkout.expiry}
            keyboardType="number-pad"
            maxLength={5}
            transform={formatExpiry}
            placeholder="MM/YY"
            containerStyle={styles.flex}
          />
          <FormField
            control={control}
            name="cvv"
            label={t.checkout.cvv}
            keyboardType="number-pad"
            maxLength={3}
            secure
            transform={x => x.replace(/\D/g, '')}
            containerStyle={styles.flex}
          />
        </View>
        <Controller
          control={control}
          name="save"
          render={({ field }) => (
            <CheckboxRow
              label={t.checkout.saveCard}
              checked={!!field.value}
              onPress={() => field.onChange(!field.value)}
            />
          )}
        />
        <InfoBanner icon="lock-closed-outline" text={t.checkout.secureNote} />
        <InfoBanner
          icon="flask-outline"
          tone="warning"
          text={t.checkout.demoFailHint}
        />
      </ScrollView>
    </Screen>
  );
}

function UpiForm({ navigation }: { navigation: Nav }) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { control, handleSubmit } = useForm<yup.InferType<typeof upiSchema>>({
    resolver: yupResolver(upiSchema),
    defaultValues: { upiId: '', save: false },
  });
  const submit = handleSubmit(({ upiId, save }) => {
    dispatch(
      checkoutActions.setPayment({
        payment: {
          method: 'upi',
          label: `UPI (${upiId.trim()})`,
          upiId: upiId.trim().toLowerCase(),
        },
        save,
      }),
    );
    navigation.navigate('CheckoutReview');
  });
  return (
    <Screen
      keyboard
      edges={['top', 'bottom']}
      header={<Header title={t.checkout.upiTitle} />}
      footer={
        <View
          style={[
            styles.footer,
            { borderTopColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Button
            title={t.common.continue}
            onPress={submit}
            testID="upi-continue"
          />
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.upiArt, { backgroundColor: colors.primarySoft }]}>
          <Icon
            name="phone-portrait-outline"
            size={44}
            color={colors.primary}
          />
        </View>
        <FormField
          control={control}
          name="upiId"
          label={t.checkout.upiLabel}
          placeholder={t.checkout.upiPlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          leftIcon="at-outline"
          autoFocus
        />
        <Controller
          control={control}
          name="save"
          render={({ field }) => (
            <CheckboxRow
              label={t.checkout.saveUpi}
              checked={!!field.value}
              onPress={() => field.onChange(!field.value)}
            />
          )}
        />
        <InfoBanner
          icon="flask-outline"
          tone="warning"
          text={t.checkout.demoFailHint}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.xs, paddingBottom: spacing.xxxl },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', gap: spacing.md },
  card: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    height: 190,
    justifyContent: 'space-between',
  },
  cardNum: { letterSpacing: 2 },
  cardRow: { flexDirection: 'row', gap: spacing.md },
  brand: { position: 'absolute', right: spacing.xl, top: spacing.xl },
  upiArt: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
});
