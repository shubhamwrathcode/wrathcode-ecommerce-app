import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  AppText,
  Button,
  Card,
  Divider,
  EmptyState,
  Header,
  Icon,
  IconButton,
  PriceTag,
  ProductImage,
  ProductRail,
  RatingBadge,
  Screen,
  Skeleton,
  useFlyToCart,
  WishlistHeart,
} from '@/components';
import { APP } from '@/config/app';
import { RULES } from '@/config/rules';
import { useAsync } from '@/hooks/useAsync';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { t, tf } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { contentService, productService, reviewService } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCartCount, selectCartItems } from '@/store/selectors';
import { checkoutActions } from '@/store/slices/checkoutSlice';
import { historyActions } from '@/store/slices/historySlice';
import { addToCart, buildCartItem } from '@/store/thunks';
import { radius, shadows, spacing, useTheme } from '@/theme';
import type { Product, Variant } from '@/types/models';
import { toast } from '@/utils/toast';
import { DeliveryCheck } from './DeliveryCheck';
import { RatingSummary } from './RatingSummary';
import { ReviewItem } from './ReviewItem';

const SIZE_REQUIRED_LABELS = ['Size', 'UK Size', 'Waist', 'Frame'];

/** Product details page (PD-01…PD-11). */
export function ProductDetailsScreen({
  navigation,
  route,
}: RootScreenProps<'ProductDetails'>) {
  const { productId } = route.params;
  const dispatch = useAppDispatch();
  const { data, loading, reload } = useAsync(async () => {
    const [product, topReviews, offers] = await Promise.all([
      productService.getProduct(productId),
      reviewService.getTopReviews(productId, 3),
      contentService.getBankOffers(),
    ]);
    return { product, topReviews, offers };
  }, [productId]);

  useEffect(() => {
    dispatch(historyActions.viewed(productId)); // PD-11
  }, [dispatch, productId]);

  if (loading) return <PdpSkeleton />;
  if (!data?.product)
    return (
      <Screen header={<Header />}>
        <EmptyState
          icon="cube-outline"
          title={t.pdp.notFound}
          actionLabel={t.common.retry}
          onAction={reload}
        />
      </Screen>
    );
  return (
    <ProductDetailsView
      product={data.product}
      topReviews={data.topReviews}
      offers={data.offers}
      navigation={navigation}
    />
  );
}

