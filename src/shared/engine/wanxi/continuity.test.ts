import { describe, expect, test } from 'vitest';
import {
  getWanxiDailyDateKey,
  resolveWanxiRelationshipStage,
  selectWanxiDailyEvents,
} from './continuity';

describe('wanxi continuity', () => {
  test('daily events are stable for the same seed and capped per npc', () => {
    const first = selectWanxiDailyEvents({ seed: 'cultivator-a:2026-09-18' });
    const second = selectWanxiDailyEvents({ seed: 'cultivator-a:2026-09-18' });
    expect(first.map((event) => event.id)).toEqual(second.map((event) => event.id));
    expect(first).toHaveLength(3);
    const counts = first.reduce<Record<string, number>>((acc, event) => {
      acc[event.roleKey] = (acc[event.roleKey] ?? 0) + 1;
      return acc;
    }, {});
    expect(Math.max(...Object.values(counts))).toBeLessThanOrEqual(2);
  });

  test('relationship stage advances without exposing numeric score', () => {
    expect(resolveWanxiRelationshipStage(0).stage).toBe('stranger');
    expect(resolveWanxiRelationshipStage(1).stage).toBe('acquainted');
    expect(resolveWanxiRelationshipStage(4).stage).toBe('familiar');
    expect(resolveWanxiRelationshipStage(8).stage).toBe('old_friend');
    expect(resolveWanxiRelationshipStage(14).stage).toBe('confidant');
  });

  test('daily reset follows UTC+8', () => {
    expect(getWanxiDailyDateKey(new Date('2026-09-17T15:59:59Z'))).toBe('2026-09-17');
    expect(getWanxiDailyDateKey(new Date('2026-09-17T16:00:00Z'))).toBe('2026-09-18');
  });
});
