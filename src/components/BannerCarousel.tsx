import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { RULES } from '@/config/rules';
import { gradients, linear, radius, spacing, useTheme } from '@/theme';
import type { Banner } from '@/types/models';
import { AppText } from './AppText';
import { Icon } from './Icon';

/** Auto-scrolling banners: 4 s interval with dot indicator (HM-03). */
export function BannerCarousel({
  banners,
  onPress,
}: {
  banners: Banner[];
  onPress: (b: Banner) => void;
}) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const ref = useRef<FlatList<Banner>>(null);
  const [index, setIndex] = useState(0);
  const itemW = width - spacing.lg * 2;
  const userDragging = useRef(false);

  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => {
      if (userDragging.current) return;
      setIndex(i => {
        const next = (i + 1) % banners.length;
        ref.current?.scrollToOffset({
          offset: next * (itemW + spacing.sm),
          animated: true,
        });
        return next;
      });
    }, RULES.bannerIntervalMs);
    return () => clearInterval(id);
  }, [banners.length, itemW]);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    userDragging.current = false;
    setIndex(Math.round(e.nativeEvent.contentOffset.x / (itemW + spacing.sm)));
  };

  return (
    <View>
      <FlatList
        ref={ref}
        data={banners}
        keyExtractor={b => b.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemW + spacing.sm}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          gap: spacing.sm,
        }}
        onScrollBeginDrag={() => (userDragging.current = true)}
        onMomentumScrollEnd={onEnd}
        getItemLayout={(_, i) => ({
          length: itemW + spacing.sm,
          offset: (itemW + spacing.sm) * i,
          index: i,
        })}
        renderItem={({ item, index: i }) => (
          <Pressable
            onPress={() => onPress(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.subtitle}`}
          >
            <View
              style={[
                styles.banner,
                { width: itemW },
                linear(gradients.banners[i % gradients.banners.length], 125),
              ]}
            >
              <View style={[styles.circle, styles.c1]} />
              <View style={[styles.circle, styles.c2]} />
              <View style={styles.text}>
                {item.tag ? (
                  <View style={styles.tag}>
                    <AppText variant="caption" color="#FFFFFF" weight="800">
                      {item.tag}
                    </AppText>
                  </View>
                ) : null}
                <AppText
                  variant="h1"
                  color="#FFFFFF"
                  numberOfLines={2}
                  style={styles.title}
                >
                  {item.title}
                </AppText>
                <AppText
                  variant="bodySm"
                  color="#FFFFFFD9"
                  numberOfLines={2}
                  style={styles.sub}
                >
                  {item.subtitle}
                </AppText>
                <View style={styles.cta}>
                  <AppText variant="label" color="#7C03B2" weight="800">
                    {item.cta}
                  </AppText>
                  <Icon name="arrow-forward" size={14} color="#7C03B2" />
                </View>
              </View>
              {item.image ? (
                <View style={styles.photoWrap}>
                  <View style={styles.photoBlob}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.photo}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.spark}>
                    <Icon name="sparkles" size={16} color="#FFFFFF" />
                  </View>
                </View>
              ) : (
                <Icon
                  name={item.icon}
                  size={96}
                  color="#FFFFFF"
                  style={styles.icon}
                />
              )}
            </View>
          </Pressable>
        )}
      />
      <View style={styles.dots}>
        {banners.map((b, i) => (
          <View
            key={b.id}
            style={[
              styles.dot,
              {
                backgroundColor: colors.border,
                width: i === index ? 18 : 6,
              },
              i === index && linear(gradients.brand, 90),
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 184,
    borderRadius: radius.xl,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg,
  },
  text: { flex: 1, zIndex: 1, paddingVertical: spacing.md },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.xs,
  },
  title: { fontSize: 22, lineHeight: 27 },
  sub: { marginTop: 2 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
  },
  icon: { opacity: 0.9, marginLeft: spacing.sm },
  photoWrap: { width: 150, height: 184, justifyContent: 'center' },
  photoBlob: {
    width: 136,
    height: 136,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-8deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 10px 24px rgba(20, 0, 40, 0.35)',
  },
  photo: { width: 112, height: 112, transform: [{ rotate: '8deg' }] },
  spark: {
    position: 'absolute',
    top: 22,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DE24F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: { position: 'absolute', borderRadius: 999 },
  c1: {
    width: 200,
    height: 200,
    right: -60,
    top: -70,
    backgroundColor: '#DE24F8',
    opacity: 0.35,
  },
  c2: {
    width: 110,
    height: 110,
    left: -30,
    bottom: -60,
    backgroundColor: '#FFFFFF',
    opacity: 0.1,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: spacing.sm,
  },
  dot: { height: 6, borderRadius: 3 },
});
