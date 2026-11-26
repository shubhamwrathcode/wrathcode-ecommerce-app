import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { RULES } from '@/config/rules';
import { t, tf } from '@/i18n';
import { gradients, linear, radius, spacing, useTheme } from '@/theme';
import type { Product } from '@/types/models';
import { discountPercent } from '@/utils/price';
import { AppText } from './AppText';
import { PriceTag } from './PriceTag';
import { ProductImage } from './ProductImage';
import { RatingBadge } from './Rating';
import { WishlistHeart } from './WishlistHeart';

interface Props {
  product: Product;
  layout?: 'grid' | 'list' | 'rail';
  width?: number;
}

export function StockLabel({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <AppText variant="caption" color="danger" weight="700">
        {t.common.outOfStock}
      </AppText>
    );
  }
  if (stock <= RULES.stock.lowStockThreshold) {
    return (
      <AppText variant="caption" color="warning" weight="700">
        {tf(t.common.onlyLeft, { n: stock })}
      </AppText>
    );
  }
  return null;
}

/** Product card (PL-01): image, 2-line name, rating, price/MRP/% off, low stock, heart. */
export const ProductCard = React.memo(function ProductCardView({
  product,
  layout = 'grid',
  width,
}: Props) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const open = () =>
    navigation.navigate('ProductDetails', { productId: product.id });
  const oos = product.stock <= 0;
  const off = discountPercent(product.mrp, product.price);

  if (layout === 'list') {
    return (
      <Pressable
        onPress={open}
        style={[
          styles.list,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
        accessibilityRole="button"
        accessibilityLabel={product.name}
      >
        <View style={styles.listImg}>
          <ProductImage source={product.images[0]} dimmed={oos} />
        </View>
        <View style={styles.listBody}>
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {product.brand}
          </AppText>
          <AppText variant="bodySm" numberOfLines={2}>
            {product.name}
          </AppText>
          <RatingBadge rating={product.rating} count={product.ratingCount} />
          <PriceTag price={product.price} mrp={product.mrp} />
          {product.freeDelivery ? (
            <AppText variant="caption" color="textSecondary">
              {t.plp.freeDelivery}
            </AppText>
          ) : null}
          <StockLabel stock={product.stock} />
        </View>
        <WishlistHeart
          productId={product.id}
          price={product.price}
          floating={false}
        />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={open}
      style={[
        layout === 'rail'
          ? [styles.rail, { width: width ?? 156 }]
          : styles.grid,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      accessibilityRole="button"
      accessibilityLabel={product.name}
    >
      <View>
        <ProductImage source={product.images[0]} dimmed={oos} />
        <View style={styles.heart}>
          <WishlistHeart
            productId={product.id}
            price={product.price}
            size={18}
          />
        </View>
        {product.isDealOfDay ? (
          <View style={[styles.tag, linear(['#FF3D7F', '#DE24F8'], 120)]}>
            <AppText variant="caption" color="#FFFFFF" weight="800">
              🔥 DEAL
            </AppText>
          </View>
        ) : product.isBestSeller ? (
          <View style={[styles.tag, linear(gradients.deep, 120)]}>
            <AppText
              variant="caption"
              color={colors.textOnPrimary}
              weight="800"
            >
              ⚡ BESTSELLER
            </AppText>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <AppText variant="caption" color="textMuted" numberOfLines={1}>
          {product.brand}
        </AppText>
        <AppText variant="bodySm" numberOfLines={2} style={styles.name}>
          {product.name}
        </AppText>
        <RatingBadge rating={product.rating} count={product.ratingCount} />
        <View style={styles.price}>
          <PriceTag price={product.price} mrp={product.mrp} size="sm" />
        </View>
        {off >= 40 && !oos ? (
          <View
            style={[styles.offPill, { backgroundColor: colors.primarySoft }]}
          >
            <AppText variant="caption" color="primary" weight="800">
              💸 Steal deal
            </AppText>
          </View>
        ) : null}
        <StockLabel stock={product.stock} />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    margin: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  rail: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  body: { padding: spacing.sm, gap: spacing.xs },
  name: { minHeight: 36 },
  price: { marginTop: 2 },
  heart: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  tag: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  offPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  list: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listImg: { width: 110 },
  listBody: { flex: 1, gap: spacing.xs },
});
