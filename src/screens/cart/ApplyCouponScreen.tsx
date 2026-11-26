import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  AppText,
  Button,
  Card,
  Header,
  Icon,
  ListSkeleton,
  Screen,
  TextField,
} from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { t, tf } from '@/i18n';
import type { CartScreenProps } from '@/navigation/types';
import { couponService } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCartPricingLines,
  selectCoupon,
  selectIsFirstOrder,
} from '@/store/selectors';
import { cartActions } from '@/store/slices/cartSlice';
import { radius, spacing, useTheme } from '@/theme';
import { formatDate } from '@/utils/date';
import { formatPrice } from '@/utils/format';
import { toast } from '@/utils/toast';

/** Apply coupon (CT-06): list with applicability reasons + manual entry. */
export function ApplyCouponScreen({
  navigation,
}: CartScreenProps<'ApplyCoupon'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const lines = useAppSelector(selectCartPricingLines);
  const isFirstOrder = useAppSelector(selectIsFirstOrder);
  const applied = useAppSelector(selectCoupon);
  const deliveryType = useAppSelector(s => s.checkout.deliveryType);
  const ctx = { lines, deliveryType, isFirstOrder };
  const { data, loading } = useAsync(() => couponService.getCoupons(ctx), []);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const apply = async (c: string) => {
    setBusy(true);
    setError(null);
    const res = await couponService.applyCoupon(c, ctx);
    setBusy(false);
    if (!res.result.ok || !res.coupon) {
      setError(res.result.ok ? t.coupon.notApplicable : res.result.reason);
      toast.error(res.result.ok ? t.coupon.notApplicable : res.result.reason);
      return;
    }
    dispatch(cartActions.setCoupon(res.coupon.code));
    toast.success(tf(t.coupon.applied, { code: res.coupon.code }));
    navigation.goBack();
  };

  return (
    <Screen keyboard header={<Header title={t.coupon.title} />}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.entry}>
          <TextField
            value={code}
            onChangeText={v => {
              setCode(v.toUpperCase());
              setError(null);
            }}
            placeholder={t.coupon.enterCode}
            autoCapitalize="characters"
            error={error ?? undefined}
            containerStyle={styles.flex}
            leftIcon="pricetag-outline"
            testID="coupon-input"
          />
          <Button
            title={t.coupon.apply}
            fullWidth={false}
            onPress={() => apply(code)}
            disabled={!code.trim()}
            loading={busy}
            style={styles.applyBtn}
          />
        </View>
        <AppText variant="h3" style={styles.title}>
          {t.coupon.available}
        </AppText>
        {loading ? (
          <ListSkeleton rows={4} />
        ) : (
          data?.map(({ coupon, result }) => {
            const isApplied = applied === coupon.code;
            return (
              <Card
                key={coupon.code}
                style={[
                  styles.card,
                  {
                    opacity: result.ok ? 1 : 0.75,
                    borderColor: isApplied ? colors.success : colors.border,
                  },
                ]}
              >
                <View style={styles.cardHead}>
                  <View
                    style={[
                      styles.code,
                      {
                        borderColor: result.ok ? colors.accent : colors.border,
                        backgroundColor: result.ok
                          ? colors.accentSoft
                          : colors.surfaceAlt,
                      },
                    ]}
                  >
                    <AppText
                      variant="label"
                      color={result.ok ? 'accentDark' : 'textMuted'}
                    >
                      {coupon.code}
                    </AppText>
                  </View>
                  <View style={styles.flex} />
                  {isApplied ? (
                    <View style={styles.row}>
                      <Icon
                        name="checkmark-circle"
                        size={18}
                        color={colors.success}
                      />
                      <Button
                        title={t.coupon.remove}
                        size="sm"
                        variant="ghost"
                        fullWidth={false}
                        onPress={() => {
                          dispatch(cartActions.setCoupon(null));
                          toast.show(t.coupon.removed);
                        }}
                      />
                    </View>
                  ) : (
                    <Button
                      title={t.coupon.apply}
                      size="sm"
                      variant={result.ok ? 'secondary' : 'outline'}
                      fullWidth={false}
                      disabled={!result.ok || busy}
                      onPress={() => apply(coupon.code)}
                    />
                  )}
                </View>
                {result.ok && result.discount > 0 ? (
                  <AppText variant="label" color="success">
                    {tf(t.coupon.save, {
                      amount: formatPrice(result.discount),
                    })}
                  </AppText>
                ) : null}
                <AppText variant="h3">{coupon.title}</AppText>
                <AppText variant="bodySm" color="textSecondary">
                  {coupon.description}
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {tf(t.coupon.validTill, { date: formatDate(coupon.expiry) })}
                </AppText>
                {!result.ok ? (
                  <View
                    style={[
                      styles.reason,
                      { backgroundColor: colors.dangerSoft },
                    ]}
                  >
                    <Icon
                      name="information-circle-outline"
                      size={16}
                      color={colors.danger}
                    />
                    <AppText variant="caption" color="danger">
                      {result.reason}
                    </AppText>
                  </View>
                ) : null}
              </Card>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  entry: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  applyBtn: { minHeight: 48 },
  title: { marginVertical: spacing.md },
  card: { marginBottom: spacing.md, gap: spacing.xs },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  code: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
});
