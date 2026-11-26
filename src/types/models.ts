/**
 * Domain models (section 8.2 of the requirements document).
 * These mirror what a real backend would return so the fake service layer
 * can be swapped for real API calls in Phase 2 without touching screens.
 */

export type ID = string;
export type ISODate = string;

export interface Category {
  id: ID;
  name: string;
  icon: string; // Ionicons glyph name
  image: string; // image descriptor (see components/ProductImage)
  parentId: ID | null;
  sortOrder: number;
  color: string;
}

export interface VariantColor {
  name: string;
  hex: string;
}

export interface Variant {
  id: ID;
  productId: ID;
  color: VariantColor | null;
  size: string | null;
  price: number;
  mrp: number;
  stock: number;
  images: string[];
}

export interface RatingBreakdown {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface Product {
  id: ID;
  name: string;
  brand: string;
  categoryId: ID;
  subCategoryId: ID;
  images: string[];
  price: number;
  mrp: number;
  rating: number;
  ratingCount: number;
  ratingBreakdown: RatingBreakdown;
  stock: number;
  variants: Variant[];
  sizeLabel: string | null; // e.g. "Size", "Storage", "Format"
  highlights: string[];
  description: string;
  specs: Record<string, string>;
  tags: string[];
  isReturnable: boolean;
  returnDays: number;
  isDealOfDay: boolean;
  isBestSeller: boolean;
  freeDelivery: boolean;
  seller: string;
  createdAt: ISODate;
}

export interface Review {
  id: ID;
  productId: ID;
  userName: string;
  rating: number;
  title: string;
  text: string;
  date: ISODate;
  images: string[];
  helpfulCount: number;
  isLocal?: boolean;
}

export type Gender = 'male' | 'female' | 'other' | '';

export interface User {
  id: ID;
  name: string;
  mobile: string;
  email: string;
  gender: Gender;
  dob: string;
  avatar: string | null;
  createdAt: ISODate;
}

export type AddressType = 'Home' | 'Work' | 'Other';

export interface Address {
  id: ID;
  userId: ID;
  name: string;
  mobile: string;
  pincode: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  type: AddressType;
  isDefault: boolean;
}

/** Snapshot of product data the cart needs to render without a round trip. */
export interface CartProductSnapshot {
  name: string;
  brand: string;
  image: string;
  price: number;
  mrp: number;
  categoryId: ID;
  isDealOfDay: boolean;
  isReturnable: boolean;
  variantLabel: string;
}

export interface CartItem {
  productId: ID;
  variantId: ID;
  qty: number;
  addedAt: ISODate;
  savedForLater: boolean;
  snapshot: CartProductSnapshot;
}

export type CouponType = 'flat' | 'percent' | 'shipping';

export interface Coupon {
  code: string;
  title: string;
  description: string;
  type: CouponType;
  value: number;
  maxDiscount: number | null;
  minCart: number;
  categoryIds: ID[] | null;
  firstOrderOnly: boolean;
  excludeDeals: boolean;
  notWithExpress: boolean;
  expiry: ISODate;
}

export type DeliveryType = 'standard' | 'express';

export type PaymentMethodType =
  | 'upi'
  | 'card'
  | 'netbanking'
  | 'wallet'
  | 'cod';

export interface PaymentInfo {
  method: PaymentMethodType;
  label: string; // e.g. "UPI (demo@okbank)", "Visa •••• 4242"
  upiId?: string;
  cardLast4?: string;
  cardBrand?: string;
  bank?: string;
  wallet?: string;
}

export interface PriceBreakup {
  totalMrp: number;
  discountOnMrp: number;
  couponDiscount: number;
  deliveryCharge: number;
  codCharge: number;
  total: number;
  savings: number;
}

export type OrderStatus =
  | 'ordered'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'picked_up'
  | 'refunded';

export interface OrderItem {
  productId: ID;
  variantId: ID;
  name: string;
  brand: string;
  image: string;
  variantLabel: string;
  price: number;
  mrp: number;
  qty: number;
  isReturnable: boolean;
  returnDays: number;
  reviewed?: boolean;
}

export interface StatusEvent {
  status: OrderStatus;
  at: ISODate;
  note?: string;
}

export interface ReturnRequest {
  type: 'return' | 'replace';
  reason: string;
  comment: string;
  requestedAt: ISODate;
  pickupAddress: Address;
}

export interface Order {
  id: ID;
  userId: ID;
  items: OrderItem[];
  address: Address;
  deliveryType: DeliveryType;
  payment: PaymentInfo;
  priceBreakup: PriceBreakup;
  coupon: string | null;
  status: OrderStatus;
  statusHistory: StatusEvent[];
  placedAt: ISODate;
  expectedDelivery: ISODate;
  cancelledAt?: ISODate;
  cancelReason?: string;
  returnRequest?: ReturnRequest;
}

export type NotificationType = 'order' | 'offer';

export interface AppNotification {
  id: ID;
  type: NotificationType;
  title: string;
  body: string;
  orderId: ID | null;
  isRead: boolean;
  createdAt: ISODate;
}

export interface Banner {
  id: ID;
  title: string;
  subtitle: string;
  cta: string;
  color: string;
  accent: string;
  icon: string;
  /** Real product photo shown on the banner. */
  image?: string;
  /** Short sticker text, e.g. "UP TO 60% OFF". */
  tag?: string;
  placement: 'home' | 'category';
  categoryId?: ID;
  target:
    | { type: 'category'; categoryId: ID }
    | { type: 'list'; title: string; filters: Partial<ProductQuery> };
}

export interface PincodeInfo {
  pincode: string;
  city: string;
  state: string;
}

export interface Faq {
  id: ID;
  question: string;
  answer: string;
}

export interface SavedPayment {
  id: ID;
  type: 'card' | 'upi';
  label: string;
  cardBrand?: string;
  last4?: string;
  upiId?: string;
  holder?: string;
  expiry?: string;
}

export type SortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'newest'
  | 'discount';

export type Collection =
  | 'bestsellers'
  | 'toprated'
  | 'new'
  | 'under999'
  | 'deals'
  | 'recommended';

export interface ProductFilters {
  categoryIds: ID[];
  brands: string[];
  priceMin: number | null;
  priceMax: number | null;
  minRating: number | null;
  minDiscount: number | null;
  hideOutOfStock: boolean;
  freeDelivery: boolean;
}

export interface ProductQuery extends ProductFilters {
  query: string;
  subCategoryId: ID | null;
  collection: Collection | null;
  sort: SortOption;
  page: number;
  pageSize: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  hasMore: boolean;
}
