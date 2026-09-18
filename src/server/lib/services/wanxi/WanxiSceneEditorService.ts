import {
  findWanxiSceneEditorState,
  saveWanxiSceneEditorState,
} from '@server/lib/repositories/wanxiSceneEditorRepository';
import { WanxiMapEditorStateSchema } from '@shared/contracts/wanxiMapEditor';
import {
  WANXI_LOCATIONS,
  WANXI_NPCS,
  getWanxiLocation,
  getWanxiRegion,
} from '@shared/engine/wanxi/definitions';
import {
  type WanxiMapCalibrationDraft,
} from '@shared/engine/wanxi/calibration';
import { createDefaultWanxiMapCalibrationDraft } from '@shared/engine/wanxi/editorDefaults';

const SCENE_ID = 'wanxi_main';

export class WanxiSceneEditorError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = 'WanxiSceneEditorError';
  }
}

function normalizeEditorState(
  input: WanxiMapCalibrationDraft,
): WanxiMapCalibrationDraft {
  const parsed = WanxiMapEditorStateSchema.safeParse(input);
  if (!parsed.success) {
    throw new WanxiSceneEditorError(
      parsed.error.issues[0]?.message ?? '地图配置格式错误',
      400,
    );
  }

  const knownNpcIds = new Set<string>(WANXI_NPCS.map((npc) => npc.id));
  const knownLocationIds = new Set<string>(WANXI_LOCATIONS.map((location) => location.id));
  const seen = new Set<string>();

  for (const placement of parsed.data.npcPlacements) {
    if (!knownNpcIds.has(placement.npcId)) {
      throw new WanxiSceneEditorError(
        `未知 NPC：${placement.npcId}`,
        400,
      );
    }
    if (seen.has(placement.npcId)) {
      throw new WanxiSceneEditorError(
        `NPC 重复摆放：${placement.npcId}`,
        400,
      );
    }
    seen.add(placement.npcId);

    if (!getWanxiRegion(placement.regionId)) {
      throw new WanxiSceneEditorError(
        `未知 Region：${placement.regionId}`,
        400,
      );
    }
    if (placement.locationId && !knownLocationIds.has(placement.locationId)) {
      throw new WanxiSceneEditorError(
        `未知 Location：${placement.locationId}`,
        400,
      );
    }
    if (placement.locationId) {
      const location = getWanxiLocation(placement.locationId);
      if (location && location.regionId !== placement.regionId) {
        throw new WanxiSceneEditorError(
          `NPC ${placement.npcId} 的 Region / Location 不一致`,
          400,
        );
      }
    }
  }

  const defaults = createDefaultWanxiMapCalibrationDraft();
  const currentByNpc = new Map(
    parsed.data.npcPlacements.map((placement) => [
      placement.npcId,
      placement,
    ]),
  );

  return {
    ...parsed.data,
    logicalSize: defaults.logicalSize,
    npcPlacements: defaults.npcPlacements.map(
      (fallback) => currentByNpc.get(fallback.npcId) ?? fallback,
    ),
  };
}

function toSnapshot(
  row: {
    revision: number;
    payload: unknown;
    updatedAt: Date;
  },
  persisted: boolean,
) {
  const state = normalizeEditorState(row.payload as WanxiMapCalibrationDraft);
  return {
    state,
    revision: row.revision,
    persisted,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Editor read: creates the first persistent row so all NPCs are recorded immediately. */
export async function ensureWanxiSceneEditorSnapshot(updatedByUserId: string) {
  const current = await findWanxiSceneEditorState(SCENE_ID);
  if (current) return toSnapshot(current, true);

  const row = await saveWanxiSceneEditorState({
    sceneId: SCENE_ID,
    payload: createDefaultWanxiMapCalibrationDraft(),
    updatedByUserId,
  });
  return toSnapshot(row, true);
}

export async function persistWanxiSceneEditorState(args: {
  state: WanxiMapCalibrationDraft;
  updatedByUserId: string;
}) {
  const normalized = normalizeEditorState(args.state);
  const row = await saveWanxiSceneEditorState({
    sceneId: SCENE_ID,
    payload: normalized,
    updatedByUserId: args.updatedByUserId,
  });
  return toSnapshot(row, true);
}

export async function resetWanxiSceneEditorState(updatedByUserId: string) {
  const row = await saveWanxiSceneEditorState({
    sceneId: SCENE_ID,
    payload: createDefaultWanxiMapCalibrationDraft(),
    updatedByUserId,
  });
  return toSnapshot(row, true);
}

/** Runtime read: does not create rows and therefore keeps old deployments stable until edited. */
export async function getWanxiSceneEditorRuntimeSnapshot() {
  const current = await findWanxiSceneEditorState(SCENE_ID);
  if (!current) return null;
  return toSnapshot(current, true);
}
