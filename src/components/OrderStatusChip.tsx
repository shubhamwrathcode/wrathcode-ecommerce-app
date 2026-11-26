import React from 'react';
import { StyleSheet, View } from 'react-native';
import { radius, useTheme } from '@/theme';
import type { OrderStatus } from '@/types/models';
import { STATUS_LABEL, statusGroup } from '@/utils/orderStatus';
import { AppText } from './AppText';

export function OrderStatusChip({ status }: { status: OrderStatus }) {
  const { colors } = useTheme();
  const g = statusGroup(status);
  const [bg, fg] =
    g === 'delivered'
      ? [colors.successSoft, colors.success]
      : g === 'cancelled'
      ? [colors.dangerSoft, colors.danger]
      : g === 'returned'
      ? [colors.warningSoft, colors.warning]
      : [colors.primarySoft, colors.primary];
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <AppText variant="caption" color={fg} weight="700">
        {STATUS_LABEL[status]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
});
