import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import { APP } from '@/config/app';
import { listenerMiddleware } from './listeners';
import { rootReducer } from './rootReducer';

const persistConfig = {
  key: APP.storageKeys.persist,
  version: 1,
  storage: AsyncStorage,
  // Checkout is a transient session and is never persisted.
  blacklist: ['checkout'],
};

export const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: getDefault =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      immutableCheck: { warnAfter: 128 },
    }).prepend(listenerMiddleware.middleware),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type { RootState } from './rootReducer';
