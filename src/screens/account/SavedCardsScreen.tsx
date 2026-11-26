import React from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import {
  AppText,
  Card,
  EmptyState,
  Header,
  Icon,
  IconButton,
  InfoBanner,
  Screen,
} from '@/components';
import { t } from '@/i18n';
import type { AccountScreenProps } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectSavedPayments, selectUser } from '@/store/selectors';
import { paymentsActions } from '@/store/slices/paymentsSlice';
import { spacing, useTheme } from '@/theme';
import { toast } from '@/utils/toast';

/** Saved cards / UPI (AC-03): masked only; view and delete. */
export function SavedCardsScreen(_: AccountScreenProps<'SavedCards'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const list = useAppSelector(selectSavedPayments);
  const remove = (id: string) =>
    Alert.alert(t.savedCards.deleteConfirm, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.remove,
        style: 'destructive',
        onPress: () => {
          if (user) dispatch(paymentsActions.remove({ userId: user.id, id }));
          toast.show(t.savedCards.removed);
        },
      },
    ]);
  return (
    <Screen header={<Header title={t.savedCards.title} />}>
      <FlatList
        data={list}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          list.length ? (
            <InfoBanner icon="lock-closed-outline" text={t.savedCards.note} />
          ) : undefined
        }
        ListEmptyComponent={
          <EmptyState
            icon="card-outline"
            title={t.savedCards.emptyTitle}
            body={t.savedCards.emptyBody}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <View
              style={[styles.icon, { backgroundColor: colors.primarySoft }]}
            >
              <Icon
                name={
                  item.type === 'upi'
                    ? 'phone-portrait-outline'
                    : 'card-outline'
                }
                size={22}
                color={colors.primary}
              />
            </View>
            <View style={styles.flex}>
              <AppText variant="h3">
                {item.type === 'upi' ? item.upiId : item.label}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {item.type === 'upi' ? t.checkout.upi : t.checkout.card}
              </AppText>
            </View>
            <IconButton
              name="trash-outline"
              color={colors.danger}
              accessibilityLabel={t.common.remove}
              onPress={() => remove(item.id)}
            />
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
