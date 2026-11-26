import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SavedPayment } from '@/types/models';
import { resetApp } from '../actions';

/** Saved cards / UPI — masked only, never full numbers or CVV (AC-03). */
export interface PaymentsState {
  saved: Record<string, SavedPayment[]>;
}

const initialState: PaymentsState = { saved: {} };

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    save(s, a: PayloadAction<{ userId: string; payment: SavedPayment }>) {
      const l = (s.saved[a.payload.userId] ??= []);
      const p = a.payload.payment;
      const dup = l.some(x =>
        p.type === 'upi'
          ? x.upiId === p.upiId
          : x.last4 === p.last4 && x.cardBrand === p.cardBrand,
      );
      if (!dup) l.unshift(p);
    },
    remove(s, a: PayloadAction<{ userId: string; id: string }>) {
      s.saved[a.payload.userId] = (s.saved[a.payload.userId] ?? []).filter(
        x => x.id !== a.payload.id,
      );
    },
  },
  extraReducers: b => b.addCase(resetApp, () => initialState),
});

export const paymentsActions = paymentsSlice.actions;
export default paymentsSlice.reducer;
