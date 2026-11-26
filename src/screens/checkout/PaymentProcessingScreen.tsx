import { CommonActions } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  View,
} from 'react-native';
import { AppText, Icon, Screen } from '@/components';
import { t } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { paymentService } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { placeOrder } from '@/store/thunks';
import { spacing, useTheme } from '@/theme';

/** 2 s payment simulation (CO-07) followed by order placement. */
export function PaymentProcessingScreen({
  navigation,
}: RootScreenProps<'PaymentProcessing'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const payment = useAppSelector(s => s.checkout.payment);
  const spin = useRef(new Animated.Value(0)).current;
  const done = useRef(false);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  // Block back navigation while "talking to the bank".
  useEffect(
    () =>
      navigation.addListener('beforeRemove', e => {
        if (!done.current) e.preventDefault();
      }),
    [navigation],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!payment) return;
      try {
        const res = await paymentService.process(payment);
        if (!alive) return;
        if (!res.success) {
          done.current = true;
          navigation.replace('OrderResult', {
            status: 'failure',
            message: res.message,
          });
          return;
        }
        const order = await dispatch(placeOrder());
        if (!alive) return;
        done.current = true;
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              { name: 'Main' },
              {
                name: 'OrderResult',
                params: { status: 'success', orderId: order.id },
              },
            ],
          }),
        );
      } catch (e) {
        done.current = true;
        navigation.replace('OrderResult', {
          status: 'failure',
          message: (e as Error).message,
        });
      }
    })();
    return () => {
      alive = false;
    };
  }, [dispatch, navigation, payment]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return (
    <Screen background="surface" edges={['top', 'bottom']}>
      <View style={styles.center}>
        <View style={styles.ringWrap}>
          <Animated.View
            style={[
              styles.ring,
              {
                borderColor: colors.primarySoft,
                borderTopColor: colors.accent,
                transform: [{ rotate }],
              },
            ]}
          />
          <Icon
            name="shield-checkmark"
            size={40}
            color={colors.primary}
            style={styles.icon}
          />
        </View>
        <AppText variant="h2" align="center">
          {t.checkout.processing}
        </AppText>
        <AppText color="textSecondary" align="center">
          {payment?.label}
        </AppText>
        <AppText
          variant="caption"
          color="textMuted"
          align="center"
          style={styles.note}
        >
          {t.checkout.processingSub}
        </AppText>
        <ActivityIndicator color={colors.accent} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  ringWrap: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  ring: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
  },
  icon: {},
  note: { marginVertical: spacing.md },
});
