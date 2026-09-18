import type { DbExecutor, DbTransaction } from '@server/lib/drizzle/db';
import {
  completeWanxiDailyEvent,
  findWanxiDailyEventProgress,
  findWanxiNpcRelationship,
  listWanxiDailyEventProgress,
  listWanxiNpcRelationships,
  saveWanxiNpcRelationship,
} from '@server/lib/repositories/wanxiContinuityRepository';
import { findWanxiStoryProgress } from '@server/lib/repositories/wanxiStoryRepository';
import { playerCommandExecutor } from '@server/lib/services/CommandExecutors';
import {
  describeWanxiMemoryTag,
  getWanxiDailyDateKey,
  getWanxiDailyEventDefinition,
  getWanxiLocation,
  getWanxiNpcByRoleKey,
  resolveWanxiRelationshipStage,
  selectWanxiDailyEvents,
  WANXI_BASE_STORY_MEMORIES,
  WANXI_LAMP_STORY_ID,
  type WanxiContinuitySnapshot,
  type WanxiDailyEventDefinition,
  type WanxiDailyEventSnapshot,
  type WanxiNpcRelationshipSnapshot,
} from '@shared/engine/wanxi';
import { getWanxiLampStorySnapshot, WanxiLampStoryError } from './WanxiLampStoryService';

const CONTINUITY_ROLE_KEYS = ['stage_musician', 'mechanist'] as const;
type ContinuityRoleKey = (typeof CONTINUITY_ROLE_KEYS)[number];

function baseRelationship(roleKey: ContinuityRoleKey) {
  return WANXI_BASE_STORY_MEMORIES[roleKey];
}

function relationshipSnapshot(args: {
  roleKey: ContinuityRoleKey;
  familiarity: number;
  memoryTags: readonly string[];
  lastInteractionAt?: Date | null;
}): WanxiNpcRelationshipSnapshot {
  const npc = getWanxiNpcByRoleKey(args.roleKey);
  const stage = resolveWanxiRelationshipStage(args.familiarity);
  return {
    roleKey: args.roleKey,
    npcName: npc?.name ?? args.roleKey,
    stage: stage.stage,
    stageLabel: stage.label,
    memoryNotes: args.memoryTags.map(describeWanxiMemoryTag),
    ...(args.lastInteractionAt
      ? { lastInteractionAt: args.lastInteractionAt.toISOString() }
      : {}),
  };
}

function eventSnapshot(
  event: WanxiDailyEventDefinition,
  completedIds: ReadonlySet<string>,
): WanxiDailyEventSnapshot {
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
    completed: completedIds.has(event.id),
  };
}

async function buildUnlockedSnapshot(args: {
  cultivatorId: string;
  dateKey: string;
  executor?: DbExecutor | DbTransaction;
}): Promise<WanxiContinuitySnapshot> {
  const [relationships, completed] = await Promise.all([
    listWanxiNpcRelationships(args.cultivatorId, args.executor),
    listWanxiDailyEventProgress(args.cultivatorId, args.dateKey, args.executor),
  ]);
  const byRole = new Map(relationships.map((row) => [row.npcRoleKey, row]));
  const completedIds = new Set(completed.map((row) => row.eventId));
  const selected = selectWanxiDailyEvents({
    seed: `${args.cultivatorId}:${args.dateKey}`,
    count: 3,
  });
  const relationshipSnapshots = CONTINUITY_ROLE_KEYS.map((roleKey) => {
    const current = byRole.get(roleKey);
    const base = baseRelationship(roleKey);
    return relationshipSnapshot({
      roleKey,
      familiarity: current?.familiarity ?? base.familiarity,
      memoryTags: current?.memoryTags ?? base.memoryTags,
      lastInteractionAt: current?.lastInteractionAt,
    });
  });
  return {
    unlocked: true,
    dateKey: args.dateKey,
    relationships: relationshipSnapshots,
    dailyEvents: selected.map((event) => eventSnapshot(event, completedIds)),
    completedToday: selected.filter((event) => completedIds.has(event.id)).length,
    totalMemories: relationshipSnapshots.reduce(
      (total, relationship) => total + relationship.memoryNotes.length,
      0,
    ),
  };
}

