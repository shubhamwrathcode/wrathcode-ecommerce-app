import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import type { Collection, ProductFilters } from '@/types/models';

export type OtpPurpose = 'login' | 'signup' | 'forgot';

export type HomeStackParamList = {
  Home: undefined;
  Offers: undefined;
};

export type CategoriesStackParamList = {
  Categories: { categoryId?: string } | undefined;
  SubCategories: { categoryId: string; name: string };
};

export type WishlistStackParamList = {
  Wishlist: undefined;
};

export type CartStackParamList = {
  Cart: undefined;
  ApplyCoupon: undefined;
};

export type AccountStackParamList = {
  Account: undefined;
  EditProfile: undefined;
  Orders: undefined;
  Addresses: undefined;
  SavedCards: undefined;
  Help: undefined;
  Settings: undefined;
  About: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  CategoriesTab: NavigatorScreenParams<CategoriesStackParamList>;
  WishlistTab: NavigatorScreenParams<WishlistStackParamList>;
  CartTab: NavigatorScreenParams<CartStackParamList>;
  AccountTab: NavigatorScreenParams<AccountStackParamList>;
};

export interface ProductListParams {
  title?: string;
  query?: string;
  subCategoryId?: string;
  collection?: Collection;
  filters?: Partial<ProductFilters>;
}

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  // Auth
  Login: { redirect?: boolean } | undefined;
  OtpVerify: {
    mobile: string;
    purpose: OtpPurpose;
    signup?: { name: string; email: string; password: string };
  };
  EmailLogin: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { mobile: string };
  ProfileSetup: { mobile: string };
  // Main
  Main: NavigatorScreenParams<MainTabParamList>;
  Search: undefined;
  ProductList: ProductListParams;
  ProductDetails: { productId: string };
  AllReviews: { productId: string; productName: string };
  ImageGallery: { images: string[]; index: number };
  WriteReview: {
    orderId: string;
    productId: string;
    variantId: string;
    name: string;
    image: string;
  };
  AddEditAddress: { addressId?: string; fromCheckout?: boolean } | undefined;
  AddressPicker: undefined;
  // Checkout
  CheckoutAddress: undefined;
  CheckoutDelivery: undefined;
  CheckoutPayment: undefined;
  PaymentEntry: { method: 'upi' | 'card' };
  CheckoutReview: undefined;
  PaymentProcessing: undefined;
  OrderResult:
    | { status: 'success'; orderId: string }
    | { status: 'failure'; message: string };
  // Orders
  OrderDetails: { orderId: string };
  TrackOrder: { orderId: string };
  CancelOrder: { orderId: string };
  ReturnRequest: { orderId: string };
  // Misc
  Notifications: undefined;
  ChatSupport: undefined;
  Legal: { kind: 'terms' | 'privacy' };
};

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
export type RootNav = NativeStackNavigationProp<RootStackParamList>;

type TabStack<
  P extends Record<string, object | undefined>,
  T extends keyof P & string,
  Tab extends keyof MainTabParamList,
> = CompositeScreenProps<
  NativeStackScreenProps<P, T>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, Tab>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type HomeScreenProps<T extends keyof HomeStackParamList> = TabStack<
  HomeStackParamList,
  T,
  'HomeTab'
>;
export type CategoriesScreenProps<T extends keyof CategoriesStackParamList> =
  TabStack<CategoriesStackParamList, T, 'CategoriesTab'>;
export type WishlistScreenProps<T extends keyof WishlistStackParamList> =
  TabStack<WishlistStackParamList, T, 'WishlistTab'>;
export type CartScreenProps<T extends keyof CartStackParamList> = TabStack<
  CartStackParamList,
  T,
  'CartTab'
>;
export type AccountScreenProps<T extends keyof AccountStackParamList> =
  TabStack<AccountStackParamList, T, 'AccountTab'>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
