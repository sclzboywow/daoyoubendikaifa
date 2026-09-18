import wanxiMapUrl from '@app/assets/wanxi/wanxi-map-v1.png';
import { InkButton } from '@app/components/ui/InkButton';
import { InkInput } from '@app/components/ui/InkInput';
import { InkSelect } from '@app/components/ui/InkSelect';
import {
  WANXI_DEFAULT_NPC_PLACEMENTS,
  WANXI_LOCATION_PLACEMENTS,
  WANXI_LOCATIONS,
  WANXI_MAIN_SCENE,
  WANXI_NPCS,
  WANXI_REGIONS,
  getWanxiLocation,
  getWanxiNpcById,
} from '@shared/engine/wanxi/definitions';
import {
  validateWanxiMapCalibration,
  wanxiPercentToPixel,
  wanxiPixelToPercent,
  wanxiPointInPolygon,
  type WanxiBlockedZoneType,
  type WanxiCalibrationSlot,
  type WanxiCalibrationZone,
  type WanxiMapCalibrationDraft,
  type WanxiPixelPoint,
} from '@shared/engine/wanxi/calibration';
import type { WanxiRegionId } from '@shared/engine/wanxi/types';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';

const STORAGE_KEY = 'wanxi:map-calibrator:v1';
const MAP_WIDTH = WANXI_MAIN_SCENE.logicalSize.width;
const MAP_HEIGHT = WANXI_MAIN_SCENE.logicalSize.height;

type CalibratorMode = 'inspect' | 'blocked' | 'safe' | 'slot';
type OverlayScope = 'current' | 'all';

interface ModeMeta {
  title: string;
  short: string;
  description: string;
  action: string;
  toneClass: string;
  borderClass: string;
  badgeClass: string;
}

const MODE_META: Record<CalibratorMode, ModeMeta> = {
  inspect: {
    title: '查看坐标',
    short: '查看',
    description: '点击只读取坐标，不创建任何内容。',
    action: '单击地图：读取像素坐标与百分比坐标。',
    toneClass: 'text-ink',
    borderClass: 'border-ink/25',
    badgeClass: 'bg-ink/10 text-ink',
  },
  blocked: {
    title: '1 · 绘制禁止区',
    short: '禁止区',
    description: '先圈水面、屋顶、植物和其他绝不能站人的区域。',
    action: '单击：增加边界点 · 双击/Enter：完成 · 右键/Ctrl+Z：撤销一点。',
    toneClass: 'text-red-800',
    borderClass: 'border-red-700/45',
    badgeClass: 'bg-red-700/10 text-red-800',
  },
  safe: {
    title: '2 · 绘制可站区',
    short: '可站区',
    description: '再圈道路、广场、桥面、水榭平台等允许脚落地的位置。',
    action: '单击：增加边界点 · 双击/Enter：完成 · 右键/Ctrl+Z：撤销一点。',
    toneClass: 'text-emerald-800',
    borderClass: 'border-emerald-700/45',
    badgeClass: 'bg-emerald-700/10 text-emerald-800',
  },
  slot: {
    title: '3 · 放置站位槽',
    short: '站位槽',
    description: '最后点击 NPC 双脚应该落下的位置，再保存 Slot。',
    action: '单击地图：设置 NPC 脚下落点 · Enter：保存 Slot。',
    toneClass: 'text-sky-800',
    borderClass: 'border-sky-700/45',
    badgeClass: 'bg-sky-700/10 text-sky-800',
  },
};

const BLOCKED_TYPE_LABELS: Record<WanxiBlockedZoneType, string> = {
  water: '水面',
  building: '建筑 / 屋顶',
  vegetation: '植物 / 密竹',
  decoration: '装饰物 / 桌椅',
  other: '其他禁站区',
};

const BLOCKED_TYPE_COLORS: Record<
  WanxiBlockedZoneType,
  { fill: string; stroke: string; text: string }
> = {
  water: {
    fill: 'rgba(59,130,246,0.22)',
    stroke: 'rgba(29,78,216,0.92)',
    text: '#1d4ed8',
  },
  building: {
    fill: 'rgba(249,115,22,0.22)',
    stroke: 'rgba(194,65,12,0.92)',
    text: '#c2410c',
  },
  vegetation: {
    fill: 'rgba(132,204,22,0.22)',
    stroke: 'rgba(77,124,15,0.92)',
    text: '#4d7c0f',
  },
  decoration: {
    fill: 'rgba(168,85,247,0.20)',
    stroke: 'rgba(126,34,206,0.92)',
    text: '#7e22ce',
  },
  other: {
    fill: 'rgba(239,68,68,0.20)',
    stroke: 'rgba(153,27,27,0.92)',
    text: '#991b1b',
  },
};

function createEmptyDraft(): WanxiMapCalibrationDraft {
  return {
    version: 1,
    sceneId: 'wanxi_main',
    logicalSize: { width: MAP_WIDTH, height: MAP_HEIGHT },
    slots: [],
    zones: [],
  };
}

function loadDraft(): WanxiMapCalibrationDraft {
  if (typeof window === 'undefined') return createEmptyDraft();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyDraft();
    const parsed = JSON.parse(raw) as Partial<WanxiMapCalibrationDraft>;
    if (
      parsed.version !== 1 ||
      parsed.sceneId !== 'wanxi_main' ||
      !Array.isArray(parsed.slots) ||
      !Array.isArray(parsed.zones)
    ) {
      return createEmptyDraft();
    }
    return {
      version: 1,
      sceneId: 'wanxi_main',
      logicalSize: { width: MAP_WIDTH, height: MAP_HEIGHT },
      slots: parsed.slots,
      zones: parsed.zones,
    };
  } catch {
    return createEmptyDraft();
  }
}

function cssPoint(point: WanxiPixelPoint) {
  return {
    left: `${(point.x / MAP_WIDTH) * 100}%`,
    top: `${(point.y / MAP_HEIGHT) * 100}%`,
  };
}

