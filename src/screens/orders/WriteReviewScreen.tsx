import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  AppText,
  Button,
  Card,
  Header,
  Icon,
  ProductImage,
  Screen,
  StarInput,
  TextField,
} from '@/components';
import { t } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { reviewService } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ordersActions } from '@/store/slices/ordersSlice';
import { radius, spacing, useTheme } from '@/theme';
import { toast } from '@/utils/toast';

/** Rate & review a delivered item (OR-06): stars required, optional photo from gallery. */
export function WriteReviewScreen({
  navigation,
  route,
}: RootScreenProps<'WriteReview'>) {
  const { orderId, productId, variantId, name, image } = route.params;
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pick = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.6,
        maxWidth: 1080,
        maxHeight: 1080,
      });
      const uri = res.assets?.[0]?.uri;
      if (uri) setPhoto(uri);
    } catch {
      toast.error(t.common.somethingWrong);
    }
  };

  const submit = async () => {
    if (!rating) return setError(t.validation.rating);
    setLoading(true);
    await reviewService.addReview({
      productId,
      userName: user?.name ?? 'You',
      rating,
      title: title.trim() || t.reviews.ratingLabels[rating - 1],
      text: text.trim(),
      images: photo ? [photo] : [],
    });
    dispatch(ordersActions.markReviewed({ orderId, variantId }));
    setLoading(false);
    toast.success(t.reviews.thanks);
    navigation.goBack();
  };

  return (
    <Screen
      keyboard
      edges={['top', 'bottom']}
      header={<Header title={t.reviews.writeTitle} />}
      footer={
        <View
          style={[
            styles.footer,
            { borderTopColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Button title={t.reviews.submit} onPress={submit} loading={loading} />
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.product}>
          <View style={styles.img}>
            <ProductImage source={image} />
          </View>
          <AppText variant="bodySm" numberOfLines={2} style={styles.flex}>
            {name}
          </AppText>
        </Card>
        <AppText variant="h3" align="center">
          {t.reviews.howWould}
        </AppText>
        <View style={styles.stars}>
          <StarInput
            value={rating}
            onChange={v => {
              setRating(v);
              setError(null);
            }}
          />
          <AppText variant="label" color={rating ? 'accent' : 'textMuted'}>
            {rating ? t.reviews.ratingLabels[rating - 1] : ' '}
          </AppText>
          {error ? (
            <AppText variant="caption" color="danger">
              {error}
            </AppText>
          ) : null}
        </View>
        <TextField
          label={t.reviews.reviewTitle}
          placeholder={t.reviews.reviewTitlePh}
          value={title}
          onChangeText={setTitle}
          maxLength={80}
        />
        <TextField
          label={t.reviews.reviewText}
          placeholder={t.reviews.reviewTextPh}
          value={text}
          onChangeText={setText}
          multiline
          style={styles.text}
          maxLength={1000}
        />
        <Pressable
          onPress={pick}
          style={[styles.photo, { borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel={t.reviews.addPhoto}
        >
          {photo ? (
            <Image source={{ uri: photo }} style={styles.preview} />
          ) : (
            <>
              <Icon name="camera-outline" size={26} color={colors.primary} />
              <AppText variant="caption" color="primary">
                {t.reviews.addPhoto}
              </AppText>
            </>
          )}
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  product: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  img: { width: 56 },
  stars: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  text: { minHeight: 110, textAlignVertical: 'top' },
  photo: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
});
