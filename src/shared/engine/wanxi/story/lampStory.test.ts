import { describe, expect, it } from 'vitest';
import {
  getWanxiLampStoryActiveBindingIds,
  getWanxiLampStoryAttentionTarget,
  getWanxiLampStoryActionPresentation,
  getWanxiLampStoryNpcPlacements,
  resolveWanxiLampStoryTransition,
  shouldUseWanxiLampAiNarrative,
  WANXI_LAMP_STORY_ACTIONS,
} from './lampStory';
import { getWanxiEnabledBindings, getWanxiNpcByRoleKey } from '../definitions';

describe('wanxi lamp story', () => {
  it('advances only through the expected action for each stage', () => {
    expect(
      resolveWanxiLampStoryTransition(
        'not_started',
        WANXI_LAMP_STORY_ACTIONS.START,
      ),
    ).toBe('deliver_tassel');
    expect(
      resolveWanxiLampStoryTransition(
        'deliver_tassel',
        WANXI_LAMP_STORY_ACTIONS.START,
      ),
    ).toBeNull();
  });

  it('keeps battle stage in place until the server settles a win', () => {
    expect(
      resolveWanxiLampStoryTransition(
        'battle_ready',
        WANXI_LAMP_STORY_ACTIONS.BATTLE,
      ),
    ).toBe('battle_ready');
    expect(getWanxiLampStoryActiveBindingIds('battle_ready')).toEqual([
      WANXI_LAMP_STORY_ACTIONS.BATTLE,
    ]);
  });

  it('moves both lovers to the lakeside for reconciliation', () => {
    const placements = getWanxiLampStoryNpcPlacements('reunion');
    expect(placements).toHaveLength(2);
    expect(new Set(placements.map((placement) => placement.locationId))).toEqual(
      new Set(['water_pavilion']),
    );
    expect(getWanxiLampStoryAttentionTarget('reunion')).toEqual({
      type: 'location',
      locationId: 'water_pavilion',
    });
  });

  it('exposes the courtyard confrontation on NPCs standing there', () => {
    const host = getWanxiNpcByRoleKey('west_host');
    const musician = getWanxiNpcByRoleKey('stage_musician');
    expect(host).toBeTruthy();
    expect(musician).toBeTruthy();
    const enabledIds = getWanxiLampStoryActiveBindingIds('return_repaired_tassel');
    const onHost = getWanxiEnabledBindings({
      npcId: host!.id,
      locationId: 'west_courtyard',
      enabledIds,
    });
    const onMusician = getWanxiEnabledBindings({
      npcId: musician!.id,
      locationId: 'west_courtyard',
      enabledIds,
    });
    expect(onHost.map((binding) => binding.id)).toEqual([
      WANXI_LAMP_STORY_ACTIONS.CONFRONTATION,
    ]);
    expect(onMusician.map((binding) => binding.id)).toEqual([
      WANXI_LAMP_STORY_ACTIONS.CONFRONTATION,
    ]);
  });
  it('limits AIGC narrative to explicitly approved dramatic beats', () => {
    expect(
      shouldUseWanxiLampAiNarrative('deliver_tassel', {
        type: 'npc',
        roleKey: 'stage_musician',
      }),
    ).toBe(true);
    expect(
      shouldUseWanxiLampAiNarrative('gather_moonsilk', {
        type: 'npc',
        roleKey: 'roaming_merchant',
      }),
    ).toBe(false);
  });

  it('keeps item presentations cosmetic and separate from state transitions', () => {
    expect(
      getWanxiLampStoryActionPresentation(
        WANXI_LAMP_STORY_ACTIONS.TAKE_CONTRACT_SAND,
      ),
    ).toMatchObject({ kicker: '获得物品', title: '沉契砂 ×1' });
  });

});
