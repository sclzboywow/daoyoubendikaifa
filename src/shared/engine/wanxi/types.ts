export type WanxiSceneId = 'wanxi_main';

export type WanxiRegionId =
  | 'gate'
  | 'square'
  | 'hall'
  | 'stage'
  | 'lakeside'
  | 'west_market'
  | 'bamboo'
  | 'southeast';

export type WanxiNpcRoleKey =
  | 'master'
  | 'gate_steward'
  | 'stage_curator'
  | 'lakeside_guest'
  | 'west_host'
  | 'bamboo_stranger'
  | 'roaming_merchant'
  | 'storyteller'
  | 'stage_musician'
  | 'mechanist';

export type WanxiLocationId = string;
export type WanxiActivityId = string;
export type WanxiGameId = string;

export interface WanxiPoint {
  /** Percentage position within the logical scene, 0..100. */
  x: number;
  /** Percentage position within the logical scene, 0..100. */
  y: number;
}

export interface WanxiHitArea {
  /** Percentage width within the logical scene. */
  width: number;
  /** Percentage height within the logical scene. */
  height: number;
}

/**
 * Map marker presentation is deliberately separate from domain identity.
 * It only controls progressive disclosure on the scene canvas.
 */
export type WanxiMarkerImportance = 'major' | 'normal' | 'minor';

export interface WanxiMarkerPresentation {
  /** Visual priority. Major markers survive the widest zoom level. */
  importance?: WanxiMarkerImportance;
  /** Minimum map scale at which the marker becomes visible. */
  minScale?: number;
  /** Hide a location marker while an NPC is currently placed there. */
  hideWhenOccupied?: boolean;
}

export type WanxiSceneLabelKind = 'building' | 'region' | 'street' | 'detail';

/**
 * Non-interactive cartographic labels. They are map geography, not buttons.
 * Broad labels can disappear as the player zooms in while local labels appear.
 */
export interface WanxiSceneLabelDefinition {
  id: string;
  text: string;
  kind: WanxiSceneLabelKind;
  point: WanxiPoint;
  minScale?: number;
  maxScale?: number;
  rotation?: number;
  direction?: 'horizontal' | 'vertical';
}

export interface WanxiRegionDefinition {
  id: WanxiRegionId;
  name: string;
  description: string;
  center: WanxiPoint;
  tags?: readonly string[];
}

export type WanxiLocationKind =
  | 'building'
  | 'square'
  | 'stage'
  | 'waterside'
  | 'courtyard'
  | 'garden'
  | 'gate'
  | 'landmark';

export interface WanxiLocationDefinition {
  id: WanxiLocationId;
  regionId: WanxiRegionId;
  name: string;
  description: string;
  kind: WanxiLocationKind;
  tags?: readonly string[];
}

export interface WanxiLocationPlacement {
  locationId: WanxiLocationId;
  point: WanxiPoint;
  hitArea?: WanxiHitArea;
  labelOffset?: WanxiPoint;
  marker?: WanxiMarkerPresentation;
}

export interface WanxiNpcDefinition {
  /** Stable config id. Never use display name as an identifier. */
  id: string;
  /** Stable semantic key used by URLs, story rules and bindings. */
  roleKey: WanxiNpcRoleKey;
  name: string;
  identity: string;
  description: string;
  sigil: string;
  defaultGreeting: string;
  conversationKey: string;
  tags?: readonly string[];
}

export interface WanxiNpcPlacement {
  npcId: string;
  regionId: WanxiRegionId;
  locationId?: WanxiLocationId;
  point: WanxiPoint;
  anchor: 'bottom';
  visibilityCondition?: string;
  priority?: number;
  /** Runtime attention hint for story/event targets. */
  attention?: boolean;
  marker?: WanxiMarkerPresentation;
}

export type WanxiActivityRef =
  | { type: 'game'; id: WanxiGameId }
  | { type: 'story'; id: string }
  | { type: 'quest'; id: string }
  | { type: 'event'; id: string }
  | { type: 'exchange'; id: string };

export type WanxiActivitySource =
  | { type: 'npc'; npcId: string }
  | { type: 'location'; locationId: WanxiLocationId };

export interface WanxiActivityBinding {
  id: WanxiActivityId;
  source: WanxiActivitySource;
  activity: WanxiActivityRef;
  conditionKey?: string;
  priority: number;
  label: string;
}

export type WanxiGameMode = 'solo' | 'async' | 'realtime';
export type WanxiGamePersistence = 'none' | 'session' | 'extended';

export interface WanxiGameDefinition {
  id: WanxiGameId;
  name: string;
  description: string;
  route: string;
  mode: WanxiGameMode;
  persistence: WanxiGamePersistence;
  enabled: boolean;
  engineKey: string;
  settlementKey: string;
  tags?: readonly string[];
}

export type WanxiGameSessionStatus =
  | 'created'
  | 'active'
  | 'completed'
  | 'settled'
  | 'abandoned'
  | 'expired';

export interface WanxiGameSession<TState = unknown, TResult = unknown> {
  id: string;
  cultivatorId: string;
  gameId: WanxiGameId;
  status: WanxiGameSessionStatus;
  schemaVersion: number;
  state: TState;
  result?: TResult;
  startedAt: string;
  completedAt?: string;
  settledAt?: string;
  expiresAt?: string;
}

export interface WanxiSceneDefinition {
  id: WanxiSceneId;
  name: string;
  backgroundAssetKey: string;
  logicalSize: {
    width: number;
    height: number;
  };
  regions: readonly WanxiRegionDefinition[];
  locations: readonly WanxiLocationDefinition[];
  locationPlacements: readonly WanxiLocationPlacement[];
  labels: readonly WanxiSceneLabelDefinition[];
}

export type WanxiLocationRuntimeTone =
  | 'normal'
  | 'attention'
  | 'disabled'
  | 'hidden';

export interface WanxiLocationRuntimeState {
  locationId: WanxiLocationId;
  state: WanxiLocationRuntimeTone;
  badge?: string;
}

export interface WanxiSceneRuntimeSnapshot {
  sceneId: WanxiSceneId;
  revision: number;
  npcPlacements: readonly WanxiNpcPlacement[];
  enabledActivityBindingIds: readonly WanxiActivityId[];
  locationStates: readonly WanxiLocationRuntimeState[];
}
