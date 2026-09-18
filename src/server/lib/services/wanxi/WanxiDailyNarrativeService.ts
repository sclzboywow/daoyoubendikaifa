import { renderPrompt } from '@server/lib/prompts';
import { generateAiObject } from '@server/utils/aiClient';
import type { WanxiDailyEventNarrativeResult } from '@shared/engine/wanxi';
import {
  getWanxiLocation,
  getWanxiNpcByRoleKey,
  type WanxiContinuityMessage,
} from '@shared/engine/wanxi';
import { z } from 'zod';
import {
  getWanxiNpcRelationshipSnapshot,
  requireWanxiDailyEventAvailable,
} from './WanxiContinuityService';

const eventBeatSchema = z.object({
  body: z.string().trim().min(1).max(220),
  gesture: z.string().trim().min(1).max(100).optional(),
  emotion: z
    .enum(['calm', 'hesitate', 'anger', 'sadness', 'relief'])
    .optional(),
  pauseAfterMs: z.number().int().min(0).max(1200).optional(),
});

export async function getWanxiDailyEventNarrative(args: {
  cultivatorId: string;
  eventId: string;
}): Promise<WanxiDailyEventNarrativeResult> {
  const { event, dateKey } = await requireWanxiDailyEventAvailable(args);
  const npc = getWanxiNpcByRoleKey(event.roleKey);
  const location = getWanxiLocation(event.locationId);
  const relationship = await getWanxiNpcRelationshipSnapshot({
    cultivatorId: args.cultivatorId,
    roleKey: event.roleKey,
  });
  const eventSnapshot = {
    id: event.id,
    title: event.title,
    summary: event.summary,
    promptLabel: event.promptLabel,
    roleKey: event.roleKey,
    npcName: npc?.name ?? event.roleKey,
    locationId: event.locationId,
    locationName: location?.name ?? event.locationId,
    completed: false,
  };
  const fallback = event.messages.map((message) => ({ ...message }));
  const schema = z.object({
    beats: z.array(eventBeatSchema).length(fallback.length),
  });
  const payload = {
    event: {
      id: event.id,
      title: event.title,
      summary: event.summary,
    },
    npc: npc
      ? {
          name: npc.name,
          identity: npc.identity,
          description: npc.description,
        }
      : { name: event.roleKey },
    relationship: {
      stage: relationship.stage,
      stageLabel: relationship.stageLabel,
      memoryNotes: relationship.memoryNotes.slice(-8),
    },
    canonicalBeats: fallback.map((message) => ({
      id: message.id,
      speaker: message.speaker ?? null,
      body: message.body,
      gesture: message.gesture ?? null,
      tone: message.tone ?? 'normal',
    })),
    facts: {
      dateKey,
      noStateMutation: true,
      noRewards: true,
      noNewMainStory: true,
    },
  };

  try {
    const { system, user } = renderPrompt('wanxi-daily-event', {
      payloadJson: JSON.stringify(payload),
    });
    const generated = await generateAiObject({
      system,
      prompt: user,
      schema,
      name: 'WanxiDailyEventBeats',
      description: '万戏坊日常后日谈演出节拍',
      sceneId: 'wanxi-daily-event',
      timeoutMs: 8_000,
      maxOutputTokens: 900,
    });
    return {
      dateKey,
      generated: true,
      event: eventSnapshot,
      messages: fallback.map((message, index): WanxiContinuityMessage => {
        const beat = generated.output.beats[index];
        return {
          ...message,
          id: `${message.id}:ai`,
          body: beat.body,
          ...(beat.gesture
            ? { gesture: beat.gesture }
            : message.gesture
              ? { gesture: message.gesture }
              : {}),
          ...(beat.emotion ? { emotion: beat.emotion } : {}),
          ...(beat.pauseAfterMs !== undefined
            ? { pauseAfterMs: beat.pauseAfterMs }
            : {}),
        };
      }),
    };
  } catch (error) {
    console.warn('[wanxi] daily event LLM fallback', {
      eventId: event.id,
      error,
    });
    return {
      dateKey,
      generated: false,
      event: eventSnapshot,
      messages: fallback,
    };
  }
}
