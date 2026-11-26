import { RULES } from '@/config/rules';
import type {
  Coupon,
  DeliveryType,
  PaymentMethodType,
  PriceBreakup,
} from '@/types/models';
import { evaluateCoupon } from './coupon';

export interface PricingLine {
  price: number;
  mrp: number;
  qty: number;
  categoryId: string;
  isDealOfDay: boolean;
}

/** round((MRP - price) / MRP * 100); 0 when below the display threshold (section 7.1). */
export function discountPercent(mrp: number, price: number): number {
  if (!mrp || mrp <= price) return 0;
  const pct = Math.round(((mrp - price) / mrp) * 100);
  return pct >= RULES.discount.minPercentToShow ? pct : 0;
}

export function cartTotals(lines: PricingLine[]) {
  let totalMrp = 0;
  let discountOnMrp = 0;
  let itemCount = 0;
  for (const l of lines) {
    totalMrp += l.mrp * l.qty;
    discountOnMrp += (l.mrp - l.price) * l.qty;
    itemCount += l.qty;
  }
  /** Cart value after product discounts, before coupon. */
  const cartValue = totalMrp - discountOnMrp;
  return { totalMrp, discountOnMrp, cartValue, itemCount };
}

/** Standard charge component only (section 7.2). */
export function standardDeliveryCharge(cartValue: number): number {
  if (cartValue <= 0) return 0;
  return cartValue >= RULES.delivery.freeThreshold
    ? 0
    : RULES.delivery.standardCharge;
}

export function deliveryCharge(
  cartValue: number,
  deliveryType: DeliveryType,
): number {
  return (
    standardDeliveryCharge(cartValue) +
    (deliveryType === 'express' ? RULES.delivery.expressCharge : 0)
  );
}

/** Amount still needed to unlock free standard delivery (CT-05). */
export function amountForFreeDelivery(cartValue: number): number {
  return Math.max(0, RULES.delivery.freeThreshold - cartValue);
}

export interface BreakupInput {
  lines: PricingLine[];
  coupon: Coupon | null;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethodType | null;
  isFirstOrder: boolean;
  now?: Date;
}

export interface BreakupResult extends PriceBreakup {
  couponError: string | null;
  codAllowed: boolean;
  itemCount: number;
  cartValue: number;
}

/**
 * Final amount = Total MRP - Discount on MRP - Coupon discount + Delivery + COD (section 7.1).
 */
export function computePriceBreakup(input: BreakupInput): BreakupResult {
  const { lines, coupon, deliveryType, paymentMethod, isFirstOrder, now } =
    input;
  const { totalMrp, discountOnMrp, cartValue, itemCount } = cartTotals(lines);
  const delivery = deliveryCharge(cartValue, deliveryType);

  let couponDiscount = 0;
  let couponError: string | null = null;
  if (coupon) {
    const res = evaluateCoupon(coupon, {
      lines,
      deliveryType,
      isFirstOrder,
      now,
    });
    if (res.ok) couponDiscount = res.discount;
    else couponError = res.reason;
  }

  const beforeCod = Math.max(0, cartValue - couponDiscount + delivery);
  const codAllowed = beforeCod <= RULES.delivery.codMaxOrderTotal;
  const codCharge = paymentMethod === 'cod' ? RULES.delivery.codCharge : 0;
  const total = beforeCod + codCharge;

  return {
    totalMrp,
    discountOnMrp,
    couponDiscount,
    deliveryCharge: delivery,
    codCharge,
    total,
    savings: discountOnMrp + couponDiscount,
    couponError,
    codAllowed,
    itemCount,
    cartValue,
  };
}

/** Strips UI-only fields so the breakup can be stored on an order. */
export function toPriceBreakup(b: BreakupResult): PriceBreakup {
  const {
    totalMrp,
    discountOnMrp,
    couponDiscount,
    deliveryCharge: delivery,
    codCharge,
    total,
    savings,
  } = b;
  return {
    totalMrp,
    discountOnMrp,
    couponDiscount,
    deliveryCharge: delivery,
    codCharge,
    total,
    savings,
  };
}
