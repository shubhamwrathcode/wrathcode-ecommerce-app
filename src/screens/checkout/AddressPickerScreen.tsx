import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  AddressText,
  AppText,
  Button,
  Card,
  Header,
  Icon,
  Screen,
  TextField,
} from '@/components';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { t } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { pincodeService } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectDeliveryAddress, selectUserAddresses } from '@/store/selectors';
import { addressActions } from '@/store/slices/addressSlice';
import { spacing, useTheme } from '@/theme';
import { isValidPincode } from '@/utils/validators';

/** "Deliver to" picker opened from Home (HM-02). */
export function AddressPickerScreen({
  navigation,
}: RootScreenProps<'AddressPicker'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const requireAuth = useRequireAuth();
  const addresses = useAppSelector(selectUserAddresses);
  const current = useAppSelector(selectDeliveryAddress);
  const guestPin = useAppSelector(s => s.address.guestPincode);
  const [pin, setPin] = useState(guestPin ?? '');
  const [error, setError] = useState<string | null>(null);

  const applyPin = () => {
    if (!isValidPincode(pin)) return setError(t.validation.pincode);
    const s = pincodeService.check(pin);
    if (!s.serviceable) return setError(t.validation.pincodeNotServiceable);
    dispatch(addressActions.select(null));
    dispatch(addressActions.setGuestPincode(pin));
    navigation.goBack();
  };

  return (
    <Screen
      edges={['top', 'bottom']}
      keyboard
      header={<Header title={t.address.picker} closeIcon />}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {addresses.map(a => (
          <Card
            key={a.id}
            onPress={() => {
              dispatch(addressActions.select(a.id));
              navigation.goBack();
            }}
            style={{
              borderColor: current?.id === a.id ? colors.accent : colors.border,
              borderWidth:
                current?.id === a.id ? 1.5 : StyleSheet.hairlineWidth,
            }}
          >
            <View style={styles.row}>
              <Icon
                name={
                  current?.id === a.id ? 'radio-button-on' : 'radio-button-off'
                }
                size={22}
                color={current?.id === a.id ? colors.accent : colors.textMuted}
              />
              <AddressText address={a} compact />
            </View>
          </Card>
        ))}
        <Button
          title={t.address.add}
          icon="add"
          variant="outline"
          onPress={() =>
            requireAuth(() => navigation.navigate('AddEditAddress'))
          }
        />
        <AppText variant="h3" style={styles.or}>
          {t.address.usePincode}
        </AppText>
        <View style={styles.pinRow}>
          <TextField
            value={pin}
            onChangeText={v => {
              setPin(v.replace(/\D/g, '').slice(0, 6));
              setError(null);
            }}
            placeholder={t.pdp.pincodePlaceholder}
            keyboardType="number-pad"
            maxLength={6}
            error={error ?? undefined}
            leftIcon="location-outline"
            containerStyle={styles.flex}
          />
          <Button
            title={t.common.apply}
            fullWidth={false}
            onPress={applyPin}
            style={styles.applyBtn}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  or: { marginTop: spacing.lg },
  pinRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  applyBtn: { minHeight: 48 },
});
