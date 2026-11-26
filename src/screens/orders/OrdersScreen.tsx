import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  AppText,
  Chip,
  EmptyState,
  Header,
  Icon,
  OrderStatusChip,
  ProductImage,
  Screen,
  TextField,
} from '@/components';
import { t, tf } from '@/i18n';
import type { AccountScreenProps } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUserOrders } from '@/store/selectors';
import { syncOrderStatuses } from '@/store/thunks';
import { spacing, useTheme } from '@/theme';
import type { Order } from '@/types/models';
import { formatDate, formatDeliveryDate } from '@/utils/date';
import { StatusGroup, statusGroup } from '@/utils/orderStatus';

type Filter = 'all' | StatusGroup;
const FILTERS: Filter[] = [
  'all',
  'active',
  'delivered',
  'cancelled',
  'returned',
];

export function orderSubtitle(o: Order) {
  if (o.status === 'delivered') {
    const ev = o.statusHistory.find(h => h.status === 'delivered');
    return tf(t.orders.deliveredOn, {
      date: formatDate(ev?.at ?? o.expectedDelivery),
    });
  }
  if (statusGroup(o.status) === 'active')
    return tf(t.orders.arrivingBy, {
      date: formatDeliveryDate(new Date(o.expectedDelivery)),
    });
  return tf(t.orders.placedOn, { date: formatDate(o.placedAt) });
}

/** My orders (OR-01): status filter + search. */
export function OrdersScreen({ navigation }: AccountScreenProps<'Orders'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectUserOrders);
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');

  useFocusEffect(
    useCallback(() => {
      dispatch(syncOrderStatuses());
    }, [dispatch]),
  );

  const data = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orders
      .filter(o => filter === 'all' || statusGroup(o.status) === filter)
      .filter(
        o =>
          !needle ||
          o.id.toLowerCase().includes(needle) ||
          o.items.some(
            i =>
              i.name.toLowerCase().includes(needle) ||
              i.brand.toLowerCase().includes(needle),
          ),
      );
  }, [orders, filter, q]);

  return (
    <Screen header={<Header title={t.orders.title} />}>
      <View
        style={[
          styles.top,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TextField
          value={q}
          onChangeText={setQ}
          placeholder={t.orders.searchPlaceholder}
          leftIcon="search"
          containerStyle={styles.search}
          returnKeyType="search"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map(f => (
            <Chip
              key={f}
              label={t.orders.filters[f]}
              selected={filter === f}
              onPress={() => setFilter(f)}
            />
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={data}
        keyExtractor={o => o.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title={t.orders.emptyTitle}
            body={t.orders.emptyBody}
            actionLabel={t.wishlist.startShopping}
            onAction={() =>
              navigation.navigate('Main', {
                screen: 'HomeTab',
                params: { screen: 'Home' },
              })
            }
          />
        }
        renderItem={({ item: o }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('OrderDetails', { orderId: o.id })
            }
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: pressed ? colors.surfaceAlt : colors.surface,
                borderColor: colors.border,
              },
            ]}
            accessibilityRole="button"
            testID={`order-${o.id}`}
          >
            <View style={styles.img}>
              <ProductImage source={o.items[0].image} />
            </View>
            <View style={styles.body}>
              <OrderStatusChip status={o.status} />
              <AppText variant="bodySm" numberOfLines={2}>
                {o.items[0].name}
                {o.items.length > 1 ? (
                  <AppText variant="bodySm" color="textMuted">{`  ${tf(
                    t.orders.moreItems,
                    { n: o.items.length - 1 },
                  )}`}</AppText>
                ) : null}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {orderSubtitle(o)}
              </AppText>
            </View>
            <Icon name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  search: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  list: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  img: { width: 72 },
  body: { flex: 1, gap: spacing.xs },
});
