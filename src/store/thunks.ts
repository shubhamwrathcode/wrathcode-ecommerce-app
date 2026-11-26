import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import { RULES } from '@/config/rules';
import {
  couponService,
  db,
  demoService,
  notificationService,
  orderService,
  productService,
} from '@/services';
import type {
  AppNotification,
  CartItem,
  Order,
  Product,
  ReturnRequest,
  SavedPayment,
  User,
  Variant,
} from '@/types/models';
import { uid } from '@/utils/id';
import { STATUS_LABEL } from '@/utils/orderStatus';
import { computePriceBreakup, toPriceBreakup } from '@/utils/price';
import { resetApp } from './actions';
import type { RootState } from './rootReducer';
import {
  selectCheckoutItems,
  selectCoupon,
  selectDefaultAddress,
  selectIsFirstOrder,
  selectOwner,
  selectUserAddresses,
  toPricingLines,
} from './selectors';
import { addressActions } from './slices/addressSlice';
import { authActions } from './slices/authSlice';
import { cartActions, maxQty } from './slices/cartSlice';
import { checkoutActions } from './slices/checkoutSlice';
import { notificationsActions } from './slices/notificationsSlice';
import { ordersActions } from './slices/ordersSlice';
import { paymentsActions } from './slices/paymentsSlice';
import { wishlistActions } from './slices/wishlistSlice';

export type AppThunk<R = void> = ThunkAction<
  R,
  RootState,
  unknown,
  UnknownAction
>;

