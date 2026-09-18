import type { EnemyRace, RealmType } from '@shared/types/constants';
import { getNoviceEquipmentState } from '@shared/lib/noviceGuidance';
import type { Cultivator } from '@shared/types/cultivator';

export type WanxiStoryBattleLoadoutPolicy = 'generated' | 'bare_attributes';

export interface WanxiStoryBattleProfile {
  id: string;
  title: string;
  realmPolicy: 'player_realm';
  realmStagePolicy: 'initial';
  loadoutPolicy: WanxiStoryBattleLoadoutPolicy;
  race: EnemyRace;
  isBoss: boolean;
  baseDifficultyByRealm: Readonly<Record<RealmType, number>>;
  retryMultipliers: readonly number[];
  assistLabels: readonly string[];
}

export interface WanxiStoryBattleTuning {
  profileId: string;
  attempt: number;
  lossesBefore: number;
  assistLevel: number;
  assistLabel: string;
  difficulty: number;
  nextAssistLevel: number;
  nextAssistLabel: string;
  nextDifficulty: number;
  newcomerProtection: boolean;
  readinessScore: number;
  enemyAttributeCapMultiplier?: number;
  nextEnemyAttributeCapMultiplier?: number;
}

export interface WanxiStoryCombatReadiness {
  score: number;
  activeAbilityCount: number;
  equippedArtifactCount: number;
  hasSectCombat: boolean;
  hasEquippedNoviceSet: boolean;
  newcomerProtection: boolean;
}

export type WanxiStoryCombatReadinessInput = Pick<
  Cultivator,
  'realm' | 'realm_stage' | 'skills' | 'cultivations' | 'sect' | 'equipped'
> & {
  inventory: Pick<Cultivator['inventory'], 'artifacts'>;
};

export const WANXI_LAMP_CONTRACT_SPIRIT_BATTLE_PROFILE: WanxiStoryBattleProfile = {
  id: 'wanxi.story.lamp.contract-spirit.v2',
  title: '旧契索命',
  realmPolicy: 'player_realm',
  realmStagePolicy: 'initial',
  loadoutPolicy: 'bare_attributes',
  race: '灵族',
  isBoss: false,
  baseDifficultyByRealm: {
    炼气: 10,
    筑基: 12,
    金丹: 15,
    元婴: 18,
    化神: 20,
    炼虚: 22,
    合体: 24,
    大乘: 26,
    渡劫: 28,
  },
  retryMultipliers: [1, 0.75, 0.55, 0.35],
  assistLabels: ['剧情低危', '契纹裂痕·一重', '契纹裂痕·二重', '残契将断'],
};

const NEWCOMER_DIFFICULTY_MULTIPLIERS = [0.45, 0.32, 0.24, 0.18] as const;
const NEWCOMER_ATTRIBUTE_CAP_MULTIPLIERS = [0.48, 0.34, 0.24, 0.18] as const;
const NEWCOMER_ASSIST_LABELS = [
  '护灯·初燃',
  '护灯·余焰',
  '护灯·残照',
  '残契将断',
] as const;

function normalizeLosses(losses: number): number {
  if (!Number.isFinite(losses)) return 0;
  return Math.max(0, Math.floor(losses));
}

function resolveLevel(profile: WanxiStoryBattleProfile, losses: number): number {
  return Math.min(
    normalizeLosses(losses),
    Math.max(0, profile.retryMultipliers.length - 1),
  );
}

function difficultyAt(
  profile: WanxiStoryBattleProfile,
  realm: RealmType,
  level: number,
): number {
  const base = profile.baseDifficultyByRealm[realm] ?? 12;
  const multiplier = profile.retryMultipliers[level] ?? 1;
  return Math.max(3, Math.round(base * multiplier));
}

function newcomerDifficultyAt(
  profile: WanxiStoryBattleProfile,
  realm: RealmType,
  level: number,
): number {
  const base = profile.baseDifficultyByRealm[realm] ?? 10;
  const multiplier = NEWCOMER_DIFFICULTY_MULTIPLIERS[level] ?? 0.18;
  return Math.max(3, Math.round(base * multiplier));
}

