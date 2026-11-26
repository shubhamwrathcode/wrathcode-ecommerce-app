import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { syncOrderStatuses } from '@/store/thunks';

/**
 * Keeps simulated order statuses moving (section 7.7): recomputed on app
 * foreground and every 20 s (fast mode) / 5 min (realistic mode).
 */
export function useOrderSync() {
  const dispatch = useAppDispatch();
  const speed = useAppSelector(s => s.ui.demoSpeed);
  useEffect(() => {
    dispatch(syncOrderStatuses());
    const id = setInterval(
      () => dispatch(syncOrderStatuses()),
      speed === 'fast' ? 20000 : 300000,
    );
    const sub = AppState.addEventListener(
      'change',
      st => st === 'active' && dispatch(syncOrderStatuses()),
    );
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [dispatch, speed]);
}
