import { renderPrompt } from '@server/lib/prompts';
import { generateAiObject, streamAiText } from '@server/utils/aiClient';
import { truncateText } from '@server/utils/llmPayload';
import type {
  WanxiLampChatRoleKey,
  WanxiLampNarrativeResult,
  WanxiNpcChatRequest,
} from '@shared/contracts/wanxiStory';
import {
  getWanxiLampNarrativeTargetKey,
  getWanxiLampStoryLocationMessages,
  getWanxiLampStoryNpcMessages,
  getWanxiLocation,
  getWanxiNpcByRoleKey,
  shouldUseWanxiLampAiNarrative,
  type WanxiLampNarrativeTarget,
  type WanxiLampStoryMessage,
} from '@shared/engine/wanxi';
import { z } from 'zod';
import { getWanxiNpcRelationshipSnapshot } from './WanxiContinuityService';
import {
  getWanxiLampStorySnapshot,
  WanxiLampStoryError,
} from './WanxiLampStoryService';

const narrativeBeatSchema = z.object({
  body: z.string().trim().min(1).max(220),
  gesture: z.string().trim().min(1).max(100).optional(),
  emotion: z
    .enum(['calm', 'hesitate', 'anger', 'sadness', 'relief'])
    .optional(),
  pauseAfterMs: z.number().int().min(0).max(1200).optional(),
});
const LOCKED_BEAT_IDS = new Set([
  'confront:cut',
  'confront:q',
  'confront:a',
  'reunion:1',
  'reunion:2',
  'reunion:6',
  'reunion:8',
]);

function canonicalMessages(
  stage: Parameters<typeof getWanxiLampStoryNpcMessages>[0],
  target: WanxiLampNarrativeTarget,
): readonly WanxiLampStoryMessage[] | null {
  return target.type === 'npc'
    ? getWanxiLampStoryNpcMessages(stage, target.roleKey)
    : getWanxiLampStoryLocationMessages(stage, target.locationId);
}

function targetDescription(target: WanxiLampNarrativeTarget) {
  if (target.type === 'npc') {
    const npc = getWanxiNpcByRoleKey(target.roleKey);
    return npc
      ? { type: 'npc', id: npc.id, name: npc.name, identity: npc.identity }
      : { type: 'npc', id: target.roleKey, name: target.roleKey };
  }
  const location = getWanxiLocation(target.locationId);
  return location
    ? {
        type: 'location',
        id: location.id,
        name: location.name,
        description: location.description,
      }
    : { type: 'location', id: target.locationId, name: target.locationId };
}

function fallbackNarrative(args: {
  stage: Parameters<typeof getWanxiLampStoryNpcMessages>[0];
  target: WanxiLampNarrativeTarget;
  messages: readonly WanxiLampStoryMessage[];
}): WanxiLampNarrativeResult {
  return {
    stage: args.stage,
    targetKey: getWanxiLampNarrativeTargetKey(args.stage, args.target),
    generated: false,
    messages: args.messages.map((message) => ({ ...message })),
  };
}

