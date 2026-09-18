import {
  getWanxiLampStoryActiveBindingIds,
  getWanxiLampStoryAttentionTarget,
  getWanxiLampStoryNpcPlacements,
  WANXI_DEFAULT_NPC_PLACEMENTS,
  WANXI_LOCATION_PLACEMENTS,
  WANXI_MAIN_SCENE,
  type WanxiNpcPlacement,
  type WanxiSceneRuntimeSnapshot,
} from '@shared/engine/wanxi';
import { getWanxiLampStorySnapshot } from './WanxiLampStoryService';

function mergeNpcPlacements(
  baseline: readonly WanxiNpcPlacement[],
  storyPlacements: readonly WanxiNpcPlacement[],
  attentionNpcId?: string,
): WanxiNpcPlacement[] {
  const byId = new Map<string, WanxiNpcPlacement>();
  for (const placement of baseline) {
    byId.set(placement.npcId, {
      ...placement,
      attention: placement.npcId === attentionNpcId,
    });
  }
  for (const placement of storyPlacements) {
    byId.set(placement.npcId, {
      ...placement,
      attention: placement.attention || placement.npcId === attentionNpcId,
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
  const attention = getWanxiLampStoryAttentionTarget(story.stage);
  const storyPlacements = getWanxiLampStoryNpcPlacements(story.stage);

  return {
    sceneId: WANXI_MAIN_SCENE.id,
    revision: 2,
    npcPlacements: mergeNpcPlacements(
      WANXI_DEFAULT_NPC_PLACEMENTS,
      storyPlacements,
      attention?.type === 'npc' ? attention.npcId : undefined,
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
