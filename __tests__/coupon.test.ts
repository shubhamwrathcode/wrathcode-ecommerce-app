import { mock } from '@/mock';
import { evaluateCoupon } from '@/utils/coupon';
import type { PricingLine } from '@/utils/price';

const coupon = (code: string) => mock.coupons.find(c => c.code === code)!;
const line = (
  price: number,
  qty = 1,
  extra: Partial<PricingLine> = {},
): PricingLine => ({
  price,
  mrp: price,
  qty,
  categoryId: 'electronics',
  isDealOfDay: false,
  ...extra,
});
const ctx = (lines: PricingLine[], extra = {}) => ({
  lines,
  deliveryType: 'standard' as const,
  isFirstOrder: false,
  ...extra,
});

describe('coupon engine (7.3)', () => {
  it('WELCOME10: 10% capped at ₹200, first order only, min ₹299', () => {
    expect(
      evaluateCoupon(
        coupon('WELCOME10'),
        ctx([line(1000)], { isFirstOrder: true }),
      ),
    ).toEqual({ ok: true, discount: 100 });
    expect(
      evaluateCoupon(
        coupon('WELCOME10'),
        ctx([line(5000)], { isFirstOrder: true }),
      ),
    ).toEqual({ ok: true, discount: 200 });
    expect(
      evaluateCoupon(coupon('WELCOME10'), ctx([line(1000)])),
    ).toMatchObject({ ok: false, reason: 'Valid only on your first order' });
    expect(
      evaluateCoupon(
        coupon('WELCOME10'),
        ctx([line(200)], { isFirstOrder: true }),
      ).ok,
    ).toBe(false);
  });

  it('SAVE100: flat ₹100 above ₹999', () => {
    expect(evaluateCoupon(coupon('SAVE100'), ctx([line(999)]))).toEqual({
      ok: true,
      discount: 100,
    });
    expect(evaluateCoupon(coupon('SAVE100'), ctx([line(900)]))).toMatchObject({
      ok: false,
      reason: 'Add ₹99 more to use this coupon',
    });
  });

  it('FREESHIP: waives standard delivery, not valid with express', () => {
    expect(evaluateCoupon(coupon('FREESHIP'), ctx([line(300)]))).toEqual({
      ok: true,
      discount: 40,
    });
    expect(
      evaluateCoupon(
        coupon('FREESHIP'),
        ctx([line(300)], { deliveryType: 'express' }),
      ),
    ).toMatchObject({ ok: false });
  });

  it('FASHION20: 20% of fashion value only, capped at ₹500', () => {
    const lines = [line(1000, 1, { categoryId: 'fashion-men' }), line(5000)];
    expect(evaluateCoupon(coupon('FASHION20'), ctx(lines))).toEqual({
      ok: true,
      discount: 200,
    });
    expect(
      evaluateCoupon(
        coupon('FASHION20'),
        ctx([line(4000, 1, { categoryId: 'fashion-women' })]),
      ),
    ).toEqual({ ok: true, discount: 500 });
    expect(evaluateCoupon(coupon('FASHION20'), ctx([line(4000)])).ok).toBe(
      false,
    );
  });

  it('MEGA500: min ₹4,999 excluding Deal of the Day items', () => {
    expect(evaluateCoupon(coupon('MEGA500'), ctx([line(5000)]))).toEqual({
      ok: true,
      discount: 500,
    });
    expect(
      evaluateCoupon(
        coupon('MEGA500'),
        ctx([line(5000, 1, { isDealOfDay: true })]),
      ),
    ).toMatchObject({
      ok: false,
      reason: 'Not valid on Deal of the Day items',
    });
  });

  it('EXPIRED50 always reports expiry', () => {
    expect(evaluateCoupon(coupon('EXPIRED50'), ctx([line(5000)]))).toEqual({
      ok: false,
      reason: 'This coupon has expired',
    });
  });
});
