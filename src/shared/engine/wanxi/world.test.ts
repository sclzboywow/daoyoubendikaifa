import { describe, expect, test } from 'vitest';
import {
  getWanxiWorldDaypart,
  resolveWanxiScheduledCoreRoles,
  selectWanxiCrossEvents,
  selectWanxiLifeEvents,
  WANXI_CROSS_EVENT_DEFINITIONS,
  WANXI_LIFE_EVENT_DEFINITIONS,
  WANXI_PROPS,
  WANXI_REGIONAL_STORY_ENCOUNTERS,
} from './world';

describe('wanxi living world', () => {
  test('contains the promised content volume', () => {
    expect(WANXI_LIFE_EVENT_DEFINITIONS).toHaveLength(60);
    expect(WANXI_CROSS_EVENT_DEFINITIONS).toHaveLength(10);
    expect(WANXI_PROPS).toHaveLength(35);
    expect(WANXI_REGIONAL_STORY_ENCOUNTERS).toHaveLength(5);
  });

  test('daytime schedule stays dense without loading all 20 core npcs', () => {
    const roles = resolveWanxiScheduledCoreRoles({
      seed: 'cultivator:2026-09-18',
      daypart: 'day',
    });
    expect(roles.length).toBeGreaterThanOrEqual(11);
    expect(roles.length).toBeLessThanOrEqual(13);
    expect(new Set(roles).size).toBe(roles.length);
  });

  test('same seed produces stable daily selections', () => {
    const visible = new Set(
      resolveWanxiScheduledCoreRoles({
        seed: 'same',
        daypart: 'day',
      }),
    );
    const met = new Set(visible);
    const first = selectWanxiLifeEvents({
      seed: 'same',
      visibleRoleKeys: visible,
      metRoleKeys: met,
      count: 4,
    }).map((event) => event.id);
    const second = selectWanxiLifeEvents({
      seed: 'same',
      visibleRoleKeys: visible,
      metRoleKeys: met,
      count: 4,
    }).map((event) => event.id);
    expect(second).toEqual(first);
  });

  test('cross events only activate when every participant is visible and met', () => {
    const event = WANXI_CROSS_EVENT_DEFINITIONS[0];
    const visible = new Set(event.participants);
    const none = selectWanxiCrossEvents({
      seed: 'cross',
      visibleRoleKeys: visible,
      metRoleKeys: new Set(),
      count: 10,
    });
    expect(none).toHaveLength(0);
  });

  test('uses Beijing dayparts', () => {
    expect(
      getWanxiWorldDaypart(new Date('2026-09-18T01:00:00Z')),
    ).toBe('day');
  });
});
