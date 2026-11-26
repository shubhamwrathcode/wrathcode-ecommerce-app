import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useOrderSync } from '@/hooks/useOrderSync';
import { LegalScreen } from '@/screens/account/AboutScreen';
import { NotificationsScreen } from '@/screens/account/NotificationsScreen';
import { EmailLoginScreen } from '@/screens/auth/EmailLoginScreen';
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { OtpVerifyScreen } from '@/screens/auth/OtpVerifyScreen';
import { ProfileSetupScreen } from '@/screens/auth/ProfileSetupScreen';
import { ResetPasswordScreen } from '@/screens/auth/ResetPasswordScreen';
import { SignUpScreen } from '@/screens/auth/SignUpScreen';
import { AddEditAddressScreen } from '@/screens/checkout/AddEditAddressScreen';
import { AddressPickerScreen } from '@/screens/checkout/AddressPickerScreen';
import { CheckoutAddressScreen } from '@/screens/checkout/CheckoutAddressScreen';
import { CheckoutDeliveryScreen } from '@/screens/checkout/CheckoutDeliveryScreen';
import { CheckoutPaymentScreen } from '@/screens/checkout/CheckoutPaymentScreen';
import { CheckoutReviewScreen } from '@/screens/checkout/CheckoutReviewScreen';
import { OrderResultScreen } from '@/screens/checkout/OrderResultScreen';
import { PaymentEntryScreen } from '@/screens/checkout/PaymentEntryScreen';
import { PaymentProcessingScreen } from '@/screens/checkout/PaymentProcessingScreen';
import { ProductListScreen } from '@/screens/listing/ProductListScreen';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
import { CancelOrderScreen } from '@/screens/orders/CancelOrderScreen';
import { OrderDetailsScreen } from '@/screens/orders/OrderDetailsScreen';
import { ReturnRequestScreen } from '@/screens/orders/ReturnRequestScreen';
import { TrackOrderScreen } from '@/screens/orders/TrackOrderScreen';
import { WriteReviewScreen } from '@/screens/orders/WriteReviewScreen';
import { AllReviewsScreen } from '@/screens/product/AllReviewsScreen';
import { ImageGalleryScreen } from '@/screens/product/ImageGalleryScreen';
import { ProductDetailsScreen } from '@/screens/product/ProductDetailsScreen';
import { SearchScreen } from '@/screens/search/SearchScreen';
import { ChatSupportScreen } from '@/screens/support/ChatSupportScreen';
import { useAppSelector } from '@/store/hooks';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Launch flow (section 4.1):
 *   Onboarding (first launch) > Login / Continue as guest > Main tabs.
 * Auth screens stay mounted for guests so they can log in from checkout
 * (Flow E). As soon as a user exists React Navigation drops them and the
 * guest lands back where they were.
 */
export function RootNavigator() {
  const onboardingDone = useAppSelector(s => s.ui.onboardingDone);
  const user = useAppSelector(s => s.auth.user);
  const isGuest = useAppSelector(s => s.auth.isGuest);
  const hasSession = !!user || isGuest;
  useOrderSync();

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      {!onboardingDone ? (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ animation: 'fade' }}
        />
      ) : (
        <>
          {hasSession ? (
            <Stack.Group>
              <Stack.Screen
                name="Main"
                component={MainTabs}
                options={{ animation: 'fade' }}
              />
              <Stack.Screen
                name="Search"
                component={SearchScreen}
                options={{ animation: 'fade' }}
              />
              <Stack.Screen name="ProductList" component={ProductListScreen} />
              <Stack.Screen
                name="ProductDetails"
                component={ProductDetailsScreen}
              />
              <Stack.Screen name="AllReviews" component={AllReviewsScreen} />
              <Stack.Screen
                name="ImageGallery"
                component={ImageGalleryScreen}
                options={{ presentation: 'fullScreenModal', animation: 'fade' }}
              />
              <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
              <Stack.Screen
                name="AddEditAddress"
                component={AddEditAddressScreen}
              />
              <Stack.Screen
                name="AddressPicker"
                component={AddressPickerScreen}
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="CheckoutAddress"
                component={CheckoutAddressScreen}
              />
              <Stack.Screen
                name="CheckoutDelivery"
                component={CheckoutDeliveryScreen}
              />
              <Stack.Screen
                name="CheckoutPayment"
                component={CheckoutPaymentScreen}
              />
              <Stack.Screen
                name="PaymentEntry"
                component={PaymentEntryScreen}
              />
              <Stack.Screen
                name="CheckoutReview"
                component={CheckoutReviewScreen}
              />
              <Stack.Screen
                name="PaymentProcessing"
                component={PaymentProcessingScreen}
                options={{ gestureEnabled: false, animation: 'fade' }}
              />
              <Stack.Screen
                name="OrderResult"
                component={OrderResultScreen}
                options={{ gestureEnabled: false, animation: 'fade' }}
              />
              <Stack.Screen
                name="OrderDetails"
                component={OrderDetailsScreen}
              />
              <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
              <Stack.Screen name="CancelOrder" component={CancelOrderScreen} />
              <Stack.Screen
                name="ReturnRequest"
                component={ReturnRequestScreen}
              />
              <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
              />
              <Stack.Screen name="ChatSupport" component={ChatSupportScreen} />
              <Stack.Screen name="Legal" component={LegalScreen} />
            </Stack.Group>
          ) : null}
          {!user ? (
            <Stack.Group navigationKey={hasSession ? 'guest' : 'anonymous'}>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
              <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
              />
              <Stack.Screen
                name="ResetPassword"
                component={ResetPasswordScreen}
              />
              <Stack.Screen
                name="ProfileSetup"
                component={ProfileSetupScreen}
              />
            </Stack.Group>
          ) : null}
        </>
      )}
    </Stack.Navigator>
  );
}
