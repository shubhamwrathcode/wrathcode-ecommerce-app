import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RULES } from '@/config/rules';
import type { CartItem } from '@/types/models';
import { resetApp } from '../actions';

export interface CartState {
  /** Carts keyed by owner: user id, or "guest". */
  carts: Record<string, CartItem[]>;
  coupon: string | null;
}

const initialState: CartState = { carts: {}, coupon: null };

type Owned<T> = { owner: string } & T;
const same = (
  a: { productId: string; variantId: string },
  b: { productId: string; variantId: string },
) => a.productId === b.productId && a.variantId === b.variantId;
export const maxQty = (stock: number) =>
  Math.max(0, Math.min(RULES.cart.maxQtyPerItem, stock));

const list = (s: CartState, owner: string) => (s.carts[owner] ??= []);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /** Same product + same variant increases quantity instead of adding a line (CT-03). */
    addItem(
      state,
      a: PayloadAction<
        Owned<{
          item: Omit<CartItem, 'addedAt' | 'savedForLater'>;
          stock: number;
        }>
      >,
    ) {
      const items = list(state, a.payload.owner);
      const { item, stock } = a.payload;
      const existing = items.find(i => same(i, item));
      const cap = maxQty(stock);
      if (existing) {
        existing.qty = Math.min(cap, existing.qty + item.qty);
        existing.savedForLater = false;
        existing.snapshot = item.snapshot;
      } else {
        items.unshift({
          ...item,
          qty: Math.min(cap, item.qty),
          addedAt: new Date().toISOString(),
          savedForLater: false,
        });
      }
    },
    setQty(
      state,
      a: PayloadAction<
        Owned<{ productId: string; variantId: string; qty: number }>
      >,
    ) {
      const it = list(state, a.payload.owner).find(i => same(i, a.payload));
      if (it) it.qty = Math.max(1, a.payload.qty);
    },
    removeItem(
      state,
      a: PayloadAction<Owned<{ productId: string; variantId: string }>>,
    ) {
      state.carts[a.payload.owner] = list(state, a.payload.owner).filter(
        i => !same(i, a.payload),
      );
    },
    restoreItem(state, a: PayloadAction<Owned<{ item: CartItem }>>) {
      const items = list(state, a.payload.owner);
      if (!items.some(i => same(i, a.payload.item)))
        items.unshift(a.payload.item);
    },
    setSavedForLater(
      state,
      a: PayloadAction<
        Owned<{ productId: string; variantId: string; saved: boolean }>
      >,
    ) {
      const it = list(state, a.payload.owner).find(i => same(i, a.payload));
      if (it) it.savedForLater = a.payload.saved;
    },
    /** Removes the lines that were just ordered (saved-for-later stays). */
    clearOrdered(state, a: PayloadAction<Owned<{}>>) {
      state.carts[a.payload.owner] = list(state, a.payload.owner).filter(
        i => i.savedForLater,
      );
      state.coupon = null;
    },
    /** Guest cart merges into the user cart on login; duplicates combine, capped (section 7.5). */
    mergeGuestInto(
      state,
      a: PayloadAction<{ userId: string; stocks: Record<string, number> }>,
    ) {
      const guest = state.carts.guest ?? [];
      const target = list(state, a.payload.userId);
      guest.forEach(g => {
        const cap = maxQty(
          a.payload.stocks[`${g.productId}:${g.variantId}`] ??
            RULES.cart.maxQtyPerItem,
        );
        const ex = target.find(t => same(t, g));
        if (ex) ex.qty = Math.min(cap, ex.qty + g.qty);
        else target.unshift({ ...g, qty: Math.min(cap, g.qty) });
      });
      delete state.carts.guest;
    },
    setCoupon(state, a: PayloadAction<string | null>) {
      state.coupon = a.payload;
    },
  },
  extraReducers: b => b.addCase(resetApp, () => initialState),
});

export const cartActions = cartSlice.actions;
export default cartSlice.reducer;
