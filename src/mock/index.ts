/**
 * Typed access to the static JSON "database".
 * RULE (SRD 3.2): only files in src/services may import from here.
 */
import type {
  Banner,
  Category,
  Coupon,
  Faq,
  AppNotification,
  PincodeInfo,
  Product,
  Review,
  User,
  Address,
} from '@/types/models';
import bannersJson from './banners.json';
import brandsJson from './brands.json';
import categoriesJson from './categories.json';
import couponsJson from './coupons.json';
import demoUserJson from './demoUser.json';
import faqsJson from './faqs.json';
import notificationsJson from './notifications.json';
import offersJson from './offers.json';
import pincodesJson from './pincodes.json';
import productsJson from './products.json';
import reviewsJson from './reviews.json';
import searchJson from './search.json';

export interface DemoOrderSeed {
  key: 'delivered' | 'in_transit' | 'placed' | 'cancelled';
  productIds: string[];
  payment: 'upi' | 'card' | 'cod';
}

export const mock = {
  products: productsJson as unknown as Product[],
  categories: categoriesJson as Category[],
  reviews: reviewsJson as Review[],
  brands: brandsJson as string[],
  banners: bannersJson as unknown as Banner[],
  coupons: couponsJson as Coupon[],
  pincodes: pincodesJson as {
    serviceable: PincodeInfo[];
    nonServiceable: string[];
    metroPrefixes: string[];
  },
  demo: demoUserJson as unknown as {
    user: User & { password: string };
    addresses: Address[];
    wishlist: { productId: string; priceAtAdd: number }[];
    orders: DemoOrderSeed[];
  },
  trending: (searchJson as { trending: string[] }).trending,
  faqs: faqsJson as Faq[],
  offerNotifications: notificationsJson as AppNotification[],
  bankOffers: (offersJson as { bankOffers: string[] }).bankOffers,
};
