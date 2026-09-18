import type { DbTransaction } from '@server/lib/drizzle/db';
import {
  completeWanxiDailyEvent,
  findWanxiDailyEventProgress,
  findWanxiNpcRelationship,
  listWanxiDailyEventProgress,
  listWanxiNpcRelationships,
  saveWanxiNpcRelationship,
} from '@server/lib/repositories/wanxiContinuityRepository';
import {
  findWanxiStoryProgress,
  saveWanxiStoryProgress,
} from '@server/lib/repositories/wanxiStoryRepository';
import { playerCommandExecutor } from '@server/lib/services/CommandExecutors';
import type {
  WanxiWorldEncounterResolution,
  WanxiWorldEncounterView,
} from '@shared/contracts/wanxiWorld';
import {
  getWanxiDailyDateKey,
  getWanxiNpcByRoleKey,
  getWanxiPropById,
  getWanxiWorldDaypart,
  getWanxiWorldEncounterDefinition,
  isWanxiCoreNpcRoleKey,
  resolveWanxiRegionalStoryEncounter,
  resolveWanxiScheduledCoreRoles,
  selectWanxiCrossEvents,
  selectWanxiLifeEvents,
  selectWanxiPropEvents,
  WANXI_PROPS,
  WANXI_WORLD_STORY_ID,
  type WanxiNpcRoleKey,
  type WanxiPropRuntimeState,
  type WanxiWorldEncounterDefinition,
  type WanxiWorldRuntimeSummary,
} from '@shared/engine/wanxi';
import { WanxiLampStoryError } from './WanxiLampStoryService';

const STORY_SCHEMA_VERSION = 1;

function storyStageOf(
  progress: Awaited<ReturnType<typeof findWanxiStoryProgress>>,
) {
  if (!progress) return 'not_started';
  return String(progress.stage);
}

function encounterActor(
  event: WanxiWorldEncounterDefinition,
): WanxiWorldEncounterView['actor'] {
  if (event.source.type === 'npc') {
    const npc = getWanxiNpcByRoleKey(event.source.roleKey);
    if (!npc) {
      throw new WanxiLampStoryError('坊中这位人物暂时找不到', 404);
    }
    return {
      id: npc.id,
      sigil: npc.sigil,
      name: npc.name,
      identity: npc.identity,
      responsibility: npc.description,
      appearance: 'person',
    };
  }

  const prop = getWanxiPropById(event.source.propId);
  if (!prop) {
    throw new WanxiLampStoryError('这件物件暂时找不到', 404);
  }
  return {
    id: prop.id,
    sigil: prop.sigil,
    name: prop.name,
    identity: '坊中物件',
    responsibility: prop.description,
    appearance: 'facility',
  };
}

function encounterView(
  event: WanxiWorldEncounterDefinition,
): WanxiWorldEncounterView {
  return {
    id: event.id,
    kind: event.kind,
    title: event.title,
    summary: event.summary,
    promptLabel: event.promptLabel,
    actor: encounterActor(event),
    participants: event.participants.map((roleKey) => ({
      roleKey,
      name: getWanxiNpcByRoleKey(roleKey)?.name ?? roleKey,
    })),
    locationId: event.locationId,
    opening: event.opening.map((message, index) => ({
      id: `${event.id}:open:${index}`,
      ...message,
    })),
    choices: event.choices.map((choice) => ({
      id: choice.id,
      label: choice.label,
      playerText: choice.playerText,
    })),
  };
}

export interface WanxiWorldRuntimeState extends WanxiWorldRuntimeSummary {
  activeEncounterIds: string[];
  propStates: WanxiPropRuntimeState[];
  storyStage: string;
}

