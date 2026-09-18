import type { WanxiSceneRuntimeSnapshot } from '@shared/engine/wanxi';
import { useCallback, useEffect, useState } from 'react';

type WanxiSceneQueryState = {
  data: WanxiSceneRuntimeSnapshot | null;
  loading: boolean;
  error: string | null;
};

type WanxiSceneApiResponse =
  | { success: true; data: WanxiSceneRuntimeSnapshot }
  | { success: false; error: string };

export function useWanxiSceneQuery() {
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<WanxiSceneQueryState>({
    data: null,
    loading: true,
    error: null,
  });

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
    setState((current) => ({ ...current, loading: true, error: null }));
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetch('/api/wanxi/scene', { signal: controller.signal })
      .then(async (response) => {
        const json = (await response.json()) as WanxiSceneApiResponse;
        if (!response.ok || !json.success) {
          throw new Error(
            'error' in json ? json.error : `HTTP ${response.status}`,
          );
        }
        return json.data;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : '万戏坊暂时无法进入',
        });
      });

    return () => controller.abort();
  }, [reloadToken]);

  return { ...state, reload };
}
