import {
  getWanxiLampStoryActiveBindingIds,
  getWanxiLampStoryAttentionTarget,
  getWanxiLampStoryNpcPlacements,
  getWanxiNpcByRoleKey,
  WANXI_DEFAULT_NPC_PLACEMENTS,
  WANXI_LOCATION_PLACEMENTS,
  WANXI_MAIN_SCENE,
  type WanxiNpcPlacement,
  type WanxiSceneRuntimeSnapshot,
} from '@shared/engine/wanxi';
import { getWanxiContinuitySnapshot } from './WanxiContinuityService';
import { getWanxiLampStorySnapshot } from './WanxiLampStoryService';

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
      attention: placement.attention || attentionNpcIds.has(placement.npcId),
    });
  }
  return [...byId.values()].sort(
    (left, right) => (right.priority ?? 0) - (left.priority ?? 0),
  );
}

export async function resolveWanxiSceneRuntimeSnapshot(
  cultivatorId: string,
): Promise<WanxiSceneRuntimeSnapshot> {
  const story = await getWanxiLampStorySnapshot(cultivatorId);
  const continuity = await getWanxiContinuitySnapshot(cultivatorId, {
    storyCompleted: story.completed,
  });
  const attention = getWanxiLampStoryAttentionTarget(story.stage);
  const storyPlacements = getWanxiLampStoryNpcPlacements(story.stage);
  const attentionNpcIds = new Set<string>();
  if (attention?.type === 'npc') attentionNpcIds.add(attention.npcId);
  if (continuity.unlocked) {
    for (const event of continuity.dailyEvents) {
      if (event.completed) continue;
      const npc = getWanxiNpcByRoleKey(event.roleKey);
      if (npc) attentionNpcIds.add(npc.id);
    }
  }

  return {
    sceneId: WANXI_MAIN_SCENE.id,
    revision: 3,
    npcPlacements: mergeNpcPlacements(
      WANXI_DEFAULT_NPC_PLACEMENTS,
      storyPlacements,
      attentionNpcIds,
    ),
    enabledActivityBindingIds: getWanxiLampStoryActiveBindingIds(story.stage),
    locationStates: WANXI_LOCATION_PLACEMENTS.map((placement) => ({
      locationId: placement.locationId,
      state:
        attention?.type === 'location' &&
        attention.locationId === placement.locationId
          ? ('attention' as const)
          : ('normal' as const),
      ...(attention?.type === 'location' &&
      attention.locationId === placement.locationId
        ? { badge: '事' }
        : {}),
    })),
  };
}
