import React from 'react';
import { StyleSheet, View } from 'react-native';
import { t } from '@/i18n';
import { radius, spacing, useTheme } from '@/theme';
import type { Address } from '@/types/models';
import { maskMobile } from '@/utils/format';
import { AppText } from './AppText';

export function AddressText({
  address,
  compact,
}: {
  address: Address;
  compact?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.text}>
      <View style={styles.nameRow}>
        <AppText variant="h3">{address.name}</AppText>
        <View
          style={[
            styles.type,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          ]}
        >
          <AppText variant="caption" color="textSecondary">
            {address.type.toUpperCase()}
          </AppText>
        </View>
        {address.isDefault ? (
          <View
            style={[
              styles.type,
              {
                backgroundColor: colors.primarySoft,
                borderColor: colors.primarySoft,
              },
            ]}
          >
            <AppText variant="caption" color="primary">
              {t.checkout.default.toUpperCase()}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText
        variant="bodySm"
        color="textSecondary"
        numberOfLines={compact ? 2 : undefined}
      >
        {[
          address.line1,
          address.line2,
          address.landmark,
          `${address.city}, ${address.state} - ${address.pincode}`,
        ]
          .filter(Boolean)
          .join(', ')}
      </AppText>
      {!compact ? (
        <AppText variant="bodySm" color="textSecondary">
          {maskMobile(address.mobile)}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  text: { gap: spacing.xs, flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  type: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
});
