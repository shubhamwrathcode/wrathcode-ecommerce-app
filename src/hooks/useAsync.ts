import {
  DependencyList,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  reload: () => Promise<void>;
  refresh: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | undefined>>;
}

/** Loads data from a (fake) service with loading / error / pull-to-refresh states. */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: DependencyList,
): AsyncState<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);
  const callId = useRef(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);

  const exec = useCallback(
    async (mode: 'load' | 'refresh') => {
      const id = ++callId.current;
      if (mode === 'load') setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const res = await run();
        if (mounted.current && id === callId.current) setData(res);
      } catch (e) {
        if (mounted.current && id === callId.current) setError(e as Error);
      } finally {
        if (mounted.current && id === callId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [run],
  );

  useEffect(() => {
    mounted.current = true;
    exec('load');
    return () => {
      mounted.current = false;
    };
  }, [exec]);

  return {
    data,
    loading,
    refreshing,
    error,
    setData,
    reload: () => exec('load'),
    refresh: () => exec('refresh'),
  };
}
