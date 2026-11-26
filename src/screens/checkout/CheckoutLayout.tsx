import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText, Button, Header, Screen, StepIndicator } from '@/components';
import { t } from '@/i18n';
import { shadows, spacing, useTheme } from '@/theme';
import { formatPrice } from '@/utils/format';

interface Props {
  step: number;
  title: string;
  total: number;
  cta: string;
  onNext: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

/** Shared chrome for the 4 checkout steps (CO-01). */
export function CheckoutLayout({
  step,
  title,
  total,
  cta,
  onNext,
  disabled,
  loading,
  children,
}: Props) {
  const { colors } = useTheme();
  return (
    <Screen
      edges={['top', 'bottom']}
      header={
        <>
          <Header title={title} />
          <StepIndicator steps={t.checkout.steps} current={step} />
        </>
      }
      footer={
        <View
          style={[
            styles.footer,
            shadows.lg,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          <View style={styles.flex}>
            <AppText variant="caption" color="textMuted">
              {t.cart.totalAmount}
            </AppText>
            <AppText variant="h2">{formatPrice(total)}</AppText>
          </View>
          <Button
            title={cta}
            onPress={onNext}
            disabled={disabled}
            loading={loading}
            fullWidth={false}
            style={styles.cta}
            testID="checkout-next"
          />
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cta: { paddingHorizontal: spacing.xxl },
});
