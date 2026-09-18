import type {
  WanxiDailyEventCompleteResponse,
  WanxiDailyEventNarrativeResponse,
} from '@shared/contracts/wanxiContinuity';
import type {
  WanxiContinuitySnapshot,
  WanxiDailyEventNarrativeResult,
} from '@shared/engine/wanxi';

async function readError(response: Response): Promise<never> {
  let message = `HTTP ${response.status}`;
  try {
    const payload = (await response.json()) as { error?: string; message?: string };
    message = payload.message || payload.error || message;
  } catch {}
  throw new Error(message);
}

export async function fetchWanxiDailyEventNarrative(
  eventId: string,
  signal?: AbortSignal,
): Promise<WanxiDailyEventNarrativeResult> {
  const response = await fetch('/api/wanxi/continuity/event/narrative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId }),
    signal,
  });
  if (!response.ok) return readError(response);
  const payload = (await response.json()) as WanxiDailyEventNarrativeResponse;
  return payload.data;
}

export async function completeWanxiDailyEvent(
  eventId: string,
): Promise<WanxiContinuitySnapshot> {
  const response = await fetch('/api/wanxi/continuity/event/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId }),
  });
  if (!response.ok) return readError(response);
  const payload = (await response.json()) as WanxiDailyEventCompleteResponse;
  return payload.data;
}
