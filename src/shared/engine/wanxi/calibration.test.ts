import { describe, expect, test } from 'vitest';
import {
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

  test('rejects slots inside blocked zones', () => {
    const draft: WanxiMapCalibrationDraft = {
      version: 1,
      sceneId: 'wanxi_main',
      logicalSize: SIZE,
      slots: [
        {
          id: 'lake_slot_01',
          regionId: 'lakeside',
          locationId: 'lakeside',
          point: { x: 2200, y: 1200 },
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
        expect.objectContaining({ code: 'SLOT_INSIDE_BLOCKED_ZONE' }),
      ]),
    );
  });

  test('rejects slots outside a local safe zone', () => {
    const draft: WanxiMapCalibrationDraft = {
      version: 1,
      sceneId: 'wanxi_main',
      logicalSize: SIZE,
      slots: [
        {
          id: 'square_slot_01',
          regionId: 'square',
          locationId: 'central_square',
          point: { x: 100, y: 100 },
        },
      ],
      zones: [
        {
          id: 'safe.square.01',
          kind: 'safe',
          regionId: 'square',
          locationId: 'central_square',
          polygon: [
            { x: 1000, y: 900 },
            { x: 1800, y: 900 },
            { x: 1800, y: 1400 },
            { x: 1000, y: 1400 },
          ],
        },
      ],
    };
    expect(validateWanxiMapCalibration(draft)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'SLOT_OUTSIDE_SAFE_ZONE' }),
      ]),
    );
  });
});
