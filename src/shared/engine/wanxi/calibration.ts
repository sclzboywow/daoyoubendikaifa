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

export interface WanxiCalibrationNpcPlacement {
  npcId: string;
  regionId: WanxiRegionId;
  locationId?: string;
  point: WanxiPixelPoint;
  locked: boolean;
  /** Whether this NPC participates in the ordinary runtime baseline. */
  runtimeVisible: boolean;
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
  npcPlacements: WanxiCalibrationNpcPlacement[];
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
    x: Number(
      ((clamp(point.x, 0, logicalSize.width) / logicalSize.width) * 100).toFixed(
        4,
      ),
    ),
    y: Number(
      ((clamp(point.y, 0, logicalSize.height) / logicalSize.height) * 100).toFixed(
        4,
      ),
    ),
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
        ((b.x - a.x) * (point.y - a.y)) /
          (b.y - a.y || Number.EPSILON) +
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

export function assessWanxiPlacementSafety(
  point: WanxiPixelPoint,
  regionId: WanxiRegionId,
  locationId: string | undefined,
  zones: readonly WanxiCalibrationZone[],
) {
  const blocked = zones.find(
    (zone) =>
      zone.kind === 'blocked' && wanxiPointInPolygon(point, zone.polygon),
  );
  if (blocked) {
    return {
      ok: false,
      level: 'error' as const,
      code: 'INSIDE_BLOCKED_ZONE',
      message: `落点位于禁止区域 ${blocked.id}${
        blocked.blockedType ? `（${blocked.blockedType}）` : ''
      }`,
    };
  }

  const localSafeZones = zones.filter(
    (zone) =>
      zone.kind === 'safe' &&
      zone.regionId === regionId &&
      (!locationId ||
        !zone.locationId ||
        zone.locationId === locationId),
  );

  if (
    localSafeZones.length > 0 &&
    !localSafeZones.some((zone) =>
      wanxiPointInPolygon(point, zone.polygon),
    )
  ) {
    return {
      ok: false,
      level: 'warning' as const,
      code: 'OUTSIDE_SAFE_ZONE',
      message: '落点不在当前 Region / Location 的 Safe Zone 内。',
    };
  }

  if (localSafeZones.length === 0) {
    return {
      ok: true,
      level: 'warning' as const,
      code: 'NO_SAFE_ZONE',
      message: '当前区域还没有 Safe Zone，仅检查 Blocked Zone。',
    };
  }

  return {
    ok: true,
    level: 'ok' as const,
    code: 'OK',
    message: '落点合法：在 Safe Zone 内，且未进入 Blocked Zone。',
  };
}

export function validateWanxiMapCalibration(
  draft: WanxiMapCalibrationDraft,
  options?: { minSlotDistance?: number; minNpcDistance?: number },
): WanxiCalibrationIssue[] {
  const issues: WanxiCalibrationIssue[] = [];
  const minSlotDistance = options?.minSlotDistance ?? 56;
  const minNpcDistance = options?.minNpcDistance ?? 90;

  if (
    draft.logicalSize.width <= 0 ||
    draft.logicalSize.height <= 0 ||
    !Number.isFinite(draft.logicalSize.width) ||
    !Number.isFinite(draft.logicalSize.height)
  ) {
    return [
      {
        level: 'error',
        code: 'INVALID_LOGICAL_SIZE',
        message: '地图 logicalSize 必须是有效的正数。',
      },
    ];
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
    if (
      zone.polygon.some((point) =>
        !pointInBounds(point, draft.logicalSize),
      )
    ) {
      issues.push({
        level: 'error',
        code: 'ZONE_OUT_OF_BOUNDS',
        entityId: zone.id,
        message: `区域 ${zone.id} 存在超出地图范围的顶点。`,
      });
    }
  }

  const npcIds = new Set<string>();
  for (const placement of draft.npcPlacements) {
    if (npcIds.has(placement.npcId)) {
      issues.push({
        level: 'error',
        code: 'DUPLICATE_NPC_PLACEMENT',
        entityId: placement.npcId,
        message: `NPC ${placement.npcId} 存在重复摆放。`,
      });
    }
    npcIds.add(placement.npcId);

    if (!pointInBounds(placement.point, draft.logicalSize)) {
      issues.push({
        level: 'error',
        code: 'NPC_OUT_OF_BOUNDS',
        entityId: placement.npcId,
        message: `NPC ${placement.npcId} 超出地图范围。`,
      });
      continue;
    }

    const safety = assessWanxiPlacementSafety(
      placement.point,
      placement.regionId,
      placement.locationId,
      draft.zones,
    );
    if (safety.code === 'INSIDE_BLOCKED_ZONE') {
      issues.push({
        level: 'error',
        code: 'NPC_INSIDE_BLOCKED_ZONE',
        entityId: placement.npcId,
        message: `NPC ${placement.npcId} ${safety.message}。`,
      });
    } else if (safety.code === 'OUTSIDE_SAFE_ZONE') {
      issues.push({
        level: 'warning',
        code: 'NPC_OUTSIDE_SAFE_ZONE',
        entityId: placement.npcId,
        message: `NPC ${placement.npcId} ${safety.message}`,
      });
    }
  }

  const safeZones = draft.zones.filter((zone) => zone.kind === 'safe');
  const blockedZones = draft.zones.filter((zone) => zone.kind === 'blocked');

  if (
    (draft.slots.length > 0 || draft.npcPlacements.length > 0) &&
    safeZones.length === 0
  ) {
    issues.push({
      level: 'warning',
      code: 'NO_SAFE_ZONES',
      message: '当前已有 Slot 或 NPC，但还没有任何 Safe Zone；这不影响保存。',
    });
  }

  for (const slot of draft.slots) {
    const localSafeZones = safeZones.filter(
      (zone) =>
        zone.regionId === slot.regionId &&
        (!slot.locationId ||
          !zone.locationId ||
          zone.locationId === slot.locationId),
    );
    if (
      localSafeZones.length > 0 &&
      !localSafeZones.some((zone) =>
        wanxiPointInPolygon(slot.point, zone.polygon),
      )
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
        message: `站位槽 ${slot.id} 落入禁止区域 ${blocked.id}。`,
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
          message: `站位槽 ${a.id} 与 ${b.id} 距离过近。`,
        });
      }
    }
  }

  for (let i = 0; i < draft.npcPlacements.length; i += 1) {
    for (let j = i + 1; j < draft.npcPlacements.length; j += 1) {
      const a = draft.npcPlacements[i];
      const b = draft.npcPlacements[j];
      if (distance(a.point, b.point) < minNpcDistance) {
        issues.push({
          level: 'warning',
          code: 'NPCS_TOO_CLOSE',
          entityId: `${a.npcId},${b.npcId}`,
          message: `NPC ${a.npcId} 与 ${b.npcId} 距离过近，名称可能重叠。`,
        });
      }
    }
  }

  return issues;
}
