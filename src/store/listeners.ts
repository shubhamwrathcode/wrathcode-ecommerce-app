import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { couponService } from '@/services';
import { evaluateCoupon } from '@/utils/coupon';
import { toast } from '@/utils/toast';
import type { RootState } from './rootReducer';
import { selectCartPricingLines, selectIsFirstOrder } from './selectors';
import { cartActions } from './slices/cartSlice';
import { checkoutActions } from './slices/checkoutSlice';
import { authActions } from './slices/authSlice';

export const listenerMiddleware = createListenerMiddleware();

/**
 * If the cart changes and the applied coupon is no longer valid, remove it
 * automatically and tell the user why (section 7.3).
 */
listenerMiddleware.startListening({
  matcher: isAnyOf(
    cartActions.addItem,
    cartActions.setQty,
    cartActions.removeItem,
    cartActions.setSavedForLater,
    cartActions.restoreItem,
    checkoutActions.setDeliveryType,
    authActions.loginSuccess,
  ),
  effect: (_action, api) => {
    const state = api.getState() as RootState;
    const code = state.cart.coupon;
    if (!code) return;
    const coupon = couponService.findByCode(code);
    if (!coupon) {
      api.dispatch(cartActions.setCoupon(null));
      return;
    }
    const res = evaluateCoupon(coupon, {
      lines: selectCartPricingLines(state),
      deliveryType: state.checkout.deliveryType,
      isFirstOrder: selectIsFirstOrder(state),
    });
    if (!res.ok) {
      api.dispatch(cartActions.setCoupon(null));
      toast.info(`Coupon ${code} removed: ${res.reason}`);
    }
  },
});
