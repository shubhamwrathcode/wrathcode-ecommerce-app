import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DemoSpeed } from '@/config/rules';
import { resetApp } from '../actions';

export type Language = 'en' | 'hi' | 'ta' | 'bn';

export interface UiState {
  onboardingDone: boolean;
  darkMode: boolean;
  language: Language;
  demoSpeed: DemoSpeed;
  notifyOrders: boolean;
  notifyOffers: boolean;
  gridView: boolean;
}

const initialState: UiState = {
  onboardingDone: false,
  darkMode: false,
  language: 'en',
  demoSpeed: 'fast',
  notifyOrders: true,
  notifyOffers: true,
  gridView: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    completeOnboarding(s) {
      s.onboardingDone = true;
    },
    setDarkMode(s, a: PayloadAction<boolean>) {
      s.darkMode = a.payload;
    },
    setLanguage(s, a: PayloadAction<Language>) {
      s.language = a.payload;
    },
    setDemoSpeed(s, a: PayloadAction<DemoSpeed>) {
      s.demoSpeed = a.payload;
    },
    setNotifyOrders(s, a: PayloadAction<boolean>) {
      s.notifyOrders = a.payload;
    },
    setNotifyOffers(s, a: PayloadAction<boolean>) {
      s.notifyOffers = a.payload;
    },
    toggleGridView(s) {
      s.gridView = !s.gridView;
    },
  },
  // Keep the onboarding flag on reset so a demo restarts at Login, not the slides.
  extraReducers: b =>
    b.addCase(resetApp, s => ({
      ...initialState,
      onboardingDone: s.onboardingDone,
    })),
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;
