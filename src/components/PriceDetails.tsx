import React from 'react';
import { StyleSheet, View } from 'react-native';
import { t, tf } from '@/i18n';
import { spacing, useTheme } from '@/theme';
import type { PriceBreakup } from '@/types/models';
import { formatPrice } from '@/utils/format';
import { AppText } from './AppText';
import { Card, Divider } from './Card';

/** Price details box (CT-04). */
export function PriceDetails({
  breakup,
  itemCount,
}: {
  breakup: PriceBreakup;
  itemCount?: number;
}) {
  const { colors } = useTheme();
  const row = (label: string, value: string, color?: string) => (
    <View style={styles.row}>
      <AppText color="textSecondary">{label}</AppText>
      <AppText color={color ?? 'text'}>{value}</AppText>
    </View>
  );
  return (
    <Card>
      <AppText variant="h3" style={styles.title}>
        {t.cart.priceDetails}
        {itemCount != null ? (
          <AppText variant="bodySm" color="textMuted">
            {'  '}({tf(t.cart.items, { n: itemCount })})
          </AppText>
        ) : null}
      </AppText>
      {row(t.cart.totalMrp, formatPrice(breakup.totalMrp))}
      {breakup.discountOnMrp > 0
        ? row(
            t.cart.discountOnMrp,
            `− ${formatPrice(breakup.discountOnMrp)}`,
            colors.success,
          )
        : null}
      {breakup.couponDiscount > 0
        ? row(
            t.cart.couponDiscount,
            `− ${formatPrice(breakup.couponDiscount)}`,
            colors.success,
          )
        : null}
      {row(
        t.cart.deliveryCharge,
        breakup.deliveryCharge === 0
          ? t.common.free
          : formatPrice(breakup.deliveryCharge),
        breakup.deliveryCharge === 0 ? colors.success : undefined,
      )}
      {breakup.codCharge > 0
        ? row(t.cart.codCharge, formatPrice(breakup.codCharge))
        : null}
      <Divider style={styles.divider} />
      <View style={styles.row}>
        <AppText variant="h3">{t.cart.totalAmount}</AppText>
        <AppText variant="h3">{formatPrice(breakup.total)}</AppText>
      </View>
      {breakup.savings > 0 ? (
        <View style={[styles.save, { backgroundColor: colors.successSoft }]}>
          <AppText variant="label" color="success">
            {tf(t.cart.youSave, { amount: formatPrice(breakup.savings) })}
          </AppText>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
  },
  divider: { marginVertical: spacing.sm },
  save: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
});
