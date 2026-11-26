import { combineReducers } from '@reduxjs/toolkit';
import address from './slices/addressSlice';
import auth from './slices/authSlice';
import cart from './slices/cartSlice';
import checkout from './slices/checkoutSlice';
import history from './slices/historySlice';
import notifications from './slices/notificationsSlice';
import orders from './slices/ordersSlice';
import payments from './slices/paymentsSlice';
import ui from './slices/uiSlice';
import wishlist from './slices/wishlistSlice';

export const rootReducer = combineReducers({
  auth,
  cart,
  wishlist,
  orders,
  address,
  ui,
  history,
  notifications,
  payments,
  checkout,
});

export type RootState = ReturnType<typeof rootReducer>;
