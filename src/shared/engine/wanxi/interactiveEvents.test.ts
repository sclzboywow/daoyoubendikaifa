import { describe, expect, test } from 'vitest';
import { WANXI_DAILY_EVENT_DEFINITIONS } from './continuity';
import {
  describeWanxiInteractiveMemoryTag,
  getWanxiDailyEventChoice,
  getWanxiDailyEventChoices,
  getWanxiDailyEventOpeningMessages,
} from './interactiveEvents';

describe('wanxi interactive daily events', () => {
  test('every daily event provides at least three player choices', () => {
    for (const event of WANXI_DAILY_EVENT_DEFINITIONS) {
      const choices = getWanxiDailyEventChoices(event.id);
      expect(choices.length).toBeGreaterThanOrEqual(3);
      expect(new Set(choices.map((choice) => choice.id)).size).toBe(choices.length);
    }
  });

  test('choice memories are unique and human-readable', () => {
    const tags: string[] = [];
    for (const event of WANXI_DAILY_EVENT_DEFINITIONS) {
      for (const choice of getWanxiDailyEventChoices(event.id)) {
        tags.push(choice.memoryTag);
        expect(describeWanxiInteractiveMemoryTag(choice.memoryTag)).toBe(
          choice.memoryText,
        );
      }
    }
    expect(new Set(tags).size).toBe(tags.length);
  });


  test('wooden bird opening stops before the npc resolves the scene alone', () => {
    const event = WANXI_DAILY_EVENT_DEFINITIONS.find(
      (item) => item.id === 'wanxi.daily.qi.wooden-bird',
    );
    expect(event).toBeDefined();
    const opening = getWanxiDailyEventOpeningMessages(event!.id, event!.messages);
    expect(opening).toHaveLength(2);
    expect(opening.some((message) => message.body.includes('明天我去找'))).toBe(false);
  });

  test('wooden bird choice preserves the player action', () => {
    const choice = getWanxiDailyEventChoice(
      'wanxi.daily.qi.wooden-bird',
      'search-together',
    );
    expect(choice?.playerText).toContain('陪你去找');
    expect(choice?.memoryTag).toBe('qi_wooden_bird_searched_together');
  });
});
