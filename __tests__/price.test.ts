import {
  amountForFreeDelivery,
  computePriceBreakup,
  deliveryCharge,
  discountPercent,
  PricingLine,
} from '@/utils/price';
import { formatIndianNumber, formatPrice } from '@/utils/format';

const line = (
  price: number,
  mrp: number,
  qty = 1,
  extra: Partial<PricingLine> = {},
): PricingLine => ({
  price,
  mrp,
  qty,
  categoryId: 'electronics',
  isDealOfDay: false,
  ...extra,
});

describe('discountPercent (7.1)', () => {
  it('rounds (MRP - price) / MRP * 100', () => {
    expect(discountPercent(1000, 667)).toBe(33);
    expect(discountPercent(999, 499)).toBe(50);
  });
  it('returns 0 below 1% or when no discount', () => {
    expect(discountPercent(1000, 996)).toBe(0);
    expect(discountPercent(1000, 1000)).toBe(0);
    expect(discountPercent(0, 100)).toBe(0);
  });
});

describe('currency formatting (7.1)', () => {
  it('uses Indian digit grouping without needless decimals', () => {
    expect(formatIndianNumber(124999)).toBe('1,24,999');
    expect(formatIndianNumber(999)).toBe('999');
    expect(formatIndianNumber(10000000)).toBe('1,00,00,000');
    expect(formatPrice(1299)).toBe('₹1,299');
    expect(formatIndianNumber(12.5)).toBe('12.50');
  });
});

describe('delivery charges (7.2)', () => {
  it('is free at or above ₹499 and ₹40 below', () => {
    expect(deliveryCharge(499, 'standard')).toBe(0);
    expect(deliveryCharge(498, 'standard')).toBe(40);
  });
  it('always adds ₹99 for express', () => {
    expect(deliveryCharge(1000, 'express')).toBe(99);
    expect(deliveryCharge(300, 'express')).toBe(139);
  });
  it('reports the gap to free delivery', () => {
    expect(amountForFreeDelivery(400)).toBe(99);
    expect(amountForFreeDelivery(600)).toBe(0);
  });
});

describe('computePriceBreakup (7.1)', () => {
  it('Final = Total MRP - Discount - Coupon + Delivery + COD', () => {
    const b = computePriceBreakup({
      lines: [line(300, 500, 2), line(150, 200)],
      coupon: null,
      deliveryType: 'standard',
      paymentMethod: 'cod',
      isFirstOrder: false,
    });
    expect(b.totalMrp).toBe(1200);
    expect(b.discountOnMrp).toBe(450);
    expect(b.cartValue).toBe(750);
    expect(b.deliveryCharge).toBe(0);
    expect(b.codCharge).toBe(10);
    expect(b.total).toBe(760);
    expect(b.savings).toBe(450);
  });

  it('disallows COD above ₹10,000', () => {
    const b = computePriceBreakup({
      lines: [line(10500, 12000)],
      coupon: null,
      deliveryType: 'standard',
      paymentMethod: null,
      isFirstOrder: false,
    });
    expect(b.codAllowed).toBe(false);
  });
});