function pointLabel(point: WanxiPixelPoint | null) {
  if (!point) return '—';
  const percent = wanxiPixelToPercent(point, {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
  });
  return `${point.x}, ${point.y} px  ·  ${percent.x.toFixed(4)}%, ${percent.y.toFixed(4)}%`;
}

function safeIdPart(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function nextSlotId(locationId: string, slots: readonly WanxiCalibrationSlot[]) {
  const prefix = `${safeIdPart(locationId)}_slot_`;
  let index = 1;
  while (
    slots.some(
      (slot) => slot.id === `${prefix}${String(index).padStart(2, '0')}`,
    )
  ) {
    index += 1;
  }
  return `${prefix}${String(index).padStart(2, '0')}`;
}

function nextZoneId(
  kind: 'safe' | 'blocked',
  locationId: string,
  zones: readonly WanxiCalibrationZone[],
) {
  const prefix = `${kind}.${safeIdPart(locationId)}.`;
  let index = 1;
  while (
    zones.some(
      (zone) => zone.id === `${prefix}${String(index).padStart(2, '0')}`,
    )
  ) {
    index += 1;
  }
  return `${prefix}${String(index).padStart(2, '0')}`;
}

function pointFromMouse(
  event: ReactMouseEvent<HTMLDivElement>,
  surface: HTMLDivElement,
): WanxiPixelPoint {
  const rect = surface.getBoundingClientRect();
  const x = Math.round(((event.clientX - rect.left) / rect.width) * MAP_WIDTH);
  const y = Math.round(((event.clientY - rect.top) / rect.height) * MAP_HEIGHT);
  return {
    x: Math.min(MAP_WIDTH, Math.max(0, x)),
    y: Math.min(MAP_HEIGHT, Math.max(0, y)),
  };
}

function polygonCenter(points: readonly WanxiPixelPoint[]): WanxiPixelPoint | null {
  if (!points.length) return null;
  const total = points.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
    { x: 0, y: 0 },
  );
  return {
    x: Math.round(total.x / points.length),
    y: Math.round(total.y / points.length),
  };
}

function NpcPreviewMarker(props: {
  npcId: string;
  point: WanxiPixelPoint;
  muted?: boolean;
  label?: string;
}) {
  const npc = getWanxiNpcById(props.npcId);
  if (!npc) return null;
  return (
    <div
      className={`pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-full ${props.muted ? 'opacity-45' : ''}`}
      style={cssPoint(props.point)}
    >
      <div className="relative flex flex-col items-center">
        <div className="font-heading border-ink/30 bg-bgpaper/95 text-ink flex size-9 items-center justify-center rounded-full border text-base shadow-[0_4px_14px_rgba(44,24,16,0.18)]">
          {npc.sigil}
        </div>
        <div className="bg-bgpaper/95 text-ink mt-1 whitespace-nowrap px-1.5 py-0.5 text-[11px] shadow-sm">
          {props.label ?? npc.name}
        </div>
      </div>
    </div>
  );
}