export async function getWanxiWorldRuntime(args: {
  cultivatorId: string;
  now?: Date;
}): Promise<WanxiWorldRuntimeState> {
  const now = args.now ?? new Date();
  const dateKey = getWanxiDailyDateKey(now);
  const daypart = getWanxiWorldDaypart(now);
  const [relationships, completed, story] = await Promise.all([
    listWanxiNpcRelationships(args.cultivatorId),
    listWanxiDailyEventProgress(args.cultivatorId, dateKey),
    findWanxiStoryProgress(args.cultivatorId, WANXI_WORLD_STORY_ID),
  ]);

  const metRoleKeys = new Set<WanxiNpcRoleKey>(
    relationships
      .filter((row) => row.interactionCount > 0 || row.familiarity > 0)
      .map((row) => row.npcRoleKey),
  );
  const visibleRoleKeys = new Set<WanxiNpcRoleKey>(
    resolveWanxiScheduledCoreRoles({
      seed: `${args.cultivatorId}:${dateKey}`,
      daypart,
    }),
  );

  const storyStage = storyStageOf(story);
  const storyEncounter =
    storyStage === 'completed'
      ? null
      : resolveWanxiRegionalStoryEncounter(storyStage);
  if (storyEncounter?.source.type === 'npc') {
    visibleRoleKeys.add(storyEncounter.source.roleKey);
  }

  const completedIds = new Set(completed.map((row) => row.eventId));
  const selectionSeed = `${args.cultivatorId}:${dateKey}:${daypart}`;
  const dailyEvents = [
    ...selectWanxiLifeEvents({
      seed: selectionSeed,
      visibleRoleKeys,
      metRoleKeys,
      count: 4,
    }),
    ...selectWanxiCrossEvents({
      seed: selectionSeed,
      visibleRoleKeys,
      metRoleKeys,
      count: 1,
    }),
    ...selectWanxiPropEvents({
      seed: selectionSeed,
      count: 3,
    }),
  ].filter((event) => !completedIds.has(event.id));

  const activeEncounterIds = [
    ...dailyEvents.map((event) => event.id),
    ...(storyEncounter ? [storyEncounter.id] : []),
  ];

  const attentionPropIds = new Set(
    dailyEvents
      .filter((event) => event.source.type === 'prop')
      .map((event) =>
        event.source.type === 'prop' ? event.source.propId : '',
      )
      .filter(Boolean),
  );
  if (storyEncounter?.source.type === 'prop') {
    attentionPropIds.add(storyEncounter.source.propId);
  }

  const propStates: WanxiPropRuntimeState[] = WANXI_PROPS.map(
    (prop) => ({
      propId: prop.id,
      state: attentionPropIds.has(prop.id)
        ? 'attention'
        : 'normal',
      ...(attentionPropIds.has(prop.id) ? { badge: '事' } : {}),
    }),
  );

  return {
    dateKey,
    daypart,
    visibleRoleKeys: [...visibleRoleKeys],
    activeEncounterIds,
    propStates,
    storyStage,
  };
}

async function requireActiveEncounter(args: {
  cultivatorId: string;
  encounterId: string;
}) {
  const definition = getWanxiWorldEncounterDefinition(args.encounterId);
  if (!definition) {
    throw new WanxiLampStoryError('这件坊中小事并不存在', 404);
  }

  const runtime = await getWanxiWorldRuntime({
    cultivatorId: args.cultivatorId,
  });
  if (!runtime.activeEncounterIds.includes(definition.id)) {
    throw new WanxiLampStoryError(
      definition.kind === 'regional_story'
        ? '这段旧事现在还没有走到这里'
        : '这件小事今天已经错过，或已经经历过了',
      409,
    );
  }
  return { definition, runtime };
}

export async function openWanxiWorldEncounter(args: {
  cultivatorId: string;
  encounterId: string;
}) {
  const { definition } = await requireActiveEncounter(args);
  return encounterView(definition);
}

