import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  Header,
  InfoBanner,
  RadioRow,
  Screen,
} from '@/components';
import { t, tf } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { cancelOrder } from '@/store/thunks';
import { spacing, useTheme } from '@/theme';
import { formatPrice } from '@/utils/format';
import { canCancel } from '@/utils/orderStatus';
import { toast } from '@/utils/toast';

/** Cancel order (OR-04): only before "Shipped"; reason > confirm > Cancelled. */
export function CancelOrderScreen({
  navigation,
  route,
}: RootScreenProps<'CancelOrder'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const order = useAppSelector(s =>
    s.orders.list.find(o => o.id === route.params.orderId),
  );
  const [reason, setReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!order || !canCancel(order)) {
    return (
      <Screen header={<Header title={t.orders.cancelTitle} />}>
        <EmptyState
          icon="alert-circle-outline"
          tone="error"
          title="This order can no longer be cancelled"
          body="Orders can be cancelled only before they are shipped."
          actionLabel={t.common.back}
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  const prepaid = order.payment.method !== 'cod';
  const submit = () =>
    Alert.alert(t.orders.cancelTitle, t.orders.cancelConfirm, [
      { text: t.common.no, style: 'cancel' },
      {
        text: t.common.yes,
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await dispatch(cancelOrder(order, reason!));
            toast.success(
              prepaid
                ? `${t.orders.cancelled}. ${tf(t.orders.refundNote, {
                    amount: formatPrice(order.priceBreakup.total),
                  })}`
                : t.orders.cancelled,
            );
            navigation.goBack();
          } catch (e) {
            toast.error((e as Error).message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);

  return (
    <Screen
      edges={['top', 'bottom']}
      header={<Header title={t.orders.cancelTitle} subtitle={order.id} />}
      footer={
        <View
          style={[
            styles.footer,
            { borderTopColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Button
            title={t.orders.cancelOrder}
            variant="danger"
            disabled={!reason}
            loading={loading}
            onPress={submit}
            testID="confirm-cancel"
          />
        </View>
      }
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText variant="h3">{t.orders.cancelReason}</AppText>
        <Card>
          {t.orders.cancelReasons.map(r => (
            <RadioRow
              key={r}
              title={r}
              selected={reason === r}
              onPress={() => setReason(r)}
            />
          ))}
        </Card>
        {prepaid ? (
          <InfoBanner
            tone="info"
            text={tf(t.orders.refundNote, {
              amount: formatPrice(order.priceBreakup.total),
            })}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
});
