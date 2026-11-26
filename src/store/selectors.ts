import { createSelector } from '@reduxjs/toolkit';
import type { Address, CartItem } from '@/types/models';
import type { PricingLine } from '@/utils/price';
import type { RootState } from './rootReducer';
import type { WishlistItem } from './slices/wishlistSlice';

const EMPTY_CART: CartItem[] = [];
const EMPTY_WISH: WishlistItem[] = [];

export const selectUser = (s: RootState) => s.auth.user;
export const selectIsLoggedIn = (s: RootState) => !!s.auth.user;
export const selectHasSession = (s: RootState) =>
  !!s.auth.user || s.auth.isGuest;
export const selectOwner = (s: RootState) => s.auth.user?.id ?? 'guest';

export const selectAllCartItems = (s: RootState) =>
  s.cart.carts[selectOwner(s)] ?? EMPTY_CART;
export const selectCartItems = createSelector(selectAllCartItems, items =>
  items.filter(i => !i.savedForLater),
);
export const selectSavedForLater = createSelector(selectAllCartItems, items =>
  items.filter(i => i.savedForLater),
);
export const selectCartCount = createSelector(selectCartItems, items =>
  items.reduce((n, i) => n + i.qty, 0),
);
export const selectCoupon = (s: RootState) => s.cart.coupon;

export const toPricingLines = (items: CartItem[]): PricingLine[] =>
  items.map(i => ({
    price: i.snapshot.price,
    mrp: i.snapshot.mrp,
    qty: i.qty,
    categoryId: i.snapshot.categoryId,
    isDealOfDay: i.snapshot.isDealOfDay,
  }));
export const selectCartPricingLines = createSelector(
  selectCartItems,
  toPricingLines,
);

export const selectWishlist = (s: RootState) =>
  s.wishlist.lists[selectOwner(s)] ?? EMPTY_WISH;
export const selectWishlistIds = createSelector(
  selectWishlist,
  l => new Set(l.map(i => i.productId)),
);

export const selectUserOrders = createSelector(
  [(s: RootState) => s.orders.list, selectUser],
  (list, user) => (user ? list.filter(o => o.userId === user.id) : []),
);
export const selectIsFirstOrder = createSelector(
  selectUserOrders,
  o => o.length === 0,
);

export const selectUserAddresses = createSelector(
  [(s: RootState) => s.address.list, selectUser],
  (list, user): Address[] =>
    user
      ? list
          .filter(a => a.userId === user.id)
          .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
      : [],
);
export const selectDefaultAddress = createSelector(
  selectUserAddresses,
  l => l.find(a => a.isDefault) ?? l[0] ?? null,
);

/** The address shown in the "Deliver to" strip (HM-02). */
export const selectDeliveryAddress = createSelector(
  [
    selectUserAddresses,
    selectDefaultAddress,
    (s: RootState) => s.address.selectedId,
  ],
  (list, def, selectedId) => list.find(a => a.id === selectedId) ?? def,
);
export const selectDeliveryPincode = (s: RootState): string | null =>
  selectDeliveryAddress(s)?.pincode ?? s.address.guestPincode;

export const selectUnreadCount = (s: RootState) =>
  s.notifications.list.filter(n => !n.isRead).length;

export const selectCheckoutItems = createSelector(
  [
    (s: RootState) => s.checkout.mode,
    (s: RootState) => s.checkout.buyNowItem,
    selectCartItems,
  ],
  (mode, buyNow, cart) => (mode === 'buyNow' && buyNow ? [buyNow] : cart),
);

export const selectSavedPayments = (s: RootState) =>
  s.auth.user ? s.payments.saved[s.auth.user.id] ?? [] : [];
