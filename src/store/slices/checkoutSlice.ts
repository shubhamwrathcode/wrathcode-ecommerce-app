import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, DeliveryType, PaymentInfo } from '@/types/models';
import { resetApp } from '../actions';

/** Transient checkout session (not persisted). */
export interface CheckoutState {
  mode: 'cart' | 'buyNow';
  buyNowItem: CartItem | null;
  addressId: string | null;
  deliveryType: DeliveryType;
  payment: PaymentInfo | null;
  savePayment: boolean;
  /** Order id after a successful placement. */
  lastOrderId: string | null;
}

const initialState: CheckoutState = {
  mode: 'cart',
  buyNowItem: null,
  addressId: null,
  deliveryType: 'standard',
  payment: null,
  savePayment: false,
  lastOrderId: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    start(
      _s,
      a: PayloadAction<{ mode: 'cart' } | { mode: 'buyNow'; item: CartItem }>,
    ) {
      return {
        ...initialState,
        mode: a.payload.mode,
        buyNowItem: a.payload.mode === 'buyNow' ? a.payload.item : null,
      };
    },
    setAddress(s, a: PayloadAction<string>) {
      s.addressId = a.payload;
    },
    setDeliveryType(s, a: PayloadAction<DeliveryType>) {
      s.deliveryType = a.payload;
    },
    setPayment(s, a: PayloadAction<{ payment: PaymentInfo; save?: boolean }>) {
      s.payment = a.payload.payment;
      s.savePayment = !!a.payload.save;
    },
    completed(s, a: PayloadAction<string>) {
      s.lastOrderId = a.payload;
    },
  },
  extraReducers: b => b.addCase(resetApp, () => initialState),
});

export const checkoutActions = checkoutSlice.actions;
export default checkoutSlice.reducer;
