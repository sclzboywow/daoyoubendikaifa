import type {
  WanxiFirstContactMutationResponse,
} from '@shared/contracts/wanxiContinuity';
import type { WanxiCoreNpcRoleKey } from '@shared/engine/wanxi';

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

export async function resolveWanxiFirstContact(
  roleKey: WanxiCoreNpcRoleKey,
  choiceId: string,
) {
  const response = await fetch(
    `/api/wanxi/relationship/${encodeURIComponent(roleKey)}/first-contact`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choiceId }),
    },
  );
  if (!response.ok) return readError(response);
  return (await response.json()) as WanxiFirstContactMutationResponse;
}
