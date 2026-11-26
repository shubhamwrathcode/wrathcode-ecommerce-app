import React from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import {
  AppText,
  Button,
  Card,
  Header,
  Icon,
  ProductCard,
  RailSkeleton,
  Screen,
  SectionHeader,
} from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { t, tf } from '@/i18n';
import type { HomeScreenProps } from '@/navigation/types';
import { contentService, couponService, productService } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCartPricingLines, selectIsFirstOrder } from '@/store/selectors';
import { cartActions } from '@/store/slices/cartSlice';
import { radius, spacing, useTheme } from '@/theme';
import { formatDate } from '@/utils/date';
import { toast } from '@/utils/toast';

/** Deals / Offers (screen 40): today's deals, coupons and bank offers. */
export function OffersScreen({ navigation }: HomeScreenProps<'Offers'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const lines = useAppSelector(selectCartPricingLines);
  const isFirstOrder = useAppSelector(selectIsFirstOrder);
  const deliveryType = useAppSelector(s => s.checkout.deliveryType);
  const { data } = useAsync(async () => {
    const [deals, coupons, bank] = await Promise.all([
      productService.getDealsOfDay(),
      couponService.getCoupons({ lines, deliveryType, isFirstOrder }),
      contentService.getBankOffers(),
    ]);
    return { deals, coupons, bank };
  }, []);

  const applyCode = (code: string, ok: boolean, reason?: string) => {
    if (!ok) {
      toast.error(reason ?? t.coupon.notApplicable);
      return;
    }
    dispatch(cartActions.setCoupon(code));
    toast.success(tf(t.offers.copied, { code }));
  };

  return (
    <Screen header={<Header title={t.offers.title} />}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SectionHeader
          title={t.offers.deals}
          action={t.common.viewAll}
          onAction={() =>
            navigation.navigate('ProductList', {
              title: t.offers.deals,
              collection: 'deals',
            })
          }
        />
        {data ? (
          <FlatList
            horizontal
            data={data.deals}
            keyExtractor={p => p.id}
            renderItem={({ item }) => (
              <ProductCard product={item} layout="rail" />
            )}
            contentContainerStyle={styles.rail}
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <RailSkeleton />
        )}
        <View style={styles.section}>
          <SectionHeader title={t.offers.coupons} />
          <View style={styles.pad}>
            {data?.coupons
              .filter(
                c =>
                  c.result.ok || c.result.reason !== 'This coupon has expired',
              )
              .map(({ coupon, result }) => (
                <Card key={coupon.code} style={styles.coupon}>
                  <View
                    style={[
                      styles.code,
                      {
                        borderColor: colors.accent,
                        backgroundColor: colors.accentSoft,
                      },
                    ]}
                  >
                    <AppText variant="label" color="accentDark">
                      {coupon.code}
                    </AppText>
                  </View>
                  <AppText variant="h3">{coupon.title}</AppText>
                  <AppText variant="bodySm" color="textSecondary">
                    {coupon.description}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    {tf(t.coupon.validTill, {
                      date: formatDate(coupon.expiry),
                    })}
                  </AppText>
                  <Button
                    title={t.common.apply}
                    size="sm"
                    variant="outline"
                    fullWidth={false}
                    onPress={() =>
                      applyCode(
                        coupon.code,
                        result.ok,
                        result.ok ? undefined : result.reason,
                      )
                    }
                    style={styles.apply}
                  />
                </Card>
              ))}
          </View>
        </View>
        <View style={styles.section}>
          <SectionHeader title={t.offers.bank} />
          <View style={styles.pad}>
            {data?.bank.map(o => (
              <View
                key={o}
                style={[
                  styles.bank,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <Icon name="card-outline" size={20} color={colors.primary} />
                <AppText variant="bodySm" style={styles.flex}>
                  {o}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingVertical: spacing.lg },
  rail: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  section: { marginTop: spacing.xxl },
  pad: { paddingHorizontal: spacing.lg, gap: spacing.md },
  coupon: { gap: spacing.xs },
  code: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.xs,
  },
  apply: { marginTop: spacing.sm },
  bank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
