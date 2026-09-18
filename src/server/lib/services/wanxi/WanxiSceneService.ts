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
import { wanxiPixelToPercent } from '@shared/engine/wanxi/calibration';
import { getWanxiContinuitySnapshot } from './WanxiContinuityService';
import { getWanxiSceneEditorRuntimeSnapshot } from './WanxiSceneEditorService';
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

function editorBaselinePlacements(
  editor: Awaited<ReturnType<typeof getWanxiSceneEditorRuntimeSnapshot>>,
): WanxiNpcPlacement[] {
  if (!editor) return [...WANXI_DEFAULT_NPC_PLACEMENTS];

  const staticByNpc = new Map(
    WANXI_DEFAULT_NPC_PLACEMENTS.map((placement) => [
      placement.npcId,
      placement,
    ]),
  );

  return editor.state.npcPlacements
    .filter((placement) => placement.runtimeVisible)
    .map((placement) => {
      const fallback = staticByNpc.get(placement.npcId);
      return {
        npcId: placement.npcId,
        regionId: placement.regionId,
        ...(placement.locationId
          ? { locationId: placement.locationId }
          : {}),
        point: wanxiPixelToPercent(
          placement.point,
          WANXI_MAIN_SCENE.logicalSize,
        ),
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
  editor: Awaited<ReturnType<typeof getWanxiSceneEditorRuntimeSnapshot>>,
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
  const [story, editor] = await Promise.all([
    getWanxiLampStorySnapshot(cultivatorId),
    getWanxiSceneEditorRuntimeSnapshot(),
  ]);
  const continuity = await getWanxiContinuitySnapshot(cultivatorId, {
    storyCompleted: story.completed,
  });
  const attention = getWanxiLampStoryAttentionTarget(story.stage);
  const rawStoryPlacements = getWanxiLampStoryNpcPlacements(story.stage);
  const storyPlacements = applyEditorCoordinatesToStory(
    rawStoryPlacements,
    editor,
  );
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
    revision: 4 + (editor?.revision ?? 0),
    npcPlacements: mergeNpcPlacements(
      editorBaselinePlacements(editor),
      storyPlacements,
      attentionNpcIds,
    ),
    enabledActivityBindingIds: getWanxiLampStoryActiveBindingIds(
      story.stage,
    ),
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