function ProductDetailsView({
  product,
  topReviews,
  offers,
  navigation,
}: {
  product: Product;
  topReviews: Awaited<ReturnType<typeof reviewService.getTopReviews>>;
  offers: string[];
  navigation: RootScreenProps<'ProductDetails'>['navigation'];
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const fly = useFlyToCart();
  const requireAuth = useRequireAuth();
  const cartCount = useAppSelector(selectCartCount);
  const cartItems = useAppSelector(selectCartItems);
  const cartIconRef = useRef<React.ComponentRef<typeof View>>(null);
  const addBtnRef = useRef<React.ComponentRef<typeof View>>(null);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [sizeY, setSizeY] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);
  const [sizeError, setSizeError] = useState(false);

  // ----- Variant model (PD-03) -----
  const colorOptions = useMemo(() => {
    const seen = new Map<string, { name: string; hex: string }>();
    product.variants.forEach(
      v =>
        v.color && !seen.has(v.color.name) && seen.set(v.color.name, v.color),
    );
    return [...seen.values()];
  }, [product]);
  const sizeOptions = useMemo(
    () => [
      ...new Set(
        product.variants.map(v => v.size).filter((s): s is string => !!s),
      ),
    ],
    [product],
  );
  const sizeRequired =
    sizeOptions.length > 1 &&
    SIZE_REQUIRED_LABELS.includes(product.sizeLabel ?? '');
  const firstInStock =
    product.variants.find(v => v.stock > 0) ?? product.variants[0];
  const [color, setColor] = useState<string | null>(
    firstInStock.color?.name ?? null,
  );
  const [size, setSize] = useState<string | null>(
    sizeRequired ? null : firstInStock.size,
  );

  const matchesColor = (v: Variant) => !color || v.color?.name === color;
  const selected =
    product.variants.find(
      v => matchesColor(v) && (sizeOptions.length === 0 || v.size === size),
    ) ?? null;
  const display: Variant =
    selected ??
    product.variants.find(v => matchesColor(v) && v.stock > 0) ??
    product.variants.find(matchesColor) ??
    product.variants[0];
  const images =
    color && colorOptions[0] && color !== colorOptions[0].name
      ? display.images
      : product.images;
  const sizeLabel = (product.sizeLabel ?? 'Size').toLowerCase();
  const sizeInStock = (s: string) =>
    product.variants.some(v => matchesColor(v) && v.size === s && v.stock > 0);
  const colorInStock = (c: string) =>
    product.variants.some(v => v.color?.name === c && v.stock > 0);
  const productOos = product.stock <= 0;
  const variantOos = !!selected && selected.stock <= 0;
  const inCart =
    !!selected &&
    cartItems.some(
      i => i.productId === product.id && i.variantId === selected.id,
    );

  useEffect(() => setImgIndex(0), [color]);

  const ensureVariant = (): Variant | null => {
    if (sizeRequired && !size) {
      setSizeError(true);
      scrollRef.current?.scrollTo({
        y: Math.max(0, sizeY - spacing.lg),
        animated: true,
      });
      toast.info(tf(t.pdp.pleaseSelectSize, { label: sizeLabel }));
      return null;
    }
    if (!selected || selected.stock <= 0) {
      toast.error(t.common.outOfStock);
      return null;
    }
    return selected;
  };

  const onAdd = () => {
    if (inCart) {
      navigation.navigate('Main', {
        screen: 'CartTab',
        params: { screen: 'Cart' },
      });
      return;
    }
    const v = ensureVariant();
    if (!v) return;
    const res = dispatch(addToCart(product, v, 1));
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    addBtnRef.current?.measureInWindow((x, y, w) => {
      cartIconRef.current?.measureInWindow((cx, cy, cw, ch) =>
        fly({ x: x + w / 2, y }, { x: cx + cw / 2, y: cy + ch / 2 }),
      );
    });
    toast.success(t.pdp.addedToCart, {
      label: t.pdp.goToCart,
      onPress: () =>
        navigation.navigate('Main', {
          screen: 'CartTab',
          params: { screen: 'Cart' },
        }),
    });
  };

  const onBuyNow = () => {
    const v = ensureVariant();
    if (!v) return;
    requireAuth(() => {
      dispatch(
        checkoutActions.start({
          mode: 'buyNow',
          item: {
            ...buildCartItem(product, v, 1),
            addedAt: new Date().toISOString(),
            savedForLater: false,
          },
        }),
      );
      navigation.navigate('CheckoutAddress');
    });
  };

  const share = () =>
    Share.share({
      message: tf(t.pdp.shareMsg, {
        name: product.name,
        app: APP.name,
        url: `${APP.shareBaseUrl}${product.id}`,
      }),
    }).catch(() => undefined);

  const onScrollImg = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  const similar = useAsync(
    () => productService.getSimilar(product.id),
    [product.id],
  );
  const fbt = useAsync(
    () => productService.getFrequentlyBoughtTogether(product.id),
    [product.id],
  );

  const stockNote =
    !productOos &&
    selected &&
    selected.stock > 0 &&
    selected.stock <= RULES.stock.lowStockThreshold
      ? tf(t.common.onlyLeftSoon, { n: selected.stock })
      : null;

  return (
    <Screen
      background="surface"
      edges={['top', 'bottom']}
      header={
        <Header
          right={
            <>
              <IconButton
                name="search"
                accessibilityLabel="Search"
                onPress={() => navigation.navigate('Search')}
              />
              <IconButton
                name="share-social-outline"
                accessibilityLabel="Share"
                onPress={share}
              />
              <View ref={cartIconRef} collapsable={false}>
                <IconButton
                  name="bag-handle-outline"
                  accessibilityLabel={t.tabs.cart}
                  badge={cartCount}
                  onPress={() =>
                    navigation.navigate('Main', {
                      screen: 'CartTab',
                      params: { screen: 'Cart' },
                    })
                  }
                />
              </View>
            </>
          }
        />
      }
      footer={
        <View
          style={[
            styles.bar,
            shadows.lg,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          {productOos ? (
            <Button
              title={t.pdp.notifyMe}
              icon="notifications-outline"
              variant="secondary"
              onPress={() => toast.success(t.pdp.notifySet)}
            />
          ) : (
            <>
              <View ref={addBtnRef} collapsable={false} style={styles.flex}>
                <Button
                  title={inCart ? t.pdp.goToCart : t.pdp.addToCart}
                  variant="outline"
                  icon={inCart ? 'arrow-forward' : 'bag-add-outline'}
                  onPress={onAdd}
                  disabled={variantOos}
                  testID="pdp-add-to-cart"
                />
              </View>
              <View style={styles.flex}>
                <Button
                  title={t.pdp.buyNow}
                  icon="flash"
                  onPress={onBuyNow}
                  disabled={variantOos}
                  testID="pdp-buy-now"
                />
              </View>
            </>
          )}
        </View>
      }
    >
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* PD-01 gallery */}
        <View>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            keyExtractor={(img, i) => `${img}-${i}`}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollImg}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() =>
                  navigation.navigate('ImageGallery', { images, index })
                }
                style={{ width }}
                accessibilityLabel={t.pdp.tapToZoom}
              >
                <ProductImage
                  source={item}
                  rounded={false}
                  dimmed={productOos}
                />
              </Pressable>
            )}
          />
          <View style={styles.heart}>
            <WishlistHeart
              productId={product.id}
              price={display.price}
              size={22}
            />
          </View>
          <View style={styles.dots}>
            {images.map((img, i) => (
              <View
                key={`${img}-${i}`}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === imgIndex ? colors.accent : colors.border,
                    width: i === imgIndex ? 16 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* PD-02 title & price */}
        <View style={styles.section}>
          <AppText variant="label" color="primary">
            {product.brand}
          </AppText>
          <AppText variant="h2" weight="500" style={styles.name}>
            {product.name}
          </AppText>
          <Pressable
            onPress={() =>
              navigation.navigate('AllReviews', {
                productId: product.id,
                productName: product.name,
              })
            }
            style={styles.ratingRow}
            accessibilityRole="button"
          >
            <RatingBadge rating={product.rating} count={product.ratingCount} />
            <Icon name="chevron-forward" size={14} color={colors.textMuted} />
          </Pressable>
          {product.isDealOfDay ? (
            <View
              style={[styles.dealTag, { backgroundColor: colors.dangerSoft }]}
            >
              <AppText variant="caption" color="danger" weight="700">
                {t.home.dealOfDay.toUpperCase()}
              </AppText>
            </View>
          ) : null}
          <View style={styles.price}>
            <PriceTag price={display.price} mrp={display.mrp} size="lg" />
          </View>
          <AppText variant="caption" color="textMuted">
            {t.common.inclusiveTaxes}
          </AppText>
          {productOos || variantOos ? (
            <AppText variant="label" color="danger" style={styles.stock}>
              {t.common.outOfStock}
            </AppText>
          ) : stockNote ? (
            <AppText variant="label" color="warning" style={styles.stock}>
              {stockNote}
            </AppText>
          ) : null}
        </View>

        {/* PD-03 variants */}
        {colorOptions.length > 0 || sizeOptions.length > 0 ? (
          <View
            style={[
              styles.section,
              styles.bordered,
              { borderColor: colors.border },
            ]}
            onLayout={e => setSizeY(e.nativeEvent.layout.y)}
          >
            {colorOptions.length > 0 ? (
              <>
                <AppText variant="h3">
                  {t.pdp.selectColour}:{' '}
                  <AppText color="textSecondary">{color}</AppText>
                </AppText>
                <View style={styles.swatches}>
                  {colorOptions.map(c => {
                    const avail = colorInStock(c.name);
                    const active = c.name === color;
                    return (
                      <Pressable
                        key={c.name}
                        onPress={() => setColor(c.name)}
                        style={[
                          styles.swatchWrap,
                          {
                            borderColor: active ? colors.accent : 'transparent',
                            opacity: avail ? 1 : 0.4,
                          },
                        ]}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={`${c.name}${
                          avail ? '' : `, ${t.common.outOfStock}`
                        }`}
                      >
                        <View
                          style={[
                            styles.swatch,
                            {
                              backgroundColor: c.hex,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          {!avail ? (
                            <View
                              style={[
                                styles.strike,
                                { backgroundColor: colors.danger },
                              ]}
                            />
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}
            {sizeOptions.length > 0 ? (
              <View>
                <AppText
                  variant="h3"
                  color={sizeError && !size ? 'danger' : 'text'}
                  style={colorOptions.length ? styles.sizeTitle : undefined}
                >
                  {tf(t.pdp.selectSize, { label: sizeLabel })}
                </AppText>
                <View style={styles.sizes}>
                  {sizeOptions.map(s => {
                    const avail = sizeInStock(s);
                    const active = s === size;
                    return (
                      <Pressable
                        key={s}
                        disabled={!avail}
                        onPress={() => {
                          setSize(s);
                          setSizeError(false);
                        }}
                        style={[
                          styles.sizeChip,
                          {
                            borderColor: active
                              ? colors.accent
                              : sizeError && !size
                              ? colors.danger
                              : colors.border,
                            backgroundColor: active
                              ? colors.accentSoft
                              : avail
                              ? colors.surface
                              : colors.surfaceAlt,
                          },
                        ]}
                        accessibilityRole="radio"
                        accessibilityState={{
                          selected: active,
                          disabled: !avail,
                        }}
                        accessibilityLabel={`${s}${
                          avail ? '' : `, ${t.common.outOfStock}`
                        }`}
                      >
                        <AppText
                          variant="label"
                          color={
                            avail
                              ? active
                                ? 'accentDark'
                                : 'text'
                              : 'textMuted'
                          }
                          strike={!avail}
                        >
                          {s}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
                {sizeError && !size ? (
                  <AppText variant="caption" color="danger">
                    {tf(t.pdp.pleaseSelectSize, { label: sizeLabel })}
                  </AppText>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* PD-04 delivery */}
        <View
          style={[
            styles.section,
            styles.bordered,
            { borderColor: colors.border },
          ]}
        >
          <DeliveryCheck />
          <Divider style={styles.divider} />
          <View style={styles.policy}>
            <Icon
              name={
                product.isReturnable
                  ? 'refresh-circle-outline'
                  : 'close-circle-outline'
              }
              size={20}
              color={colors.primary}
            />
            <AppText variant="bodySm">
              {product.isReturnable
                ? tf(t.pdp.returnPolicy, { days: product.returnDays })
                : t.pdp.notReturnable}
            </AppText>
          </View>
          <View style={styles.policy}>
            <Icon name="storefront-outline" size={20} color={colors.primary} />
            <AppText variant="bodySm">
              {tf(t.pdp.soldBy, { seller: product.seller })}
            </AppText>
          </View>
        </View>

        {/* PD-05 offers */}
        <View
          style={[
            styles.section,
            styles.bordered,
            { borderColor: colors.border },
          ]}
        >
          <AppText variant="h3" style={styles.subTitle}>
            {t.pdp.offers}
          </AppText>
          {offers.map(o => (
            <View key={o} style={styles.offer}>
              <Icon name="pricetag" size={16} color={colors.success} />
              <AppText variant="bodySm" style={styles.flex}>
                {o}
              </AppText>
            </View>
          ))}
        </View>

        {/* PD-06 details */}
        <View
          style={[
            styles.section,
            styles.bordered,
            { borderColor: colors.border },
          ]}
        >
          <AppText variant="h3" style={styles.subTitle}>
            {t.pdp.highlights}
          </AppText>
          {product.highlights.map(h => (
            <View key={h} style={styles.offer}>
              <View
                style={[styles.bullet, { backgroundColor: colors.textMuted }]}
              />
              <AppText variant="bodySm" style={styles.flex}>
                {h}
              </AppText>
            </View>
          ))}
          <AppText variant="h3" style={[styles.subTitle, styles.mt]}>
            {t.pdp.description}
          </AppText>
          <AppText variant="bodySm" color="textSecondary">
            {product.description}
          </AppText>
          <AppText variant="h3" style={[styles.subTitle, styles.mt]}>
            {t.pdp.specifications}
          </AppText>
          <Card padded={false}>
            {Object.entries(product.specs).map(([k, v], i) => (
              <View
                key={k}
                style={[
                  styles.specRow,
                  i > 0 && {
                    borderTopColor: colors.border,
                    borderTopWidth: StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <AppText
                  variant="bodySm"
                  color="textMuted"
                  style={styles.specKey}
                >
                  {k}
                </AppText>
                <AppText variant="bodySm" style={styles.flex}>
                  {v}
                </AppText>
              </View>
            ))}
          </Card>
        </View>

        {/* PD-07 ratings */}
        <View
          style={[
            styles.section,
            styles.bordered,
            { borderColor: colors.border },
          ]}
        >
          <AppText variant="h3" style={styles.subTitle}>
            {t.pdp.ratingsReviews}
          </AppText>
          <RatingSummary
            rating={product.rating}
            count={product.ratingCount}
            breakdown={product.ratingBreakdown}
          />
          {topReviews.map(r => (
            <ReviewItem key={r.id} review={r} />
          ))}
          <Button
            title={t.pdp.seeAllReviews}
            variant="ghost"
            onPress={() =>
              navigation.navigate('AllReviews', {
                productId: product.id,
                productName: product.name,
              })
            }
          />
        </View>

        {/* PD-10 */}
        <ProductRail
          title={t.pdp.boughtTogether}
          products={fbt.data}
          loading={fbt.loading}
        />
        <ProductRail
          title={t.pdp.similar}
          products={similar.data}
          loading={similar.loading}
        />
      </ScrollView>
    </Screen>
  );
}

function PdpSkeleton() {
  return (
    <Screen background="surface" header={<Header />}>
      <Skeleton height={360} style={{ borderRadius: 0 }} />
      <View style={styles.section}>
        <Skeleton width="30%" />
        <Skeleton width="90%" height={20} style={styles.mt} />
        <Skeleton width="40%" style={styles.mt} />
        <Skeleton width="50%" height={28} style={styles.mt} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: spacing.xxxl },
  heart: { position: 'absolute', top: spacing.md, right: spacing.md },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
  },
  dot: { height: 6, borderRadius: 3 },
  section: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  bordered: { borderTopWidth: 8 },
  name: { marginTop: spacing.xs },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    minHeight: 32,
  },
  dealTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  price: { marginTop: spacing.sm },
  stock: { marginTop: spacing.sm },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  swatchWrap: { padding: 3, borderRadius: 24, borderWidth: 2 },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strike: { width: 48, height: 2, transform: [{ rotate: '45deg' }] },
  sizeTitle: { marginTop: spacing.xl },
  sizes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  sizeChip: {
    minWidth: 52,
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { marginVertical: spacing.lg },
  policy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  subTitle: { marginBottom: spacing.md },
  mt: { marginTop: spacing.lg },
  offer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bullet: { width: 5, height: 5, borderRadius: 3, marginTop: 8 },
  specRow: { flexDirection: 'row', padding: spacing.md, gap: spacing.md },
  specKey: { width: 120 },
  bar: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
