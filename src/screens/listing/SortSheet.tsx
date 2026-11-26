import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheet, RadioRow } from '@/components';
import { t } from '@/i18n';
import { spacing } from '@/theme';
import type { SortOption } from '@/types/models';

const OPTIONS: SortOption[] = [
  'relevance',
  'price_asc',
  'price_desc',
  'rating',
  'newest',
  'discount',
];

/** Sort bottom sheet (PL-03). */
export function SortSheet({
  visible,
  value,
  onClose,
  onSelect,
}: {
  visible: boolean;
  value: SortOption;
  onClose: () => void;
  onSelect: (s: SortOption) => void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t.plp.sortBy}>
      <View style={styles.body}>
        {OPTIONS.map(o => (
          <RadioRow
            key={o}
            title={t.plp.sortOptions[o]}
            selected={value === o}
            onPress={() => {
              onSelect(o);
              onClose();
            }}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
});
