import { describe, expect, test } from 'vitest';
import { WANXI_CORE_NPC_ROLE_KEYS } from './npcRoster';
import {
  WANXI_CHARACTER_PROFILES,
  WANXI_FIRST_CONTACT_DEFINITIONS,
  getWanxiCharacterProfile,
  getWanxiFirstContactDefinition,
} from './characterProfiles';

describe('wanxi core npc character profiles', () => {
  test('covers all 20 core npc roles exactly once', () => {
    expect(WANXI_CHARACTER_PROFILES).toHaveLength(20);
    expect(WANXI_FIRST_CONTACT_DEFINITIONS).toHaveLength(20);
    expect(new Set(WANXI_CHARACTER_PROFILES.map((item) => item.roleKey)).size).toBe(20);
    expect(new Set(WANXI_FIRST_CONTACT_DEFINITIONS.map((item) => item.roleKey)).size).toBe(20);

    for (const roleKey of WANXI_CORE_NPC_ROLE_KEYS) {
      expect(getWanxiCharacterProfile(roleKey)).not.toBeNull();
      const first = getWanxiFirstContactDefinition(roleKey);
      expect(first).not.toBeNull();
      expect(first?.openingMessages.length).toBeGreaterThanOrEqual(2);
      expect(first?.choices).toHaveLength(3);
      expect(new Set(first?.choices.map((choice) => choice.memoryTag)).size).toBe(3);
    }
  });
});
