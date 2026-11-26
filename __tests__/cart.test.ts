import reducer, { cartActions } from '@/store/slices/cartSlice';
import type { CartItem } from '@/types/models';

const item = (
  variantId = 'v1',
  qty = 1,
): Omit<CartItem, 'addedAt' | 'savedForLater'> => ({
  productId: 'p1',
  variantId,
  qty,
  snapshot: {
    name: 'X',
    brand: 'B',
    image: '',
    price: 100,
    mrp: 200,
    categoryId: 'c',
    isDealOfDay: false,
    isReturnable: true,
    variantLabel: '',
  },
});

describe('cart rules (CT-02, CT-03, 7.5)', () => {
  it('same product + variant increases quantity instead of a new line', () => {
    let s = reducer(
      undefined,
      cartActions.addItem({ owner: 'u', item: item(), stock: 50 }),
    );
    s = reducer(
      s,
      cartActions.addItem({ owner: 'u', item: item(), stock: 50 }),
    );
    expect(s.carts.u).toHaveLength(1);
    expect(s.carts.u[0].qty).toBe(2);
  });

  it('caps quantity at min(5, stock)', () => {
    let s = reducer(
      undefined,
      cartActions.addItem({ owner: 'u', item: item('v1', 4), stock: 50 }),
    );
    s = reducer(
      s,
      cartActions.addItem({ owner: 'u', item: item('v1', 4), stock: 50 }),
    );
    expect(s.carts.u[0].qty).toBe(5);
    s = reducer(
      undefined,
      cartActions.addItem({ owner: 'u', item: item('v2', 4), stock: 2 }),
    );
    expect(s.carts.u[0].qty).toBe(2);
  });

  it('merges the guest cart into the user cart on login, still capped', () => {
    let s = reducer(
      undefined,
      cartActions.addItem({ owner: 'guest', item: item('v1', 3), stock: 50 }),
    );
    s = reducer(
      s,
      cartActions.addItem({ owner: 'u', item: item('v1', 4), stock: 50 }),
    );
    s = reducer(
      s,
      cartActions.mergeGuestInto({ userId: 'u', stocks: { 'p1:v1': 50 } }),
    );
    expect(s.carts.guest).toBeUndefined();
    expect(s.carts.u[0].qty).toBe(5);
  });
});
