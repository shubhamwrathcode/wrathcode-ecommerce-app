import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { AppText, Icon, ProductImage, RatingBadge } from '@/components';
import { t, tf } from '@/i18n';
import { reviewService } from '@/services';
import { spacing, useTheme } from '@/theme';
import type { Review } from '@/types/models';
import { formatDate } from '@/utils/date';

export const ReviewItem = React.memo(function ReviewItemView({
  review,
}: {
  review: Review;
}) {
  const { colors } = useTheme();
  const [helpful, setHelpful] = useState(review.helpfulCount);
  const [voted, setVoted] = useState(false);
  return (
    <View style={[styles.wrap, { borderBottomColor: colors.border }]}>
      <View style={styles.row}>
        <RatingBadge rating={review.rating} />
        <AppText variant="h3" style={styles.flex} numberOfLines={1}>
          {review.title}
        </AppText>
      </View>
      <AppText variant="bodySm" color="textSecondary" style={styles.text}>
        {review.text}
      </AppText>
      {review.images.length ? (
        <View style={styles.images}>
          {review.images.map(img =>
            img.startsWith('pi|') ? (
              <ProductImage key={img} source={img} size={64} />
            ) : (
              <Image
                key={img}
                source={{ uri: img }}
                style={[styles.photo, { backgroundColor: colors.surfaceAlt }]}
              />
            ),
          )}
        </View>
      ) : null}
      <View style={styles.meta}>
        <AppText variant="caption" color="textMuted" style={styles.flex}>
          {review.userName} · {review.isLocal ? 'You' : t.pdp.verifiedBuyer} ·{' '}
          {formatDate(review.date)}
        </AppText>
        <Pressable
          disabled={voted}
          onPress={() => {
            setVoted(true);
            setHelpful(h => h + 1);
            reviewService.markHelpful(review.id);
          }}
          hitSlop={10}
          style={styles.helpful}
          accessibilityRole="button"
        >
          <Icon
            name={voted ? 'thumbs-up' : 'thumbs-up-outline'}
            size={14}
            color={voted ? colors.primary : colors.textMuted}
          />
          <AppText variant="caption" color={voted ? 'primary' : 'textMuted'}>
            {tf(t.pdp.helpful, { n: helpful })}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { marginTop: spacing.xs },
  images: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  helpful: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
