import type {
  WanxiLocationId,
  WanxiNpcRoleKey,
  WanxiRegionId,
} from './types';

export const WANXI_CORE_NPC_ROLE_KEYS = [
  'master',
  'script_scholar',
  'gate_steward',
  'storyteller',
  'chess_keeper',
  'stage_curator',
  'chief_musician',
  'dancer',
  'lakeside_guest',
  'lantern_maker',
  'tea_physician',
  'west_host',
  'mask_artisan',
  'curio_dealer',
  'bamboo_stranger',
  'former_challenger',
  'roaming_merchant',
  'runner_boy',
  'night_watchman',
  'mysterious_girl',
] as const satisfies readonly WanxiNpcRoleKey[];

export type WanxiCoreNpcRoleKey =
  (typeof WANXI_CORE_NPC_ROLE_KEYS)[number];

export const WANXI_LEGACY_NPC_ROLE_KEYS = [
  'stage_musician',
  'mechanist',
] as const satisfies readonly WanxiNpcRoleKey[];

export type WanxiLegacyNpcRoleKey =
  (typeof WANXI_LEGACY_NPC_ROLE_KEYS)[number];

export type WanxiNpcMobilityType =
  | 'resident'
  | 'roaming'
  | 'night'
  | 'conditional';

export type WanxiNpcContentTier =
  | 'core_mystery'
  | 'area_core'
  | 'life'
  | 'mobile';

export type WanxiNpcInitialVisibility =
  | 'visible'
  | 'identity_hidden'
  | 'dynamic'
  | 'conditional';

export interface WanxiNpcRosterProfile {
  roleKey: WanxiCoreNpcRoleKey;
  contentTier: WanxiNpcContentTier;
  mobilityType: WanxiNpcMobilityType;
  initialVisibility: WanxiNpcInitialVisibility;
  characterTheme: string;
  homeRegionId?: WanxiRegionId;
  homeLocationId?: WanxiLocationId;
  candidateRegionIds: readonly WanxiRegionId[];
  candidateLocationIds: readonly WanxiLocationId[];
  /**
   * V1 only records semantic homes/candidates.
   * Real coordinates must come from the map calibrator after manual review.
   */
  placementPolicy: 'calibrated_slot_only';
}

