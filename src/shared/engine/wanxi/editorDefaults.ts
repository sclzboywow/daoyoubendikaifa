import {
  WANXI_DEFAULT_NPC_PLACEMENTS,
  WANXI_MAIN_SCENE,
  WANXI_NPCS,
  getWanxiNpcByRoleKey,
} from './definitions';
import {
  wanxiPercentToPixel,
  type WanxiCalibrationNpcPlacement,
  type WanxiMapCalibrationDraft,
} from './calibration';
import type {
  WanxiLocationId,
  WanxiNpcRoleKey,
  WanxiPoint,
  WanxiRegionId,
} from './types';

interface EditorPlacementPlan {
  regionId: WanxiRegionId;
  locationId: WanxiLocationId;
  point: WanxiPoint;
}

const PLAN: Record<WanxiNpcRoleKey, EditorPlacementPlan> = {
  master: {
    regionId: 'hall',
    locationId: 'hall_forecourt',
    point: { x: 51, y: 24 },
  },
  script_scholar: {
    regionId: 'hall',
    locationId: 'main_hall',
    point: { x: 44, y: 20 },
  },
  gate_steward: {
    regionId: 'gate',
    locationId: 'gate',
    point: { x: 47, y: 81 },
  },
  storyteller: {
    regionId: 'square',
    locationId: 'central_square',
    point: { x: 46, y: 55 },
  },
  chess_keeper: {
    regionId: 'square',
    locationId: 'central_square',
    point: { x: 56, y: 58 },
  },
  stage_curator: {
    regionId: 'stage',
    locationId: 'stage_forecourt',
    point: { x: 76, y: 36 },
  },
  chief_musician: {
    regionId: 'stage',
    locationId: 'stage',
    point: { x: 84, y: 31 },
  },
  dancer: {
    regionId: 'stage',
    locationId: 'stage_forecourt',
    point: { x: 79, y: 40 },
  },
  lakeside_guest: {
    regionId: 'lakeside',
    locationId: 'lakeside',
    point: { x: 69, y: 51 },
  },
  lantern_maker: {
    regionId: 'lakeside',
    locationId: 'water_pavilion',
    point: { x: 84, y: 60 },
  },
  tea_physician: {
    regionId: 'lakeside',
    locationId: 'lakeside',
    point: { x: 73, y: 61 },
  },
  west_host: {
    regionId: 'west_market',
    locationId: 'west_courtyard',
    point: { x: 27, y: 55 },
  },
  mask_artisan: {
    regionId: 'west_market',
    locationId: 'west_lane',
    point: { x: 20, y: 63 },
  },
  curio_dealer: {
    regionId: 'west_market',
    locationId: 'west_lane',
    point: { x: 31, y: 62 },
  },
  bamboo_stranger: {
    regionId: 'bamboo',
    locationId: 'bamboo_garden',
    point: { x: 20, y: 27 },
  },
  former_challenger: {
    regionId: 'southeast',
    locationId: 'southeast_courtyard',
    point: { x: 78, y: 78 },
  },
  roaming_merchant: {
    regionId: 'square',
    locationId: 'central_square',
    point: { x: 52, y: 58 },
  },
  runner_boy: {
    regionId: 'gate',
    locationId: 'notice_board',
    point: { x: 43, y: 80 },
  },
  night_watchman: {
    regionId: 'gate',
    locationId: 'gate',
    point: { x: 53, y: 82 },
  },
  mysterious_girl: {
    regionId: 'bamboo',
    locationId: 'bamboo_garden',
    point: { x: 17, y: 31 },
  },
  stage_musician: {
    regionId: 'stage',
    locationId: 'stage',
    point: { x: 86, y: 34 },
  },
  mechanist: {
    regionId: 'west_market',
    locationId: 'west_courtyard',
    point: { x: 31, y: 55 },
  },
};

const DEFAULT_RUNTIME_IDS = new Set(
  WANXI_DEFAULT_NPC_PLACEMENTS.map((placement) => placement.npcId),
);

function buildNpcPlacement(
  roleKey: WanxiNpcRoleKey,
): WanxiCalibrationNpcPlacement {
  const npc = getWanxiNpcByRoleKey(roleKey);
  if (!npc) {
    throw new Error(`Unknown Wanxi NPC role: ${roleKey}`);
  }
  const plan = PLAN[roleKey];
  return {
    npcId: npc.id,
    regionId: plan.regionId,
    locationId: plan.locationId,
    point: wanxiPercentToPixel(plan.point, WANXI_MAIN_SCENE.logicalSize),
    locked: false,
    runtimeVisible: DEFAULT_RUNTIME_IDS.has(npc.id),
  };
}

/**
 * The editor always starts with every registered Wanxi NPC on the map.
 * These are rough planning points only; the editor is the source of truth
 * after a user saves calibrated positions to the database.
 */
export function createDefaultWanxiMapCalibrationDraft(): WanxiMapCalibrationDraft {
  return {
    version: 1,
    sceneId: 'wanxi_main',
    logicalSize: {
      width: WANXI_MAIN_SCENE.logicalSize.width,
      height: WANXI_MAIN_SCENE.logicalSize.height,
    },
    slots: [],
    zones: [],
    npcPlacements: WANXI_NPCS.map((npc) => buildNpcPlacement(npc.roleKey)),
  };
}
