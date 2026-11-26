import { CommonActions } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { AppText, Button, Card, Icon, Screen } from '@/components';
import { t, tf } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { useAppSelector } from '@/store/hooks';
import { brand, spacing, useTheme } from '@/theme';
import { formatDeliveryDate } from '@/utils/date';
import { formatPrice } from '@/utils/format';

const CONFETTI = [
  brand.magenta,
  brand.violet,
  brand.orchid,
  '#F6A8FF',
  '#1E9E62',
  '#FFC94D',
];

/** Order success / failure (CO-09). */
export function OrderResultScreen({
  navigation,
  route,
}: RootScreenProps<'OrderResult'>) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const params = route.params;
  const success = params.status === 'success';
  const order = useAppSelector(s =>
    params.status === 'success'
      ? s.orders.list.find(o => o.id === params.orderId)
      : undefined,
  );
  const scale = useRef(new Animated.Value(0)).current;
  const fall = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 14,
      speed: 8,
    }).start();
    if (success)
      Animated.timing(fall, {
        toValue: 1,
        duration: 2200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
  }, [fall, scale, success]);

  const goHome = () =>
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            params: { screen: 'HomeTab', params: { screen: 'Home' } },
          },
        ],
      }),
    );
  const viewOrder = () =>
    params.status === 'success' &&
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          {
            name: 'Main',
            params: { screen: 'AccountTab', params: { screen: 'Orders' } },
          },
          { name: 'OrderDetails', params: { orderId: params.orderId } },
        ],
      }),
    );

  return (
    <Screen background="surface" edges={['top', 'bottom']}>
      {success
        ? Array.from({ length: 22 }).map((_, i) => (
            <Animated.View
              key={i}
              pointerEvents="none"
              style={[
                styles.confetti,
                {
                  left: (i * 37) % width,
                  backgroundColor: CONFETTI[i % CONFETTI.length],
                  transform: [
                    {
                      translateY: fall.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-40, 380 + (i % 5) * 60],
                      }),
                    },
                    {
                      rotate: fall.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', `${(i % 2 ? 1 : -1) * 540}deg`],
                      }),
                    },
                  ],
                  opacity: fall.interpolate({
                    inputRange: [0, 0.8, 1],
                    outputRange: [1, 1, 0],
                  }),
                },
              ]}
            />
          ))
        : null}
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.badge,
            {
              backgroundColor: success ? colors.successSoft : colors.dangerSoft,
              transform: [{ scale }],
            },
          ]}
        >
          <View
            style={[
              styles.inner,
              { backgroundColor: success ? colors.success : colors.danger },
            ]}
          >
            <Icon
              name={success ? 'checkmark' : 'close'}
              size={56}
              color="#FFFFFF"
            />
          </View>
        </Animated.View>
        <AppText variant="h1" align="center">
          {success ? t.orderResult.successTitle : t.orderResult.failTitle}
        </AppText>
        <AppText color="textSecondary" align="center" style={styles.body}>
          {success
            ? tf(t.orderResult.successBody, { id: params.orderId })
            : params.status === 'failure'
            ? `${params.message} ${t.orderResult.failBody}`
            : ''}
        </AppText>
        {order ? (
          <Card style={styles.card}>
            <View style={styles.row}>
              <AppText color="textSecondary">{t.orders.orderId}</AppText>
              <AppText weight="700">{order.id}</AppText>
            </View>
            <View style={styles.row}>
              <AppText color="textSecondary">{t.cart.totalAmount}</AppText>
              <AppText weight="700">
                {formatPrice(order.priceBreakup.total)}
              </AppText>
            </View>
            <View style={styles.row}>
              <Icon name="cube-outline" size={18} color={colors.success} />
              <AppText color="success" weight="600" style={styles.flex}>
                {tf(t.orderResult.expected, {
                  date: formatDeliveryDate(new Date(order.expectedDelivery)),
                })}
              </AppText>
            </View>
          </Card>
        ) : null}
      </View>
      <View style={styles.actions}>
        {success ? (
          <>
            <Button
              title={t.orderResult.viewOrder}
              variant="secondary"
              onPress={viewOrder}
              testID="view-order"
            />
            <Button
              title={t.orderResult.continueShopping}
              variant="outline"
              onPress={goHome}
            />
          </>
        ) : (
          <>
            <Button
              title={t.orderResult.retry}
              icon="refresh"
              onPress={() => navigation.replace('PaymentProcessing')}
              testID="retry-payment"
            />
            <Button
              title={t.orderResult.changeMethod}
              variant="outline"
              onPress={() => navigation.popTo('CheckoutPayment')}
            />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  badge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  inner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { maxWidth: 320 },
  card: { alignSelf: 'stretch', marginTop: spacing.xl, gap: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actions: { padding: spacing.lg, gap: spacing.md },
  confetti: {
    position: 'absolute',
    top: 0,
    width: 10,
    height: 16,
    borderRadius: 2,
  },
});
