import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, shadows, spacing, useTheme } from '@/theme';
import { toast, ToastOptions } from '@/utils/toast';
import { AppText } from './AppText';
import { Icon } from './Icon';

type Active = ToastOptions & { id: number };

/** Global toast renderer (added to cart, removed, coupon applied, …). */
export function ToastHost() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<Active | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () =>
      toast.subscribe(t => {
        if (timer.current) clearTimeout(timer.current);
        setCurrent(t);
        anim.setValue(0);
        Animated.spring(anim, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 6,
        }).start();
        timer.current = setTimeout(
          hide,
          t.duration ?? (t.action ? 4000 : 2400),
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  function hide() {
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setCurrent(null));
  }

  if (!current) return null;
  const icon =
    current.kind === 'success'
      ? 'checkmark-circle'
      : current.kind === 'error'
      ? 'alert-circle'
      : 'information-circle';
  const tint =
    current.kind === 'success'
      ? colors.success
      : current.kind === 'error'
      ? colors.danger
      : colors.accent;
  return (
    <View
      pointerEvents="box-none"
      style={[
        StyleSheet.absoluteFill,
        styles.host,
        { paddingBottom: insets.bottom + 72 },
      ]}
    >
      <Animated.View
        accessibilityLiveRegion="polite"
        style={[
          styles.toast,
          shadows.lg,
          {
            backgroundColor: '#1F0F33',
            opacity: anim,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Icon name={icon} size={20} color={tint} />
        <AppText
          variant="bodySm"
          color="#FFFFFF"
          style={styles.msg}
          numberOfLines={3}
        >
          {current.message}
        </AppText>
        {current.action ? (
          <Pressable
            hitSlop={10}
            onPress={() => {
              current.action?.onPress();
              hide();
            }}
            accessibilityRole="button"
          >
            <AppText variant="label" color={colors.accent} weight="700">
              {current.action.label.toUpperCase()}
            </AppText>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { justifyContent: 'flex-end', alignItems: 'center', zIndex: 999 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    maxWidth: 520,
    alignSelf: 'stretch',
  },
  msg: { flex: 1 },
});
