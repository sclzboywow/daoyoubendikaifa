import type { WanxiPoint, WanxiRegionId } from './types';

export interface WanxiPixelPoint {
  x: number;
  y: number;
}

export interface WanxiCalibrationLogicalSize {
  width: number;
  height: number;
}

export type WanxiCalibrationZoneKind = 'safe' | 'blocked';
export type WanxiBlockedZoneType =
  | 'water'
  | 'building'
  | 'vegetation'
  | 'decoration'
  | 'other';

export interface WanxiCalibrationSlot {
  id: string;
  regionId: WanxiRegionId;
  locationId?: string;
  label?: string;
  point: WanxiPixelPoint;
  tags?: string[];
}

export interface WanxiCalibrationZone {
  id: string;
  kind: WanxiCalibrationZoneKind;
  regionId: WanxiRegionId;
  locationId?: string;
  blockedType?: WanxiBlockedZoneType;
  polygon: WanxiPixelPoint[];
  note?: string;
}

export interface WanxiMapCalibrationDraft {
  version: 1;
  sceneId: 'wanxi_main';
  logicalSize: WanxiCalibrationLogicalSize;
  slots: WanxiCalibrationSlot[];
  zones: WanxiCalibrationZone[];
}

export type WanxiCalibrationIssueLevel = 'error' | 'warning';

export interface WanxiCalibrationIssue {
  level: WanxiCalibrationIssueLevel;
  code: string;
  message: string;
  entityId?: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function wanxiPercentToPixel(
  point: WanxiPoint,
  logicalSize: WanxiCalibrationLogicalSize,
): WanxiPixelPoint {
  return {
    x: Math.round((clamp(point.x, 0, 100) / 100) * logicalSize.width),
    y: Math.round((clamp(point.y, 0, 100) / 100) * logicalSize.height),
  };
}

export function wanxiPixelToPercent(
  point: WanxiPixelPoint,
  logicalSize: WanxiCalibrationLogicalSize,
): WanxiPoint {
  return {
    x: Number(((clamp(point.x, 0, logicalSize.width) / logicalSize.width) * 100).toFixed(4)),
    y: Number(((clamp(point.y, 0, logicalSize.height) / logicalSize.height) * 100).toFixed(4)),
  };
}

function pointOnSegment(
  point: WanxiPixelPoint,
  a: WanxiPixelPoint,
  b: WanxiPixelPoint,
  epsilon = 0.001,
) {
  const cross =
    (point.y - a.y) * (b.x - a.x) -
    (point.x - a.x) * (b.y - a.y);
  if (Math.abs(cross) > epsilon) return false;
  const dot =
    (point.x - a.x) * (b.x - a.x) +
    (point.y - a.y) * (b.y - a.y);
  if (dot < -epsilon) return false;
  const lenSq = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  return dot <= lenSq + epsilon;
}

export function wanxiPointInPolygon(
  point: WanxiPixelPoint,
  polygon: readonly WanxiPixelPoint[],
): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[j];
    const b = polygon[i];
    if (pointOnSegment(point, a, b)) return true;

    const intersects =
      a.y > point.y !== b.y > point.y &&
      point.x <
        ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y || Number.EPSILON) +
          a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInBounds(
  point: WanxiPixelPoint,
  logicalSize: WanxiCalibrationLogicalSize,
) {
  return (
    Number.isFinite(point.x) &&
    Number.isFinite(point.y) &&
    point.x >= 0 &&
    point.y >= 0 &&
    point.x <= logicalSize.width &&
    point.y <= logicalSize.height
  );
}