export const variantLabel = (v: Variant, sizeLabel: string | null) =>
  [
    v.color?.name,
    v.size
      ? sizeLabel && sizeLabel !== 'Size'
        ? v.size
        : `Size ${v.size}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

export function buildCartItem(
  product: Product,
  variant: Variant,
  qty = 1,
): Omit<CartItem, 'addedAt' | 'savedForLater'> {
  return {
    productId: product.id,
    variantId: variant.id,
    qty,
    snapshot: {
      name: product.name,
      brand: product.brand,
      image: variant.images[0] ?? product.images[0],
      price: variant.price,
      mrp: variant.mrp,
      categoryId: product.categoryId,
      isDealOfDay: product.isDealOfDay,
      isReturnable: product.isReturnable,
      variantLabel: variantLabel(variant, product.sizeLabel),
    },
  };
}

export type AddToCartResult =
  | { ok: true; capped: boolean }
  | { ok: false; message: string };

/** Adds to cart respecting max qty = min(5, stock) (CT-02, 7.4). */
export const addToCart =
  (product: Product, variant: Variant, qty = 1): AppThunk<AddToCartResult> =>
  (dispatch, getState) => {
    if (variant.stock <= 0)
      return { ok: false, message: 'This item is out of stock' };
    const state = getState();
    const owner = selectOwner(state);
    const existing = (state.cart.carts[owner] ?? []).find(
      i =>
        i.productId === product.id &&
        i.variantId === variant.id &&
        !i.savedForLater,
    );
    const cap = maxQty(variant.stock);
    if (existing && existing.qty >= cap) {
      return {
        ok: false,
        message:
          cap < RULES.cart.maxQtyPerItem
            ? `Only ${cap} left in stock`
            : `You can buy up to ${cap} units of this item`,
      };
    }
    dispatch(
      cartActions.addItem({
        owner,
        item: buildCartItem(product, variant, qty),
        stock: variant.stock,
      }),
    );
    return { ok: true, capped: !!existing && existing.qty + qty > cap };
  };

export const changeQty =
  (item: CartItem, qty: number, stock: number): AppThunk<string | null> =>
  (dispatch, getState) => {
    const cap = maxQty(stock);
    if (qty < 1) return null;
    if (qty > cap) {
      return cap < RULES.cart.maxQtyPerItem
        ? `Only ${cap} left in stock`
        : `Maximum ${cap} units allowed per item`;
    }
    dispatch(
      cartActions.setQty({
        owner: selectOwner(getState()),
        productId: item.productId,
        variantId: item.variantId,
        qty,
      }),
    );
    return null;
  };

export const removeFromCart =
  (item: CartItem): AppThunk =>
  (dispatch, getState) => {
    dispatch(
      cartActions.removeItem({
        owner: selectOwner(getState()),
        productId: item.productId,
        variantId: item.variantId,
      }),
    );
  };

export const restoreCartItem =
  (item: CartItem): AppThunk =>
  (dispatch, getState) => {
    dispatch(cartActions.restoreItem({ owner: selectOwner(getState()), item }));
  };

export const saveForLater =
  (item: CartItem, saved: boolean): AppThunk =>
  (dispatch, getState) => {
    dispatch(
      cartActions.setSavedForLater({
        owner: selectOwner(getState()),
        productId: item.productId,
        variantId: item.variantId,
        saved,
      }),
    );
  };

/** Returns true when the product was added, false when removed. */
export const toggleWishlist =
  (productId: string, price: number): AppThunk<boolean> =>
  (dispatch, getState) => {
    const state = getState();
    const owner = selectOwner(state);
    const exists = (state.wishlist.lists[owner] ?? []).some(
      i => i.productId === productId,
    );
    if (exists) dispatch(wishlistActions.remove({ owner, productId }));
    else dispatch(wishlistActions.add({ owner, productId, price }));
    return !exists;
  };

export const pushNotification =
  (n: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>): AppThunk =>
  (dispatch, getState) => {
    const ui = getState().ui;
    if (n.type === 'order' && !ui.notifyOrders) return;
    if (n.type === 'offer' && !ui.notifyOffers) return;
    dispatch(
      notificationsActions.push({
        ...n,
        id: uid('n_'),
        isRead: false,
        createdAt: new Date().toISOString(),
      }),
    );
  };

/**
 * Logs a user in: merges the guest cart / wishlist (section 7.5) and seeds the
 * demo account fixtures on its first login (section 8.1, OR-08).
 */
export const loginUser =
  (user: User): AppThunk =>
  (dispatch, getState) => {
    const guestCart = getState().cart.carts.guest ?? [];
    const stocks: Record<string, number> = {};
    guestCart.forEach(i => {
      stocks[`${i.productId}:${i.variantId}`] = productService.stockOf(
        i.productId,
        i.variantId,
      );
    });
    dispatch(authActions.loginSuccess(user));
    dispatch(cartActions.mergeGuestInto({ userId: user.id, stocks }));
    dispatch(wishlistActions.mergeGuestInto({ userId: user.id }));

    if (
      demoService.isDemoUser(user) &&
      !getState().orders.seededUsers.includes(user.id)
    ) {
      const addresses = demoService.addresses();
      dispatch(addressActions.seed(addresses));
      dispatch(
        wishlistActions.seed({
          owner: user.id,
          items: demoService
            .wishlist()
            .map(w => ({
              productId: w.productId,
              priceAtAdd: w.priceAtAdd,
              addedAt: new Date().toISOString(),
            })),
        }),
      );
      const orders = orderService.buildDemoOrders(
        user.id,
        addresses[0],
        getState().ui.demoSpeed,
      );
      dispatch(ordersActions.seeded({ userId: user.id, orders }));
    }
    // Guest pincode becomes irrelevant once real addresses exist.
    if (selectUserAddresses(getState()).length)
      dispatch(addressActions.setGuestPincode(null));
    dispatch(notificationsActions.seed(notificationService.initialOffers()));
  };

export const continueAsGuest = (): AppThunk => dispatch => {
  dispatch(authActions.continueAsGuest());
  dispatch(notificationsActions.seed(notificationService.initialOffers()));
};

/** Logout clears the session but keeps orders, so demo history is not lost (AU-07). */
export const logout = (): AppThunk => dispatch => {
  dispatch(authActions.loggedOut());
  dispatch(cartActions.setCoupon(null));
  dispatch(addressActions.select(null));
};

export const placeOrder =
  (): AppThunk<Promise<Order>> => async (dispatch, getState) => {
    const state = getState();
    const user = state.auth.user;
    if (!user) throw new Error('Please login to place your order');
    const { checkout } = state;
    const items = selectCheckoutItems(state);
    const address =
      selectUserAddresses(state).find(a => a.id === checkout.addressId) ??
      selectDefaultAddress(state);
    if (!address) throw new Error('Please select a delivery address');
    if (!checkout.payment) throw new Error('Please select a payment method');
    const couponCode = checkout.mode === 'cart' ? selectCoupon(state) : null;
    const { coupon, breakup } = computeCheckoutBreakup(state);
    const priceBreakup = toPriceBreakup(breakup);
    const order = await orderService.placeOrder({
      userId: user.id,
      items,
      address,
      deliveryType: checkout.deliveryType,
      payment: checkout.payment,
      priceBreakup,
      coupon: coupon && !breakup.couponError ? couponCode : null,
      mode: state.ui.demoSpeed,
    });
    dispatch(ordersActions.added(order));
    if (checkout.mode === 'cart')
      dispatch(cartActions.clearOrdered({ owner: user.id }));
    dispatch(checkoutActions.completed(order.id));
    if (
      checkout.savePayment &&
      (checkout.payment.method === 'card' || checkout.payment.method === 'upi')
    ) {
      const p = checkout.payment;
      const saved: SavedPayment =
        p.method === 'upi'
          ? {
              id: uid('pm_'),
              type: 'upi',
              label: p.upiId ?? 'UPI',
              upiId: p.upiId,
            }
          : {
              id: uid('pm_'),
              type: 'card',
              label: p.label,
              cardBrand: p.cardBrand,
              last4: p.cardLast4,
            };
      dispatch(paymentsActions.save({ userId: user.id, payment: saved }));
    }
    dispatch(
      pushNotification({
        type: 'order',
        title: 'Order placed',
        body: `Your order ${order.id} has been placed successfully.`,
        orderId: order.id,
      }),
    );
    return order;
  };

/** Shared by the Review screen and placeOrder so both always agree. */
export function computeCheckoutBreakup(state: RootState) {
  const items = selectCheckoutItems(state);
  const code = state.checkout.mode === 'cart' ? selectCoupon(state) : null;
  const coupon = code ? couponService.findByCode(code) : null;
  const breakup = computePriceBreakup({
    lines: toPricingLines(items),
    coupon,
    deliveryType: state.checkout.deliveryType,
    paymentMethod: state.checkout.payment?.method ?? null,
    isFirstOrder: selectIsFirstOrder(state),
  });
  return { coupon, breakup };
}

export const cancelOrder =
  (order: Order, reason: string): AppThunk<Promise<Order>> =>
  async (dispatch, getState) => {
    const updated = await orderService.cancelOrder(
      order,
      reason,
      getState().ui.demoSpeed,
    );
    dispatch(ordersActions.updated(updated));
    dispatch(
      pushNotification({
        type: 'order',
        title: 'Order cancelled',
        body: `Your order ${order.id} has been cancelled.`,
        orderId: order.id,
      }),
    );
    return updated;
  };

export const requestReturn =
  (
    order: Order,
    req: Omit<ReturnRequest, 'requestedAt'>,
  ): AppThunk<Promise<Order>> =>
  async (dispatch, getState) => {
    const updated = await orderService.requestReturn(
      order,
      req,
      getState().ui.demoSpeed,
    );
    dispatch(ordersActions.updated(updated));
    dispatch(
      pushNotification({
        type: 'order',
        title:
          req.type === 'return' ? 'Return requested' : 'Replacement requested',
        body: `We have received your ${req.type} request for order ${order.id}. Pickup will be scheduled soon.`,
        orderId: order.id,
      }),
    );
    return updated;
  };

/** "Buy it again" adds all items of an order back to the cart (OR-07). */
export const buyAgain =
  (order: Order): AppThunk<Promise<number>> =>
  async dispatch => {
    const products = await productService.getProductsByIds(
      order.items.map(i => i.productId),
    );
    let added = 0;
    order.items.forEach(item => {
      const p = products.find(x => x.id === item.productId);
      const v = p?.variants.find(x => x.id === item.variantId);
      if (p && v && v.stock > 0) {
        const res = dispatch(addToCart(p, v, item.qty));
        if (res.ok) added += 1;
      }
    });
    return added;
  };

/**
 * Moves orders forward based on elapsed time (section 7.7) and creates a local
 * notification for every status change (AC-04).
 */
export const syncOrderStatuses = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const all = state.orders.list;
  if (!all.length) return;
  const refreshed = orderService.refreshStatuses(all, state.ui.demoSpeed);
  let changed = false;
  refreshed.forEach((o, i) => {
    const prev = all[i];
    if (
      o.status !== prev.status ||
      o.statusHistory.length !== prev.statusHistory.length
    ) {
      changed = true;
      if (
        o.status !== prev.status &&
        state.auth.user &&
        o.userId === state.auth.user.id
      ) {
        dispatch(
          pushNotification({
            type: 'order',
            title: `Order ${STATUS_LABEL[o.status].toLowerCase()}`,
            body: `${o.items[0]?.name ?? 'Your order'}${
              o.items.length > 1 ? ` and ${o.items.length - 1} more` : ''
            } — ${STATUS_LABEL[o.status]}.`,
            orderId: o.id,
          }),
        );
      }
    }
  });
  if (changed) dispatch(ordersActions.replaceAll(refreshed));
};

/** "Reset demo data" (AC-06): clears the fake server and every slice. */
export const resetDemoData = (): AppThunk<Promise<void>> => async dispatch => {
  await db.reset();
  dispatch(resetApp());
};
