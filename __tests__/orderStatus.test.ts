import type { Order } from '@/types/models';
import {
  buildTimeline,
  canCancel,
  canReturn,
  deriveOrderStatus,
} from '@/utils/orderStatus';

const MIN = 60e3;
const base = (placedAt: number, extra: Partial<Order> = {}): Order => ({
  id: 'SV1',
  userId: 'u',
  items: [
    {
      productId: 'p',
      variantId: 'v',
      name: 'X',
      brand: 'B',
      image: '',
      variantLabel: '',
      price: 100,
      mrp: 100,
      qty: 1,
      isReturnable: true,
      returnDays: 7,
    },
  ],
  address: {} as Order['address'],
  deliveryType: 'standard',
  payment: { method: 'upi', label: 'UPI' },
  priceBreakup: {
    totalMrp: 100,
    discountOnMrp: 0,
    couponDiscount: 0,
    deliveryCharge: 40,
    codCharge: 0,
    total: 140,
    savings: 0,
  },
  coupon: null,
  status: 'ordered',
  statusHistory: [],
  placedAt: new Date(placedAt).toISOString(),
  expectedDelivery: new Date(placedAt + 2 * 86400e3).toISOString(),
  ...extra,
});

describe('order status simulation — fast mode (7.7)', () => {
  const t0 = Date.UTC(2026, 10, 24, 10);
  it.each([
    [0, 'ordered'],
    [2, 'packed'],
    [5, 'shipped'],
    [8, 'out_for_delivery'],
    [10, 'delivered'],
  ])('after %i min → %s', (mins, status) => {
    expect(
      deriveOrderStatus(base(t0), 'fast', t0 + (mins as number) * MIN + 1)
        .status,
    ).toBe(status);
  });

  it('cancellation freezes history and is only allowed before shipping', () => {
    const o = base(t0, { cancelledAt: new Date(t0 + 3 * MIN).toISOString() });
    const r = deriveOrderStatus(o, 'fast', t0 + 60 * MIN);
    expect(r.status).toBe('cancelled');
    expect(r.history.map(h => h.status)).toEqual([
      'ordered',
      'packed',
      'cancelled',
    ]);

    const packed = {
      ...base(t0),
      ...deriveOrderStatus(base(t0), 'fast', t0 + 3 * MIN),
    };
    const shipped = {
      ...base(t0),
      ...deriveOrderStatus(base(t0), 'fast', t0 + 6 * MIN),
    };
    expect(canCancel({ ...packed, statusHistory: packed.history })).toBe(true);
    expect(canCancel({ ...shipped, statusHistory: shipped.history })).toBe(
      false,
    );
  });

  it('return flow: requested > picked up (+2m) > refunded (+5m)', () => {
    const req = t0 + 20 * MIN;
    const o = base(t0, {
      returnRequest: {
        type: 'return',
        reason: 'x',
        comment: '',
        requestedAt: new Date(req).toISOString(),
        pickupAddress: {} as Order['address'],
      },
    });
    expect(deriveOrderStatus(o, 'fast', req + MIN).status).toBe(
      'return_requested',
    );
    expect(deriveOrderStatus(o, 'fast', req + 3 * MIN).status).toBe(
      'picked_up',
    );
    expect(deriveOrderStatus(o, 'fast', req + 6 * MIN).status).toBe('refunded');
  });

  it('return window is 7 days after delivery', () => {
    const now = t0 + 11 * MIN;
    const d = deriveOrderStatus(base(t0), 'fast', now);
    const delivered = {
      ...base(t0),
      status: d.status,
      statusHistory: d.history,
    };
    expect(canReturn(delivered, now)).toBe(true);
    expect(canReturn(delivered, now + 8 * 86400e3)).toBe(false);
  });

  it('timeline marks reached steps and projects expected times', () => {
    const d = deriveOrderStatus(base(t0), 'fast', t0 + 6 * MIN);
    const steps = buildTimeline(
      { ...base(t0), status: d.status, statusHistory: d.history },
      'fast',
    );
    expect(steps.map(s => s.done)).toEqual([true, true, true, false, false]);
    expect(steps[4].expected).toBe(new Date(t0 + 10 * MIN).toISOString());
  });
});

describe('order status simulation — realistic mode', () => {
  it('packed after 6h, shipped after 1 day', () => {
    const t0 = new Date(2026, 10, 24, 9).getTime();
    expect(
      deriveOrderStatus(base(t0), 'realistic', t0 + 5 * 3600e3).status,
    ).toBe('ordered');
    expect(
      deriveOrderStatus(base(t0), 'realistic', t0 + 7 * 3600e3).status,
    ).toBe('packed');
    expect(
      deriveOrderStatus(base(t0), 'realistic', t0 + 25 * 3600e3).status,
    ).toBe('shipped');
  });
});
