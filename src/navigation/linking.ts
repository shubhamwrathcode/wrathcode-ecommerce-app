import type { LinkingOptions } from '@react-navigation/native';
import { APP } from '@/config/app';
import type { RootStackParamList } from './types';

/**
 * Deep-link ready structure (section 3.1), e.g.
 *   shopverse://product/p012
 *   shopverse://orders/SV2611241234
 *   shopverse://search
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [...APP.deepLinkPrefixes],
  config: {
    screens: {
      Main: {
        screens: {
          HomeTab: { screens: { Home: 'home', Offers: 'offers' } },
          CategoriesTab: {
            screens: {
              Categories: 'categories',
              SubCategories: 'categories/:categoryId',
            },
          },
          WishlistTab: { screens: { Wishlist: 'wishlist' } },
          CartTab: { screens: { Cart: 'cart', ApplyCoupon: 'cart/coupons' } },
          AccountTab: {
            screens: {
              Account: 'account',
              Orders: 'orders',
              Settings: 'settings',
              Help: 'help',
            },
          },
        },
      },
      Search: 'search',
      ProductList: 'list',
      ProductDetails: 'product/:productId',
      OrderDetails: 'orders/:orderId',
      TrackOrder: 'orders/:orderId/track',
      Notifications: 'notifications',
    },
  },
};