export function assessWanxiStoryCombatReadiness(
  cultivator: WanxiStoryCombatReadinessInput,
): WanxiStoryCombatReadiness {
  const activeAbilityCount = [
    ...(cultivator.skills ?? []),
    ...(cultivator.cultivations ?? []),
  ].filter((entry) => Boolean(entry.abilityConfig)).length;
  const equippedIds = new Set(
    [
      cultivator.equipped?.weapon,
      cultivator.equipped?.armor,
      cultivator.equipped?.accessory,
    ].filter(Boolean),
  );
  const equippedArtifactCount = (cultivator.inventory?.artifacts ?? []).filter(
    (artifact) =>
      Boolean(artifact.id) &&
      equippedIds.has(artifact.id) &&
      Boolean(artifact.abilityConfig),
  ).length;
  const hasSectCombat = Boolean(cultivator.sect);
  const noviceEquipment = getNoviceEquipmentState(cultivator);
  const score =
    activeAbilityCount * 2 +
    equippedArtifactCount * 2 +
    (hasSectCombat ? 2 : 0) +
    (cultivator.realm_stage === '初期' ? 0 : 2);
  const newcomerProtection =
    cultivator.realm === '炼气' &&
    (score <= 2 || (score <= 4 && !noviceEquipment.hasEquippedFullSet));

  return {
    score,
    activeAbilityCount,
    equippedArtifactCount,
    hasSectCombat,
    hasEquippedNoviceSet: noviceEquipment.hasEquippedFullSet,
    newcomerProtection,
  };
}

export function resolveWanxiStoryBattleTuning(args: {
  profile: WanxiStoryBattleProfile;
  realm: RealmType;
  battleLosses: number;
  readiness?: WanxiStoryCombatReadiness;
}): WanxiStoryBattleTuning {
  const lossesBefore = normalizeLosses(args.battleLosses);
  const assistLevel = resolveLevel(args.profile, lossesBefore);
  const nextAssistLevel = resolveLevel(args.profile, lossesBefore + 1);
  const newcomerProtection = Boolean(args.readiness?.newcomerProtection);

  if (newcomerProtection) {
    return {
      profileId: args.profile.id,
      attempt: lossesBefore + 1,
      lossesBefore,
      assistLevel,
      assistLabel: NEWCOMER_ASSIST_LABELS[assistLevel] ?? '护灯',
      difficulty: newcomerDifficultyAt(args.profile, args.realm, assistLevel),
      nextAssistLevel,
      nextAssistLabel: NEWCOMER_ASSIST_LABELS[nextAssistLevel] ?? '护灯',
      nextDifficulty: newcomerDifficultyAt(args.profile, args.realm, nextAssistLevel),
      newcomerProtection: true,
      readinessScore: args.readiness?.score ?? 0,
      enemyAttributeCapMultiplier:
        NEWCOMER_ATTRIBUTE_CAP_MULTIPLIERS[assistLevel] ?? 0.22,
      nextEnemyAttributeCapMultiplier:
        NEWCOMER_ATTRIBUTE_CAP_MULTIPLIERS[nextAssistLevel] ?? 0.22,
    };
  }

  return {
    profileId: args.profile.id,
    attempt: lossesBefore + 1,
    lossesBefore,
    assistLevel,
    assistLabel: args.profile.assistLabels[assistLevel] ?? `援助 ${assistLevel}`,
    difficulty: difficultyAt(args.profile, args.realm, assistLevel),
    nextAssistLevel,
    nextAssistLabel:
      args.profile.assistLabels[nextAssistLevel] ?? `援助 ${nextAssistLevel}`,
    nextDifficulty: difficultyAt(args.profile, args.realm, nextAssistLevel),
    newcomerProtection: false,
    readinessScore: args.readiness?.score ?? 99,
  };
}

export function applyWanxiStoryBattleLoadout(
  cultivator: Cultivator,
  profile: WanxiStoryBattleProfile,
): Cultivator {
  if (profile.loadoutPolicy !== 'bare_attributes') return cultivator;
  return {
    ...cultivator,
    skills: [],
    cultivations: [],
    sect: null,
    inventory: { ...cultivator.inventory, artifacts: [] },
    equipped: { weapon: null, armor: null, accessory: null },
  };
}

export function applyWanxiStoryNewcomerAttributeCap(
  opponent: Cultivator,
  player: Pick<Cultivator, 'attributes'>,
  multiplier: number | undefined,
): Cultivator {
  if (!multiplier) return opponent;
  const scale = (key: keyof Cultivator['attributes']) =>
    Math.max(1, Math.round((player.attributes[key] ?? 1) * multiplier));
  return {
    ...opponent,
    attributes: {
      vitality: Math.min(opponent.attributes.vitality, scale('vitality')),
      strength: Math.min(opponent.attributes.strength, scale('strength')),
      spirit: Math.min(opponent.attributes.spirit, scale('spirit')),
      endurance: Math.min(opponent.attributes.endurance, scale('endurance')),
      speed: Math.min(opponent.attributes.speed, scale('speed')),
      willpower: Math.min(opponent.attributes.willpower, scale('willpower')),
    },
  };
}
