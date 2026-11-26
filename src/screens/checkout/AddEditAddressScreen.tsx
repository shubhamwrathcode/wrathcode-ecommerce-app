import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  AppText,
  Button,
  CheckboxRow,
  Chip,
  FormField,
  Header,
  Screen,
} from '@/components';
import { RULES } from '@/config/rules';
import { t, tf } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { pincodeService, wait } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser, selectUserAddresses } from '@/store/selectors';
import { addressActions } from '@/store/slices/addressSlice';
import { checkoutActions } from '@/store/slices/checkoutSlice';
import { spacing, useTheme } from '@/theme';
import type { AddressType } from '@/types/models';
import { uid } from '@/utils/id';
import { AddressForm, addressSchema } from '@/utils/schemas';
import { toast } from '@/utils/toast';
import { isValidPincode } from '@/utils/validators';

const TYPES: AddressType[] = ['Home', 'Work', 'Other'];

/** Add / edit address (screen 22) with pincode auto-fill and serviceability check. */
export function AddEditAddressScreen({
  navigation,
  route,
}: RootScreenProps<'AddEditAddress'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const addresses = useAppSelector(selectUserAddresses);
  const existing = addresses.find(a => a.id === route.params?.addressId);
  const [saving, setSaving] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  const { control, handleSubmit, watch, setValue, setError } =
    useForm<AddressForm>({
      resolver: yupResolver(addressSchema),
      defaultValues: existing ?? {
        name: user?.name ?? '',
        mobile: user?.mobile ?? '',
        pincode: '',
        line1: '',
        line2: '',
        landmark: '',
        city: '',
        state: '',
        type: 'Home',
        isDefault: addresses.length === 0,
      },
    });

  const pincode = watch('pincode');
  useEffect(() => {
    if (!isValidPincode(pincode ?? '')) {
      setAutoFilled(false);
      return;
    }
    let alive = true;
    pincodeService.lookup(pincode).then(info => {
      if (!alive) return;
      if (info) {
        setValue('city', info.city, { shouldValidate: true });
        setValue('state', info.state, { shouldValidate: true });
        setAutoFilled(true);
      } else setAutoFilled(false);
      if (!pincodeService.check(pincode).serviceable)
        setError('pincode', { message: t.validation.pincodeNotServiceable });
    });
    return () => {
      alive = false;
    };
  }, [pincode, setValue, setError]);

  const onSave = handleSubmit(async values => {
    if (!user) return;
    if (!pincodeService.check(values.pincode).serviceable) {
      setError('pincode', { message: t.validation.pincodeNotServiceable });
      return;
    }
    if (!existing && addresses.length >= RULES.addresses.max) {
      toast.error(tf(t.address.max, { n: RULES.addresses.max }));
      return;
    }
    setSaving(true);
    await wait(400);
    const id = existing?.id ?? uid('a_');
    dispatch(
      addressActions.upsert({
        ...values,
        landmark: values.landmark ?? '',
        isDefault: !!values.isDefault,
        id,
        userId: user.id,
      }),
    );
    if (route.params?.fromCheckout) dispatch(checkoutActions.setAddress(id));
    setSaving(false);
    toast.success(t.address.saved);
    navigation.goBack();
  });

  return (
    <Screen
      keyboard
      edges={['top', 'bottom']}
      header={
        <Header title={existing ? t.address.editTitle : t.address.addTitle} />
      }
      footer={
        <View
          style={[
            styles.footer,
            { borderTopColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Button
            title={t.address.save}
            onPress={onSave}
            loading={saving}
            testID="address-save"
          />
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <FormField
          control={control}
          name="name"
          label={t.address.fullName}
          autoCapitalize="words"
        />
        <FormField
          control={control}
          name="mobile"
          label={t.address.mobile}
          keyboardType="number-pad"
          maxLength={10}
          prefix="+91"
          transform={v => v.replace(/\D/g, '')}
        />
        <FormField
          control={control}
          name="pincode"
          label={t.address.pincode}
          keyboardType="number-pad"
          maxLength={6}
          transform={v => v.replace(/\D/g, '')}
          hint={autoFilled ? t.address.autoFilled : undefined}
        />
        <FormField control={control} name="line1" label={t.address.line1} />
        <FormField control={control} name="line2" label={t.address.line2} />
        <FormField
          control={control}
          name="landmark"
          label={t.address.landmark}
        />
        <View style={styles.row}>
          <FormField
            control={control}
            name="city"
            label={t.address.city}
            containerStyle={styles.flex}
          />
          <FormField
            control={control}
            name="state"
            label={t.address.state}
            containerStyle={styles.flex}
          />
        </View>
        <AppText variant="label" color="textSecondary" style={styles.label}>
          {t.address.type}
        </AppText>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <View style={styles.chips}>
              {TYPES.map(tp => (
                <Chip
                  key={tp}
                  label={tp}
                  icon={
                    tp === 'Home'
                      ? 'home-outline'
                      : tp === 'Work'
                      ? 'briefcase-outline'
                      : 'location-outline'
                  }
                  selected={field.value === tp}
                  onPress={() => field.onChange(tp)}
                />
              ))}
            </View>
          )}
        />
        <Controller
          control={control}
          name="isDefault"
          render={({ field }) => (
            <CheckboxRow
              label={t.address.makeDefault}
              checked={!!field.value}
              onPress={() => field.onChange(!field.value)}
            />
          )}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  row: { flexDirection: 'row', gap: spacing.md },
  label: { marginBottom: spacing.sm },
  chips: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
});
