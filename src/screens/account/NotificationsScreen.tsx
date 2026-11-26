import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { AppText, Chip, EmptyState, Header, Icon, Screen } from '@/components';
import { t } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { notificationsActions } from '@/store/slices/notificationsSlice';
import { spacing, useTheme } from '@/theme';
import type { NotificationType } from '@/types/models';
import { timeAgo } from '@/utils/date';

/** Notifications (AC-04): order updates and offers with read / unread state. */
export function NotificationsScreen({
  navigation,
}: RootScreenProps<'Notifications'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const list = useAppSelector(s => s.notifications.list);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const data = useMemo(
    () => list.filter(n => filter === 'all' || n.type === filter),
    [list, filter],
  );
  const unread = list.some(n => !n.isRead);

  return (
    <Screen
      header={
        <Header
          title={t.notifications.title}
          right={
            unread ? (
              <Pressable
                onPress={() => dispatch(notificationsActions.markAllRead())}
                hitSlop={10}
                style={styles.markAll}
                accessibilityRole="button"
              >
                <AppText variant="label" color="accent">
                  {t.notifications.markAll}
                </AppText>
              </Pressable>
            ) : undefined
          }
        />
      }
    >
      <View
        style={[
          styles.chips,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Chip
          label={t.orders.filters.all}
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        <Chip
          label={t.notifications.orders}
          icon="cube-outline"
          selected={filter === 'order'}
          onPress={() => setFilter('order')}
        />
        <Chip
          label={t.notifications.offers}
          icon="pricetag-outline"
          selected={filter === 'offer'}
          onPress={() => setFilter('offer')}
        />
      </View>
      <FlatList
        data={data}
        keyExtractor={n => n.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title={t.notifications.emptyTitle}
            body={t.notifications.emptyBody}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              dispatch(notificationsActions.markRead(item.id));
              if (item.orderId)
                navigation.navigate('OrderDetails', { orderId: item.orderId });
              else if (item.type === 'offer')
                navigation.navigate('Main', {
                  screen: 'HomeTab',
                  params: { screen: 'Offers' },
                });
            }}
            style={[
              styles.row,
              {
                backgroundColor: item.isRead
                  ? colors.surface
                  : colors.primarySoft,
                borderBottomColor: colors.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${item.isRead ? '' : 'Unread. '}${item.title}`}
          >
            <View
              style={[
                styles.icon,
                {
                  backgroundColor:
                    item.type === 'order'
                      ? colors.primarySoft
                      : colors.accentSoft,
                },
              ]}
            >
              <Icon
                name={
                  item.type === 'order' ? 'cube-outline' : 'pricetag-outline'
                }
                size={20}
                color={item.type === 'order' ? colors.primary : colors.accent}
              />
            </View>
            <View style={styles.flex}>
              <AppText variant="h3" weight={item.isRead ? '500' : '700'}>
                {item.title}
              </AppText>
              <AppText variant="bodySm" color="textSecondary">
                {item.body}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {timeAgo(item.createdAt)}
              </AppText>
            </View>
            {!item.isRead ? (
              <View style={[styles.dot, { backgroundColor: colors.accent }]} />
            ) : null}
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  markAll: {
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  list: { flexGrow: 1 },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
});
