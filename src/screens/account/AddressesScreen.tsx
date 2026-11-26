import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import {
  AddressText,
  AppText,
  Button,
  Card,
  Divider,
  EmptyState,
  Header,
  Screen,
} from '@/components';
import { RULES } from '@/config/rules';
import { t, tf } from '@/i18n';
import type { AccountScreenProps } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser, selectUserAddresses } from '@/store/selectors';
import { addressActions } from '@/store/slices/addressSlice';
import { spacing, useTheme } from '@/theme';
import { toast } from '@/utils/toast';

/** Saved addresses (AC-02): add, edit, delete, set default; max 5. */
export function AddressesScreen({
  navigation,
}: AccountScreenProps<'Addresses'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const list = useAppSelector(selectUserAddresses);
  const full = list.length >= RULES.addresses.max;

  const remove = (id: string) =>
    Alert.alert(t.address.deleteConfirm, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          dispatch(addressActions.remove({ id }));
          toast.show(t.address.deleted);
        },
      },
    ]);

  const action = (label: string, onPress: () => void, danger?: boolean) => (
    <Pressable
      onPress={onPress}
      style={styles.action}
      hitSlop={6}
      accessibilityRole="button"
    >
      <AppText variant="label" color={danger ? 'danger' : 'accent'}>
        {label}
      </AppText>
    </Pressable>
  );

  return (
    <Screen
      edges={['top', 'bottom']}
      header={
        <Header
          title={t.address.title}
          subtitle={`${list.length}/${RULES.addresses.max}`}
        />
      }
      footer={
        <View
          style={[
            styles.footer,
            { borderTopColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Button
            title={t.address.add}
            icon="add"
            onPress={() =>
              full
                ? toast.error(tf(t.address.max, { n: RULES.addresses.max }))
                : navigation.navigate('AddEditAddress')
            }
          />
        </View>
      }
    >
      <FlatList
        data={list}
        keyExtractor={a => a.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="location-outline"
            title={t.address.emptyTitle}
            body={t.address.emptyBody}
          />
        }
        renderItem={({ item }) => (
          <Card padded={false}>
            <View style={styles.body}>
              <AddressText address={item} />
            </View>
            <Divider />
            <View style={styles.actions}>
              {action(t.common.edit, () =>
                navigation.navigate('AddEditAddress', { addressId: item.id }),
              )}
              {action(t.common.delete, () => remove(item.id), true)}
              {!item.isDefault && user
                ? action(t.address.setDefault, () =>
                    dispatch(
                      addressActions.setDefault({
                        id: item.id,
                        userId: user.id,
                      }),
                    ),
                  )
                : null}
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  body: { padding: spacing.lg },
  actions: { flexDirection: 'row' },
  action: {
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    justifyContent: 'center',
  },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
});
