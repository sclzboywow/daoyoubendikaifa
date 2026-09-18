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
  describeWanxiFirstContactMemoryTag,
  describeWanxiInteractiveMemoryTag,
  describeWanxiMemoryTagForRole,
  getWanxiDailyDateKey,
  getWanxiDailyEventChoice,
  getWanxiDailyEventDefinition,
  getWanxiFirstContactChoice,
  getWanxiFirstContactDefinition,
  getWanxiLocation,
  getWanxiNpcByRoleKey,
  isWanxiCoreNpcRoleKey,
  isWanxiLegacyNpcRoleKey,
  resolveWanxiRelationshipStage,
  selectWanxiDailyEvents,
  WANXI_BASE_STORY_MEMORIES,
  WANXI_CORE_NPC_ROLE_KEYS,
  WANXI_LAMP_STORY_ID,
  WANXI_LEGACY_NPC_ROLE_KEYS,
  type WanxiContinuitySnapshot,
  type WanxiCoreNpcRoleKey,
  type WanxiDailyEventDefinition,
  type WanxiDailyEventSnapshot,
  type WanxiFirstContactResolutionResult,
  type WanxiNpcRelationshipSnapshot,
  type WanxiNpcRoleKey,
} from '@shared/engine/wanxi';
import {
  getWanxiLampStorySnapshot,
  WanxiLampStoryError,
} from './WanxiLampStoryService';

const FIRST_CONTACT_MILESTONE = 'wanxi.first_contact';

function emptyBaseRelationship() {
  return {
    familiarity: 0,
    memoryTags: [] as string[],
    memoryNotes: [] as string[],
  };
}

function baseRelationship(
  roleKey: WanxiNpcRoleKey,
  storyCompleted: boolean,
) {
  if (
    storyCompleted &&
    (roleKey === 'stage_musician' || roleKey === 'mechanist')
  ) {
    return WANXI_BASE_STORY_MEMORIES[roleKey];
  }
  return emptyBaseRelationship();
}