export async function getWanxiContinuitySnapshot(
  cultivatorId: string,
  options?: {
    now?: Date;
    executor?: DbExecutor | DbTransaction;
    storyCompleted?: boolean;
  },
): Promise<WanxiContinuitySnapshot> {
  const dateKey = getWanxiDailyDateKey(options?.now);
  const completed =
    options?.storyCompleted ?? (await getWanxiLampStorySnapshot(cultivatorId)).completed;
  if (!completed) {
    return {
      unlocked: false,
      dateKey,
      relationships: [],
      dailyEvents: [],
      completedToday: 0,
      totalMemories: 0,
    };
  }
  return buildUnlockedSnapshot({
    cultivatorId,
    dateKey,
    executor: options?.executor,
  });
}

export async function getWanxiNpcRelationshipSnapshot(args: {
  cultivatorId: string;
  roleKey: ContinuityRoleKey;
}): Promise<WanxiNpcRelationshipSnapshot> {
  const story = await getWanxiLampStorySnapshot(args.cultivatorId);
  if (!story.completed) {
    const npc = getWanxiNpcByRoleKey(args.roleKey);
    return {
      roleKey: args.roleKey,
      npcName: npc?.name ?? args.roleKey,
      stage: 'stranger',
      stageLabel: '陌生',
      memoryNotes: [],
    };
  }
  const current = await findWanxiNpcRelationship(args.cultivatorId, args.roleKey);
  const base = baseRelationship(args.roleKey);
  return relationshipSnapshot({
    roleKey: args.roleKey,
    familiarity: current?.familiarity ?? base.familiarity,
    memoryTags: current?.memoryTags ?? base.memoryTags,
    lastInteractionAt: current?.lastInteractionAt,
  });
}

export async function requireWanxiDailyEventAvailable(args: {
  cultivatorId: string;
  eventId: string;
  executor?: DbExecutor | DbTransaction;
  now?: Date;
}): Promise<{ event: WanxiDailyEventDefinition; dateKey: string }> {
  const storyCompleted = args.executor
    ? (
        await findWanxiStoryProgress(
          args.cultivatorId,
          WANXI_LAMP_STORY_ID,
          args.executor,
        )
      )?.stage === 'completed'
    : (await getWanxiLampStorySnapshot(args.cultivatorId)).completed;
  if (!storyCompleted) {
    throw new WanxiLampStoryError('先把《灯火未迟》的旧事说完，再来看看坊中的日常');
  }
  const dateKey = getWanxiDailyDateKey(args.now);
  const selected = selectWanxiDailyEvents({
    seed: `${args.cultivatorId}:${dateKey}`,
    count: 3,
  });
  const event = selected.find((candidate) => candidate.id === args.eventId);
  if (!event || !getWanxiDailyEventDefinition(args.eventId)) {
    throw new WanxiLampStoryError('这件坊中见闻今天并没有发生', 404);
  }
  const completed = await findWanxiDailyEventProgress(
    args.cultivatorId,
    dateKey,
    event.id,
    args.executor,
  );
  if (completed) {
    throw new WanxiLampStoryError('这件小事今天已经经历过了');
  }
  return { event, dateKey };
}

export async function completeWanxiDailyEventAndRemember(args: {
  userId: string;
  cultivatorId: string;
  eventId: string;
}) {
  return playerCommandExecutor.executeWithLock({
    userId: args.userId,
    cultivatorId: args.cultivatorId,
    source: 'wanxi_daily_event',
    allowEmpty: true,
    command: async (tx) => {
      const { event, dateKey } = await requireWanxiDailyEventAvailable({
        cultivatorId: args.cultivatorId,
        eventId: args.eventId,
        executor: tx,
      });
      const current = await findWanxiNpcRelationship(
        args.cultivatorId,
        event.roleKey,
        tx,
      );
      const base = baseRelationship(event.roleKey);
      const memoryTags = [
        ...new Set([...(current?.memoryTags ?? base.memoryTags), event.memoryTag]),
      ];
      await saveWanxiNpcRelationship(
        {
          cultivatorId: args.cultivatorId,
          npcRoleKey: event.roleKey,
          familiarity: Math.min(
            20,
            (current?.familiarity ?? base.familiarity) + event.familiarityDelta,
          ),
          interactionCount: (current?.interactionCount ?? 1) + 1,
          memoryTags,
          milestones: current?.milestones ?? [],
          lastInteractionAt: new Date(),
        },
        tx,
      );
      await completeWanxiDailyEvent(
        {
          cultivatorId: args.cultivatorId,
          eventDate: dateKey,
          eventId: event.id,
        },
        tx,
      );
      return {
        result: {
          continuity: await buildUnlockedSnapshot({
            cultivatorId: args.cultivatorId,
            dateKey,
            executor: tx,
          }),
        },
        resourceChanges: [],
      };
    },
  });
}
