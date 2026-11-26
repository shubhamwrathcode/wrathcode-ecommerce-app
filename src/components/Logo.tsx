import React from 'react';
import { StyleSheet, View } from 'react-native';
import { APP } from '@/config/app';
import { brand, gradients, linear, spacing } from '@/theme';
import { AppText } from './AppText';

/**
 * ShopVerse mark, styled after the Wrathcode logo: violet → magenta gradient
 * tile, a white shopping bag with a faceted gem, and the curved Wrathcode
 * "cradle" swoosh underneath. Same geometry as the native app icon
 * (scripts/generate-app-icon.swift), expressed as fractions of the tile size.
 */
export function Logo({
  size = 40,
  showName = false,
  light = false,
}: {
  size?: number;
  showName?: boolean;
  /** Use on dark / gradient backgrounds: wordmark turns white. */
  light?: boolean;
}) {
  const f = (n: number) => n * size;
  const handleR = f(0.098);
  const handleW = Math.max(1.5, f(0.04));
  const ringR = f(0.36);
  const ringW = Math.max(1.5, f(0.028));
  return (
    <View style={styles.row} accessibilityLabel={APP.name}>
      <View
        style={[
          styles.tile,
          linear([brand.deepPlum, brand.violet, brand.orchid, brand.magenta], 145),
          { width: size, height: size, borderRadius: size * 0.27 },
        ]}
      >
        {/* swoosh: lower half of a ring */}
        <View
          style={[
            styles.abs,
            styles.clip,
            {
              top: f(0.5),
              left: f(0.5) - ringR - ringW / 2,
              width: (ringR + ringW / 2) * 2,
              height: ringR + ringW,
            },
          ]}
        >
          <View
            style={{
              position: 'absolute',
              top: -ringR - ringW / 2,
              width: (ringR + ringW / 2) * 2,
              height: (ringR + ringW / 2) * 2,
              borderRadius: size,
              borderWidth: ringW,
              borderColor: 'rgba(255,255,255,0.6)',
            }}
          />
        </View>
        {/* bag handle: upper half of a ring */}
        <View
          style={[
            styles.abs,
            styles.clip,
            {
              top: f(0.37) - handleR - handleW / 2,
              left: f(0.5) - handleR - handleW / 2,
              width: (handleR + handleW / 2) * 2,
              height: handleR + handleW / 2 + 1,
            },
          ]}
        >
          <View
            style={{
              width: (handleR + handleW / 2) * 2,
              height: (handleR + handleW / 2) * 2,
              borderRadius: size,
              borderWidth: handleW,
              borderColor: '#FFFFFF',
            }}
          />
        </View>
        {/* bag body */}
        <View
          style={[
            styles.abs,
            {
              top: f(0.37),
              left: f(0.3),
              width: f(0.4),
              height: f(0.34),
              borderRadius: f(0.06),
              backgroundColor: '#FFFFFF',
            },
          ]}
        >
          {/* faceted gem */}
          <View
            style={[
              styles.abs,
              linear(gradients.brand, 135),
              {
                left: f(0.2) - f(0.07),
                top: f(0.17) - f(0.07),
                width: f(0.14),
                height: f(0.14),
                borderRadius: f(0.02),
                transform: [{ rotate: '45deg' }],
              },
            ]}
          />
        </View>
      </View>
      {showName ? (
        <AppText
          style={{
            fontSize: size * 0.55,
            lineHeight: size * 0.72,
            fontWeight: '800',
            letterSpacing: -0.5,
          }}
          color={light ? '#FFFFFF' : 'primary'}
        >
          Shop
          <AppText
            style={{ fontSize: size * 0.55, fontWeight: '800' }}
            color={light ? brand.magenta : 'accent'}
          >
            Verse
          </AppText>
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tile: { overflow: 'hidden' },
  abs: { position: 'absolute' },
  clip: { overflow: 'hidden' },
});
