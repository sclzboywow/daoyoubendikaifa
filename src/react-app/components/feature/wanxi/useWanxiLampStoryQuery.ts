import type { WanxiLampStorySnapshot } from '@shared/engine/wanxi';
import { useCallback, useEffect, useState } from 'react';

type WanxiLampStoryQueryState = {
  data: WanxiLampStorySnapshot | null;
  loading: boolean;
  error: string | null;
};

type ApiResponse =
  | { success: true; data: WanxiLampStorySnapshot }
  | { success: false; error: string };

export function useWanxiLampStoryQuery() {
  const [token, setToken] = useState(0);
  const [state, setState] = useState<WanxiLampStoryQueryState>({
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
    void fetch('/api/wanxi/story/lamp', { signal: controller.signal })
      .then(async (response) => {
        const json = (await response.json()) as ApiResponse;
        if (!response.ok || !json.success) {
          throw new Error('error' in json ? json.error : `HTTP ${response.status}`);
        }
        return json.data;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({ data, loading: false, error: null });
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          loading: false,
          error: reason instanceof Error ? reason.message : '剧情状态读取失败',
        });
      });
    return () => controller.abort();
  }, [token]);

  return { ...state, reload };
}
