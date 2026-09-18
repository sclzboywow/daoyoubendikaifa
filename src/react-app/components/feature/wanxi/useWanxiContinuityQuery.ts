import type { WanxiContinuitySnapshot } from '@shared/engine/wanxi';
import { useCallback, useEffect, useState } from 'react';

type State = {
  data: WanxiContinuitySnapshot | null;
  loading: boolean;
  error: string | null;
};

type ApiResponse =
  | { success: true; data: WanxiContinuitySnapshot }
  | { success: false; error: string };

export function useWanxiContinuityQuery() {
  const [token, setToken] = useState(0);
  const [state, setState] = useState<State>({
    data: null,
    loading: true,
    error: null,
  });

  const reload = useCallback(() => {
    setToken((value) => value + 1);
    setState((current) => ({ ...current, loading: true, error: null }));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/wanxi/continuity', { signal: controller.signal })
      .then(async (response) => {
        const json = (await response.json()) as ApiResponse;
        if (!response.ok || !json.success) {
          throw new Error('error' in json ? json.error : `HTTP ${response.status}`);
        }
        return json.data;
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : '万戏坊纪事读取失败',
        });
      });
    return () => controller.abort();
  }, [token]);

  return { ...state, reload };
}
