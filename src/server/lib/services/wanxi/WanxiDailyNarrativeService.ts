import { renderPrompt } from '@server/lib/prompts';
import { generateAiObject } from '@server/utils/aiClient';
import type {
  WanxiDailyEventNarrativeResult,
  WanxiDailyEventResolutionResult,
} from '@shared/engine/wanxi';
import {
  getWanxiDailyEventChoice,
  getWanxiDailyEventOpeningMessages,
  getWanxiLocation,
  getWanxiNpcByRoleKey,
  type WanxiContinuityMessage,
  type WanxiDailyEventDefinition,
} from '@shared/engine/wanxi';
import { z } from 'zod';
import {
  getWanxiNpcRelationshipSnapshot,
  requireWanxiDailyEventAvailable,
} from './WanxiContinuityService';
import { WanxiLampStoryError } from './WanxiLampStoryService';

const eventBeatSchema = z.object({
  body: z.string().trim().min(1).max(220),
  gesture: z.string().trim().min(1).max(100).optional(),
  emotion: z
    .enum(['calm', 'hesitate', 'anger', 'sadness', 'relief'])
    .optional(),
  pauseAfterMs: z.number().int().min(0).max(1200).optional(),
});

function snapshotEvent(
  event: WanxiDailyEventDefinition,
  completed = false,
) {
  const npc = getWanxiNpcByRoleKey(event.roleKey);
  const location = getWanxiLocation(event.locationId);
  return {
    id: event.id,
    title: event.title,
    summary: event.summary,
    promptLabel: event.promptLabel,
    roleKey: event.roleKey,
    npcName: npc?.name ?? event.roleKey,
    locationId: event.locationId,
    locationName: location?.name ?? event.locationId,
    completed,
  };
}

function mergeGeneratedBeats(
  canonical: readonly WanxiContinuityMessage[],
  beats: Array<{
    body: string;
    gesture?: string;
    emotion?: 'calm' | 'hesitate' | 'anger' | 'sadness' | 'relief';
    pauseAfterMs?: number;
  }>,
): WanxiContinuityMessage[] {
  return canonical.map((message, index) => {
    const beat = beats[index];
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
  });
}

async function relationshipPayload(cultivatorId: string, event: WanxiDailyEventDefinition) {
  const relationship = await getWanxiNpcRelationshipSnapshot({
    cultivatorId,
    roleKey: event.roleKey,
  });
  return {
    stage: relationship.stage,
    stageLabel: relationship.stageLabel,
    memoryNotes: relationship.memoryNotes.slice(-8),
  };
}

export async function getWanxiDailyEventNarrative(args: {
  cultivatorId: string;
  eventId: string;
}): Promise<WanxiDailyEventNarrativeResult> {
  const { event, dateKey } = await requireWanxiDailyEventAvailable(args);
  const npc = getWanxiNpcByRoleKey(event.roleKey);
  const relationship = await relationshipPayload(args.cultivatorId, event);
  const eventSnapshot = snapshotEvent(event);
  const fallback = getWanxiDailyEventOpeningMessages(event.id, event.messages);
  const schema = z.object({
    beats: z.array(eventBeatSchema).length(fallback.length),
  });
  const payload = {
    eventPhase: 'opening',
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
    relationship,
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
      playerHasNotRespondedYet: true,
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
      description: '万戏坊日常后日谈开场演出节拍',
      sceneId: 'wanxi-daily-event',
      timeoutMs: 8_000,
      maxOutputTokens: 900,
    });
    return {
      dateKey,
      generated: true,
      event: eventSnapshot,
      messages: mergeGeneratedBeats(fallback, generated.output.beats),
    };
  } catch (error) {
    console.warn('[wanxi] daily event opening LLM fallback', {
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

export async function getWanxiDailyEventResolutionNarrative(args: {
  cultivatorId: string;
  eventId: string;
  choiceId: string;
}): Promise<WanxiDailyEventResolutionResult> {
  const { event, dateKey } = await requireWanxiDailyEventAvailable(args);
  const choice = getWanxiDailyEventChoice(event.id, args.choiceId);
  if (!choice) {
    throw new WanxiLampStoryError('这句话和眼前这件事对不上', 400);
  }

  const npc = getWanxiNpcByRoleKey(event.roleKey);
  const relationship = await relationshipPayload(args.cultivatorId, event);
  const eventSnapshot = snapshotEvent(event, true);
  const playerMessage: WanxiContinuityMessage = {
    id: `${event.id}:${choice.id}:player`,
    speaker: '你',
    body: choice.playerText,
    tone: 'attention',
    pauseAfterMs: 260,
  };
  const canonicalResponse = choice.responseMessages.map((message) => ({
    ...message,
  }));
  const fallback = [playerMessage, ...canonicalResponse];
  const schema = z.object({
    beats: z.array(eventBeatSchema).length(canonicalResponse.length),
  });
  const payload = {
    eventPhase: 'response',
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
    relationship,
    playerChoice: {
      id: choice.id,
      label: choice.label,
      playerText: choice.playerText,
    },
    canonicalBeats: canonicalResponse.map((message) => ({
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
      answerThePlayerChoiceDirectly: true,
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
      name: 'WanxiDailyEventResponseBeats',
      description: '万戏坊日常事件对玩家选择的回应节拍',
      sceneId: 'wanxi-daily-event',
      timeoutMs: 8_000,
      maxOutputTokens: 720,
    });
    return {
      dateKey,
      generated: true,
      event: eventSnapshot,
      choice: {
        id: choice.id,
        label: choice.label,
        playerText: choice.playerText,
      },
      messages: [
        playerMessage,
        ...mergeGeneratedBeats(canonicalResponse, generated.output.beats),
      ],
    };
  } catch (error) {
    console.warn('[wanxi] daily event response LLM fallback', {
      eventId: event.id,
      choiceId: choice.id,
      error,
    });
    return {
      dateKey,
      generated: false,
      event: eventSnapshot,
      choice: {
        id: choice.id,
        label: choice.label,
        playerText: choice.playerText,
      },
      messages: fallback,
    };
  }
}
