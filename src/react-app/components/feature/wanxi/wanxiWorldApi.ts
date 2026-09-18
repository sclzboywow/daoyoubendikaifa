import type {
  WanxiWorldEncounterOpenResponse,
  WanxiWorldEncounterResolveResponse,
  WanxiWorldEncounterView,
  WanxiWorldEncounterResolution,
} from '@shared/contracts/wanxiWorld';

async function readError(response: Response): Promise<never> {
  let message = `HTTP ${response.status}`;
  try {
    const payload = (await response.json()) as {
      error?: string;
      message?: string;
    };
    message = payload.message || payload.error || message;
  } catch {
    /* ignore malformed error payload */
  }
  throw new Error(message);
}

export async function fetchWanxiWorldEncounter(
  encounterId: string,
  signal?: AbortSignal,
): Promise<WanxiWorldEncounterView> {
  const response = await fetch('/api/wanxi/world/encounter/open', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ encounterId }),
    signal,
  });
  if (!response.ok) return readError(response);
  const payload =
    (await response.json()) as WanxiWorldEncounterOpenResponse;
  return payload.data;
}

export async function resolveWanxiWorldEncounter(
  encounterId: string,
  choiceId: string,
): Promise<WanxiWorldEncounterResolution> {
  const response = await fetch('/api/wanxi/world/encounter/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ encounterId, choiceId }),
  });
  if (!response.ok) return readError(response);
  const payload =
    (await response.json()) as WanxiWorldEncounterResolveResponse;
  return payload.data;
}
