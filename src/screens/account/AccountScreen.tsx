import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  AppText,
  Button,
  Card,
  Divider,
  Header,
  Icon,
  ListRow,
  Screen,
} from '@/components';
import { APP } from '@/config/app';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { t, tf } from '@/i18n';
import type { AccountScreenProps } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectUnreadCount,
  selectUserOrders,
  selectWishlist,
} from '@/store/selectors';
import { logout } from '@/store/thunks';
import { gradients, linear, radius, spacing, useTheme } from '@/theme';
import { initials, maskMobile } from '@/utils/format';
import { toast } from '@/utils/toast';

/** Profile / Account (AC-01) hub. */
export function AccountScreen({ navigation }: AccountScreenProps<'Account'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const requireAuth = useRequireAuth();
  const user = useAppSelector(s => s.auth.user);
  const unread = useAppSelector(selectUnreadCount);
  const orders = useAppSelector(selectUserOrders);
  const wish = useAppSelector(selectWishlist);

  const onLogout = () =>
    Alert.alert(t.account.logout, t.account.logoutConfirm, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.account.logout,
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
          toast.show(t.account.loggedOut);
        },
      },
    ]);

  const tiles = [
    {
      icon: 'receipt-outline',
      label: t.account.orders,
      badge: orders.length,
      onPress: () => requireAuth(() => navigation.navigate('Orders')),
    },
    {
      icon: 'heart-outline',
      label: t.tabs.wishlist,
      badge: wish.length,
      onPress: () =>
        navigation.navigate('Main', {
          screen: 'WishlistTab',
          params: { screen: 'Wishlist' },
        }),
    },
    {
      icon: 'pricetags-outline',
      label: t.account.offers,
      onPress: () =>
        navigation.navigate('Main', {
          screen: 'HomeTab',
          params: { screen: 'Offers' },
        }),
    },
    {
      icon: 'help-buoy-outline',
      label: t.help.title,
      onPress: () => navigation.navigate('Help'),
    },
  ];

  return (
    <Screen header={<Header title={t.account.title} back={false} />}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.profile}>
          {user ? (
            <>
              <View
                style={[styles.avatar, linear(gradients.brand, 135)]}
              >
                <AppText variant="h1" color={colors.textOnPrimary}>
                  {initials(user.name)}
                </AppText>
              </View>
              <View style={styles.flex}>
                <AppText variant="h2">{user.name}</AppText>
                <AppText variant="bodySm" color="textSecondary">
                  {maskMobile(user.mobile)}
                </AppText>
                {user.email ? (
                  <AppText variant="caption" color="textMuted">
                    {user.email}
                  </AppText>
                ) : null}
              </View>
              <Pressable
                onPress={() => navigation.navigate('EditProfile')}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={t.account.editProfile}
              >
                <Icon name="create-outline" size={22} color={colors.accent} />
              </Pressable>
            </>
          ) : (
            <View style={styles.flex}>
              <AppText variant="h2">{t.account.guestTitle}</AppText>
              <AppText
                variant="bodySm"
                color="textSecondary"
                style={styles.guestBody}
              >
                {t.account.guestBody}
              </AppText>
              <Button
                title={t.account.loginSignup}
                onPress={() => navigation.navigate('Login', { redirect: true })}
              />
            </View>
          )}
        </Card>

        <View style={styles.tiles}>
          {tiles.map(tile => (
            <Pressable
              key={tile.label}
              onPress={tile.onPress}
              style={[
                styles.tile,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              accessibilityRole="button"
            >
              <Icon name={tile.icon} size={24} color={colors.primary} />
              <AppText variant="caption" align="center" numberOfLines={1}>
                {tile.label}
              </AppText>
              {tile.badge ? (
                <View
                  style={[styles.tileBadge, linear(gradients.brand, 135)]}
                >
                  <AppText
                    variant="caption"
                    color="#FFFFFF"
                    style={styles.tileBadgeText}
                  >
                    {tile.badge}
                  </AppText>
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>

        <Card padded={false} style={styles.menu}>
          <ListRow
            icon="location-outline"
            title={t.account.addresses}
            onPress={() => requireAuth(() => navigation.navigate('Addresses'))}
          />
          <Divider />
          <ListRow
            icon="card-outline"
            title={t.account.savedCards}
            onPress={() => requireAuth(() => navigation.navigate('SavedCards'))}
          />
          <Divider />
          <ListRow
            icon="notifications-outline"
            title={t.account.notifications}
            onPress={() => navigation.navigate('Notifications')}
            right={
              unread ? (
                <View style={[styles.pill, linear(gradients.brand, 135)]}>
                  <AppText variant="caption" color="#FFFFFF">
                    {unread}
                  </AppText>
                </View>
              ) : undefined
            }
          />
          <Divider />
          <ListRow
            icon="settings-outline"
            title={t.account.settings}
            onPress={() => navigation.navigate('Settings')}
          />
        </Card>

        <Card padded={false} style={styles.menu}>
          <ListRow
            icon="information-circle-outline"
            title={tf(t.account.about, { app: APP.name })}
            onPress={() => navigation.navigate('About')}
          />
          <Divider />
          <ListRow
            icon="document-text-outline"
            title={t.account.terms}
            onPress={() => navigation.navigate('Legal', { kind: 'terms' })}
          />
          <Divider />
          <ListRow
            icon="shield-outline"
            title={t.account.privacy}
            onPress={() => navigation.navigate('Legal', { kind: 'privacy' })}
          />
        </Card>

        {user ? (
          <Card padded={false} style={styles.menu}>
            <ListRow
              icon="log-out-outline"
              title={t.account.logout}
              danger
              chevron={false}
              onPress={onLogout}
            />
          </Card>
        ) : null}
        <AppText
          variant="caption"
          color="textMuted"
          align="center"
          style={styles.version}
        >
          {APP.name} · {tf(t.account.version, { v: APP.version })}
        </AppText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBody: { marginVertical: spacing.md },
  tiles: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tileBadge: {
    position: 'absolute',
    top: 6,
    right: 10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tileBadgeText: { fontSize: 10, lineHeight: 12 },
  menu: { overflow: 'hidden' },
  pill: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  version: { marginTop: spacing.lg },
});
