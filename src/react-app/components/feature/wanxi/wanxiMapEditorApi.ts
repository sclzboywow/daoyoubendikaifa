import type {
  WanxiMapEditorSnapshot,
} from '@shared/contracts/wanxiMapEditor';
import type { WanxiMapCalibrationDraft } from '@shared/engine/wanxi/calibration';

async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as
    | { success?: boolean; data?: T; error?: string }
    | null;

  if (!response.ok || !body?.success || body.data === undefined) {
    throw new Error(body?.error ?? `请求失败（${response.status}）`);
  }
  return body.data;
}

export async function fetchWanxiMapEditorState() {
  return readJson<WanxiMapEditorSnapshot>(
    await fetch('/api/wanxi/editor/state'),
  );
}

export async function saveWanxiMapEditorState(
  state: WanxiMapCalibrationDraft,
) {
  return readJson<WanxiMapEditorSnapshot>(
    await fetch('/api/wanxi/editor/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    }),
  );
}

export async function resetWanxiMapEditorState() {
  return readJson<WanxiMapEditorSnapshot>(
    await fetch('/api/wanxi/editor/reset', {
      method: 'POST',
    }),
  );
}
