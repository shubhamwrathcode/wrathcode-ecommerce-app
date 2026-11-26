import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '@/types/models';
import { resetApp } from '../actions';

export interface OrdersState {
  list: Order[];
  /** Users whose demo history has been seeded (so it is not re-added). */
  seededUsers: string[];
  /** Review state per order item: `${orderId}:${variantId}` */
  reviewed: Record<string, true>;
}

const initialState: OrdersState = { list: [], seededUsers: [], reviewed: {} };

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    added(state, a: PayloadAction<Order>) {
      state.list.unshift(a.payload);
    },
    updated(state, a: PayloadAction<Order>) {
      const i = state.list.findIndex(o => o.id === a.payload.id);
      if (i >= 0) state.list[i] = a.payload;
    },
    replaceAll(state, a: PayloadAction<Order[]>) {
      state.list = a.payload;
    },
    seeded(state, a: PayloadAction<{ userId: string; orders: Order[] }>) {
      if (state.seededUsers.includes(a.payload.userId)) return;
      state.seededUsers.push(a.payload.userId);
      state.list.push(...a.payload.orders);
      state.list.sort((x, y) => y.placedAt.localeCompare(x.placedAt));
    },
    markReviewed(
      state,
      a: PayloadAction<{ orderId: string; variantId: string }>,
    ) {
      state.reviewed[`${a.payload.orderId}:${a.payload.variantId}`] = true;
    },
  },
  extraReducers: b => b.addCase(resetApp, () => initialState),
});

export const ordersActions = ordersSlice.actions;
export default ordersSlice.reducer;
