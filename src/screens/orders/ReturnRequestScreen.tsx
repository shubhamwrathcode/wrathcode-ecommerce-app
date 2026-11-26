import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  AddressText,
  AppText,
  Button,
  Card,
  Chip,
  EmptyState,
  Header,
  Icon,
  RadioRow,
  Screen,
  TextField,
} from '@/components';
import { t } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUserAddresses } from '@/store/selectors';
import { requestReturn } from '@/store/thunks';
import { spacing, useTheme } from '@/theme';
import { canReturn } from '@/utils/orderStatus';
import { toast } from '@/utils/toast';

/** Return / Replace (OR-05): within 7 days of delivery, returnable items only. */
export function ReturnRequestScreen({
  navigation,
  route,
}: RootScreenProps<'ReturnRequest'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const order = useAppSelector(s =>
    s.orders.list.find(o => o.id === route.params.orderId),
  );
  const addresses = useAppSelector(selectUserAddresses);
  const [type, setType] = useState<'return' | 'replace'>('return');
  const [reason, setReason] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [addressId, setAddressId] = useState<string | null>(
    order?.address.id ?? null,
  );
  const [loading, setLoading] = useState(false);

  if (!order || !canReturn(order)) {
    return (
      <Screen header={<Header title={t.orders.returnTitle} />}>
        <EmptyState
          icon="time-outline"
          tone="error"
          title="Return window closed"
          body="Returns are available within 7 days of delivery for returnable items."
          actionLabel={t.common.back}
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  const pickupOptions = addresses.some(a => a.id === order.address.id)
    ? addresses
    : [order.address, ...addresses];
  const pickup = pickupOptions.find(a => a.id === addressId) ?? order.address;

  const submit = async () => {
    if (!reason) return;
    setLoading(true);
    try {
      await dispatch(
        requestReturn(order, { type, reason, comment, pickupAddress: pickup }),
      );
      toast.success(
        type === 'return'
          ? t.orders.returnRequested
          : t.orders.replaceRequested,
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      keyboard
      edges={['top', 'bottom']}
      header={<Header title={t.orders.returnTitle} subtitle={order.id} />}
      footer={
        <View
          style={[
            styles.footer,
            { borderTopColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Button
            title={t.orders.submitRequest}
            disabled={!reason}
            loading={loading}
            onPress={submit}
          />
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="h3">{t.orders.returnType}</AppText>
        <View style={styles.chips}>
          <Chip
            label={t.orders.returnOpt}
            icon="cash-outline"
            selected={type === 'return'}
            onPress={() => setType('return')}
          />
          <Chip
            label={t.orders.replaceOpt}
            icon="swap-horizontal"
            selected={type === 'replace'}
            onPress={() => setType('replace')}
          />
        </View>
        <AppText variant="h3">{t.orders.returnReason}</AppText>
        <Card>
          {t.orders.returnReasons.map(r => (
            <RadioRow
              key={r}
              title={r}
              selected={reason === r}
              onPress={() => setReason(r)}
            />
          ))}
        </Card>
        <TextField
          label={t.orders.comments}
          value={comment}
          onChangeText={setComment}
          multiline
          style={styles.comment}
        />
        <AppText variant="h3">{t.orders.pickupAddress}</AppText>
        {pickupOptions.map(a => (
          <Card
            key={a.id}
            onPress={() => setAddressId(a.id)}
            style={{
              borderColor: pickup.id === a.id ? colors.accent : colors.border,
              borderWidth: pickup.id === a.id ? 1.5 : StyleSheet.hairlineWidth,
            }}
          >
            <View style={styles.row}>
              <Icon
                name={
                  pickup.id === a.id ? 'radio-button-on' : 'radio-button-off'
                }
                size={22}
                color={pickup.id === a.id ? colors.accent : colors.textMuted}
              />
              <AddressText address={a} compact />
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  chips: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  comment: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.md },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
});
