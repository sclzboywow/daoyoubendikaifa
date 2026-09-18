import { describe, expect, it } from 'vitest';
import type { Cultivator } from '@shared/types/cultivator';
import {
  applyWanxiStoryBattleLoadout,
  applyWanxiStoryNewcomerAttributeCap,
  assessWanxiStoryCombatReadiness,
  resolveWanxiStoryBattleTuning,
  WANXI_LAMP_CONTRACT_SPIRIT_BATTLE_PROFILE,
} from './battleProfiles';

function newcomer() {
  return {
    realm: '炼气',
    realm_stage: '初期',
    skills: [],
    cultivations: [],
    sect: null,
    inventory: { artifacts: [] },
    equipped: { weapon: null, armor: null, accessory: null },
  } as unknown as Cultivator;
}

describe('wanxi story battle profiles', () => {
  it('anchors a normal lamp-story battle to low-risk realm difficulty', () => {
    expect(
      resolveWanxiStoryBattleTuning({
        profile: WANXI_LAMP_CONTRACT_SPIRIT_BATTLE_PROFILE,
        realm: '炼气',
        battleLosses: 0,
      }),
    ).toMatchObject({ difficulty: 10, newcomerProtection: false });
  });

  it('detects underprepared new cultivators by readiness', () => {
    expect(assessWanxiStoryCombatReadiness(newcomer())).toMatchObject({
      score: 0,
      newcomerProtection: true,
    });
  });

  it('protects newcomers from the first attempt and keeps softening', () => {
    const readiness = assessWanxiStoryCombatReadiness(newcomer());
    const first = resolveWanxiStoryBattleTuning({
      profile: WANXI_LAMP_CONTRACT_SPIRIT_BATTLE_PROFILE,
      realm: '炼气',
      battleLosses: 0,
      readiness,
    });
    const third = resolveWanxiStoryBattleTuning({
      profile: WANXI_LAMP_CONTRACT_SPIRIT_BATTLE_PROFILE,
      realm: '炼气',
      battleLosses: 2,
      readiness,
    });
    expect(first).toMatchObject({
      assistLabel: '护灯·初燃',
      difficulty: 5,
      enemyAttributeCapMultiplier: 0.48,
    });
    expect(third).toMatchObject({
      assistLabel: '护灯·残照',
      difficulty: 3,
      enemyAttributeCapMultiplier: 0.24,
    });
  });

  it('strips combat loadout from the story enemy', () => {
    const cultivator = {
      name: '索契灵',
      realm: '炼气',
      realm_stage: '初期',
      attributes: { vitality: 10, strength: 10, spirit: 10, endurance: 10, speed: 10, willpower: 10 },
      spiritual_roots: [],
      skills: [{ name: '术', abilityConfig: {} }],
      cultivations: [{ name: '法', abilityConfig: {} }],
      inventory: { artifacts: [{ id: 'w', name: '刃', abilityConfig: {} }], consumables: [], materials: [] },
      equipped: { weapon: 'w', armor: null, accessory: null },
      sect: { id: 'sect' },
    } as unknown as Cultivator;
    expect(applyWanxiStoryBattleLoadout(cultivator, WANXI_LAMP_CONTRACT_SPIRIT_BATTLE_PROFILE)).toMatchObject({
      skills: [], cultivations: [], sect: null, inventory: { artifacts: [] },
    });
  });

  it('caps protected enemy attributes against the actual new character', () => {
    const player = { attributes: { vitality: 20, strength: 10, spirit: 12, endurance: 10, speed: 8, willpower: 9 } } as Cultivator;
    const enemy = { ...player, attributes: { vitality: 100, strength: 100, spirit: 100, endurance: 100, speed: 100, willpower: 100 } } as Cultivator;
    expect(applyWanxiStoryNewcomerAttributeCap(enemy, player, 0.48).attributes).toEqual({
      vitality: 10, strength: 5, spirit: 6, endurance: 5, speed: 4, willpower: 4,
    });
  });
});
