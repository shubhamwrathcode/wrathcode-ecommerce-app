import React, { useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, IconButton, ProductImage } from '@/components';
import type { RootScreenProps } from '@/navigation/types';
import { brand, spacing } from '@/theme';

/**
 * Full-screen zoom gallery (PD-01). Pinch-zoom on iOS via ScrollView; on
 * Android a double-tap toggles 2.5x zoom (no gesture library needed).
 */
function ZoomableImage({ source, size }: { source: string; size: number }) {
  const [zoomed, setZoomed] = useState(false);
  const lastTap = useRef(0);
  const onTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) setZoomed(z => !z);
    lastTap.current = now;
  };
  if (Platform.OS === 'ios') {
    return (
      <ScrollView
        maximumZoomScale={4}
        minimumZoomScale={1}
        centerContent
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{ width: size }}
      >
        <View style={[styles.center, { width: size }]}>
          <ProductImage source={source} size={size} rounded={false} />
        </View>
      </ScrollView>
    );
  }
  return (
    <Pressable onPress={onTap} style={[styles.center, { width: size }]}>
      <View style={{ transform: [{ scale: zoomed ? 2.5 : 1 }] }}>
        <ProductImage source={source} size={size} rounded={false} />
      </View>
    </Pressable>
  );
}

export function ImageGalleryScreen({
  navigation,
  route,
}: RootScreenProps<'ImageGallery'>) {
  const { images, index } = route.params;
  const { width } = useWindowDimensions();
  const [current, setCurrent] = useState(index);
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setCurrent(Math.round(e.nativeEvent.contentOffset.x / width));
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.top}>
        <IconButton
          name="close"
          color="#FFFFFF"
          accessibilityLabel="Close"
          onPress={() => navigation.goBack()}
        />
        <AppText color="#FFFFFF" variant="label">
          {current + 1} / {images.length}
        </AppText>
        <View style={styles.spacer} />
      </View>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        initialScrollIndex={index}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        keyExtractor={(img, i) => `${img}-${i}`}
        onMomentumScrollEnd={onEnd}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <ZoomableImage source={item} size={width} />}
      />
      <View style={styles.thumbs}>
        {images.map((img, i) => (
          <View
            key={`${img}-${i}`}
            style={[
              styles.thumb,
              { borderColor: i === current ? brand.magenta : 'transparent' },
            ]}
          >
            <ProductImage source={img} size={48} />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.night },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  spacer: { width: 44 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  thumbs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  thumb: { borderWidth: 2, borderRadius: 10, padding: 1 },
});
