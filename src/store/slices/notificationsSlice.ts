import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppNotification } from '@/types/models';
import { resetApp } from '../actions';

export interface NotificationsState {
  list: AppNotification[];
  seeded: boolean;
}

const initialState: NotificationsState = { list: [], seeded: false };

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    seed(s, a: PayloadAction<AppNotification[]>) {
      if (s.seeded) return;
      s.list = a.payload;
      s.seeded = true;
    },
    push(s, a: PayloadAction<AppNotification>) {
      s.list.unshift(a.payload);
      s.list = s.list.slice(0, 100);
    },
    markRead(s, a: PayloadAction<string>) {
      const n = s.list.find(x => x.id === a.payload);
      if (n) n.isRead = true;
    },
    markAllRead(s) {
      s.list.forEach(n => {
        n.isRead = true;
      });
    },
    remove(s, a: PayloadAction<string>) {
      s.list = s.list.filter(n => n.id !== a.payload);
    },
  },
  extraReducers: b => b.addCase(resetApp, () => initialState),
});

export const notificationsActions = notificationsSlice.actions;
export default notificationsSlice.reducer;
