import React, { useEffect, useRef } from 'react';
import { Animated, StatusBar, StyleSheet, View } from 'react-native';
import { AppText, Logo } from '@/components';
import { APP } from '@/config/app';
import { brand, gradients, linear, spacing } from '@/theme';

/** ON-01: logo + tagline for ~1.5 s while the saved session loads. */
export function SplashScreen() {
  const scale = useRef(new Animated.Value(0.7)).current;
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 10,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 600,
        delay: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, scale]);
  return (
    <View style={[styles.root, linear(gradients.night, 160)]}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.glow, linear([brand.magenta, 'transparent'], 0)]} />
      <View style={[styles.ring, styles.r1]} />
      <View style={[styles.ring, styles.r2]} />
      <Animated.View style={{ transform: [{ scale }] }}>
        <Logo size={96} light />
      </Animated.View>
      <Animated.View style={[styles.text, { opacity: fade }]}>
        <AppText style={styles.name} color="#FFFFFF">
          Shop
          <AppText style={styles.name} color={brand.magenta}>
            Verse
          </AppText>
        </AppText>
        <AppText color="#FFFFFFB3" align="center">
          {APP.tagline}
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brand.night,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.xs },
  name: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFFFFF14',
  },
  r1: { width: 320, height: 320 },
  r2: { width: 520, height: 520 },
  glow: {
    position: 'absolute',
    bottom: -260,
    width: 620,
    height: 520,
    borderRadius: 999,
    opacity: 0.45,
  },
});
