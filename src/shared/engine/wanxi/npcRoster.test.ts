import { describe, expect, test } from 'vitest';
import { WANXI_NPCS } from './definitions';
import {
  getWanxiNpcRosterProfile,
  isWanxiCoreNpcRoleKey,
  isWanxiLegacyNpcRoleKey,
  WANXI_CORE_NPC_ROLE_KEYS,
  WANXI_LEGACY_NPC_ROLE_KEYS,
  WANXI_NPC_ROSTER_PROFILES,
} from './npcRoster';

describe('wanxi npc roster v1', () => {
  test('registers exactly 20 core npc roles plus 2 legacy trial roles', () => {
    expect(WANXI_CORE_NPC_ROLE_KEYS).toHaveLength(20);
    expect(new Set(WANXI_CORE_NPC_ROLE_KEYS).size).toBe(20);
    expect(WANXI_LEGACY_NPC_ROLE_KEYS).toEqual([
      'stage_musician',
      'mechanist',
    ]);

    const definedRoles = new Set(WANXI_NPCS.map((npc) => npc.roleKey));
    for (const roleKey of WANXI_CORE_NPC_ROLE_KEYS) {
      expect(definedRoles.has(roleKey)).toBe(true);
      expect(isWanxiCoreNpcRoleKey(roleKey)).toBe(true);
      expect(isWanxiLegacyNpcRoleKey(roleKey)).toBe(false);
    }
    for (const roleKey of WANXI_LEGACY_NPC_ROLE_KEYS) {
      expect(definedRoles.has(roleKey)).toBe(true);
      expect(isWanxiCoreNpcRoleKey(roleKey)).toBe(false);
      expect(isWanxiLegacyNpcRoleKey(roleKey)).toBe(true);
    }
  });

  test('every core npc has a calibrated-slot-only planning profile', () => {
    expect(WANXI_NPC_ROSTER_PROFILES).toHaveLength(20);
    expect(
      new Set(WANXI_NPC_ROSTER_PROFILES.map((profile) => profile.roleKey)).size,
    ).toBe(20);

    for (const roleKey of WANXI_CORE_NPC_ROLE_KEYS) {
      const profile = getWanxiNpcRosterProfile(roleKey);
      expect(profile).not.toBeNull();
      expect(profile?.placementPolicy).toBe('calibrated_slot_only');
      expect(profile?.candidateRegionIds.length).toBeGreaterThan(0);
      expect(profile?.candidateLocationIds.length).toBeGreaterThan(0);
    }
  });
});