function ModeButton(props: {
  mode: CalibratorMode;
  active: boolean;
  onClick(): void;
}) {
  const meta = MODE_META[props.mode];
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`w-full border px-3 py-3 text-left transition-colors ${
        props.active
          ? `${meta.borderClass} bg-bgpaper shadow-sm`
          : 'border-ink/10 bg-paper/45 hover:border-ink/25 hover:bg-bgpaper/75'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-0.5 inline-flex min-w-14 justify-center px-2 py-1 text-[11px] font-semibold ${meta.badgeClass}`}
        >
          {meta.short}
        </span>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${props.active ? meta.toneClass : 'text-ink'}`}>
            {meta.title}
          </p>
          <p className="text-ink-secondary mt-1 text-xs leading-5">
            {meta.description}
          </p>
        </div>
      </div>
    </button>
  );
}

function ZoneLegend() {
  return (
    <div className="space-y-1.5 text-xs">
      <p className="text-ink font-semibold">图层颜色</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-ink-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 border border-emerald-700/60 bg-emerald-500/20" />
          可站区
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 border border-blue-700/60 bg-blue-500/20" />
          水面
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 border border-orange-700/60 bg-orange-500/20" />
          建筑
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 border border-lime-700/60 bg-lime-500/20" />
          植物
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 border border-purple-700/60 bg-purple-500/20" />
          装饰物
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full border-2 border-sky-700 bg-sky-500/60" />
          Slot
        </span>
      </div>
    </div>
  );
}

function zoneVisual(zone: WanxiCalibrationZone) {
  if (zone.kind === 'safe') {
    return {
      fill: 'rgba(16,185,129,0.18)',
      stroke: 'rgba(4,120,87,0.92)',
      text: '#047857',
    };
  }
  return BLOCKED_TYPE_COLORS[zone.blockedType ?? 'other'];
}

export function WanxiPlacementCalibrator() {
  const mapSurfaceRef = useRef<HTMLDivElement | null>(null);
  const mapViewportRef = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState<WanxiMapCalibrationDraft>(loadDraft);
  const [mode, setMode] = useState<CalibratorMode>('inspect');
  const [zoom, setZoom] = useState(0.5);
  const [cursor, setCursor] = useState<WanxiPixelPoint | null>(null);
  const [hoverPoint, setHoverPoint] = useState<WanxiPixelPoint | null>(null);
  const [pendingPolygon, setPendingPolygon] = useState<WanxiPixelPoint[]>([]);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<WanxiRegionId>('square');
  const [selectedLocationId, setSelectedLocationId] = useState('central_square');
  const [selectedNpcId, setSelectedNpcId] = useState(WANXI_NPCS[0]?.id ?? '');
  const [slotId, setSlotId] = useState('');
  const [slotLabel, setSlotLabel] = useState('');
  const [slotTags, setSlotTags] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [zoneNote, setZoneNote] = useState('');
  const [blockedType, setBlockedType] = useState<WanxiBlockedZoneType>('water');
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(100);
  const [showLocations, setShowLocations] = useState(true);
  const [showLegacyNpc, setShowLegacyNpc] = useState(false);
  const [showZoneLabels, setShowZoneLabels] = useState(true);
  const [overlayScope, setOverlayScope] = useState<OverlayScope>('current');
  const [importText, setImportText] = useState('');
  const [status, setStatus] = useState('建议先圈禁止区，再圈可站区，最后放置 Slot。');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const locationsForRegion = useMemo(
    () => WANXI_LOCATIONS.filter((location) => location.regionId === selectedRegionId),
    [selectedRegionId],
  );

  const issues = useMemo(() => validateWanxiMapCalibration(draft), [draft]);
  const errors = issues.filter((issue) => issue.level === 'error');
  const warnings = issues.filter((issue) => issue.level === 'warning');

  const currentLocationSlots = useMemo(
    () => draft.slots.filter((slot) => slot.locationId === selectedLocationId),
    [draft.slots, selectedLocationId],
  );
  const currentLocationZones = useMemo(
    () => draft.zones.filter((zone) => zone.locationId === selectedLocationId),
    [draft.zones, selectedLocationId],
  );

  const visibleSlots =
    overlayScope === 'all' ? draft.slots : currentLocationSlots;
  const visibleZones =
    overlayScope === 'all' ? draft.zones : currentLocationZones;

  const currentLocationPlacement = WANXI_LOCATION_PLACEMENTS.find(
    (placement) => placement.locationId === selectedLocationId,
  );

  const cursorSafety = useMemo(() => {
    if (!cursor) return null;
    const localSafeZones = draft.zones.filter(
      (zone) =>
        zone.kind === 'safe' &&
        zone.regionId === selectedRegionId &&
        (!zone.locationId || zone.locationId === selectedLocationId),
    );
    const blocked = draft.zones.find(
      (zone) =>
        zone.kind === 'blocked' && wanxiPointInPolygon(cursor, zone.polygon),
    );
    if (blocked) {
      return {
        level: 'error' as const,
        text: `禁止落点：位于 ${blocked.id}${
          blocked.blockedType ? ` · ${BLOCKED_TYPE_LABELS[blocked.blockedType]}` : ''
        }`,
      };
    }
    if (
      localSafeZones.length > 0 &&
      !localSafeZones.some((zone) => wanxiPointInPolygon(cursor, zone.polygon))
    ) {
      return {
        level: 'error' as const,
        text: '禁止落点：不在当前 Location 的可站区内。',
      };
    }
    if (localSafeZones.length === 0) {
      return {
        level: 'warning' as const,
        text: '未校验：当前 Location 还没有 Safe Zone。',
      };
    }
    return { level: 'ok' as const, text: '合法落点：位于 Safe Zone，且未进入禁止区。' };
  }, [cursor, draft.zones, selectedLocationId, selectedRegionId]);

  function changeMode(next: CalibratorMode) {
    if (next !== mode && pendingPolygon.length > 0) {
      setStatus('已取消未完成的多边形。');
    }
    setMode(next);
    setPendingPolygon([]);
    setEditingZoneId(null);
    setZoneId('');
    setZoneNote('');
    if (next !== 'slot') {
      setSlotId('');
      setSlotLabel('');
      setSlotTags('');
    }
  }

  function setLocation(locationId: string) {
    const location = getWanxiLocation(locationId);
    if (!location) return;
    setSelectedLocationId(locationId);
    setSelectedRegionId(location.regionId);
    setSlotId('');
    setZoneId('');
    setPendingPolygon([]);
    setEditingZoneId(null);
    setStatus(`已切换到 ${location.name}。`);
  }

  function setRegion(regionId: WanxiRegionId) {
    setSelectedRegionId(regionId);
    const first = WANXI_LOCATIONS.find((location) => location.regionId === regionId);
    if (first) setLocation(first.id);
  }

  function focusCurrentLocation() {
    const viewport = mapViewportRef.current;
    if (!viewport || !currentLocationPlacement) return;
    const pixel = wanxiPercentToPixel(currentLocationPlacement.point, {
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
    });
    viewport.scrollTo({
      left: Math.max(0, pixel.x * zoom - viewport.clientWidth / 2 + 32),
      top: Math.max(0, pixel.y * zoom - viewport.clientHeight / 2 + 32),
      behavior: 'smooth',
    });
  }

  function fitMap() {
    const viewport = mapViewportRef.current;
    if (!viewport) return;
    const usableWidth = Math.max(200, viewport.clientWidth - 64);
    const usableHeight = Math.max(200, viewport.clientHeight - 64);
    const next = Math.min(usableWidth / MAP_WIDTH, usableHeight / MAP_HEIGHT, 1.25);
    setZoom(Math.max(0.2, Number(next.toFixed(2))));
    requestAnimationFrame(() => viewport.scrollTo({ left: 0, top: 0 }));
  }

  function onMapClick(event: ReactMouseEvent<HTMLDivElement>) {
    if ((mode === 'safe' || mode === 'blocked') && event.detail > 1) return;
    const surface = mapSurfaceRef.current;
    if (!surface) return;
    const point = pointFromMouse(event, surface);
    setCursor(point);

    if (mode === 'inspect') {
      setStatus(`坐标：${pointLabel(point)}`);
      return;
    }

    if (mode === 'slot') {
      if (!slotId) setSlotId(nextSlotId(selectedLocationId, draft.slots));
      setStatus('已设置 NPC 脚下落点。确认安全状态后点击“保存 Slot”。');
      return;
    }

    setPendingPolygon((current) => [...current, point]);
    if (!zoneId) setZoneId(nextZoneId(mode, selectedLocationId, draft.zones));
    setStatus(`已加入第 ${pendingPolygon.length + 1} 个边界点。`);
  }

  function onMapMove(event: ReactMouseEvent<HTMLDivElement>) {
    const surface = mapSurfaceRef.current;
    if (!surface) return;
    setHoverPoint(pointFromMouse(event, surface));
  }

  function saveSlot() {
    if (!cursor) {
      setStatus('请先进入“站位槽”模式，再点击地图上的 NPC 脚下位置。');
      return;
    }
    if (cursorSafety?.level === 'error') {
      setStatus(`不能保存：${cursorSafety.text}`);
      return;
    }
    const id = slotId.trim() || nextSlotId(selectedLocationId, draft.slots);
    const slot: WanxiCalibrationSlot = {
      id,
      regionId: selectedRegionId,
      locationId: selectedLocationId,
      point: cursor,
      ...(slotLabel.trim() ? { label: slotLabel.trim() } : {}),
      ...(slotTags.trim()
        ? {
            tags: slotTags
              .split(',')
              .map((value) => value.trim())
              .filter(Boolean),
          }
        : {}),
    };
    setDraft((current) => ({
      ...current,
      slots: [...current.slots.filter((item) => item.id !== id), slot],
    }));
    setSlotId('');
    setSlotLabel('');
    setSlotTags('');
    setStatus(`已保存站位槽 ${id}。继续点击地图可放下一个 Slot。`);
  }

  function deleteSlot(id: string) {
    setDraft((current) => ({
      ...current,
      slots: current.slots.filter((slot) => slot.id !== id),
    }));
    if (slotId === id) {
      setSlotId('');
      setSlotLabel('');
      setSlotTags('');
    }
    setStatus(`已删除站位槽 ${id}。`);
  }

  function editSlot(slot: WanxiCalibrationSlot) {
    changeMode('slot');
    const location = slot.locationId ? getWanxiLocation(slot.locationId) : null;
    if (location) {
      setSelectedRegionId(location.regionId);
      setSelectedLocationId(location.id);
    } else {
      setSelectedRegionId(slot.regionId);
    }
    setCursor(slot.point);
    setSlotId(slot.id);
    setSlotLabel(slot.label ?? '');
    setSlotTags(slot.tags?.join(', ') ?? '');
    setStatus(`正在编辑 ${slot.id}。点击地图可重新移动脚点。`);
  }

  function finishZone() {
    if (mode !== 'safe' && mode !== 'blocked') return;
    if (pendingPolygon.length < 3) {
      setStatus('至少需要 3 个顶点才能完成区域。');
      return;
    }
    const id = zoneId.trim() || nextZoneId(mode, selectedLocationId, draft.zones);
    const zone: WanxiCalibrationZone = {
      id,
      kind: mode,
      regionId: selectedRegionId,
      locationId: selectedLocationId,
      polygon: pendingPolygon,
      ...(mode === 'blocked' ? { blockedType } : {}),
      ...(zoneNote.trim() ? { note: zoneNote.trim() } : {}),
    };
    setDraft((current) => ({
      ...current,
      zones: [...current.zones.filter((item) => item.id !== id), zone],
    }));
    setPendingPolygon([]);
    setEditingZoneId(null);
    setZoneId('');
    setZoneNote('');
    setStatus(`已保存 ${mode === 'safe' ? '可站区' : '禁止区'} ${id}。`);
  }

  function cancelZoneDrawing() {
    setPendingPolygon([]);
    setEditingZoneId(null);
    setZoneId('');
    setZoneNote('');
    setStatus('已取消当前多边形绘制。');
  }

  function deleteZone(id: string) {
    setDraft((current) => ({
      ...current,
      zones: current.zones.filter((zone) => zone.id !== id),
    }));
    if (editingZoneId === id) cancelZoneDrawing();
    setStatus(`已删除区域 ${id}。`);
  }

  function editZone(zone: WanxiCalibrationZone) {
    changeMode(zone.kind);
    const location = zone.locationId ? getWanxiLocation(zone.locationId) : null;
    if (location) {
      setSelectedRegionId(location.regionId);
      setSelectedLocationId(location.id);
    } else {
      setSelectedRegionId(zone.regionId);
    }
    setPendingPolygon([...zone.polygon]);
    setEditingZoneId(zone.id);
    setZoneId(zone.id);
    setZoneNote(zone.note ?? '');
    if (zone.blockedType) setBlockedType(zone.blockedType);
    setStatus(`正在重绘 ${zone.id}。可以继续加点、撤销，完成后会覆盖原区域。`);
  }

  function importLegacyNpcPlacements() {
    const imported = WANXI_DEFAULT_NPC_PLACEMENTS.map((placement) => {
      const npc = getWanxiNpcById(placement.npcId);
      return {
        id: `legacy.${placement.locationId ?? placement.regionId}.${npc?.roleKey ?? placement.npcId}`,
        regionId: placement.regionId,
        ...(placement.locationId ? { locationId: placement.locationId } : {}),
        point: wanxiPercentToPixel(placement.point, {
          width: MAP_WIDTH,
          height: MAP_HEIGHT,
        }),
        label: `当前位置 · ${npc?.name ?? placement.npcId}`,
        tags: ['legacy', 'needs-review'],
      } satisfies WanxiCalibrationSlot;
    });
    setDraft((current) => {
      const ids = new Set(imported.map((slot) => slot.id));
      return {
        ...current,
        slots: [...current.slots.filter((slot) => !ids.has(slot.id)), ...imported],
      };
    });
    setStatus(`已导入 ${imported.length} 个当前 NPC 点位。请逐个检查，不要直接视为合法 Slot。`);
  }

  function exportJson() {
    return JSON.stringify(draft, null, 2);
  }

  async function copyExport(kind: 'json' | 'ts') {
    const json = exportJson();
    const text =
      kind === 'json'
        ? json
        : `// Generated by Wanxi Map Calibrator V2 UI\nexport const WANXI_MAP_CALIBRATION_V1 = ${json} as const;\n`;
    try {
      await navigator.clipboard.writeText(text);
      setStatus(kind === 'json' ? 'JSON 已复制。' : 'TypeScript 配置已复制。');
    } catch {
      setStatus('浏览器未允许剪贴板访问，请使用“下载 JSON”。');
    }
  }

  function downloadJson() {
    const blob = new Blob([exportJson()], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'wanxi-map-calibration-v1.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus('已生成 wanxi-map-calibration-v1.json。');
  }

  function importJson() {
    try {
      const parsed = JSON.parse(importText) as WanxiMapCalibrationDraft;
      if (
        parsed.version !== 1 ||
        parsed.sceneId !== 'wanxi_main' ||
        !Array.isArray(parsed.slots) ||
        !Array.isArray(parsed.zones)
      ) {
        throw new Error('格式不是 Wanxi Map Calibration V1');
      }
      setDraft({
        ...parsed,
        logicalSize: { width: MAP_WIDTH, height: MAP_HEIGHT },
      });
      setPendingPolygon([]);
      setEditingZoneId(null);
      setStatus('JSON 已导入并写入本地草稿。');
    } catch (error) {
      setStatus(error instanceof Error ? `导入失败：${error.message}` : '导入失败。');
    }
  }

  function resetDraft() {
    if (!window.confirm('确定清空当前全部站位槽和区域草稿吗？')) return;
    setDraft(createEmptyDraft());
    setCursor(null);
    setPendingPolygon([]);
    setEditingZoneId(null);
    setSlotId('');
    setZoneId('');
    setStatus('草稿已清空。');
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const editingField =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT';

      if (event.key === 'Escape') {
        if (pendingPolygon.length) cancelZoneDrawing();
        else if (mode !== 'inspect') changeMode('inspect');
        return;
      }

      if (editingField) return;

      if (event.key === '1') changeMode('blocked');
      if (event.key === '2') changeMode('safe');
      if (event.key === '3') changeMode('slot');
      if (event.key === '0') changeMode('inspect');

      if (
        (mode === 'safe' || mode === 'blocked') &&
        (event.key === 'Backspace' || (event.ctrlKey && event.key.toLowerCase() === 'z'))
      ) {
        event.preventDefault();
        setPendingPolygon((current) => current.slice(0, -1));
      }

      if (event.key === 'Enter') {
        if (mode === 'safe' || mode === 'blocked') finishZone();
        if (mode === 'slot') saveSlot();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const modeMeta = MODE_META[mode];
  const pendingPreviewPoints =
    pendingPolygon.length && hoverPoint
      ? [...pendingPolygon, hoverPoint]
      : pendingPolygon;

  const mapCursorClass = mode === 'inspect' ? 'cursor-cell' : 'cursor-crosshair';

  return (
    <div className="bg-paper flex h-full min-h-0 flex-col overflow-hidden">
      <header className="border-ink/15 bg-bgpaper/95 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-dashed px-3 py-2 md:px-4">
        <div>
          <p className="text-ink text-sm font-semibold tracking-[0.08em]">万戏坊地图定位校准器 V2</p>
          <p className="text-ink-secondary mt-0.5 text-xs">
            数据格式仍为 V1 · 地图 {MAP_WIDTH} × {MAP_HEIGHT} · NPC 坐标统一表示双脚落点
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <InkButton href="/game/wanxi">返回万戏坊</InkButton>
          <InkButton variant="ghost" onClick={() => void copyExport('json')}>复制 JSON</InkButton>
          <InkButton variant="ghost" onClick={() => void copyExport('ts')}>复制 TS</InkButton>
          <InkButton variant="outline" onClick={downloadJson}>下载 JSON</InkButton>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
        <aside className="border-ink/15 bg-bgpaper shrink-0 overflow-y-auto border-b p-3 xl:w-[292px] xl:border-r xl:border-b-0">
          <div className="space-y-5">
            <section>
              <p className="text-ink text-sm font-semibold">建议工作流</p>
              <p className="text-ink-secondary mt-1 text-xs leading-5">
                不要先放 NPC。先禁止区 → 可站区 → Slot，最后才绑定人物。
              </p>
              <div className="mt-3 space-y-2">
                {(['inspect', 'blocked', 'safe', 'slot'] as const).map((item) => (
                  <ModeButton
                    key={item}
                    mode={item}
                    active={mode === item}
                    onClick={() => changeMode(item)}
                  />
                ))}
              </div>
              <p className="text-ink-secondary mt-2 text-[11px] leading-5">
                快捷键：0 查看 · 1 禁止区 · 2 可站区 · 3 Slot · Esc 取消
              </p>
            </section>

            <section className="border-ink/10 space-y-3 border-t pt-4">
              <div>
                <p className="text-ink text-sm font-semibold">当前地图位置</p>
                <p className="text-ink-secondary mt-1 text-xs leading-5">
                  所有新建区域和 Slot 都归属当前 Location。
                </p>
              </div>
              <InkSelect
                label="Region"
                value={selectedRegionId}
                onChange={(value) => setRegion(value as WanxiRegionId)}
              >
                {WANXI_REGIONS.map((region) => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </InkSelect>
              <InkSelect
                label="Location"
                value={selectedLocationId}
                onChange={setLocation}
              >
                {locationsForRegion.map((location) => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </InkSelect>
              <div className="flex flex-wrap gap-2">
                <InkButton variant="outline" onClick={focusCurrentLocation}>定位当前 Location</InkButton>
                <InkButton variant="ghost" onClick={fitMap}>适应窗口</InkButton>
              </div>
            </section>

            <section className="border-ink/10 space-y-3 border-t pt-4">
              <p className="text-ink text-sm font-semibold">图层显示</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-ink-secondary">
                <label className="inline-flex items-center gap-1.5">
                  <input type="checkbox" checked={showGrid} onChange={(event) => setShowGrid(event.target.checked)} />
                  网格
                </label>
                <label className="inline-flex items-center gap-1.5">
                  <input type="checkbox" checked={showLocations} onChange={(event) => setShowLocations(event.target.checked)} />
                  Location
                </label>
                <label className="inline-flex items-center gap-1.5">
                  <input type="checkbox" checked={showLegacyNpc} onChange={(event) => setShowLegacyNpc(event.target.checked)} />
                  旧 NPC
                </label>
                <label className="inline-flex items-center gap-1.5">
                  <input type="checkbox" checked={showZoneLabels} onChange={(event) => setShowZoneLabels(event.target.checked)} />
                  区域标签
                </label>
              </div>
              <InkSelect label="覆盖范围" value={overlayScope} onChange={(value) => setOverlayScope(value as OverlayScope)}>
                <option value="current">只显示当前 Location</option>
                <option value="all">显示全图草稿</option>
              </InkSelect>
              <InkSelect label="网格间距" value={String(gridSize)} onChange={(value) => setGridSize(Number(value))}>
                <option value="50">50 px</option>
                <option value="100">100 px</option>
                <option value="200">200 px</option>
              </InkSelect>
              <ZoneLegend />
            </section>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className={`border-b bg-bgpaper/92 px-3 py-2 ${modeMeta.borderClass}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className={`shrink-0 px-2 py-1 text-xs font-semibold ${modeMeta.badgeClass}`}>
                  当前模式 · {modeMeta.short}
                </span>
                <p className={`min-w-0 text-xs leading-5 ${modeMeta.toneClass}`}>
                  {modeMeta.action}
                  {mode === 'blocked' ? ` 当前类型：${BLOCKED_TYPE_LABELS[blockedType]}` : ''}
                </p>
              </div>
              <div className="text-ink-secondary flex items-center gap-2 text-xs">
                <button type="button" onClick={() => setZoom((value) => Math.max(0.2, Number((value - 0.1).toFixed(2))))} className="hover:text-ink">−</button>
                <span>{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => setZoom((value) => Math.min(1.5, Number((value + 0.1).toFixed(2))))} className="hover:text-ink">＋</button>
              </div>
            </div>
          </div>

          <div
            ref={mapViewportRef}
            className="min-h-0 flex-1 overflow-auto bg-[#d8d0c1] p-8"
          >
            <div
              ref={mapSurfaceRef}
              onClick={onMapClick}
              onDoubleClick={() => {
                if ((mode === 'safe' || mode === 'blocked') && pendingPolygon.length >= 3) finishZone();
              }}
              onContextMenu={(event) => {
                if (mode !== 'safe' && mode !== 'blocked') return;
                event.preventDefault();
                setPendingPolygon((current) => current.slice(0, -1));
              }}
              onMouseMove={onMapMove}
              onMouseLeave={() => setHoverPoint(null)}
              className={`relative isolate origin-top-left overflow-hidden shadow-[0_12px_40px_rgba(44,24,16,0.18)] ${mapCursorClass}`}
              style={{
                width: `${MAP_WIDTH * zoom}px`,
                height: `${MAP_HEIGHT * zoom}px`,
              }}
            >
              <img
                src={wanxiMapUrl}
                alt="万戏坊地图校准底图"
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full select-none"
              />

              <svg
                viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 z-10 h-full w-full"
                aria-hidden="true"
              >
                {showGrid ? (
                  <>
                    <defs>
                      <pattern id="wanxi-calibrator-grid-v2" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                        <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="rgba(47,41,35,0.14)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                      </pattern>
                    </defs>
                    <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#wanxi-calibrator-grid-v2)" />
                  </>
                ) : null}

                {visibleZones
                  .filter((zone) => zone.id !== editingZoneId)
                  .map((zone) => {
                    const visual = zoneVisual(zone);
                    return (
                      <polygon
                        key={zone.id}
                        points={zone.polygon.map((point) => `${point.x},${point.y}`).join(' ')}
                        fill={visual.fill}
                        stroke={visual.stroke}
                        strokeWidth="3"
                        vectorEffect="non-scaling-stroke"
                      />
                    );
                  })}

                {pendingPolygon.length ? (
                  <>
                    <polygon
                      points={pendingPreviewPoints.map((point) => `${point.x},${point.y}`).join(' ')}
                      fill={mode === 'safe' ? 'rgba(16,185,129,0.13)' : zoneVisual({ id: 'pending', kind: 'blocked', regionId: selectedRegionId, polygon: [], blockedType }).fill}
                      stroke={mode === 'safe' ? 'rgba(4,120,87,0.98)' : BLOCKED_TYPE_COLORS[blockedType].stroke}
                      strokeDasharray="12 8"
                      strokeWidth="4"
                      vectorEffect="non-scaling-stroke"
                    />
                    {pendingPolygon.map((point, index) => (
                      <g key={`${point.x}:${point.y}:${index}`}>
                        <circle cx={point.x} cy={point.y} r="13" fill="rgba(248,243,230,0.96)" stroke={mode === 'safe' ? 'rgba(4,120,87,1)' : BLOCKED_TYPE_COLORS[blockedType].stroke} strokeWidth="3" vectorEffect="non-scaling-stroke" />
                        <text x={point.x} y={point.y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={mode === 'safe' ? '#047857' : BLOCKED_TYPE_COLORS[blockedType].text}>{index + 1}</text>
                      </g>
                    ))}
                  </>
                ) : null}
              </svg>

              {showZoneLabels
                ? visibleZones
                    .filter((zone) => zone.id !== editingZoneId)
                    .map((zone) => {
                      const center = polygonCenter(zone.polygon);
                      if (!center) return null;
                      const visual = zoneVisual(zone);
                      return (
                        <div key={`label:${zone.id}`} className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2" style={cssPoint(center)}>
                          <div className="bg-bgpaper/92 border px-1.5 py-0.5 text-[10px] shadow-sm" style={{ borderColor: visual.stroke, color: visual.text }}>
                            {zone.kind === 'safe' ? 'SAFE' : BLOCKED_TYPE_LABELS[zone.blockedType ?? 'other']} · {zone.id}
                          </div>
                        </div>
                      );
                    })
                : null}

              {showLocations
                ? WANXI_LOCATION_PLACEMENTS.map((placement) => {
                    const point = wanxiPercentToPixel(placement.point, {
                      width: MAP_WIDTH,
                      height: MAP_HEIGHT,
                    });
                    const location = getWanxiLocation(placement.locationId);
                    const selected = placement.locationId === selectedLocationId;
                    return (
                      <div
                        key={placement.locationId}
                        className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
                        style={cssPoint(point)}
                      >
                        <div className={`${selected ? 'border-crimson bg-bgpaper text-crimson ring-2 ring-crimson/20' : 'border-ink/45 bg-bgpaper/80 text-ink'} border px-1.5 py-0.5 text-[10px] shadow-sm`}>
                          {location?.name ?? placement.locationId}
                        </div>
                      </div>
                    );
                  })
                : null}

              {showLegacyNpc
                ? WANXI_DEFAULT_NPC_PLACEMENTS.map((placement) => (
                    <NpcPreviewMarker
                      key={placement.npcId}
                      npcId={placement.npcId}
                      muted
                      point={wanxiPercentToPixel(placement.point, {
                        width: MAP_WIDTH,
                        height: MAP_HEIGHT,
                      })}
                    />
                  ))
                : null}

              {visibleSlots.map((slot) => {
                const selected = slot.id === slotId;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    title={`${slot.id} · ${slot.point.x},${slot.point.y}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      editSlot(slot);
                    }}
                    className="group absolute z-30 -translate-x-1/2 -translate-y-1/2"
                    style={cssPoint(slot.point)}
                  >
                    <span className={`${selected ? 'bg-crimson shadow-[0_0_0_4px_rgba(159,48,48,0.18)]' : 'bg-sky-600 shadow-[0_0_0_2px_rgba(3,105,161,0.35)]'} border-bgpaper block size-4 rounded-full border-2`} />
                    <span className={`${selected ? 'block' : 'hidden group-hover:block'} bg-bgpaper/95 text-ink pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 text-[10px] shadow-sm`}>
                      {slot.label || slot.id}
                    </span>
                  </button>
                );
              })}

              {cursor ? (
                <div className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-1/2" style={cssPoint(cursor)}>
                  <div className="relative size-10">
                    <span className={`${mode === 'slot' && cursorSafety?.level === 'error' ? 'bg-red-700' : mode === 'slot' && cursorSafety?.level === 'ok' ? 'bg-emerald-700' : 'bg-crimson'} absolute top-1/2 left-0 h-px w-full`} />
                    <span className={`${mode === 'slot' && cursorSafety?.level === 'error' ? 'bg-red-700' : mode === 'slot' && cursorSafety?.level === 'ok' ? 'bg-emerald-700' : 'bg-crimson'} absolute top-0 left-1/2 h-full w-px`} />
                    <span className={`${mode === 'slot' && cursorSafety?.level === 'error' ? 'border-red-700' : mode === 'slot' && cursorSafety?.level === 'ok' ? 'border-emerald-700' : 'border-crimson'} bg-bgpaper absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2`} />
                  </div>
                </div>
              ) : null}

              {mode === 'slot' && cursor && selectedNpcId ? (
                <NpcPreviewMarker
                  npcId={selectedNpcId}
                  point={cursor}
                  label={`${getWanxiNpcById(selectedNpcId)?.name ?? 'NPC'} · 预览`}
                />
              ) : null}
            </div>
          </div>

          <div className="border-ink/10 bg-bgpaper/95 flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 border-t px-3 py-2 text-xs">
            <span className="text-ink-secondary">鼠标：{pointLabel(hoverPoint)}</span>
            <span className="text-ink-secondary">选中：{pointLabel(cursor)}</span>
            <span className="text-ink">{status}</span>
          </div>
        </section>

        <aside className="border-ink/15 bg-bgpaper min-h-0 w-full shrink-0 overflow-y-auto border-t p-4 xl:w-[390px] xl:border-t-0 xl:border-l">
          <div className="space-y-5">
            <section className={`border p-3 ${modeMeta.borderClass} bg-paper/40`}>
              <p className={`text-sm font-semibold ${modeMeta.toneClass}`}>{modeMeta.title}</p>
              <p className="text-ink-secondary mt-1 text-xs leading-5">{modeMeta.description}</p>
              <p className="text-ink mt-2 text-xs leading-5">{modeMeta.action}</p>
            </section>

            {mode === 'inspect' ? (
              <section className="space-y-3">
                <p className="text-ink text-sm font-semibold">坐标检查</p>
                <div className="border-ink/10 bg-paper/50 border p-3 text-xs leading-6">
                  <p className="text-ink-secondary">最后点击</p>
                  <p className="text-ink font-mono">{pointLabel(cursor)}</p>
                  <p className="text-ink-secondary mt-2">当前 Location</p>
                  <p className="text-ink">{getWanxiLocation(selectedLocationId)?.name ?? selectedLocationId}</p>
                </div>
                <p className="text-ink-secondary text-xs leading-5">
                  查看模式绝不会新增 Slot 或区域。确认位置后再切到左侧对应工具。
                </p>
              </section>
            ) : null}

            {mode === 'slot' ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-ink text-sm font-semibold">站位槽 Slot</p>
                  <span className="text-ink-secondary text-xs">当前 Location：{currentLocationSlots.length}</span>
                </div>
                <InkSelect label="NPC真实标记预览" value={selectedNpcId} onChange={setSelectedNpcId}>
                  {WANXI_NPCS.map((npc) => (
                    <option key={npc.id} value={npc.id}>{npc.name} · {npc.identity}</option>
                  ))}
                </InkSelect>
                <InkInput label="Slot ID" value={slotId} placeholder={nextSlotId(selectedLocationId, draft.slots)} onChange={setSlotId} />
                <InkInput label="说明" value={slotLabel} placeholder="例如：水榭栏杆旁" onChange={setSlotLabel} />
                <InkInput label="Tags（逗号分隔）" value={slotTags} placeholder="standing, quiet, social" onChange={setSlotTags} />
                <div className="border-ink/10 border p-3 text-xs leading-5">
                  <p className="text-ink-secondary">当前脚点</p>
                  <p className="text-ink font-mono">{pointLabel(cursor)}</p>
                  {cursorSafety ? (
                    <p className={`mt-2 font-semibold ${cursorSafety.level === 'error' ? 'text-red-800' : cursorSafety.level === 'warning' ? 'text-amber-700' : 'text-emerald-800'}`}>
                      {cursorSafety.text}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <InkButton variant="primary" disabled={!cursor || cursorSafety?.level === 'error'} onClick={saveSlot}>保存 Slot</InkButton>
                  {slotId && draft.slots.some((slot) => slot.id === slotId) ? (
                    <InkButton variant="ghost" onClick={() => deleteSlot(slotId)}>删除当前 Slot</InkButton>
                  ) : null}
                </div>
                <InkButton variant="outline" onClick={importLegacyNpcPlacements}>导入旧 NPC 点位为待校准 Slot</InkButton>
                {currentLocationSlots.length ? (
                  <div className="space-y-1.5">
                    {currentLocationSlots.map((slot) => (
                      <div key={slot.id} className="border-ink/10 flex items-center justify-between gap-2 border-b py-1.5 text-xs">
                        <button type="button" onClick={() => editSlot(slot)} className="text-ink min-w-0 text-left hover:text-crimson">
                          <span className="block truncate">{slot.label || slot.id}</span>
                          <span className="text-ink-secondary">{slot.point.x}, {slot.point.y}</span>
                        </button>
                        <button type="button" onClick={() => deleteSlot(slot.id)} className="text-ink-secondary hover:text-crimson">删除</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-ink-secondary text-xs">当前 Location 还没有 Slot。</p>
                )}
              </section>
            ) : null}

            {mode === 'safe' || mode === 'blocked' ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-ink text-sm font-semibold">
                    {mode === 'safe' ? '可站区域' : '禁止区域'}
                  </p>
                  <span className="text-ink-secondary text-xs">已取 {pendingPolygon.length} 点</span>
                </div>
                {mode === 'blocked' ? (
                  <InkSelect label="禁止区类型" value={blockedType} onChange={(value) => setBlockedType(value as WanxiBlockedZoneType)}>
                    {(Object.keys(BLOCKED_TYPE_LABELS) as WanxiBlockedZoneType[]).map((type) => (
                      <option key={type} value={type}>{BLOCKED_TYPE_LABELS[type]}</option>
                    ))}
                  </InkSelect>
                ) : null}
                <InkInput
                  label="Zone ID"
                  value={zoneId}
                  placeholder={nextZoneId(mode, selectedLocationId, draft.zones)}
                  onChange={setZoneId}
                />
                <InkInput label="备注" value={zoneNote} placeholder={mode === 'safe' ? '例如：石桥与水榭平台' : '例如：主湖水面'} onChange={setZoneNote} />
                <div className="border-ink/10 bg-paper/45 border p-3 text-xs leading-5">
                  <p className="text-ink font-semibold">怎么画</p>
                  <p className="text-ink-secondary mt-1">沿边界连续单击。点错了可右键或 Ctrl+Z。最后双击或按 Enter 完成。</p>
                  {editingZoneId ? <p className="text-crimson mt-2">正在重绘：{editingZoneId}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <InkButton variant="primary" disabled={pendingPolygon.length < 3} onClick={finishZone}>完成区域</InkButton>
                  <InkButton variant="ghost" disabled={pendingPolygon.length === 0} onClick={() => setPendingPolygon((current) => current.slice(0, -1))}>撤销一点</InkButton>
                  <InkButton variant="ghost" disabled={pendingPolygon.length === 0 && !editingZoneId} onClick={cancelZoneDrawing}>取消</InkButton>
                </div>
                <div className="space-y-1.5">
                  {currentLocationZones
                    .filter((zone) => zone.kind === mode)
                    .map((zone) => (
                      <div key={zone.id} className="border-ink/10 flex items-start justify-between gap-2 border-b py-1.5 text-xs">
                        <button type="button" onClick={() => editZone(zone)} className="min-w-0 text-left hover:opacity-70">
                          <span className={zone.kind === 'safe' ? 'text-emerald-800' : 'text-red-800'}>{zone.id}</span>
                          <span className="text-ink-secondary block">{zone.polygon.length} 点{zone.blockedType ? ` · ${BLOCKED_TYPE_LABELS[zone.blockedType]}` : ''}</span>
                        </button>
                        <button type="button" onClick={() => deleteZone(zone.id)} className="text-ink-secondary hover:text-crimson">删除</button>
                      </div>
                    ))}
                </div>
              </section>
            ) : null}

            <section className="border-ink/10 space-y-3 border-t pt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-ink text-sm font-semibold">自动校验</p>
                <span className="text-xs">
                  <span className={errors.length ? 'text-crimson' : 'text-emerald-800'}>{errors.length} error</span>
                  <span className="text-ink-secondary"> · {warnings.length} warning</span>
                </span>
              </div>
              {issues.length === 0 ? (
                <p className="text-emerald-800 text-xs leading-5">当前草稿没有发现越界、落入禁区或槽位过近问题。</p>
              ) : (
                <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                  {issues.map((issue, index) => (
                    <button
                      key={`${issue.code}:${issue.entityId ?? index}`}
                      type="button"
                      onClick={() => {
                        if (!issue.entityId) return;
                        const slot = draft.slots.find((item) => item.id === issue.entityId);
                        if (slot) editSlot(slot);
                        const zone = draft.zones.find((item) => item.id === issue.entityId);
                        if (zone) editZone(zone);
                      }}
                      className={`block w-full border-l-2 pl-2 text-left text-xs leading-5 ${issue.level === 'error' ? 'border-crimson text-crimson' : 'border-amber-600 text-amber-800'}`}
                    >
                      <span className="font-semibold">{issue.code}</span>
                      <span className="block">{issue.message}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="border-ink/10 space-y-3 border-t pt-4">
              <p className="text-ink text-sm font-semibold">导入 / 备份</p>
              <textarea
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                rows={5}
                placeholder="粘贴此前导出的 wanxi-map-calibration-v1.json"
                className="border-ink/20 bg-paper text-ink w-full resize-y border px-2 py-2 font-mono text-xs leading-5 outline-none focus:border-crimson/50"
              />
              <div className="flex flex-wrap gap-2">
                <InkButton onClick={importJson}>导入 JSON</InkButton>
                <InkButton variant="ghost" onClick={resetDraft}>清空草稿</InkButton>
              </div>
              <p className="text-ink-secondary text-xs leading-5">
                V2 只改编辑体验，仍使用 V1 JSON 数据格式和 localStorage 键，旧草稿不会丢失。
              </p>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