function distance(a: WanxiPixelPoint, b: WanxiPixelPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function validateWanxiMapCalibration(
  draft: WanxiMapCalibrationDraft,
  options?: { minSlotDistance?: number },
): WanxiCalibrationIssue[] {
  const issues: WanxiCalibrationIssue[] = [];
  const minSlotDistance = options?.minSlotDistance ?? 56;

  if (
    draft.logicalSize.width <= 0 ||
    draft.logicalSize.height <= 0 ||
    !Number.isFinite(draft.logicalSize.width) ||
    !Number.isFinite(draft.logicalSize.height)
  ) {
    issues.push({
      level: 'error',
      code: 'INVALID_LOGICAL_SIZE',
      message: '地图 logicalSize 必须是有效的正数。',
    });
    return issues;
  }

  const slotIds = new Set<string>();
  for (const slot of draft.slots) {
    if (slotIds.has(slot.id)) {
      issues.push({
        level: 'error',
        code: 'DUPLICATE_SLOT_ID',
        entityId: slot.id,
        message: `站位槽 ${slot.id} 重复。`,
      });
    }
    slotIds.add(slot.id);
    if (!pointInBounds(slot.point, draft.logicalSize)) {
      issues.push({
        level: 'error',
        code: 'SLOT_OUT_OF_BOUNDS',
        entityId: slot.id,
        message: `站位槽 ${slot.id} 超出地图范围。`,
      });
    }
  }

  const zoneIds = new Set<string>();
  for (const zone of draft.zones) {
    if (zoneIds.has(zone.id)) {
      issues.push({
        level: 'error',
        code: 'DUPLICATE_ZONE_ID',
        entityId: zone.id,
        message: `区域 ${zone.id} 重复。`,
      });
    }
    zoneIds.add(zone.id);
    if (zone.polygon.length < 3) {
      issues.push({
        level: 'error',
        code: 'ZONE_TOO_SMALL',
        entityId: zone.id,
        message: `区域 ${zone.id} 至少需要 3 个顶点。`,
      });
    }
    if (zone.polygon.some((point) => !pointInBounds(point, draft.logicalSize))) {
      issues.push({
        level: 'error',
        code: 'ZONE_OUT_OF_BOUNDS',
        entityId: zone.id,
        message: `区域 ${zone.id} 存在超出地图范围的顶点。`,
      });
    }
  }

  const safeZones = draft.zones.filter((zone) => zone.kind === 'safe');
  const blockedZones = draft.zones.filter((zone) => zone.kind === 'blocked');

  if (draft.slots.length > 0 && safeZones.length === 0) {
    issues.push({
      level: 'warning',
      code: 'NO_SAFE_ZONES',
      message: '当前已有站位槽，但还没有绘制任何 Safe Zone。',
    });
  }

  for (const slot of draft.slots) {
    const localSafeZones = safeZones.filter(
      (zone) =>
        zone.regionId === slot.regionId &&
        (!slot.locationId || !zone.locationId || zone.locationId === slot.locationId),
    );
    if (
      localSafeZones.length > 0 &&
      !localSafeZones.some((zone) => wanxiPointInPolygon(slot.point, zone.polygon))
    ) {
      issues.push({
        level: 'error',
        code: 'SLOT_OUTSIDE_SAFE_ZONE',
        entityId: slot.id,
        message: `站位槽 ${slot.id} 不在所属区域的 Safe Zone 内。`,
      });
    }

    const blocked = blockedZones.find((zone) =>
      wanxiPointInPolygon(slot.point, zone.polygon),
    );
    if (blocked) {
      issues.push({
        level: 'error',
        code: 'SLOT_INSIDE_BLOCKED_ZONE',
        entityId: slot.id,
        message: `站位槽 ${slot.id} 落入禁止区域 ${blocked.id}${blocked.blockedType ? `（${blocked.blockedType}）` : ''}。`,
      });
    }
  }

  for (let i = 0; i < draft.slots.length; i += 1) {
    for (let j = i + 1; j < draft.slots.length; j += 1) {
      const a = draft.slots[i];
      const b = draft.slots[j];
      if (distance(a.point, b.point) < minSlotDistance) {
        issues.push({
          level: 'warning',
          code: 'SLOTS_TOO_CLOSE',
          entityId: `${a.id},${b.id}`,
          message: `站位槽 ${a.id} 与 ${b.id} 距离过近，NPC 名字可能重叠。`,
        });
      }
    }
  }

  return issues;
}