export const WANXI_NPC_ROSTER_PROFILES = [
  {
    roleKey: 'master',
    contentTier: 'core_mystery',
    mobilityType: 'resident',
    initialVisibility: 'visible',
    characterTheme: '秩序是否值得用隐瞒维持',
    homeRegionId: 'hall',
    homeLocationId: 'hall_forecourt',
    candidateRegionIds: ['hall'],
    candidateLocationIds: ['hall_forecourt', 'main_hall'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'script_scholar',
    contentTier: 'area_core',
    mobilityType: 'resident',
    initialVisibility: 'visible',
    characterTheme: '讲别人的故事容易，承认自己的故事很难',
    homeRegionId: 'hall',
    homeLocationId: 'main_hall',
    candidateRegionIds: ['hall', 'stage'],
    candidateLocationIds: ['main_hall', 'stage'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'gate_steward',
    contentTier: 'area_core',
    mobilityType: 'resident',
    initialVisibility: 'visible',
    characterTheme: '一直记住别人，却很少有人真正记住自己',
    homeRegionId: 'gate',
    homeLocationId: 'gate',
    candidateRegionIds: ['gate'],
    candidateLocationIds: ['gate', 'notice_board'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'storyteller',
    contentTier: 'mobile',
    mobilityType: 'roaming',
    initialVisibility: 'visible',
    characterTheme: '真实的事情成为故事后，还属于当事人吗',
    homeRegionId: 'square',
    homeLocationId: 'central_square',
    candidateRegionIds: ['square', 'lakeside', 'west_market'],
    candidateLocationIds: ['central_square', 'water_pavilion', 'west_lane'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'chess_keeper',
    contentTier: 'life',
    mobilityType: 'resident',
    initialVisibility: 'visible',
    characterTheme: '赢是不是唯一有价值的结果',
    homeRegionId: 'square',
    homeLocationId: 'central_square',
    candidateRegionIds: ['square', 'southeast'],
    candidateLocationIds: ['central_square', 'southeast_courtyard'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'stage_curator',
    contentTier: 'area_core',
    mobilityType: 'resident',
    initialVisibility: 'visible',
    characterTheme: '完美和真实是不是一回事',
    homeRegionId: 'stage',
    homeLocationId: 'stage_forecourt',
    candidateRegionIds: ['stage'],
    candidateLocationIds: ['stage_forecourt', 'stage'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'chief_musician',
    contentTier: 'life',
    mobilityType: 'resident',
    initialVisibility: 'visible',
    characterTheme: '如果一切都被控制住，就真的不会出错吗',
    homeRegionId: 'stage',
    homeLocationId: 'stage',
    candidateRegionIds: ['stage'],
    candidateLocationIds: ['stage', 'stage_forecourt'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'dancer',
    contentTier: 'life',
    mobilityType: 'resident',
    initialVisibility: 'visible',
    characterTheme: '讨人喜欢和成为自己',
    homeRegionId: 'stage',
    homeLocationId: 'stage_forecourt',
    candidateRegionIds: ['stage', 'west_market'],
    candidateLocationIds: ['stage_forecourt', 'west_lane'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'lakeside_guest',
    contentTier: 'core_mystery',
    mobilityType: 'resident',
    initialVisibility: 'visible',
    characterTheme: '旁观是否也是一种选择',
    homeRegionId: 'lakeside',
    homeLocationId: 'lakeside',
    candidateRegionIds: ['lakeside', 'hall'],
    candidateLocationIds: ['lakeside', 'water_pavilion', 'hall_forecourt'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'lantern_maker',
    contentTier: 'life',
    mobilityType: 'resident',
    initialVisibility: 'visible',
    characterTheme: '不抱希望，真的就不会失望吗',
    homeRegionId: 'lakeside',
    homeLocationId: 'water_pavilion',
    candidateRegionIds: ['lakeside'],
    candidateLocationIds: ['water_pavilion', 'lakeside'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'tea_physician',
    contentTier: 'life',
    mobilityType: 'resident',
    initialVisibility: 'visible',
    characterTheme: '接受自己的无能为力',
    homeRegionId: 'lakeside',
    homeLocationId: 'lakeside',
    candidateRegionIds: ['lakeside', 'southeast'],
    candidateLocationIds: ['lakeside', 'water_pavilion', 'southeast_courtyard'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'west_host',
    contentTier: 'area_core',
    mobilityType: 'resident',
    initialVisibility: 'visible',
    characterTheme: '聪明不能代替信任',
    homeRegionId: 'west_market',
    homeLocationId: 'west_courtyard',
    candidateRegionIds: ['west_market', 'stage'],
    candidateLocationIds: ['west_courtyard', 'west_lane', 'stage'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'mask_artisan',
    contentTier: 'life',
    mobilityType: 'resident',
    initialVisibility: 'visible',
    characterTheme: '面具是否一定意味着虚假',
    homeRegionId: 'west_market',
    homeLocationId: 'west_lane',
    candidateRegionIds: ['west_market', 'stage'],
    candidateLocationIds: ['west_lane', 'stage_forecourt'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'curio_dealer',
    contentTier: 'life',
    mobilityType: 'resident',
    initialVisibility: 'visible',
    characterTheme: '物品能否保存人的一部分',
    homeRegionId: 'west_market',
    homeLocationId: 'west_lane',
    candidateRegionIds: ['west_market', 'hall', 'bamboo'],
    candidateLocationIds: ['west_lane', 'main_hall', 'bamboo_garden'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'bamboo_stranger',
    contentTier: 'core_mystery',
    mobilityType: 'conditional',
    initialVisibility: 'conditional',
    characterTheme: '人有没有权让别人忘记真相',
    homeRegionId: 'bamboo',
    homeLocationId: 'bamboo_garden',
    candidateRegionIds: ['bamboo'],
    candidateLocationIds: ['bamboo_garden'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'former_challenger',
    contentTier: 'area_core',
    mobilityType: 'resident',
    initialVisibility: 'identity_hidden',
    characterTheme: '人生是不是只有巅峰才算值得',
    homeRegionId: 'southeast',
    homeLocationId: 'southeast_courtyard',
    candidateRegionIds: ['southeast', 'square', 'lakeside'],
    candidateLocationIds: ['southeast_courtyard', 'central_square', 'lakeside'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'roaming_merchant',
    contentTier: 'mobile',
    mobilityType: 'roaming',
    initialVisibility: 'dynamic',
    characterTheme: '一直说只是路过的人，什么时候才算有家',
    candidateRegionIds: ['gate', 'square', 'west_market'],
    candidateLocationIds: ['gate', 'central_square', 'west_lane'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'runner_boy',
    contentTier: 'mobile',
    mobilityType: 'roaming',
    initialVisibility: 'dynamic',
    characterTheme: '没有人在意的人，可能看到最多',
    candidateRegionIds: ['gate', 'square', 'stage', 'west_market'],
    candidateLocationIds: ['gate', 'central_square', 'stage_forecourt', 'west_lane'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'night_watchman',
    contentTier: 'mobile',
    mobilityType: 'night',
    initialVisibility: 'conditional',
    characterTheme: '被忽视的人往往看得最清楚',
    candidateRegionIds: ['gate', 'square', 'southeast'],
    candidateLocationIds: ['gate', 'central_square', 'southeast_courtyard'],
    placementPolicy: 'calibrated_slot_only',
  },
  {
    roleKey: 'mysterious_girl',
    contentTier: 'core_mystery',
    mobilityType: 'conditional',
    initialVisibility: 'conditional',
    characterTheme: '人的身份由过去决定，还是由现在的选择决定',
    candidateRegionIds: ['bamboo', 'lakeside', 'southeast'],
    candidateLocationIds: ['bamboo_garden', 'water_pavilion', 'southeast_courtyard'],
    placementPolicy: 'calibrated_slot_only',
  },
] as const satisfies readonly WanxiNpcRosterProfile[];

const coreRoleSet = new Set<WanxiNpcRoleKey>(WANXI_CORE_NPC_ROLE_KEYS);
const legacyRoleSet = new Set<WanxiNpcRoleKey>(WANXI_LEGACY_NPC_ROLE_KEYS);
const profileByRole = new Map<WanxiCoreNpcRoleKey, WanxiNpcRosterProfile>(
  WANXI_NPC_ROSTER_PROFILES.map((profile) => [profile.roleKey, profile]),
);

export function isWanxiCoreNpcRoleKey(
  roleKey: string,
): roleKey is WanxiCoreNpcRoleKey {
  return coreRoleSet.has(roleKey as WanxiNpcRoleKey);
}

export function isWanxiLegacyNpcRoleKey(
  roleKey: string,
): roleKey is WanxiLegacyNpcRoleKey {
  return legacyRoleSet.has(roleKey as WanxiNpcRoleKey);
}

export function getWanxiNpcRosterProfile(roleKey: string) {
  return profileByRole.get(roleKey as WanxiCoreNpcRoleKey) ?? null;
}
