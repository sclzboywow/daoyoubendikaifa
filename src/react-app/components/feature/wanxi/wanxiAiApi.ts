import type {
  WanxiLampChatRoleKey,
  WanxiLampNarrativeResponse,
  WanxiLampNarrativeResult,
  WanxiNpcChatRequest,
  WanxiNpcChatStreamEvent,
} from '@shared/contracts/wanxiStory';
import type { WanxiLampNarrativeTarget } from '@shared/engine/wanxi';

async function readError(response: Response): Promise<never> {
  let message = `HTTP ${response.status}`;
  try {
    const payload = (await response.json()) as { error?: string; message?: string };
    message = payload.message || payload.error || message;
  } catch {}
  throw new Error(message);
}

export async function fetchWanxiLampNarrative(
  target: WanxiLampNarrativeTarget,
  signal?: AbortSignal,
): Promise<WanxiLampNarrativeResult> {
  const response = await fetch('/api/wanxi/story/lamp/narrative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target }),
    signal,
  });
  if (!response.ok) return readError(response);
  const payload = (await response.json()) as WanxiLampNarrativeResponse;
  return payload.data;
}

export async function streamWanxiNpcChat(
  roleKey: WanxiLampChatRoleKey,
  request: WanxiNpcChatRequest,
  handlers: {
    onStart?(messageId: string, npcName: string): void;
    onChunk?(messageId: string, text: string): void;
    onComplete?(messageId: string, body: string): void;
    onError?(messageId: string, fallbackBody: string): void;
  },
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(
    `/api/wanxi/story/lamp/chat/${encodeURIComponent(roleKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    },
  );
  if (!response.ok) return readError(response);
  if (!response.body) throw new Error('万戏坊的回应没有传回来');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const flush = () => {
    const segments = buffer.split('\n\n');
    buffer = segments.pop() ?? '';
    for (const segment of segments) {
      const data = segment
        .split('\n')
        .filter((line) => line.startsWith('data: '))
        .map((line) => line.slice(6))
        .join('\n')
        .trim();
      if (!data) continue;
      const event = JSON.parse(data) as WanxiNpcChatStreamEvent;
      if (event.type === 'chat-start') handlers.onStart?.(event.messageId, event.npcName);
      else if (event.type === 'chat-chunk') handlers.onChunk?.(event.messageId, event.text);
      else if (event.type === 'chat-complete') handlers.onComplete?.(event.messageId, event.body);
      else handlers.onError?.(event.messageId, event.fallbackBody);
    }
  };
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    flush();
  }
  buffer += decoder.decode();
  flush();
}
