import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { t } from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectWishlistIds } from '@/store/selectors';
import { toggleWishlist } from '@/store/thunks';
import { shadows, useTheme } from '@/theme';
import { toast } from '@/utils/toast';
import { Icon } from './Icon';

/** Heart toggle with pop animation and "Undo" toast (WL-01). */
export const WishlistHeart = React.memo(function WishlistHeartView({
  productId,
  price,
  size = 20,
  floating = true,
}: {
  productId: string;
  price: number;
  size?: number;
  floating?: boolean;
}) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const active = useAppSelector(s => selectWishlistIds(s).has(productId));
  const scale = useRef(new Animated.Value(1)).current;

  const onPress = () => {
    const added = dispatch(toggleWishlist(productId, price));
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.35,
        useNativeDriver: true,
        speed: 50,
        bounciness: 12,
      }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
    toast.show({
      message: added ? t.wishlist.added : t.wishlist.removed,
      kind: added ? 'success' : 'default',
      action: {
        label: t.common.undo,
        onPress: () => dispatch(toggleWishlist(productId, price)),
      },
    });
  };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remove from wishlist' : 'Add to wishlist'}
      accessibilityState={{ selected: active }}
      style={
        floating
          ? [styles.floating, shadows.sm, { backgroundColor: colors.surface }]
          : styles.plain
      }
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon
          name={active ? 'heart' : 'heart-outline'}
          size={size}
          color={active ? colors.danger : colors.textSecondary}
        />
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  floating: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plain: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
