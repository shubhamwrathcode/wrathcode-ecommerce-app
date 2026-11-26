import { mock } from '@/mock';
import type { Coupon } from '@/types/models';
import { CouponContext, CouponResult, evaluateCoupon } from '@/utils/coupon';
import { simulate } from './apiClient';

export interface CouponWithStatus {
  coupon: Coupon;
  result: CouponResult;
}

export const couponService = {
  async getCoupons(ctx: CouponContext): Promise<CouponWithStatus[]> {
    return simulate(() =>
      mock.coupons.map(coupon => ({
        coupon,
        result: evaluateCoupon(coupon, ctx),
      })),
    );
  },

  async applyCoupon(
    code: string,
    ctx: CouponContext,
  ): Promise<{ coupon: Coupon | null; result: CouponResult }> {
    return simulate(() => {
      const coupon =
        mock.coupons.find(c => c.code === code.trim().toUpperCase()) ?? null;
      if (!coupon)
        return {
          coupon: null,
          result: { ok: false as const, reason: 'Invalid coupon code' },
        };
      return { coupon, result: evaluateCoupon(coupon, ctx) };
    });
  },

  /** Synchronous lookup used by the cart re-validation listener. */
  findByCode(code: string): Coupon | null {
    return mock.coupons.find(c => c.code === code) ?? null;
  },
};
