import { useMemo } from 'react';
import { useStore } from 'react-redux';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/rootReducer';
import { computeCheckoutBreakup } from '@/store/thunks';

/** Live price breakup for the current checkout session. */
export function useCheckoutTotals() {
  const store = useStore<RootState>();
  const checkout = useAppSelector(s => s.checkout);
  const cart = useAppSelector(s => s.cart);
  const orders = useAppSelector(s => s.orders.list);
  const user = useAppSelector(s => s.auth.user);
  return useMemo(
    () => computeCheckoutBreakup(store.getState()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkout, cart, orders, user],
  );
}
