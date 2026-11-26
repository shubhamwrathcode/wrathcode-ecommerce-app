import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  AppText,
  Card,
  EmptyState,
  Header,
  Icon,
  InfoBanner,
  ProductImage,
  Screen,
} from '@/components';
import { t, tf } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { syncOrderStatuses } from '@/store/thunks';
import { spacing, useTheme } from '@/theme';
import { formatDateTime } from '@/utils/date';
import { buildTimeline } from '@/utils/orderStatus';

/** Vertical tracking timeline (OR-03); status moves forward with time (section 7.7). */
export function TrackOrderScreen({ route }: RootScreenProps<'TrackOrder'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const order = useAppSelector(s =>
    s.orders.list.find(o => o.id === route.params.orderId),
  );
  const mode = useAppSelector(s => s.ui.demoSpeed);

  // Re-evaluate on open and every 10 s while the screen is visible.
  useFocusEffect(
    useCallback(() => {
      dispatch(syncOrderStatuses());
      const id = setInterval(() => dispatch(syncOrderStatuses()), 10000);
      return () => clearInterval(id);
    }, [dispatch]),
  );

  if (!order)
    return <EmptyState icon="receipt-outline" title={t.orders.notFound} />;
  const steps = buildTimeline(order, mode);

  return (
    <Screen header={<Header title={t.orders.trackTitle} subtitle={order.id} />}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.head}>
          <View style={styles.img}>
            <ProductImage source={order.items[0].image} />
          </View>
          <AppText variant="bodySm" numberOfLines={2} style={styles.flex}>
            {order.items[0].name}
          </AppText>
        </Card>
        <Card>
          {steps.map((s, i) => {
            const last = i === steps.length - 1;
            const next = steps[i + 1];
            const tint =
              s.status === 'cancelled'
                ? colors.danger
                : s.done
                ? colors.success
                : colors.border;
            return (
              <View
                key={s.status}
                style={styles.step}
                accessibilityLabel={`${s.label} ${s.done ? 'done' : 'pending'}`}
              >
                <View style={styles.rail}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: s.done ? tint : colors.surface,
                        borderColor: tint,
                      },
                    ]}
                  >
                    {s.done ? (
                      <Icon
                        name={s.status === 'cancelled' ? 'close' : 'checkmark'}
                        size={12}
                        color="#FFFFFF"
                      />
                    ) : null}
                  </View>
                  {!last ? (
                    <View
                      style={[
                        styles.line,
                        {
                          backgroundColor: next?.done
                            ? colors.success
                            : colors.border,
                        },
                      ]}
                    />
                  ) : null}
                </View>
                <View style={styles.stepBody}>
                  <AppText variant="h3" color={s.done ? 'text' : 'textMuted'}>
                    {s.label}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    {s.at
                      ? formatDateTime(s.at)
                      : s.expected
                      ? tf(t.orders.expectedOn, {
                          date: formatDateTime(s.expected),
                        })
                      : ''}
                  </AppText>
                </View>
              </View>
            );
          })}
        </Card>
        <InfoBanner
          icon="speedometer-outline"
          text={tf(t.orders.demoSpeedNote, {
            mode: mode === 'fast' ? t.settings.fast : t.settings.realistic,
          })}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  img: { width: 56 },
  step: { flexDirection: 'row', gap: spacing.md, minHeight: 64 },
  rail: { alignItems: 'center', width: 24 },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { width: 2, flex: 1, marginVertical: 2 },
  stepBody: { flex: 1, paddingBottom: spacing.lg },
});
