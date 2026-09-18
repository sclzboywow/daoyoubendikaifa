import {
  getWanxiLampStoryActiveBindingIds,
  getWanxiLampStoryAttentionTarget,
  getWanxiLampStoryNpcPlacements,
  getWanxiLocation,
  getWanxiNpcById,
  getWanxiNpcByRoleKey,
  getWanxiWorldEncounterDefinition,
  isWanxiCoreNpcRoleKey,
  resolveWanxiMobileLocation,
  WANXI_DEFAULT_NPC_PLACEMENTS,
  WANXI_LOCATION_PLACEMENTS,
  WANXI_MAIN_SCENE,
  type WanxiNpcPlacement,
  type WanxiSceneRuntimeSnapshot,
} from '@shared/engine/wanxi';
import { wanxiPixelToPercent } from '@shared/engine/wanxi/calibration';
import { getWanxiContinuitySnapshot } from './WanxiContinuityService';
import { getWanxiSceneEditorRuntimeSnapshot } from './WanxiSceneEditorService';
import { getWanxiLampStorySnapshot } from './WanxiLampStoryService';
import { getWanxiWorldRuntime } from './WanxiWorldService';

function mergeNpcPlacements(
  baseline: readonly WanxiNpcPlacement[],
  storyPlacements: readonly WanxiNpcPlacement[],
  attentionNpcIds: ReadonlySet<string>,
): WanxiNpcPlacement[] {
  const byId = new Map<string, WanxiNpcPlacement>();
  for (const placement of baseline) {
    byId.set(placement.npcId, {
      ...placement,
      attention: attentionNpcIds.has(placement.npcId),
    });
  }
  for (const placement of storyPlacements) {
    byId.set(placement.npcId, {
      ...placement,
      attention:
        placement.attention || attentionNpcIds.has(placement.npcId),
    });
  }
  return [...byId.values()].sort(
    (left, right) =>
      (right.priority ?? 0) - (left.priority ?? 0),
  );
}

function mobileFallbackPoint(locationId: string, roleKey: string) {
  const placement = WANXI_LOCATION_PLACEMENTS.find(
    (item) => item.locationId === locationId,
  );
  if (!placement) return null;

  let hash = 2166136261;
  for (const char of roleKey) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  const offsetX = ((hash % 7) - 3) * 0.34;
  const offsetY = (((hash >>> 4) % 7) - 3) * 0.28;
  return {
    x: Math.max(1, Math.min(99, placement.point.x + offsetX)),
    y: Math.max(1, Math.min(99, placement.point.y + offsetY)),
  };
}

function editorScheduledPlacements(
  editor: Awaited<
    ReturnType<typeof getWanxiSceneEditorRuntimeSnapshot>
  >,
  world: Awaited<ReturnType<typeof getWanxiWorldRuntime>>,
  cultivatorId: string,
): WanxiNpcPlacement[] {
  if (!editor) {
    return [...WANXI_DEFAULT_NPC_PLACEMENTS];
  }

  const staticByNpc = new Map(
    WANXI_DEFAULT_NPC_PLACEMENTS.map((placement) => [
      placement.npcId,
      placement,
    ]),
  );
  const visibleRoleKeys = new Set(world.visibleRoleKeys);
  const locationSeed = `${cultivatorId}:${world.dateKey}:${world.daypart}`;

  return editor.state.npcPlacements
    .filter((placement) => {
      const npc = getWanxiNpcById(placement.npcId);
      if (!npc) return false;
      if (isWanxiCoreNpcRoleKey(npc.roleKey)) {
        return visibleRoleKeys.has(npc.roleKey);
      }
      // Legacy/test characters keep the editor's explicit runtime toggle.
      return placement.runtimeVisible;
    })
    .map((placement) => {
      const npc = getWanxiNpcById(placement.npcId);
      const fallback = staticByNpc.get(placement.npcId);
      const savedPoint = wanxiPixelToPercent(
        placement.point,
        WANXI_MAIN_SCENE.logicalSize,
      );
      if (!npc) {
        return {
          npcId: placement.npcId,
          regionId: placement.regionId,
          ...(placement.locationId
            ? { locationId: placement.locationId }
            : {}),
          point: savedPoint,
          anchor: 'bottom' as const,
          priority: fallback?.priority ?? 60,
          marker:
            fallback?.marker ??
            ({
              importance: 'normal' as const,
              minScale: 0.55,
            }),
        };
      }

      const scheduledLocationId = resolveWanxiMobileLocation({
        roleKey: npc.roleKey,
        seed: locationSeed,
        fallbackLocationId:
          placement.locationId ?? 'central_square',
      });
      const scheduledLocation = getWanxiLocation(scheduledLocationId);
      const moved =
        scheduledLocationId !== placement.locationId &&
        ['storyteller', 'roaming_merchant', 'runner_boy', 'night_watchman', 'mysterious_girl'].includes(
          npc.roleKey,
        );
      const point =
        moved
          ? mobileFallbackPoint(scheduledLocationId, npc.roleKey) ??
            savedPoint
          : savedPoint;

      return {
        npcId: placement.npcId,
        regionId:
          moved && scheduledLocation
            ? scheduledLocation.regionId
            : placement.regionId,
        ...(moved
          ? { locationId: scheduledLocationId }
          : placement.locationId
            ? { locationId: placement.locationId }
            : {}),
        point,
        anchor: 'bottom' as const,
        priority: fallback?.priority ?? 60,
        marker:
          fallback?.marker ??
          ({
            importance: 'normal' as const,
            minScale: 0.55,
          }),
      };
    });
}

