import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { resetApp } from '../actions';

export interface WishlistItem {
  productId: string;
  addedAt: string;
  /** Price when added — used for the "Price drop" tag (WL-02). */
  priceAtAdd: number;
}

export interface WishlistState {
  lists: Record<string, WishlistItem[]>;
}

const initialState: WishlistState = { lists: {} };

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    add(
      state,
      a: PayloadAction<{ owner: string; productId: string; price: number }>,
    ) {
      const l = (state.lists[a.payload.owner] ??= []);
      if (!l.some(i => i.productId === a.payload.productId)) {
        l.unshift({
          productId: a.payload.productId,
          addedAt: new Date().toISOString(),
          priceAtAdd: a.payload.price,
        });
      }
    },
    remove(state, a: PayloadAction<{ owner: string; productId: string }>) {
      state.lists[a.payload.owner] = (
        state.lists[a.payload.owner] ?? []
      ).filter(i => i.productId !== a.payload.productId);
    },
    restore(state, a: PayloadAction<{ owner: string; item: WishlistItem }>) {
      const l = (state.lists[a.payload.owner] ??= []);
      if (!l.some(i => i.productId === a.payload.item.productId))
        l.unshift(a.payload.item);
    },
    seed(state, a: PayloadAction<{ owner: string; items: WishlistItem[] }>) {
      const l = (state.lists[a.payload.owner] ??= []);
      a.payload.items.forEach(it => {
        if (!l.some(i => i.productId === it.productId)) l.push(it);
      });
    },
    mergeGuestInto(state, a: PayloadAction<{ userId: string }>) {
      const guest = state.lists.guest ?? [];
      const l = (state.lists[a.payload.userId] ??= []);
      guest.forEach(g => {
        if (!l.some(i => i.productId === g.productId)) l.unshift(g);
      });
      delete state.lists.guest;
    },
  },
  extraReducers: b => b.addCase(resetApp, () => initialState),
});

export const wishlistActions = wishlistSlice.actions;
export default wishlistSlice.reducer;
