import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP } from '@/config/app';
import { mock } from '@/mock';
import type { Review, User } from '@/types/models';

/**
 * The fake "server" state: data a real backend would own and mutate
 * (stock levels, registered users, user-written reviews). Persisted on device
 * so the demo survives restarts; wiped by "Reset demo data".
 */
export interface LocalUser extends User {
  password: string;
}

interface DbState {
  stock: Record<string, number>; // variantId -> stock override
  users: LocalUser[];
  reviews: Review[];
  helpful: Record<string, number>;
}

const initialState = (): DbState => ({
  stock: {},
  users: [{ ...mock.demo.user }],
  reviews: [],
  helpful: {},
});

let state: DbState = initialState();
let loaded = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const db = {
  async init() {
    if (loaded) return;
    try {
      const raw = await AsyncStorage.getItem(APP.storageKeys.db);
      if (raw) state = { ...initialState(), ...(JSON.parse(raw) as DbState) };
    } catch {
      state = initialState();
    }
    loaded = true;
  },
  get(): DbState {
    return state;
  },
  update(mutator: (s: DbState) => void) {
    mutator(state);
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      AsyncStorage.setItem(APP.storageKeys.db, JSON.stringify(state)).catch(
        () => undefined,
      );
    }, 150);
  },
  async reset() {
    state = initialState();
    await AsyncStorage.removeItem(APP.storageKeys.db);
  },
};
