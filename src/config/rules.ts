/**
 * Business rules (section 7 of the SRD). Every number the demo depends on lives
 * here so it can be tuned quickly for a client.
 */
export const RULES = {
  currency: { symbol: '₹', locale: 'en-IN' },
  discount: { minPercentToShow: 1 },
  delivery: {
    freeThreshold: 499,
    standardCharge: 40,
    expressCharge: 99,
    codCharge: 10,
    codMaxOrderTotal: 10000,
    metroDays: 2,
    metroExpressDays: 1,
    listedDays: [4, 5] as const,
    otherDays: 6,
  },
  cart: { maxQtyPerItem: 5 },
  stock: { lowStockThreshold: 5 },
  auth: {
    demoOtp: '1234',
    otpLength: 4,
    otpResendSeconds: 30,
    otpMaxAttempts: 3,
    otpLockSeconds: 30,
    passwordMinLength: 8,
  },
  addresses: { max: 5 },
  search: { recentLimit: 8, minChars: 2, debounceMs: 300 },
  recentlyViewedLimit: 10,
  listing: { pageSize: 10 },
  api: { minDelayMs: 300, maxDelayMs: 800 },
  payment: {
    processingMs: 2000,
    failUpiId: 'fail@upi',
    failCardSuffix: '0000',
  },
  returns: { windowDays: 7 },
  splashMs: 1500,
  bannerIntervalMs: 4000,
  /** Order status simulation (section 7.7). Offsets from order placement. */
  orderTimeline: {
    fast: {
      packed: 2 * 60e3,
      shipped: 5 * 60e3,
      outForDelivery: 8 * 60e3,
      delivered: 10 * 60e3,
      pickedUp: 2 * 60e3,
      refunded: 5 * 60e3,
    },
    realistic: {
      packed: 6 * 3600e3,
      shipped: 24 * 3600e3,
      pickedUp: 24 * 3600e3,
      refunded: 3 * 24 * 3600e3,
      outForDeliveryHour: 8,
      deliveredHour: 14,
    },
  },
} as const;

export type DemoSpeed = 'fast' | 'realistic';
