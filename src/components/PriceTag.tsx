import React from 'react';
import { StyleSheet, View } from 'react-native';
import { t, tf } from '@/i18n';
import { spacing } from '@/theme';
import { formatPrice } from '@/utils/format';
import { discountPercent } from '@/utils/price';
import { AppText } from './AppText';

interface Props {
  price: number;
  mrp: number;
  size?: 'sm' | 'md' | 'lg';
}

/** Price, MRP struck out and % off (section 7.1: show only if ≥1%). */
export const PriceTag = React.memo(function PriceTagView({
  price,
  mrp,
  size = 'md',
}: Props) {
  const pct = discountPercent(mrp, price);
  const main = size === 'lg' ? 'h1' : size === 'md' ? 'h3' : 'label';
  return (
    <View style={styles.row}>
      <AppText variant={main} weight="700">
        {formatPrice(price)}
      </AppText>
      {pct > 0 ? (
        <>
          <AppText
            variant={size === 'lg' ? 'body' : 'caption'}
            color="textMuted"
            strike
          >
            {formatPrice(mrp)}
          </AppText>
          <AppText
            variant={size === 'lg' ? 'h3' : 'caption'}
            color="success"
            weight="700"
          >
            {tf(t.common.off, { pct })}
          </AppText>
        </>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
});
