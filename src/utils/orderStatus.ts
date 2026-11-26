import { DemoSpeed, RULES } from '@/config/rules';
import type { Order, OrderStatus, StatusEvent } from '@/types/models';

export const TRACK_STEPS: OrderStatus[] = [
  'ordered',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
];
export const RETURN_STEPS: OrderStatus[] = [
  'return_requested',
  'picked_up',
  'refunded',
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  ordered: 'Ordered',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  return_requested: 'Return requested',
  picked_up: 'Picked up',
  refunded: 'Refunded',
};

export type StatusGroup = 'active' | 'delivered' | 'cancelled' | 'returned';

export function statusGroup(s: OrderStatus): StatusGroup {
  if (s === 'delivered') return 'delivered';
  if (s === 'cancelled') return 'cancelled';
  if (RETURN_STEPS.includes(s)) return 'returned';
  return 'active';
}

/** Planned timestamp of each forward step for an order (section 7.7). */
export function plannedSchedule(
  order: Pick<Order, 'placedAt' | 'expectedDelivery'>,
  mode: DemoSpeed,
): Record<string, number> {
  const placed = new Date(order.placedAt).getTime();
  if (mode === 'fast') {
    const f = RULES.orderTimeline.fast;
    return {
      ordered: placed,
      packed: placed + f.packed,
      shipped: placed + f.shipped,
      out_for_delivery: placed + f.outForDelivery,
      delivered: placed + f.delivered,
    };
  }
  const r = RULES.orderTimeline.realistic;
  const exp = new Date(order.expectedDelivery);
  const ofd = new Date(exp);
  ofd.setHours(r.outForDeliveryHour, 0, 0, 0);
  const del = new Date(exp);
  del.setHours(r.deliveredHour, 0, 0, 0);
  const shipped = placed + r.shipped;
  const ofdAt = Math.max(ofd.getTime(), shipped + 3600e3);
  return {
    ordered: placed,
    packed: placed + r.packed,
    shipped,
    out_for_delivery: ofdAt,
    delivered: Math.max(del.getTime(), ofdAt + 3600e3),
  };
}

export function returnSchedule(
  requestedAt: string,
  mode: DemoSpeed,
): Record<string, number> {
  const t = new Date(requestedAt).getTime();
  const cfg =
    mode === 'fast' ? RULES.orderTimeline.fast : RULES.orderTimeline.realistic;
  return {
    return_requested: t,
    picked_up: t + cfg.pickedUp,
    refunded: t + cfg.refunded,
  };
}

/**
 * Derives the current status and history from timestamps. Called whenever an
 * order screen opens (and by the background sync) since there is no server.
 */
export function deriveOrderStatus(
  order: Order,
  mode: DemoSpeed,
  now = Date.now(),
): { status: OrderStatus; history: StatusEvent[] } {
  const plan = plannedSchedule(order, mode);
  const cutoff = order.cancelledAt
    ? new Date(order.cancelledAt).getTime()
    : now;
  const history: StatusEvent[] = [];
  for (const step of TRACK_STEPS) {
    if (plan[step] <= Math.min(cutoff, now))
      history.push({ status: step, at: new Date(plan[step]).toISOString() });
  }
  if (!history.length) history.push({ status: 'ordered', at: order.placedAt });

  if (order.cancelledAt) {
    history.push({
      status: 'cancelled',
      at: order.cancelledAt,
      note: order.cancelReason,
    });
    return { status: 'cancelled', history };
  }
  if (order.returnRequest) {
    const rs = returnSchedule(order.returnRequest.requestedAt, mode);
    for (const step of RETURN_STEPS) {
      if (rs[step] <= now)
        history.push({ status: step, at: new Date(rs[step]).toISOString() });
    }
  }
  return { status: history[history.length - 1].status, history };
}

export function deliveredAt(order: Order): Date | null {
  const ev = order.statusHistory.find(h => h.status === 'delivered');
  return ev ? new Date(ev.at) : null;
}

export const canCancel = (o: Order) =>
  o.status === 'ordered' || o.status === 'packed';

export function canReturn(o: Order, now = Date.now()): boolean {
  if (o.status !== 'delivered' || o.returnRequest) return false;
  if (!o.items.some(i => i.isReturnable)) return false;
  const at = deliveredAt(o);
  if (!at) return false;
  const windowDays = Math.max(
    RULES.returns.windowDays,
    ...o.items.map(i => i.returnDays),
  );
  return now - at.getTime() <= windowDays * 86400000;
}

export const canReview = (o: Order) =>
  o.status === 'delivered' || RETURN_STEPS.includes(o.status);

export interface TimelineStep {
  status: OrderStatus;
  label: string;
  done: boolean;
  at: string | null;
  expected: string | null;
}

/** Vertical timeline for the Track order screen (OR-03). */
export function buildTimeline(order: Order, mode: DemoSpeed): TimelineStep[] {
  const plan = plannedSchedule(order, mode);
  const reached = new Map(order.statusHistory.map(h => [h.status, h.at]));
  const steps: OrderStatus[] =
    order.status === 'cancelled'
      ? [...TRACK_STEPS.filter(s => reached.has(s)), 'cancelled']
      : order.returnRequest
      ? [...TRACK_STEPS, ...RETURN_STEPS]
      : TRACK_STEPS;
  const rs = order.returnRequest
    ? returnSchedule(order.returnRequest.requestedAt, mode)
    : null;
  return steps.map(s => ({
    status: s,
    label: STATUS_LABEL[s],
    done: reached.has(s),
    at: reached.get(s) ?? null,
    expected: reached.has(s)
      ? null
      : plan[s]
      ? new Date(plan[s]).toISOString()
      : rs?.[s]
      ? new Date(rs[s]).toISOString()
      : null,
  }));
}
