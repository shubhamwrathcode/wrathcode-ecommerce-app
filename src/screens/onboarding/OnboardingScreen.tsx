import React, { useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { AppText, Button, Logo, ProductImage, Screen } from '@/components';
import { ONBOARDING_PHOTOS } from '@/config/app';
import { t } from '@/i18n';
import { useAppDispatch } from '@/store/hooks';
import { uiActions } from '@/store/slices/uiSlice';
import { gradients, linear, spacing, useTheme } from '@/theme';

/** ON-02: three slides with Skip / Next, shown on first launch only. */
export function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const ref = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const slides = t.onboarding.slides;
  const last = index === slides.length - 1;
  const finish = () => dispatch(uiActions.completeOnboarding());
  const next = () => {
    if (last) return finish();
    ref.current?.scrollToIndex({ index: index + 1 });
    setIndex(index + 1);
  };
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  return (
    <Screen edges={['top', 'bottom']} background="surface">
      <View style={styles.top}>
        <Logo size={32} showName />
        {!last ? (
          <Pressable onPress={finish} hitSlop={12} accessibilityRole="button">
            <AppText variant="label" color="textSecondary">
              {t.common.skip}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      <FlatList
        ref={ref}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={s => s.title}
        onMomentumScrollEnd={onEnd}
        renderItem={({ item, index: i }) => (
          <View style={[styles.slide, { width }]}>
            <View
              style={[
                styles.art,
                linear(gradients.banners[i % gradients.banners.length], 135),
              ]}
            >
              <View style={[styles.artInner, { backgroundColor: '#FFFFFF' }]}>
                <ProductImage
                  source={ONBOARDING_PHOTOS[i % ONBOARDING_PHOTOS.length][0]}
                  size={176}
                  rounded={false}
                />
              </View>
              <View style={[styles.sticker, styles.s1]}>
                <ProductImage
                  source={ONBOARDING_PHOTOS[i % ONBOARDING_PHOTOS.length][1]}
                  size={60}
                />
              </View>
              <View style={[styles.sticker, styles.s2]}>
                <ProductImage
                  source={ONBOARDING_PHOTOS[i % ONBOARDING_PHOTOS.length][2]}
                  size={52}
                />
              </View>
              <View
                style={[styles.bubble, styles.b1, linear(gradients.brand, 135)]}
              />
            </View>
            <AppText variant="h1" align="center" style={styles.title}>
              {item.title}
            </AppText>
            <AppText color="textSecondary" align="center" style={styles.body}>
              {item.body}
            </AppText>
          </View>
        )}
      />
      <View style={styles.dots}>
        {slides.map((s, i) => (
          <View
            key={s.title}
            style={[
              styles.dot,
              {
                width: i === index ? 22 : 8,
                backgroundColor: colors.border,
              },
              i === index && linear(gradients.brand, 90),
            ]}
          />
        ))}
      </View>
      <View style={styles.footer}>
        <Button
          title={last ? t.onboarding.getStarted : t.common.next}
          onPress={next}
          icon={last ? undefined : 'arrow-forward'}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  art: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artInner: {
    boxShadow: '0px 10px 30px rgba(65, 5, 116, 0.35)',
    width: 176,
    height: 176,
    borderRadius: 88,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: { position: 'absolute', borderRadius: 99 },
  b1: { width: 22, height: 22, bottom: 30, right: 34 },
  sticker: {
    position: 'absolute',
    padding: 4,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 8px 20px rgba(65, 5, 116, 0.3)',
  },
  s1: { top: 6, right: -6, transform: [{ rotate: '10deg' }] },
  s2: { bottom: 10, left: -4, transform: [{ rotate: '-12deg' }] },
  title: { marginTop: spacing.xxxl },
  body: { marginTop: spacing.md },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.xl,
  },
  dot: { height: 8, borderRadius: 4 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
});