async function rememberForParticipants(args: {
  tx: DbTransaction;
  cultivatorId: string;
  event: WanxiWorldEncounterDefinition;
}) {
  for (const roleKey of args.event.participants) {
    if (!isWanxiCoreNpcRoleKey(roleKey)) continue;
    const current = await findWanxiNpcRelationship(
      args.cultivatorId,
      roleKey,
      args.tx,
    );

    // Prop interactions do not silently "meet" a character the player has
    // never spoken to. Life/cross/story encounters already require or imply contact.
    if (
      args.event.source.type === 'prop' &&
      (!current || current.interactionCount <= 0)
    ) {
      continue;
    }

    await saveWanxiNpcRelationship(
      {
        cultivatorId: args.cultivatorId,
        npcRoleKey: roleKey,
        familiarity:
          (current?.familiarity ?? 0) +
          args.event.familiarityDelta,
        interactionCount:
          (current?.interactionCount ?? 0) + 1,
        memoryTags: [
          ...new Set([
            ...(current?.memoryTags ?? []),
            args.event.memoryTag,
          ]),
        ],
        milestones: current?.milestones ?? [],
        lastInteractionAt: new Date(),
      },
      args.tx,
    );
  }
}

function resolutionFor(
  event: WanxiWorldEncounterDefinition,
  choiceId: string,
): WanxiWorldEncounterResolution {
  const choice = event.choices.find((candidate) => candidate.id === choiceId);
  if (!choice) {
    throw new WanxiLampStoryError('这句话和眼前这件事对不上', 400);
  }
  return {
    encounterId: event.id,
    choice: {
      id: choice.id,
      label: choice.label,
      playerText: choice.playerText,
    },
    messages: [
      {
        id: `${event.id}:${choice.id}:player`,
        speaker: '你',
        body: choice.playerText,
        tone: 'attention',
        pauseAfterMs: 220,
      },
      ...choice.response.map((message, index) => ({
        id: `${event.id}:${choice.id}:response:${index}`,
        ...message,
      })),
    ],
    memoryText: event.memoryText,
    ...(event.kind === 'regional_story' &&
    event.nextStoryStage === 'completed'
      ? { storyCompleted: true }
      : {}),
  };
}

export async function resolveWanxiWorldEncounter(args: {
  userId: string;
  cultivatorId: string;
  encounterId: string;
  choiceId: string;
}) {
  const { definition } = await requireActiveEncounter({
    cultivatorId: args.cultivatorId,
    encounterId: args.encounterId,
  });
  const resolution = resolutionFor(definition, args.choiceId);

  return playerCommandExecutor.executeWithLock({
    userId: args.userId,
    cultivatorId: args.cultivatorId,
    source: 'wanxi_world_encounter',
    allowEmpty: true,
    command: async (tx) => {
      if (definition.kind === 'regional_story') {
        const current = await findWanxiStoryProgress(
          args.cultivatorId,
          WANXI_WORLD_STORY_ID,
          tx,
        );
        const currentStage = storyStageOf(current);
        if (currentStage !== definition.storyStage) {
          throw new WanxiLampStoryError(
            '这段旧事已经往前走了',
            409,
          );
        }
        await saveWanxiStoryProgress(
          {
            cultivatorId: args.cultivatorId,
            storyId: WANXI_WORLD_STORY_ID,
            // repository currently shares the LampStory stage type; storage is varchar.
            stage: definition.nextStoryStage as never,
            schemaVersion: STORY_SCHEMA_VERSION,
            state: {
              ...(current?.state ?? {}),
              [`choice:${definition.id}`]: args.choiceId,
              lastEncounterId: definition.id,
            },
            completedAt:
              definition.nextStoryStage === 'completed'
                ? new Date()
                : null,
          },
          tx,
        );
      } else {
        const dateKey = getWanxiDailyDateKey();
        const completed = await findWanxiDailyEventProgress(
          args.cultivatorId,
          dateKey,
          definition.id,
          tx,
        );
        if (completed) {
          throw new WanxiLampStoryError(
            '这件小事今天已经经历过了',
            409,
          );
        }
        await completeWanxiDailyEvent(
          {
            cultivatorId: args.cultivatorId,
            eventDate: dateKey,
            eventId: definition.id,
          },
          tx,
        );
      }

      await rememberForParticipants({
        tx,
        cultivatorId: args.cultivatorId,
        event: definition,
      });

      return {
        result: resolution,
        resourceChanges: [],
      };
    },
  });
}
