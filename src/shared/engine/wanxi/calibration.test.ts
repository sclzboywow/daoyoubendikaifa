import { describe, expect, test } from 'vitest';
import { WANXI_NPCS } from './definitions';
import { createDefaultWanxiMapCalibrationDraft } from './editorDefaults';
import {
  assessWanxiPlacementSafety,
  validateWanxiMapCalibration,
  wanxiPercentToPixel,
  wanxiPixelToPercent,
  wanxiPointInPolygon,
  type WanxiMapCalibrationDraft,
} from './calibration';

const SIZE = { width: 3056, height: 2143 };

describe('wanxi map calibration', () => {
  test('converts percent and pixel coordinates predictably', () => {
    expect(wanxiPercentToPixel({ x: 50, y: 50 }, SIZE)).toEqual({
      x: 1528,
      y: 1072,
    });
    const percent = wanxiPixelToPercent({ x: 1528, y: 1072 }, SIZE);
    expect(percent.x).toBe(50);
    expect(percent.y).toBeCloseTo(50.0233, 4);
  });

  test('treats polygon edges as inside', () => {
    const polygon = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    expect(wanxiPointInPolygon({ x: 50, y: 50 }, polygon)).toBe(true);
    expect(wanxiPointInPolygon({ x: 0, y: 50 }, polygon)).toBe(true);
    expect(wanxiPointInPolygon({ x: 150, y: 50 }, polygon)).toBe(false);
  });

  test('default editor draft records every registered NPC', () => {
    const draft = createDefaultWanxiMapCalibrationDraft();
    expect(draft.npcPlacements).toHaveLength(WANXI_NPCS.length);
    expect(new Set(draft.npcPlacements.map((item) => item.npcId)).size).toBe(
      WANXI_NPCS.length,
    );
  });

  test('rejects npc placements inside blocked zones', () => {
    const draft: WanxiMapCalibrationDraft = {
      version: 1,
      sceneId: 'wanxi_main',
      logicalSize: SIZE,
      slots: [],
      npcPlacements: [
        {
          npcId: 'wanxi_npc_master',
          regionId: 'lakeside',
          locationId: 'lakeside',
          point: { x: 2200, y: 1200 },
          locked: false,
          runtimeVisible: true,
        },
      ],
      zones: [
        {
          id: 'blocked.water.01',
          kind: 'blocked',
          blockedType: 'water',
          regionId: 'lakeside',
          locationId: 'lakeside',
          polygon: [
            { x: 2100, y: 1100 },
            { x: 2300, y: 1100 },
            { x: 2300, y: 1300 },
            { x: 2100, y: 1300 },
          ],
        },
      ],
    };
    expect(validateWanxiMapCalibration(draft)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'NPC_INSIDE_BLOCKED_ZONE' }),
      ]),
    );
  });

  test('safe-zone absence does not prevent manual placement', () => {
    const safety = assessWanxiPlacementSafety(
      { x: 100, y: 100 },
      'square',
      'central_square',
      [],
    );
    expect(safety.ok).toBe(true);
    expect(safety.level).toBe('warning');
    expect(safety.code).toBe('NO_SAFE_ZONE');
  });
});
