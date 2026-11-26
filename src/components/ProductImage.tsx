import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { linear, radius, useTheme } from '@/theme';
import { Icon } from './Icon';

/**
 * Product / category image.
 * - `https://…` sources render the real product photo on a clean white tile
 *   (Amazon-style, `contain` so nothing is cropped), with a soft placeholder
 *   while loading and a graceful fallback if the network is unavailable.
 * - Legacy descriptors ("pi|<ionicon>|<hex>|<idx>") still render a drawn tile.
 */
interface Props {
  source: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  rounded?: boolean;
  dimmed?: boolean;
}

function parse(desc: string) {
  const [, icon = 'cube-outline', hex = '#8A94A3', idx = '0'] = desc.split('|');
  return { icon, hex, idx: Number(idx) || 0 };
}

function hexToRgba(hex: string, a: number) {
  const h = hex.replace('#', '');
  const n = parseInt(
    h.length === 3
      ? h
          .split('')
          .map(c => c + c)
          .join('')
      : h,
    16,
  );
  // eslint-disable-next-line no-bitwise
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export const ProductImage = React.memo(function ProductImageView({
  source,
  size,
  style,
  rounded = true,
  dimmed,
}: Props) {
  if (/^https?:\/\//.test(source)) {
    return (
      <PhotoTile
        uri={source}
        size={size}
        style={style}
        rounded={rounded}
        dimmed={dimmed}
      />
    );
  }
  return (
    <DrawnTile
      source={source}
      size={size}
      style={style}
      rounded={rounded}
      dimmed={dimmed}
    />
  );
});

function PhotoTile({
  uri,
  size,
  style,
  rounded,
  dimmed,
}: Omit<Props, 'source'> & { uri: string }) {
  const { colors } = useTheme();
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  return (
    <View
      style={[
        styles.box,
        size ? { width: size, height: size } : styles.fill,
        {
          backgroundColor: '#FFFFFF',
          borderRadius: rounded ? radius.md : 0,
          opacity: dimmed ? 0.5 : 1,
        },
        style,
      ]}
      accessibilityRole="image"
    >
      {state !== 'ok' ? (
        <View style={[styles.center, linear(['#F7F1FC', '#FFFFFF'], 160)]}>
          {state === 'loading' ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Icon name="image-outline" size={28} color={colors.textMuted} />
          )}
        </View>
      ) : null}
      <Image
        source={{ uri }}
        style={styles.photo}
        resizeMode="contain"
        onLoad={() => setState('ok')}
        onError={() => setState('error')}
        fadeDuration={200}
      />
    </View>
  );
}

function DrawnTile({ source, size, style, rounded, dimmed }: Props) {
  const { dark } = useTheme();
  const { icon, hex, idx } = parse(source);
  const angle = (idx % 4) * 90;
  const iconScale = [0.42, 0.5, 0.36, 0.46][idx % 4];
  const bg = hexToRgba(hex, dark ? 0.28 : 0.14);
  // Linear wash: product colour into the brand tint; direction varies per variant.
  const wash = linear(
    [
      hexToRgba(hex, dark ? 0.42 : 0.26),
      hexToRgba(hex, dark ? 0.12 : 0.06),
      // fades into a soft Wrathcode violet/magenta tint
      dark ? 'rgba(124,3,178,0.28)' : 'rgba(222,36,248,0.12)',
    ],
    150 + angle,
  );
  return (
    <View
      style={[
        styles.box,
        size ? { width: size, height: size } : styles.fill,
        {
          backgroundColor: bg,
          borderRadius: rounded ? radius.md : 0,
          opacity: dimmed ? 0.5 : 1,
        },
        wash,
        style,
      ]}
      accessibilityRole="image"
    >
      <View
        style={[
          styles.blob,
          {
            backgroundColor: hexToRgba(hex, 0.22),
            transform: [{ rotate: `${angle}deg` }],
          },
        ]}
      />
      <View style={[styles.blob2, { backgroundColor: hexToRgba(hex, 0.12) }]} />
      <View style={styles.center}>
        <Icon name={icon} size={(size ?? 160) * iconScale} color={hex} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden', aspectRatio: 1 },
  fill: { width: '100%' },
  blob: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    borderRadius: 999,
    top: '-18%',
    right: '-18%',
  },
  blob2: {
    position: 'absolute',
    width: '55%',
    height: '55%',
    borderRadius: 999,
    bottom: '-15%',
    left: '-12%',
  },
  photo: { position: 'absolute', top: '6%', left: '6%', right: '6%', bottom: '6%' },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
