import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RULES } from '@/config/rules';
import { resetApp } from '../actions';

export interface HistoryState {
  recentlyViewed: string[];
  recentSearches: string[];
}

const initialState: HistoryState = { recentlyViewed: [], recentSearches: [] };

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    viewed(s, a: PayloadAction<string>) {
      s.recentlyViewed = [
        a.payload,
        ...s.recentlyViewed.filter(id => id !== a.payload),
      ].slice(0, RULES.recentlyViewedLimit);
    },
    searched(s, a: PayloadAction<string>) {
      const q = a.payload.trim();
      if (!q) return;
      s.recentSearches = [
        q,
        ...s.recentSearches.filter(x => x.toLowerCase() !== q.toLowerCase()),
      ].slice(0, RULES.search.recentLimit);
    },
    removeSearch(s, a: PayloadAction<string>) {
      s.recentSearches = s.recentSearches.filter(x => x !== a.payload);
    },
    clearSearches(s) {
      s.recentSearches = [];
    },
  },
  extraReducers: b => b.addCase(resetApp, () => initialState),
});

export const historyActions = historySlice.actions;
export default historySlice.reducer;