export async function getWanxiLampNarrative(args: {
  cultivatorId: string;
  target: WanxiLampNarrativeTarget;
}): Promise<WanxiLampNarrativeResult> {
  const story = await getWanxiLampStorySnapshot(args.cultivatorId);
  const canonical = canonicalMessages(story.stage, args.target) ?? [];
  const fallback = fallbackNarrative({
    stage: story.stage,
    target: args.target,
    messages: canonical,
  });
  if (
    canonical.length === 0 ||
    !shouldUseWanxiLampAiNarrative(story.stage, args.target)
  ) {
    return fallback;
  }
  const schema = z.object({
    beats: z.array(narrativeBeatSchema).length(canonical.length),
  });
  const payload = {
    story: {
      id: story.storyId,
      title: story.title,
      stage: story.stage,
      objective: story.objective,
      summary: story.summary,
    },
    target: targetDescription(args.target),
    canonicalBeats: canonical.map((message) => ({
      id: message.id,
      speaker: message.speaker ?? null,
      body: message.body,
      gesture: message.gesture ?? null,
      tone: message.tone ?? 'normal',
      locked: LOCKED_BEAT_IDS.has(message.id),
    })),
    facts: {
      preserveOrder: true,
      noStateMutation: true,
      noRewards: true,
      noFutureSpoilers: true,
    },
  };
  try {
    const { system, user } = renderPrompt('wanxi-narrative', {
      payloadJson: JSON.stringify(payload),
    });
    const generated = await generateAiObject({
      system,
      prompt: user,
      schema,
      name: 'WanxiNarrativeBeats',
      description: '万戏坊受控剧情演出节拍',
      sceneId: 'wanxi-narrative',
      timeoutMs: 8_000,
      maxOutputTokens: 1_200,
    });
    return {
      ...fallback,
      generated: true,
      messages: canonical.map((message, index) => {
        const beat = generated.output.beats[index];
        const locked = LOCKED_BEAT_IDS.has(message.id);
        return {
          ...message,
          id: `${message.id}:ai`,
          body: locked ? message.body : beat.body,
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
    console.warn('[wanxi] narrative LLM fallback', {
      stage: story.stage,
      target: args.target,
      error,
    });
    return fallback;
  }
}

function npcChatFacts(roleKey: WanxiLampChatRoleKey) {
  if (roleKey === 'stage_musician') {
    return {
      npc: {
        name: '林照晚',
        identity: '百戏台琴师',
        voice:
          '克制、安静、清醒。不会因为感动就否定祁望川当年代替她作决定的错误。',
      },
      relationshipFacts: [
        '玩家帮助查清旧灯穗与旧灵契的真相。',
        '玩家见证林照晚与祁望川在听澜水榭重新谈话。',
        '林照晚没有说一切回到从前，只愿意与祁望川重新认识。',
      ],
      fallbackBody:
        '林照晚把琴弦轻轻按住：“旧事已经说开了。以后怎样，我想慢一点，也让他慢一点。”',
    };
  }
  return {
    npc: {
      name: '祁望川',
      identity: '机关匠',
      voice:
        '温和、笨拙、做事比说话利落。已经明白“替别人决定”本身也是一种伤害。',
    },
    relationshipFacts: [
      '玩家替祁望川查清并斩断旧灵契。',
      '玩家见证祁望川向林照晚道歉。',
      '两人没有直接恢复旧日关系，而是答应重新认识。',
    ],
    fallbackBody:
      '祁望川低头摆弄着一块薄木片：“这一次不赶着许诺。她愿意说话，我就先把话听完。”',
  };
}

export async function prepareWanxiLampNpcChat(args: {
  cultivatorId: string;
  roleKey: WanxiLampChatRoleKey;
  request: WanxiNpcChatRequest;
}) {
  const story = await getWanxiLampStorySnapshot(args.cultivatorId);
  if (!story.completed) {
    throw new WanxiLampStoryError('这段旧事还没有说完，眼下并不适合闲谈');
  }
  const facts = npcChatFacts(args.roleKey);
  const relationship = await getWanxiNpcRelationshipSnapshot({
    cultivatorId: args.cultivatorId,
    roleKey: args.roleKey,
  });
  const payload = {
    npc: facts.npc,
    storyFacts: {
      title: story.title,
      completed: true,
      ending: '林照晚与祁望川没有回到当年，只决定从今天重新认识。',
      importantBoundary:
        '祁望川救过林照晚的琴，但他当年替她决定“不告诉真相”仍然是错误；两件事同时成立。',
    },
    relationship: {
      stage: relationship.stage,
      stageLabel: relationship.stageLabel,
      memoryNotes: relationship.memoryNotes.slice(-10),
    },
    relationshipFacts: [
      ...facts.relationshipFacts,
      ...relationship.memoryNotes,
    ],
    forbiddenClaims: [
      '不得声称两人已经成婚或恢复成从前的恋人。',
      '不得声称玩家获得新的奖励、物品、灵石、属性或称号。',
      '不得创造新的主线剧情事实。',
    ],
    history: args.request.history.slice(-8).map((item) => ({
      role: item.role,
      body: truncateText(item.body, 240),
    })),
    playerMessage: truncateText(args.request.message, 160),
  };
  const { system, user } = renderPrompt('wanxi-npc-chat', {
    payloadJson: JSON.stringify(payload),
  });
  return {
    npcName: facts.npc.name,
    fallbackBody: facts.fallbackBody,
    stream(abortSignal?: AbortSignal) {
      const timeoutSignal = AbortSignal.timeout(20_000);
      const combined = abortSignal
        ? AbortSignal.any([abortSignal, timeoutSignal])
        : timeoutSignal;
      return streamAiText({
        system,
        prompt: user,
        sceneId: 'wanxi-npc-chat',
        abortSignal: combined,
        maxOutputTokens: 320,
      });
    },
  };
}
