import {
  BottomTabBarButtonProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { Icon } from '@/components';
import { t } from '@/i18n';
import { AboutScreen } from '@/screens/account/AboutScreen';
import { AccountScreen } from '@/screens/account/AccountScreen';
import { AddressesScreen } from '@/screens/account/AddressesScreen';
import { EditProfileScreen } from '@/screens/account/EditProfileScreen';
import { SavedCardsScreen } from '@/screens/account/SavedCardsScreen';
import { SettingsScreen } from '@/screens/account/SettingsScreen';
import { ApplyCouponScreen } from '@/screens/cart/ApplyCouponScreen';
import { CartScreen } from '@/screens/cart/CartScreen';
import { CategoriesScreen } from '@/screens/categories/CategoriesScreen';
import { SubCategoriesScreen } from '@/screens/categories/SubCategoriesScreen';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { OffersScreen } from '@/screens/home/OffersScreen';
import { OrdersScreen } from '@/screens/orders/OrdersScreen';
import { HelpScreen } from '@/screens/support/HelpScreen';
import { WishlistScreen } from '@/screens/wishlist/WishlistScreen';
import { useAppSelector } from '@/store/hooks';
import { selectCartCount, selectWishlist } from '@/store/selectors';
import { robotoFamily, usesRoboto, useTheme } from '@/theme';
import type {
  AccountStackParamList,
  CartStackParamList,
  CategoriesStackParamList,
  HomeStackParamList,
  MainTabParamList,
  WishlistStackParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CategoriesStack = createNativeStackNavigator<CategoriesStackParamList>();
const WishlistStack = createNativeStackNavigator<WishlistStackParamList>();
const CartStack = createNativeStackNavigator<CartStackParamList>();
const AccountStack = createNativeStackNavigator<AccountStackParamList>();

const noHeader = { headerShown: false } as const;

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={noHeader}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Offers" component={OffersScreen} />
    </HomeStack.Navigator>
  );
}
function CategoriesNavigator() {
  return (
    <CategoriesStack.Navigator screenOptions={noHeader}>
      <CategoriesStack.Screen name="Categories" component={CategoriesScreen} />
      <CategoriesStack.Screen
        name="SubCategories"
        component={SubCategoriesScreen}
      />
    </CategoriesStack.Navigator>
  );
}
function WishlistNavigator() {
  return (
    <WishlistStack.Navigator screenOptions={noHeader}>
      <WishlistStack.Screen name="Wishlist" component={WishlistScreen} />
    </WishlistStack.Navigator>
  );
}
function CartNavigator() {
  return (
    <CartStack.Navigator screenOptions={noHeader}>
      <CartStack.Screen name="Cart" component={CartScreen} />
      <CartStack.Screen name="ApplyCoupon" component={ApplyCouponScreen} />
    </CartStack.Navigator>
  );
}
function AccountNavigator() {
  return (
    <AccountStack.Navigator screenOptions={noHeader}>
      <AccountStack.Screen name="Account" component={AccountScreen} />
      <AccountStack.Screen name="EditProfile" component={EditProfileScreen} />
      <AccountStack.Screen name="Orders" component={OrdersScreen} />
      <AccountStack.Screen name="Addresses" component={AddressesScreen} />
      <AccountStack.Screen name="SavedCards" component={SavedCardsScreen} />
      <AccountStack.Screen name="Help" component={HelpScreen} />
      <AccountStack.Screen name="Settings" component={SettingsScreen} />
      <AccountStack.Screen name="About" component={AboutScreen} />
    </AccountStack.Navigator>
  );
}

/** Cart icon bounces whenever the item count goes up (add-to-cart feedback). */
function CartTabIcon({
  color,
  focused,
  size,
}: {
  color: string;
  focused: boolean;
  size: number;
}) {
  const count = useAppSelector(selectCartCount);
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef(count);
  useEffect(() => {
    if (count > prev.current) {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.3,
          useNativeDriver: true,
          speed: 40,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
        }),
      ]).start();
    }
    prev.current = count;
  }, [count, scale]);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Icon
        name={focused ? 'bag-handle' : 'bag-handle-outline'}
        size={size}
        color={color}
      />
    </Animated.View>
  );
}

const TabButton = (props: BottomTabBarButtonProps) => {
  const { children, style, onPress, onLongPress, accessibilityState, testID } =
    props;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={accessibilityState}
      testID={testID}
      style={style}
    >
      {children}
    </Pressable>
  );
};

const icon = (name: string) =>
  function TabIcon({
    color,
    focused,
    size,
  }: {
    color: string;
    focused: boolean;
    size: number;
  }) {
    return (
      <Icon
        name={focused ? name : `${name}-outline`}
        size={size}
        color={color}
      />
    );
  };
const HomeIcon = icon('home');
const CategoriesIcon = icon('grid');
const WishlistIcon = icon('heart');
const AccountIcon = icon('person');

export function MainTabs() {
  const { colors } = useTheme();
  const cartCount = useAppSelector(selectCartCount);
  const wishCount = useAppSelector(s => selectWishlist(s).length);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          ...(usesRoboto
            ? { fontFamily: robotoFamily('600'), fontWeight: 'normal' }
            : { fontWeight: '600' }),
        },
        tabBarButton: TabButton,
        tabBarBadgeStyle: {
          backgroundColor: colors.accent,
          color: '#FFFFFF',
          fontSize: 10,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{ title: t.tabs.home, tabBarIcon: HomeIcon }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesNavigator}
        options={{ title: t.tabs.categories, tabBarIcon: CategoriesIcon }}
      />
      <Tab.Screen
        name="WishlistTab"
        component={WishlistNavigator}
        // "The Wishlist tab shows a dot when it has items" (section 4.1)
        options={{
          title: t.tabs.wishlist,
          tabBarIcon: WishlistIcon,
          tabBarBadge: wishCount ? '' : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.accent,
            minWidth: 9,
            maxHeight: 9,
            borderRadius: 5,
            marginTop: 4,
          },
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartNavigator}
        options={{
          title: t.tabs.cart,
          tabBarIcon: CartTabIcon,
          tabBarBadge: cartCount || undefined,
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountNavigator}
        options={{ title: t.tabs.account, tabBarIcon: AccountIcon }}
      />
    </Tab.Navigator>
  );
}