function relationshipSnapshot(args: {
  roleKey: WanxiNpcRoleKey;
  familiarity: number;
  interactionCount: number;
  memoryTags: readonly string[];
  milestones?: readonly string[];
  lastInteractionAt?: Date | null;
  metFallback?: boolean;
}): WanxiNpcRelationshipSnapshot {
  const npc = getWanxiNpcByRoleKey(args.roleKey);
  const stage = resolveWanxiRelationshipStage(args.familiarity);
  const milestones = new Set(args.milestones ?? []);
  return {
    roleKey: args.roleKey,
    npcName: npc?.name ?? args.roleKey,
    stage: stage.stage,
    stageLabel: stage.label,
    met:
      args.metFallback === true ||
      args.interactionCount > 0 ||
      args.familiarity > 0 ||
      milestones.has(FIRST_CONTACT_MILESTONE),
    interactionCount: Math.max(0, args.interactionCount),
    memoryNotes: args.memoryTags.map(
      (tag) =>
        describeWanxiFirstContactMemoryTag(tag) ??
        describeWanxiInteractiveMemoryTag(tag) ??
        describeWanxiMemoryTagForRole(args.roleKey, tag),
    ),
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

async function buildSnapshot(args: {
  cultivatorId: string;
  dateKey: string;
  storyCompleted: boolean;
  executor?: DbExecutor | DbTransaction;
}): Promise<WanxiContinuitySnapshot> {
  const [relationships, completed] = await Promise.all([
    listWanxiNpcRelationships(args.cultivatorId, args.executor),
    args.storyCompleted
      ? listWanxiDailyEventProgress(
          args.cultivatorId,
          args.dateKey,
          args.executor,
        )
      : Promise.resolve([]),
  ]);

  const byRole = new Map(relationships.map((row) => [row.npcRoleKey, row]));
  const relationshipRoles: WanxiNpcRoleKey[] = [
    ...WANXI_CORE_NPC_ROLE_KEYS,
    ...(args.storyCompleted ? WANXI_LEGACY_NPC_ROLE_KEYS : []),
  ];

  const relationshipSnapshots = relationshipRoles.map((roleKey) => {
    const current = byRole.get(roleKey);
    const base = baseRelationship(roleKey, args.storyCompleted);
    return relationshipSnapshot({
      roleKey,
      familiarity: current?.familiarity ?? base.familiarity,
      interactionCount:
        current?.interactionCount ??
        (args.storyCompleted && isWanxiLegacyNpcRoleKey(roleKey) ? 1 : 0),
      memoryTags: current?.memoryTags ?? base.memoryTags,
      milestones: current?.milestones ?? [],
      lastInteractionAt: current?.lastInteractionAt,
      metFallback:
        args.storyCompleted && isWanxiLegacyNpcRoleKey(roleKey),
    });
  });

  const completedIds = new Set(completed.map((row) => row.eventId));
  const selected = args.storyCompleted
    ? selectWanxiDailyEvents({
        seed: `${args.cultivatorId}:${args.dateKey}`,
        count: 3,
      })
    : [];

  return {
    // Kept for backward compatibility: it now means the old Lamp post-story
    // daily-event layer is unlocked, not whether NPC relationships exist.
    unlocked: args.storyCompleted,
    dateKey: args.dateKey,
    relationships: relationshipSnapshots,
    dailyEvents: selected.map((event) =>
      eventSnapshot(event, completedIds),
    ),
    completedToday: selected.filter((event) =>
      completedIds.has(event.id),
    ).length,
    totalMemories: relationshipSnapshots.reduce(
      (total, relationship) =>
        total + relationship.memoryNotes.length,
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
  const storyCompleted =
    options?.storyCompleted ??
    (await getWanxiLampStorySnapshot(cultivatorId)).completed;

  return buildSnapshot({
    cultivatorId,
    dateKey,
    storyCompleted,
    executor: options?.executor,
  });
}

export async function getWanxiNpcRelationshipSnapshot(args: {
  cultivatorId: string;
  roleKey: WanxiNpcRoleKey;
}): Promise<WanxiNpcRelationshipSnapshot> {
  const storyCompleted = isWanxiLegacyNpcRoleKey(args.roleKey)
    ? (await getWanxiLampStorySnapshot(args.cultivatorId)).completed
    : false;
  const current = await findWanxiNpcRelationship(
    args.cultivatorId,
    args.roleKey,
  );
  const base = baseRelationship(args.roleKey, storyCompleted);

  return relationshipSnapshot({
    roleKey: args.roleKey,
    familiarity: current?.familiarity ?? base.familiarity,
    interactionCount:
      current?.interactionCount ??
      (storyCompleted && isWanxiLegacyNpcRoleKey(args.roleKey) ? 1 : 0),
    memoryTags: current?.memoryTags ?? base.memoryTags,
    milestones: current?.milestones ?? [],
    lastInteractionAt: current?.lastInteractionAt,
    metFallback:
      storyCompleted && isWanxiLegacyNpcRoleKey(args.roleKey),
  });
}

async function storyCompletedInside(
  cultivatorId: string,
  executor?: DbExecutor | DbTransaction,
) {
  if (!executor) {
    return (await getWanxiLampStorySnapshot(cultivatorId)).completed;
  }
  return (
    await findWanxiStoryProgress(
      cultivatorId,
      WANXI_LAMP_STORY_ID,
      executor,
    )
  )?.stage === 'completed';
}

export async function resolveWanxiFirstContactAndRemember(args: {
  userId: string;
  cultivatorId: string;
  roleKey: WanxiCoreNpcRoleKey;
  choiceId: string;
}) {
  const definition = getWanxiFirstContactDefinition(args.roleKey);
  const choice = getWanxiFirstContactChoice(
    args.roleKey,
    args.choiceId,
  );
  if (!definition || !choice || !isWanxiCoreNpcRoleKey(args.roleKey)) {
    throw new WanxiLampStoryError('这句话和眼前的人对不上', 404);
  }

  return playerCommandExecutor.executeWithLock({
    userId: args.userId,
    cultivatorId: args.cultivatorId,
    source: 'wanxi_first_contact',
    allowEmpty: true,
    command: async (tx) => {
      const current = await findWanxiNpcRelationship(
        args.cultivatorId,
        args.roleKey,
        tx,
      );
      const milestones = new Set(current?.milestones ?? []);
      if (milestones.has(FIRST_CONTACT_MILESTONE)) {
        throw new WanxiLampStoryError(
          '你们已经正式打过照面了',
          409,
        );
      }

      const memoryTags = [
        ...new Set([
          ...(current?.memoryTags ?? []),
          choice.memoryTag,
        ]),
      ];
      const nextMilestones = [
        ...new Set([
          ...(current?.milestones ?? []),
          FIRST_CONTACT_MILESTONE,
        ]),
      ];

      const updated = await saveWanxiNpcRelationship(
        {
          cultivatorId: args.cultivatorId,
          npcRoleKey: args.roleKey,
          familiarity:
            (current?.familiarity ?? 0) +
            choice.familiarityDelta,
          interactionCount:
            (current?.interactionCount ?? 0) + 1,
          memoryTags,
          milestones: nextMilestones,
          lastInteractionAt: new Date(),
        },
        tx,
      );

      const storyCompleted = await storyCompletedInside(
        args.cultivatorId,
        tx,
      );
      const dateKey = getWanxiDailyDateKey();
      const relationship = relationshipSnapshot({
        roleKey: args.roleKey,
        familiarity: updated.familiarity,
        interactionCount: updated.interactionCount,
        memoryTags: updated.memoryTags,
        milestones: updated.milestones,
        lastInteractionAt: updated.lastInteractionAt,
      });

      const resolution: WanxiFirstContactResolutionResult = {
        roleKey: args.roleKey,
        choice: {
          id: choice.id,
          label: choice.label,
          playerText: choice.playerText,
        },
        messages: choice.responseMessages.map((message) => ({
          ...message,
        })),
      };

      return {
        result: {
          continuity: await buildSnapshot({
            cultivatorId: args.cultivatorId,
            dateKey,
            storyCompleted,
            executor: tx,
          }),
          relationship,
          resolution,
        },
        resourceChanges: [],
      };
    },
  });
}

export async function requireWanxiDailyEventAvailable(args: {
  cultivatorId: string;
  eventId: string;
  executor?: DbExecutor | DbTransaction;
  now?: Date;
}): Promise<{
  event: WanxiDailyEventDefinition;
  dateKey: string;
}> {
  const storyCompleted = await storyCompletedInside(
    args.cultivatorId,
    args.executor,
  );
  if (!storyCompleted) {
    throw new WanxiLampStoryError(
      '这批旧日后谈还没有解锁',
    );
  }

  const dateKey = getWanxiDailyDateKey(args.now);
  const selected = selectWanxiDailyEvents({
    seed: `${args.cultivatorId}:${dateKey}`,
    count: 3,
  });
  const event = selected.find(
    (candidate) => candidate.id === args.eventId,
  );
  if (!event || !getWanxiDailyEventDefinition(args.eventId)) {
    throw new WanxiLampStoryError(
      '这件坊中见闻今天并没有发生',
      404,
    );
  }

  const completed = await findWanxiDailyEventProgress(
    args.cultivatorId,
    dateKey,
    event.id,
    args.executor,
  );
  if (completed) {
    throw new WanxiLampStoryError(
      '这件小事今天已经经历过了',
    );
  }
  return { event, dateKey };
}

export async function completeWanxiDailyEventAndRemember(args: {
  userId: string;
  cultivatorId: string;
  eventId: string;
  choiceId: string;
}) {
  return playerCommandExecutor.executeWithLock({
    userId: args.userId,
    cultivatorId: args.cultivatorId,
    source: 'wanxi_daily_event',
    allowEmpty: true,
    command: async (tx) => {
      const { event, dateKey } =
        await requireWanxiDailyEventAvailable({
          cultivatorId: args.cultivatorId,
          eventId: args.eventId,
          executor: tx,
        });
      const choice = getWanxiDailyEventChoice(
        event.id,
        args.choiceId,
      );
      if (!choice) {
        throw new WanxiLampStoryError(
          '这句话和眼前这件事对不上',
          400,
        );
      }

      const current = await findWanxiNpcRelationship(
        args.cultivatorId,
        event.roleKey,
        tx,
      );
      const base = baseRelationship(event.roleKey, true);
      const memoryTags = [
        ...new Set([
          ...(current?.memoryTags ?? base.memoryTags),
          choice.memoryTag,
        ]),
      ];

      await saveWanxiNpcRelationship(
        {
          cultivatorId: args.cultivatorId,
          npcRoleKey: event.roleKey,
          familiarity: Math.min(
            20,
            (current?.familiarity ??
              base.familiarity) +
              event.familiarityDelta,
          ),
          interactionCount:
            (current?.interactionCount ?? 1) + 1,
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
          continuity: await buildSnapshot({
            cultivatorId: args.cultivatorId,
            dateKey,
            storyCompleted: true,
            executor: tx,
          }),
        },
        resourceChanges: [],
      };
    },
  });
}
