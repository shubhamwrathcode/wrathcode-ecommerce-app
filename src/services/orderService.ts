import { DemoSpeed } from '@/config/rules';
import { mock } from '@/mock';
import type {
  Address,
  CartItem,
  DeliveryType,
  Order,
  OrderItem,
  PaymentInfo,
  PriceBreakup,
  ReturnRequest,
} from '@/types/models';
import { orderId } from '@/utils/id';
import { deriveOrderStatus } from '@/utils/orderStatus';
import { computePriceBreakup, toPriceBreakup } from '@/utils/price';
import { ApiError, simulate } from './apiClient';
import { db } from './db';
import { pincodeService } from './pincodeService';
import { productService } from './productService';

export interface PlaceOrderInput {
  userId: string;
  items: CartItem[];
  address: Address;
  deliveryType: DeliveryType;
  payment: PaymentInfo;
  priceBreakup: PriceBreakup;
  coupon: string | null;
  mode: DemoSpeed;
}

const toOrderItem = (c: CartItem, returnDays: number): OrderItem => ({
  productId: c.productId,
  variantId: c.variantId,
  name: c.snapshot.name,
  brand: c.snapshot.brand,
  image: c.snapshot.image,
  variantLabel: c.snapshot.variantLabel,
  price: c.snapshot.price,
  mrp: c.snapshot.mrp,
  qty: c.qty,
  isReturnable: c.snapshot.isReturnable,
  returnDays,
});

const adjustStock = (
  items: { productId: string; variantId: string; qty: number }[],
  sign: 1 | -1,
) => {
  db.update(s => {
    items.forEach(i => {
      const current = productService.stockOf(i.productId, i.variantId);
      s.stock[i.variantId] = Math.max(0, current + sign * i.qty);
    });
  });
};

const withDerived = (o: Order, mode: DemoSpeed, now = Date.now()): Order => {
  const { status, history } = deriveOrderStatus(o, mode, now);
  return { ...o, status, statusHistory: history };
};

export const orderService = {
  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    return simulate(() => {
      const oos = input.items.find(
        i => productService.stockOf(i.productId, i.variantId) < i.qty,
      );
      if (oos)
        throw new ApiError(
          'OUT_OF_STOCK',
          `${oos.snapshot.name} is out of stock`,
        );
      const s = pincodeService.check(input.address.pincode);
      if (!s.serviceable)
        throw new ApiError(
          'NOT_SERVICEABLE',
          'Not deliverable to this pincode',
        );
      const now = new Date();
      const expected =
        pincodeService.expectedDate(
          input.address.pincode,
          input.deliveryType,
          now,
        ) ?? now;
      adjustStock(input.items, -1);
      const order: Order = {
        id: orderId(now),
        userId: input.userId,
        items: input.items.map(i =>
          toOrderItem(
            i,
            mock.products.find(p => p.id === i.productId)?.returnDays ?? 7,
          ),
        ),
        address: input.address,
        deliveryType: input.deliveryType,
        payment: input.payment,
        priceBreakup: input.priceBreakup,
        coupon: input.coupon,
        status: 'ordered',
        statusHistory: [{ status: 'ordered', at: now.toISOString() }],
        placedAt: now.toISOString(),
        expectedDelivery: expected.toISOString(),
      };
      return withDerived(order, input.mode);
    }, 600);
  },

  async cancelOrder(
    order: Order,
    reason: string,
    mode: DemoSpeed,
  ): Promise<Order> {
    return simulate(() => {
      const current = withDerived(order, mode);
      if (current.status !== 'ordered' && current.status !== 'packed') {
        throw new ApiError(
          'NOT_ALLOWED',
          'This order has already been shipped and can no longer be cancelled',
        );
      }
      adjustStock(order.items, 1);
      return withDerived(
        {
          ...order,
          cancelledAt: new Date().toISOString(),
          cancelReason: reason,
        },
        mode,
      );
    });
  },

  async requestReturn(
    order: Order,
    request: Omit<ReturnRequest, 'requestedAt'>,
    mode: DemoSpeed,
  ): Promise<Order> {
    return simulate(() =>
      withDerived(
        {
          ...order,
          returnRequest: { ...request, requestedAt: new Date().toISOString() },
        },
        mode,
      ),
    );
  },

  /** Re-computes time-based statuses (section 7.7). Pure — no delay. */
  refreshStatuses(orders: Order[], mode: DemoSpeed, now = Date.now()): Order[] {
    return orders.map(o => withDerived(o, mode, now));
  },

  /** Four pre-loaded orders for the demo account in different states (OR-08). */
  buildDemoOrders(userId: string, address: Address, mode: DemoSpeed): Order[] {
    const now = Date.now();
    const H = 3600e3;
    const D = 24 * H;
    const plans: Record<
      string,
      { placed: number; expected: number; cancelled?: number }
    > = {
      delivered: { placed: now - 5 * D, expected: now - 2 * D },
      in_transit:
        mode === 'fast'
          ? { placed: now - 6 * 60e3, expected: now + D }
          : { placed: now - 1.5 * D, expected: now + D },
      placed: { placed: now - 60e3, expected: now + 3 * D },
      cancelled: {
        placed: now - 9 * D,
        expected: now - 6 * D,
        cancelled: now - 9 * D + 2 * H,
      },
    };
    const payments: Record<string, PaymentInfo> = {
      upi: { method: 'upi', label: 'UPI (riya@okdemo)', upiId: 'riya@okdemo' },
      card: {
        method: 'card',
        label: 'Visa •••• 4242',
        cardLast4: '4242',
        cardBrand: 'Visa',
      },
      cod: { method: 'cod', label: 'Cash on Delivery' },
    };
    return mock.demo.orders.map((seed, idx) => {
      const plan = plans[seed.key];
      const items: OrderItem[] = seed.productIds.map(pid => {
        const p = mock.products.find(x => x.id === pid)!;
        const v = p.variants.find(x => x.stock > 0) ?? p.variants[0];
        const label = [v.color?.name, v.size].filter(Boolean).join(' · ');
        return {
          productId: p.id,
          variantId: v.id,
          name: p.name,
          brand: p.brand,
          image: v.images[0] ?? p.images[0],
          variantLabel: label,
          price: v.price,
          mrp: v.mrp,
          qty: 1,
          isReturnable: p.isReturnable,
          returnDays: p.returnDays,
        };
      });
      const breakup = computePriceBreakup({
        lines: items.map(i => ({
          price: i.price,
          mrp: i.mrp,
          qty: i.qty,
          categoryId: '',
          isDealOfDay: false,
        })),
        coupon: null,
        deliveryType: 'standard',
        paymentMethod: payments[seed.payment].method,
        isFirstOrder: false,
      });
      const priceBreakup = toPriceBreakup(breakup);
      const order: Order = {
        id: `SV2611${String(1001 + idx * 1373)}`,
        userId,
        items,
        address,
        deliveryType: 'standard',
        payment: payments[seed.payment],
        priceBreakup,
        coupon: null,
        status: 'ordered',
        statusHistory: [],
        placedAt: new Date(plan.placed).toISOString(),
        expectedDelivery: new Date(plan.expected).toISOString(),
        ...(plan.cancelled
          ? {
              cancelledAt: new Date(plan.cancelled).toISOString(),
              cancelReason: 'Ordered by mistake',
            }
          : {}),
      };
      return withDerived(order, mode, now);
    });
  },
};
