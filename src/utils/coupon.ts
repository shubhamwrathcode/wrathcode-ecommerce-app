import { RULES } from '@/config/rules';
import type { Coupon, DeliveryType } from '@/types/models';
import { formatPrice } from './format';
import type { PricingLine } from './price';

export type CouponResult =
  | { ok: true; discount: number }
  | { ok: false; reason: string };

export interface CouponContext {
  lines: PricingLine[];
  deliveryType: DeliveryType;
  isFirstOrder: boolean;
  now?: Date;
}

const value = (lines: PricingLine[]) =>
  lines.reduce((s, l) => s + l.price * l.qty, 0);

/**
 * Coupon engine (section 7.3). Returns the discount or a human readable reason
 * the coupon cannot be applied (CT-06).
 */
export function evaluateCoupon(
  coupon: Coupon,
  ctx: CouponContext,
): CouponResult {
  const now = ctx.now ?? new Date();
  if (new Date(coupon.expiry).getTime() < now.getTime()) {
    return { ok: false, reason: 'This coupon has expired' };
  }
  if (!ctx.lines.length) return { ok: false, reason: 'Your cart is empty' };
  if (coupon.firstOrderOnly && !ctx.isFirstOrder) {
    return { ok: false, reason: 'Valid only on your first order' };
  }
  if (coupon.notWithExpress && ctx.deliveryType === 'express') {
    return { ok: false, reason: 'Not valid with Express delivery' };
  }

  const cartValue = value(ctx.lines);
  let eligibleLines = ctx.lines;
  if (coupon.categoryIds) {
    eligibleLines = eligibleLines.filter(l =>
      coupon.categoryIds!.includes(l.categoryId),
    );
    if (!eligibleLines.length)
      return { ok: false, reason: 'Add Fashion items to use this coupon' };
  }
  if (coupon.excludeDeals) {
    const withoutDeals = eligibleLines.filter(l => !l.isDealOfDay);
    if (
      value(withoutDeals) < coupon.minCart &&
      value(eligibleLines) >= coupon.minCart
    ) {
      return { ok: false, reason: 'Not valid on Deal of the Day items' };
    }
    eligibleLines = withoutDeals;
  }
  const eligibleValue = value(eligibleLines);
  const minBase =
    coupon.categoryIds || coupon.excludeDeals ? eligibleValue : cartValue;
  if (minBase < coupon.minCart) {
    return {
      ok: false,
      reason: `Add ${formatPrice(
        coupon.minCart - minBase,
      )} more to use this coupon`,
    };
  }

  let discount = 0;
  switch (coupon.type) {
    case 'flat':
      discount = coupon.value;
      break;
    case 'percent':
      discount = Math.round((eligibleValue * coupon.value) / 100);
      break;
    case 'shipping':
      // Waives the standard delivery charge (express fee is not waivable).
      discount =
        cartValue >= RULES.delivery.freeThreshold
          ? 0
          : RULES.delivery.standardCharge;
      break;
  }
  if (coupon.maxDiscount != null)
    discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, eligibleValue);
  return { ok: true, discount };
}
