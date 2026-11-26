import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Address } from '@/types/models';
import { resetApp } from '../actions';

export interface AddressState {
  list: Address[];
  /** Address used for "Deliver to" on Home / PDP for the logged-in user. */
  selectedId: string | null;
  /** Pincode chosen by a guest (or without an address) for delivery checks. */
  guestPincode: string | null;
}

const initialState: AddressState = {
  list: [],
  selectedId: null,
  guestPincode: null,
};

const ensureSingleDefault = (
  list: Address[],
  userId: string,
  defaultId: string,
) => {
  list.forEach(a => {
    if (a.userId === userId) a.isDefault = a.id === defaultId;
  });
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    upsert(state, a: PayloadAction<Address>) {
      const addr = a.payload;
      const mine = state.list.filter(x => x.userId === addr.userId);
      const isFirst =
        mine.length === 0 || (mine.length === 1 && mine[0].id === addr.id);
      const i = state.list.findIndex(x => x.id === addr.id);
      const next = { ...addr, isDefault: addr.isDefault || isFirst };
      if (i >= 0) state.list[i] = next;
      else state.list.push(next);
      if (next.isDefault) ensureSingleDefault(state.list, addr.userId, addr.id);
    },
    remove(state, a: PayloadAction<{ id: string }>) {
      const target = state.list.find(x => x.id === a.payload.id);
      state.list = state.list.filter(x => x.id !== a.payload.id);
      if (state.selectedId === a.payload.id) state.selectedId = null;
      if (target?.isDefault) {
        const next = state.list.find(x => x.userId === target.userId);
        if (next) next.isDefault = true;
      }
    },
    setDefault(state, a: PayloadAction<{ id: string; userId: string }>) {
      ensureSingleDefault(state.list, a.payload.userId, a.payload.id);
    },
    select(state, a: PayloadAction<string | null>) {
      state.selectedId = a.payload;
    },
    setGuestPincode(state, a: PayloadAction<string | null>) {
      state.guestPincode = a.payload;
    },
    seed(state, a: PayloadAction<Address[]>) {
      a.payload.forEach(addr => {
        if (!state.list.some(x => x.id === addr.id)) state.list.push(addr);
      });
    },
  },
  extraReducers: b => b.addCase(resetApp, () => initialState),
});

export const addressActions = addressSlice.actions;
export default addressSlice.reducer;
