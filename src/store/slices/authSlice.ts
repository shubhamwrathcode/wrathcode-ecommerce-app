import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/models';
import { resetApp } from '../actions';

export interface AuthState {
  user: User | null;
  isGuest: boolean;
}

const initialState: AuthState = { user: null, isGuest: false };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isGuest = false;
    },
    continueAsGuest(state) {
      state.user = null;
      state.isGuest = true;
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    loggedOut(state) {
      state.user = null;
      state.isGuest = false;
    },
  },
  extraReducers: b => b.addCase(resetApp, () => initialState),
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