function applyEditorCoordinatesToStory(
  storyPlacements: readonly WanxiNpcPlacement[],
  editor: Awaited<
    ReturnType<typeof getWanxiSceneEditorRuntimeSnapshot>
  >,
): WanxiNpcPlacement[] {
  if (!editor) return [...storyPlacements];

  const savedByNpc = new Map(
    editor.state.npcPlacements.map((placement) => [
      placement.npcId,
      placement,
    ]),
  );

  return storyPlacements.map((placement) => {
    const saved = savedByNpc.get(placement.npcId);
    if (!saved || saved.locationId !== placement.locationId) {
      return placement;
    }
    return {
      ...placement,
      point: wanxiPixelToPercent(
        saved.point,
        WANXI_MAIN_SCENE.logicalSize,
      ),
    };
  });
}

export async function resolveWanxiSceneRuntimeSnapshot(
  cultivatorId: string,
): Promise<WanxiSceneRuntimeSnapshot> {
  const [story, editor, world] = await Promise.all([
    getWanxiLampStorySnapshot(cultivatorId),
    getWanxiSceneEditorRuntimeSnapshot(),
    getWanxiWorldRuntime({ cultivatorId }),
  ]);
  const continuity = await getWanxiContinuitySnapshot(
    cultivatorId,
    {
      storyCompleted: story.completed,
    },
  );

  const attention = getWanxiLampStoryAttentionTarget(story.stage);
  const rawStoryPlacements =
    getWanxiLampStoryNpcPlacements(story.stage);
  const storyPlacements = applyEditorCoordinatesToStory(
    rawStoryPlacements,
    editor,
  );

  const attentionNpcIds = new Set<string>();
  if (attention?.type === 'npc') {
    attentionNpcIds.add(attention.npcId);
  }

  if (continuity.unlocked) {
    for (const event of continuity.dailyEvents) {
      if (event.completed) continue;
      const npc = getWanxiNpcByRoleKey(event.roleKey);
      if (npc) attentionNpcIds.add(npc.id);
    }
  }

  for (const encounterId of world.activeEncounterIds) {
    const encounter =
      getWanxiWorldEncounterDefinition(encounterId);
    if (encounter?.source.type === 'npc') {
      const npc = getWanxiNpcByRoleKey(encounter.source.roleKey);
      if (npc) attentionNpcIds.add(npc.id);
    }
  }

  const worldLocationAttention = new Set(
    world.activeEncounterIds.flatMap((encounterId) => {
      const encounter =
        getWanxiWorldEncounterDefinition(encounterId);
      return encounter?.kind === 'regional_story'
        ? [encounter.locationId]
        : [];
    }),
  );

  return {
    sceneId: WANXI_MAIN_SCENE.id,
    revision: 10 + (editor?.revision ?? 0),
    npcPlacements: mergeNpcPlacements(
      editorScheduledPlacements(
        editor,
        world,
        cultivatorId,
      ),
      storyPlacements,
      attentionNpcIds,
    ),
    enabledActivityBindingIds: [
      ...new Set([
        ...getWanxiLampStoryActiveBindingIds(story.stage),
        ...world.activeEncounterIds,
      ]),
    ],
    locationStates: WANXI_LOCATION_PLACEMENTS.map(
      (placement) => ({
        locationId: placement.locationId,
        state:
          attention?.type === 'location' &&
          attention.locationId === placement.locationId
            ? ('attention' as const)
            : worldLocationAttention.has(placement.locationId)
              ? ('attention' as const)
              : ('normal' as const),
        ...((attention?.type === 'location' &&
          attention.locationId === placement.locationId) ||
        worldLocationAttention.has(placement.locationId)
          ? { badge: '事' }
          : {}),
      }),
    ),
    propStates: world.propStates,
    world: {
      dateKey: world.dateKey,
      daypart: world.daypart,
      activeEncounterIds: world.activeEncounterIds,
      storyStage: world.storyStage,
    },
  };
}
