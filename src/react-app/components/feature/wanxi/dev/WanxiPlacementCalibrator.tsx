import { WANXI_SINGLE_MAP_URL } from '../wanxiMapAssets';
import { InkButton } from '@app/components/ui/InkButton';
import { InkInput } from '@app/components/ui/InkInput';
import { InkSelect } from '@app/components/ui/InkSelect';
import {
  fetchWanxiMapEditorState,
  resetWanxiMapEditorState,
  saveWanxiMapEditorState,
} from '@app/components/feature/wanxi/wanxiMapEditorApi';
import {
  WANXI_LOCATION_PLACEMENTS,
  WANXI_LOCATIONS,
  WANXI_MAIN_SCENE,
  WANXI_NPCS,
  WANXI_REGIONS,
  getWanxiLocation,
  getWanxiNpcById,
  isWanxiCoreNpcRoleKey,
  isWanxiLegacyNpcRoleKey,
} from '@shared/engine/wanxi';
import {
  assessWanxiPlacementSafety,
  validateWanxiMapCalibration,
  wanxiPercentToPixel,
  wanxiPixelToPercent,
  type WanxiBlockedZoneType,
  type WanxiCalibrationNpcPlacement,
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

const MAP_WIDTH = WANXI_MAIN_SCENE.logicalSize.width;
const MAP_HEIGHT = WANXI_MAIN_SCENE.logicalSize.height;

type EditorMode = 'npc' | 'blocked' | 'safe' | 'inspect';
type DrawShape = 'freehand' | 'rectangle';

interface DraggingNpc {
  npcId: string;
  point: WanxiPixelPoint | null;
  original: WanxiCalibrationNpcPlacement;
}

interface DrawingZone {
  kind: 'safe' | 'blocked';
  shape: DrawShape;
  start: WanxiPixelPoint;
  points: WanxiPixelPoint[];
}

const BLOCKED_TYPE_LABELS: Record<WanxiBlockedZoneType, string> = {
  water: '水面',
  building: '建筑 / 屋顶',
  vegetation: '植物 / 密竹',
  decoration: '装饰物 / 桌椅',
  other: '其他禁站区',
};

const BLOCKED_TYPE_COLORS: Record<
  WanxiBlockedZoneType,
  { fill: string; stroke: string }
> = {
  water: { fill: 'rgba(59,130,246,0.20)', stroke: '#1d4ed8' },
  building: { fill: 'rgba(249,115,22,0.20)', stroke: '#c2410c' },
  vegetation: { fill: 'rgba(132,204,22,0.20)', stroke: '#4d7c0f' },
  decoration: { fill: 'rgba(168,85,247,0.20)', stroke: '#7e22ce' },
  other: { fill: 'rgba(239,68,68,0.20)', stroke: '#991b1b' },
};

function cloneDraft(draft: WanxiMapCalibrationDraft) {
  return {
    ...draft,
    slots: draft.slots.map((item) => ({
      ...item,
      point: { ...item.point },
      tags: item.tags ? [...item.tags] : undefined,
    })),
    zones: draft.zones.map((item) => ({
      ...item,
      polygon: item.polygon.map((point) => ({ ...point })),
    })),
    npcPlacements: draft.npcPlacements.map((item) => ({
      ...item,
      point: { ...item.point },
    })),
  };
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
  return `${point.x}, ${point.y}px · ${percent.x.toFixed(3)}%, ${percent.y.toFixed(3)}%`;
}

function polygonPath(points: readonly WanxiPixelPoint[]) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

function nextZoneId(
  kind: 'safe' | 'blocked',
  locationId: string,
  zones: readonly WanxiCalibrationZone[],
) {
  const prefix = `${kind}.${locationId}.`;
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

function pointFromClient(
  clientX: number,
  clientY: number,
  surface: HTMLDivElement,
): WanxiPixelPoint | null {
  const rect = surface.getBoundingClientRect();
  if (
    clientX < rect.left ||
    clientX > rect.right ||
    clientY < rect.top ||
    clientY > rect.bottom
  ) {
    return null;
  }
  return {
    x: Math.round(((clientX - rect.left) / rect.width) * MAP_WIDTH),
    y: Math.round(((clientY - rect.top) / rect.height) * MAP_HEIGHT),
  };
}

function rectanglePoints(
  start: WanxiPixelPoint,
  end: WanxiPixelPoint,
): WanxiPixelPoint[] {
  return [
    start,
    { x: end.x, y: start.y },
    end,
    { x: start.x, y: end.y },
  ];
}

function inferLocation(point: WanxiPixelPoint) {
  let best:
    | {
        locationId: string;
        regionId: WanxiRegionId;
        distance: number;
      }
    | undefined;

  for (const placement of WANXI_LOCATION_PLACEMENTS) {
    const pixel = wanxiPercentToPixel(placement.point, {
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
    });
    const location = getWanxiLocation(placement.locationId);
    if (!location) continue;
    const distance = Math.hypot(point.x - pixel.x, point.y - pixel.y);
    if (!best || distance < best.distance) {
      best = {
        locationId: location.id,
        regionId: location.regionId,
        distance,
      };
    }
  }

  return best ?? {
    locationId: 'central_square',
    regionId: 'square' as const,
    distance: 0,
  };
}

function zoneVisual(zone: WanxiCalibrationZone) {
  if (zone.kind === 'safe') {
    return { fill: 'rgba(16,185,129,0.18)', stroke: '#047857' };
  }
  return BLOCKED_TYPE_COLORS[zone.blockedType ?? 'other'];
}

function NpcMarker(props: {
  placement: WanxiCalibrationNpcPlacement;
  selected: boolean;
  showNames: boolean;
  issueCodes: readonly string[];
  onMouseDown(event: ReactMouseEvent<HTMLButtonElement>): void;
  onClick(): void;
}) {
  const npc = getWanxiNpcById(props.placement.npcId);
  if (!npc) return null;

  const blocked = props.issueCodes.includes('NPC_INSIDE_BLOCKED_ZONE');
  const crowded = props.issueCodes.includes('NPCS_TOO_CLOSE');

  return (
    <button
      type="button"
      onClick={props.onClick}
      onMouseDown={props.onMouseDown}
      className="group absolute z-40 -translate-x-1/2 -translate-y-full"
      style={cssPoint(props.placement.point)}
      title={`${npc.name} · ${pointLabel(props.placement.point)}`}
    >
      <span className="relative flex flex-col items-center">
        <span
          className={`font-heading flex size-10 items-center justify-center rounded-full border shadow-[0_4px_14px_rgba(44,24,16,0.18)] ${
            blocked
              ? 'border-red-700 bg-red-700 text-white'
              : crowded
                ? 'border-amber-700 bg-amber-50 text-amber-900'
                : props.placement.runtimeVisible
                  ? 'border-crimson/45 bg-bgpaper text-crimson'
                  : 'border-ink/30 bg-bgpaper text-ink'
          } ${props.selected ? 'ring-4 ring-crimson/20' : ''}`}
        >
          {npc.sigil}
          {props.placement.locked ? (
            <span className="border-bgpaper bg-ink text-bgpaper absolute -top-1 -right-1 rounded px-1 text-[8px]">
              锁
            </span>
          ) : null}
        </span>
        {props.showNames ? (
          <span
            className={`mt-1 whitespace-nowrap border px-1.5 py-0.5 text-[11px] shadow-sm ${
              blocked
                ? 'border-red-700/30 bg-red-50 text-red-900'
                : crowded
                  ? 'border-amber-700/30 bg-amber-50 text-amber-900'
                  : 'border-ink/15 bg-bgpaper/95 text-ink'
            }`}
          >
            {npc.name}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function WanxiPlacementCalibrator() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef<WanxiMapCalibrationDraft[]>([]);
  const redoRef = useRef<WanxiMapCalibrationDraft[]>([]);
  const saveTimerRef = useRef<number | null>(null);
  const savingRef = useRef(false);
  const pendingSaveRef = useRef<WanxiMapCalibrationDraft | null>(null);

  const [draft, setDraft] = useState<WanxiMapCalibrationDraft | null>(null);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const [mode, setMode] = useState<EditorMode>('npc');
  const [drawShape, setDrawShape] = useState<DrawShape>('freehand');
  const [blockedType, setBlockedType] =
    useState<WanxiBlockedZoneType>('water');
  const [zoom, setZoom] = useState(0.55);
  const [showGrid, setShowGrid] = useState(false);
  const [showLocations, setShowLocations] = useState(true);
  const [showNames, setShowNames] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [selectedNpcId, setSelectedNpcId] = useState('');
  const [search, setSearch] = useState('');
  const [cursorPoint, setCursorPoint] = useState<WanxiPixelPoint | null>(null);
  const [draggingNpc, setDraggingNpc] = useState<DraggingNpc | null>(null);
  const [drawingZone, setDrawingZone] = useState<DrawingZone | null>(null);
  const [status, setStatus] = useState('正在读取数据库中的地图配置……');

  useEffect(() => {
    let cancelled = false;
    void fetchWanxiMapEditorState()
      .then((snapshot) => {
        if (cancelled) return;
        setDraft(snapshot.state);
        setRevision(snapshot.revision);
        setLastSavedAt(snapshot.updatedAt);
        setSelectedNpcId(snapshot.state.npcPlacements[0]?.npcId ?? '');
        setStatus(
          `已从数据库载入 ${snapshot.state.npcPlacements.length} 个 NPC。直接拖动人物即可。`,
        );
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(
          error instanceof Error ? error.message : '地图配置读取失败',
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const issues = useMemo(
    () => (draft ? validateWanxiMapCalibration(draft) : []),
    [draft],
  );

  const issueCodesByNpc = useMemo(() => {
    const result = new Map<string, string[]>();
    if (!draft) return result;

    for (const placement of draft.npcPlacements) {
      result.set(placement.npcId, []);
    }
    for (const issue of issues) {
      if (!issue.entityId) continue;
      const ids = issue.entityId.split(',');
      for (const id of ids) {
        if (!result.has(id)) continue;
        result.get(id)?.push(issue.code);
      }
    }
    return result;
  }, [draft, issues]);

  const selectedPlacement = useMemo(
    () =>
      draft?.npcPlacements.find(
        (placement) => placement.npcId === selectedNpcId,
      ) ?? null,
    [draft, selectedNpcId],
  );

  const selectedNpc = selectedPlacement
    ? getWanxiNpcById(selectedPlacement.npcId)
    : null;

  const selectedSafety =
    draft && selectedPlacement
      ? assessWanxiPlacementSafety(
          selectedPlacement.point,
          selectedPlacement.regionId,
          selectedPlacement.locationId,
          draft.zones,
        )
      : null;

  const filteredNpcs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!draft) return [];
    return WANXI_NPCS.filter((npc) => {
      if (!term) return true;
      return (
        npc.name.includes(term) ||
        npc.identity.includes(term) ||
        npc.roleKey.toLowerCase().includes(term)
      );
    });
  }, [draft, search]);

  async function persist(nextDraft: WanxiMapCalibrationDraft) {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    pendingSaveRef.current = cloneDraft(nextDraft);
    setDirty(true);

    if (savingRef.current) return;

    savingRef.current = true;
    setSaving(true);
    try {
      let latestRevision = revision;
      let latestUpdatedAt = lastSavedAt;
      while (pendingSaveRef.current) {
        const target = pendingSaveRef.current;
        pendingSaveRef.current = null;
        const snapshot = await saveWanxiMapEditorState(target);
        latestRevision = snapshot.revision;
        latestUpdatedAt = snapshot.updatedAt;
        setRevision(snapshot.revision);
        setLastSavedAt(snapshot.updatedAt);
      }
      setDirty(false);
      setStatus(
        `已保存到数据库 · revision ${latestRevision}。正式万戏坊运行时会读取这份坐标。`,
      );
      if (latestUpdatedAt) setLastSavedAt(latestUpdatedAt);
    } catch (error) {
      pendingSaveRef.current = null;
      setDirty(true);
      setStatus(
        error instanceof Error ? `保存失败：${error.message}` : '保存失败',
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  function scheduleSave(nextDraft: WanxiMapCalibrationDraft) {
    setDirty(true);
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      void persist(nextDraft);
    }, 700);
  }

  function commit(
    updater:
      | WanxiMapCalibrationDraft
      | ((current: WanxiMapCalibrationDraft) => WanxiMapCalibrationDraft),
    message?: string,
  ) {
    setDraft((current) => {
      if (!current) return current;
      const next =
        typeof updater === 'function' ? updater(current) : updater;
      historyRef.current.push(cloneDraft(current));
      if (historyRef.current.length > 80) historyRef.current.shift();
      redoRef.current = [];
      scheduleSave(next);
      return next;
    });
    if (message) setStatus(message);
  }

  function undo() {
    if (!draft || historyRef.current.length === 0) return;
    const previous = historyRef.current.pop();
    if (!previous) return;
    redoRef.current.push(cloneDraft(draft));
    setDraft(previous);
    scheduleSave(previous);
    setStatus('已撤销上一步。');
  }

  function redo() {
    if (!draft || redoRef.current.length === 0) return;
    const next = redoRef.current.pop();
    if (!next) return;
    historyRef.current.push(cloneDraft(draft));
    setDraft(next);
    scheduleSave(next);
    setStatus('已恢复一步。');
  }

  function fitMap() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const next = Math.min(
      (viewport.clientWidth - 40) / MAP_WIDTH,
      (viewport.clientHeight - 40) / MAP_HEIGHT,
      1.2,
    );
    setZoom(Math.max(0.25, Number(next.toFixed(2))));
    requestAnimationFrame(() =>
      viewport.scrollTo({ left: 0, top: 0 }),
    );
  }

  function centerPoint(point: WanxiPixelPoint) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({
      left: Math.max(0, point.x * zoom - viewport.clientWidth / 2),
      top: Math.max(0, point.y * zoom - viewport.clientHeight / 2),
      behavior: 'smooth',
    });
  }

  function beginNpcDrag(
    placement: WanxiCalibrationNpcPlacement,
    event?: ReactMouseEvent,
  ) {
    if (placement.locked) {
      setStatus('该 NPC 已锁定，请先解锁。');
      return;
    }
    event?.preventDefault();
    event?.stopPropagation();
    setMode('npc');
    setSelectedNpcId(placement.npcId);
    setDraggingNpc({
      npcId: placement.npcId,
      point: placement.point,
      original: placement,
    });
    setStatus('拖动人物到目标位置，松开鼠标会自动保存到数据库。');
  }

  function updateSelectedPlacement(
    patch: Partial<WanxiCalibrationNpcPlacement>,
  ) {
    if (!draft || !selectedPlacement) return;
    commit(
      {
        ...draft,
        npcPlacements: draft.npcPlacements.map((item) =>
          item.npcId === selectedPlacement.npcId
            ? { ...item, ...patch }
            : item,
        ),
      },
      '人物属性已修改，正在保存……',
    );
  }

  function onMapMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    const surface = surfaceRef.current;
    if (!surface) return;
    const point = pointFromClient(event.clientX, event.clientY, surface);
    if (!point) return;
    setCursorPoint(point);

    if (mode === 'inspect') {
      setStatus(`坐标：${pointLabel(point)}`);
      return;
    }

    if (mode === 'blocked' || mode === 'safe') {
      event.preventDefault();
      setDrawingZone({
        kind: mode,
        shape: drawShape,
        start: point,
        points: [point],
      });
      setStatus(
        drawShape === 'rectangle'
          ? '拖出矩形，松手保存。'
          : '按住鼠标沿边界描一圈，松手保存。',
      );
    }
  }

  useEffect(() => {
    function onMouseMove(event: MouseEvent) {
      const surface = surfaceRef.current;
      if (!surface) return;
      const point = pointFromClient(event.clientX, event.clientY, surface);
      if (point) setCursorPoint(point);

      if (draggingNpc) {
        setDraggingNpc((current) =>
          current ? { ...current, point } : current,
        );
      }

      if (drawingZone && point) {
        setDrawingZone((current) => {
          if (!current) return current;
          if (current.shape === 'rectangle') {
            return {
              ...current,
              points: rectanglePoints(current.start, point),
            };
          }
          const last = current.points[current.points.length - 1];
          if (!last) return current;
          if (Math.hypot(point.x - last.x, point.y - last.y) < 12) {
            return current;
          }
          return { ...current, points: [...current.points, point] };
        });
      }
    }

    function onMouseUp() {
      if (draggingNpc && draft) {
        const point = draggingNpc.point;
        if (point) {
          const inferred = inferLocation(point);
          const next: WanxiCalibrationNpcPlacement = {
            ...draggingNpc.original,
            point,
            regionId: inferred.regionId,
            locationId: inferred.locationId,
          };
          commit(
            {
              ...draft,
              npcPlacements: draft.npcPlacements.map((item) =>
                item.npcId === next.npcId ? next : item,
              ),
            },
            `${getWanxiNpcById(next.npcId)?.name ?? next.npcId} 已移动到 ${getWanxiLocation(inferred.locationId)?.name ?? inferred.locationId}，正在保存……`,
          );
        }
        setDraggingNpc(null);
      }

      if (drawingZone && draft) {
        const points = drawingZone.points;
        if (points.length >= 3) {
          const center =
            points.reduce(
              (sum, point) => ({
                x: sum.x + point.x,
                y: sum.y + point.y,
              }),
              { x: 0, y: 0 },
            );
          const middle = {
            x: center.x / points.length,
            y: center.y / points.length,
          };
          const inferred = inferLocation(middle);
          const zone: WanxiCalibrationZone = {
            id: nextZoneId(
              drawingZone.kind,
              inferred.locationId,
              draft.zones,
            ),
            kind: drawingZone.kind,
            regionId: inferred.regionId,
            locationId: inferred.locationId,
            polygon: points,
            ...(drawingZone.kind === 'blocked'
              ? { blockedType }
              : {}),
          };
          commit(
            {
              ...draft,
              zones: [...draft.zones, zone],
            },
            `已新增${zone.kind === 'safe' ? '可站区' : '禁止区'}，正在保存……`,
          );
        } else {
          setStatus('区域过小，已取消。');
        }
        setDrawingZone(null);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const editing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT';

      if (event.key === 'Escape') {
        setDraggingNpc(null);
        setDrawingZone(null);
        setStatus('已取消当前操作。');
        return;
      }
      if (editing) return;

      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        redo();
        return;
      }
      if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
        return;
      }
      if (event.ctrlKey && event.key.toLowerCase() === 's' && draft) {
        event.preventDefault();
        void persist(draft);
        return;
      }

      if (event.key === '1') setMode('npc');
      if (event.key === '2') setMode('blocked');
      if (event.key === '3') setMode('safe');
      if (event.key === '0') setMode('inspect');
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [
    blockedType,
    draft,
    draggingNpc,
    drawingZone,
    drawShape,
  ]);

  async function resetToDefault() {
    if (savingRef.current) {
      setStatus('当前仍在保存，请等保存完成后再恢复默认位置。');
      return;
    }
    if (!window.confirm('确定恢复全部 NPC 的初始摆放并清空区域标记吗？')) {
      return;
    }
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    pendingSaveRef.current = null;
    setSaving(true);
    try {
      const snapshot = await resetWanxiMapEditorState();
      historyRef.current = [];
      redoRef.current = [];
      setDraft(snapshot.state);
      setRevision(snapshot.revision);
      setLastSavedAt(snapshot.updatedAt);
      setDirty(false);
      setSelectedNpcId(snapshot.state.npcPlacements[0]?.npcId ?? '');
      setStatus('已恢复默认地图配置，并保存到数据库。');
    } catch (error) {
      setStatus(
        error instanceof Error ? `恢复失败：${error.message}` : '恢复失败',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-paper flex h-full items-center justify-center">
        <p className="text-ink-secondary">正在读取万戏坊地图配置……</p>
      </div>
    );
  }

  if (loadError || !draft) {
    return (
      <div className="bg-paper flex h-full items-center justify-center p-6">
        <div className="border-ink/20 bg-bgpaper max-w-lg border p-5 text-center">
          <p className="text-crimson font-semibold">地图编辑器无法读取数据库</p>
          <p className="text-ink-secondary mt-2 text-sm leading-6">
            {loadError ?? '未知错误'}
          </p>
          <p className="text-ink-secondary mt-2 text-xs">
            请确认已执行数据库迁移，并且当前账号具有管理员权限；开发模式可直接使用。
          </p>
        </div>
      </div>
    );
  }

  const drawingPath = drawingZone ? polygonPath(drawingZone.points) : '';
  const errorCount = issues.filter((issue) => issue.level === 'error').length;
  const warningCount = issues.filter(
    (issue) => issue.level === 'warning',
  ).length;

  return (
    <div className="bg-paper flex h-full min-h-0 flex-col overflow-hidden">
      <header className="border-ink/15 bg-bgpaper/95 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-dashed px-3 py-2 md:px-4">
        <div>
          <p className="text-ink text-sm font-semibold tracking-[0.08em]">
            万戏坊地图编辑器
          </p>
          <p className="text-ink-secondary mt-0.5 text-xs">
            全部 NPC 已默认载入 · 拖动即定位 · 自动保存数据库 · 正式场景读取保存结果
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs ${
              saving
                ? 'text-amber-700'
                : dirty
                  ? 'text-crimson'
                  : 'text-emerald-800'
            }`}
          >
            {saving
              ? '保存中…'
              : dirty
                ? '有未保存改动'
                : `已保存 · r${revision}`}
          </span>
          <InkButton variant="primary" disabled={saving} onClick={() => void persist(draft)}>
            立即保存
          </InkButton>
          <InkButton variant="ghost" disabled={!historyRef.current.length} onClick={undo}>
            撤销
          </InkButton>
          <InkButton variant="ghost" disabled={!redoRef.current.length} onClick={redo}>
            重做
          </InkButton>
          <InkButton href="/game/wanxi">查看正式万戏坊</InkButton>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="border-ink/15 bg-bgpaper hidden w-[300px] shrink-0 overflow-y-auto border-r p-3 lg:block">
          <div className="space-y-4">
            <section>
              <p className="text-ink text-sm font-semibold">操作模式</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  ['npc', '1 · 拖 NPC'],
                  ['blocked', '2 · 禁止区'],
                  ['safe', '3 · 可站区'],
                  ['inspect', '0 · 看坐标'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMode(value as EditorMode)}
                    className={`border px-2 py-2 text-xs ${
                      mode === value
                        ? 'border-crimson bg-bgpaper text-crimson'
                        : 'border-ink/10 bg-paper/45 text-ink'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-ink-secondary mt-2 text-[11px] leading-5">
                默认就是拖 NPC。Safe Zone 不是必做项；水面、屋顶等禁止区用于校验。
              </p>
            </section>

            {mode === 'blocked' || mode === 'safe' ? (
              <section className="border-ink/10 space-y-3 border-t pt-4">
                <InkSelect
                  label="绘制方式"
                  value={drawShape}
                  onChange={(value) => setDrawShape(value as DrawShape)}
                >
                  <option value="freehand">按住拖动自由描边</option>
                  <option value="rectangle">按住拖出矩形</option>
                </InkSelect>
                {mode === 'blocked' ? (
                  <InkSelect
                    label="禁止区类型"
                    value={blockedType}
                    onChange={(value) =>
                      setBlockedType(value as WanxiBlockedZoneType)
                    }
                  >
                    {(Object.keys(
                      BLOCKED_TYPE_LABELS,
                    ) as WanxiBlockedZoneType[]).map((type) => (
                      <option key={type} value={type}>
                        {BLOCKED_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </InkSelect>
                ) : null}
              </section>
            ) : null}

            <section className="border-ink/10 border-t pt-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-ink text-sm font-semibold">
                  全部 NPC
                </p>
                <span className="text-ink-secondary text-xs">
                  {draft.npcPlacements.length} 人
                </span>
              </div>
              <div className="mt-2">
                <InkInput
                  value={search}
                  placeholder="搜索姓名 / 身份 / roleKey"
                  onChange={setSearch}
                />
              </div>
              <div className="mt-3 space-y-1.5">
                {filteredNpcs.map((npc) => {
                  const placement = draft.npcPlacements.find(
                    (item) => item.npcId === npc.id,
                  );
                  if (!placement) return null;
                  const selected = selectedNpcId === npc.id;
                  return (
                    <button
                      key={npc.id}
                      type="button"
                      onClick={() => {
                        setSelectedNpcId(npc.id);
                        centerPoint(placement.point);
                      }}
                      onMouseDown={(event) =>
                        beginNpcDrag(placement, event)
                      }
                      className={`w-full border px-2 py-2 text-left ${
                        selected
                          ? 'border-crimson bg-bgpaper'
                          : 'border-ink/10 bg-paper/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-ink truncate text-xs font-semibold">
                            {npc.name} · {npc.identity}
                          </p>
                          <p className="text-ink-secondary mt-0.5 truncate text-[10px]">
                            {getWanxiLocation(placement.locationId ?? '')?.name ??
                              placement.locationId ??
                              placement.regionId}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 px-1 py-0.5 text-[9px] ${
                            isWanxiLegacyNpcRoleKey(npc.roleKey)
                              ? 'bg-amber-100 text-amber-800'
                              : placement.runtimeVisible
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-paper text-ink-secondary'
                          }`}
                        >
                          {isWanxiLegacyNpcRoleKey(npc.roleKey)
                            ? '历史'
                            : placement.runtimeVisible
                              ? '场景显示'
                              : '已记录'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </aside>

        <section className="flex min-h-0 flex-1 flex-col">
          <div className="border-ink/10 bg-bgpaper/90 flex shrink-0 flex-wrap items-center gap-3 border-b px-3 py-2 text-xs">
            <span className="text-ink font-semibold">
              当前：
              {mode === 'npc'
                ? '拖动 NPC'
                : mode === 'blocked'
                  ? `绘制禁止区 · ${BLOCKED_TYPE_LABELS[blockedType]}`
                  : mode === 'safe'
                    ? '绘制可站区'
                    : '查看坐标'}
            </span>
            <span className="text-ink-secondary">
              鼠标 {pointLabel(cursorPoint)}
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={showNames}
                  onChange={(event) => setShowNames(event.target.checked)}
                />
                NPC 名称
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={showLocations}
                  onChange={(event) =>
                    setShowLocations(event.target.checked)
                  }
                />
                地点
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={showZones}
                  onChange={(event) => setShowZones(event.target.checked)}
                />
                区域
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(event) => setShowGrid(event.target.checked)}
                />
                网格
              </label>
              <InkButton variant="ghost" onClick={fitMap}>
                适应窗口
              </InkButton>
            </div>
          </div>

          <div
            ref={viewportRef}
            className="min-h-0 flex-1 overflow-auto bg-paper p-4"
          >
            <div
              ref={surfaceRef}
              onMouseDown={onMapMouseDown}
              className={`relative mx-auto overflow-hidden border border-ink/10 bg-bgpaper shadow ${
                mode === 'npc' ? 'cursor-default' : 'cursor-crosshair'
              }`}
              style={{
                width: MAP_WIDTH * zoom,
                height: MAP_HEIGHT * zoom,
                backgroundImage: `url(${WANXI_SINGLE_MAP_URL})`,
                backgroundSize: '100% 100%',
              }}
            >
              {showGrid ? (
                <div
                  className="pointer-events-none absolute inset-0 opacity-50"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(44,24,16,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(44,24,16,0.10) 1px, transparent 1px)',
                    backgroundSize: `${100 * zoom}px ${100 * zoom}px`,
                  }}
                />
              ) : null}

              {showZones ? (
                <svg
                  viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                  className="pointer-events-none absolute inset-0 h-full w-full"
                >
                  {draft.zones.map((zone) => {
                    const style = zoneVisual(zone);
                    return (
                      <path
                        key={zone.id}
                        d={`${polygonPath(zone.polygon)} Z`}
                        fill={style.fill}
                        stroke={style.stroke}
                        strokeWidth={4}
                      />
                    );
                  })}
                  {drawingZone?.points.length ? (
                    <path
                      d={`${polygonPath(drawingZone.points)} ${
                        drawingZone.shape === 'rectangle' ? 'Z' : ''
                      }`}
                      fill={
                        drawingZone.shape === 'rectangle'
                          ? drawingZone.kind === 'safe'
                            ? 'rgba(16,185,129,0.12)'
                            : BLOCKED_TYPE_COLORS[blockedType].fill
                          : 'none'
                      }
                      stroke={
                        drawingZone.kind === 'safe'
                          ? '#047857'
                          : BLOCKED_TYPE_COLORS[blockedType].stroke
                      }
                      strokeWidth={5}
                      strokeDasharray="10 8"
                    />
                  ) : null}
                </svg>
              ) : null}

              {showLocations
                ? WANXI_LOCATION_PLACEMENTS.map((placement) => {
                    const point = wanxiPercentToPixel(
                      placement.point,
                      WANXI_MAIN_SCENE.logicalSize,
                    );
                    return (
                      <div
                        key={placement.locationId}
                        className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
                        style={cssPoint(point)}
                      >
                        <span className="border-ink/30 bg-bgpaper/80 text-ink border px-1.5 py-0.5 text-[10px] shadow-sm">
                          {getWanxiLocation(placement.locationId)?.name ??
                            placement.locationId}
                        </span>
                      </div>
                    );
                  })
                : null}

              {draft.npcPlacements.map((placement) => (
                <NpcMarker
                  key={placement.npcId}
                  placement={placement}
                  selected={placement.npcId === selectedNpcId}
                  showNames={showNames}
                  issueCodes={
                    issueCodesByNpc.get(placement.npcId) ?? []
                  }
                  onClick={() => setSelectedNpcId(placement.npcId)}
                  onMouseDown={(event) =>
                    beginNpcDrag(placement, event)
                  }
                />
              ))}

              {draggingNpc?.point ? (
                <div
                  className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full opacity-75"
                  style={cssPoint(draggingNpc.point)}
                >
                  <span className="font-heading border-crimson bg-bgpaper text-crimson flex size-10 items-center justify-center rounded-full border-2">
                    {getWanxiNpcById(draggingNpc.npcId)?.sigil ?? '?'}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="border-ink/10 bg-bgpaper/95 flex shrink-0 flex-wrap items-center gap-4 border-t px-3 py-2 text-xs">
            <span className="text-ink">{status}</span>
            <span className="text-ink-secondary ml-auto">
              错误 {errorCount} · 警告 {warningCount}
              {lastSavedAt
                ? ` · ${new Date(lastSavedAt).toLocaleTimeString()}`
                : ''}
            </span>
          </div>
        </section>

        <aside className="border-ink/15 bg-bgpaper hidden w-[390px] shrink-0 overflow-y-auto border-l p-4 xl:block">
          <div className="space-y-5">
            {selectedPlacement && selectedNpc ? (
              <section className="border-ink/10 border p-3">
                <p className="text-ink text-sm font-semibold">
                  {selectedNpc.name} · {selectedNpc.identity}
                </p>
                <p className="text-ink-secondary mt-1 text-xs">
                  {selectedNpc.roleKey}
                </p>

                <div className="mt-3 border-ink/10 border p-3 text-xs leading-6">
                  <p className="text-ink-secondary">脚下坐标</p>
                  <p className="text-ink font-mono">
                    {pointLabel(selectedPlacement.point)}
                  </p>
                  <p className="text-ink-secondary mt-2">安全检查</p>
                  <p
                    className={`font-semibold ${
                      selectedSafety?.level === 'error'
                        ? 'text-red-800'
                        : selectedSafety?.level === 'warning'
                          ? 'text-amber-800'
                          : 'text-emerald-800'
                    }`}
                  >
                    {selectedSafety?.message ?? '—'}
                  </p>
                </div>

                <div className="mt-3 space-y-3">
                  <InkSelect
                    label="Region"
                    value={selectedPlacement.regionId}
                    onChange={(value) => {
                      const regionId = value as WanxiRegionId;
                      const firstLocation = WANXI_LOCATIONS.find(
                        (location) => location.regionId === regionId,
                      );
                      updateSelectedPlacement({
                        regionId,
                        locationId: firstLocation?.id,
                      });
                    }}
                  >
                    {WANXI_REGIONS.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </InkSelect>

                  <InkSelect
                    label="Location"
                    value={selectedPlacement.locationId ?? ''}
                    onChange={(value) => {
                      const location = getWanxiLocation(value);
                      if (!location) return;
                      updateSelectedPlacement({
                        locationId: location.id,
                        regionId: location.regionId,
                      });
                    }}
                  >
                    {WANXI_LOCATIONS.filter(
                      (location) =>
                        location.regionId === selectedPlacement.regionId,
                    ).map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </InkSelect>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPlacement.runtimeVisible}
                      disabled={
                        selectedNpc
                          ? isWanxiCoreNpcRoleKey(selectedNpc.roleKey)
                          : false
                      }
                      onChange={(event) =>
                        updateSelectedPlacement({
                          runtimeVisible: event.target.checked,
                        })
                      }
                    />
                    <span>
                      <span className="text-ink font-semibold">
                        {selectedNpc &&
                        isWanxiCoreNpcRoleKey(selectedNpc.roleKey)
                          ? '由出勤系统控制'
                          : '正式场景显示'}
                      </span>
                      <span className="text-ink-secondary block">
                        {selectedNpc &&
                        isWanxiCoreNpcRoleKey(selectedNpc.roleKey)
                          ? '正式20人不再靠这个开关常驻；地图编辑器只负责保存本位坐标，实际出现时间由万戏坊出勤调度决定。'
                          : '历史/试水角色仍可用此开关作为普通场景基线显隐。'}
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPlacement.locked}
                      onChange={(event) =>
                        updateSelectedPlacement({
                          locked: event.target.checked,
                        })
                      }
                    />
                    <span>
                      <span className="text-ink font-semibold">锁定位置</span>
                      <span className="text-ink-secondary block">
                        防止误拖；不影响正式场景显示。
                      </span>
                    </span>
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <InkButton
                    variant="outline"
                    onClick={() => centerPoint(selectedPlacement.point)}
                  >
                    定位人物
                  </InkButton>
                  <InkButton
                    variant="ghost"
                    onClick={() =>
                      beginNpcDrag(selectedPlacement)
                    }
                  >
                    拖动人物
                  </InkButton>
                </div>
              </section>
            ) : null}

            <section className="border-ink/10 border p-3">
              <div className="flex items-center justify-between">
                <p className="text-ink text-sm font-semibold">
                  禁止区 / 可站区
                </p>
                <span className="text-ink-secondary text-xs">
                  {draft.zones.length}
                </span>
              </div>
              <p className="text-ink-secondary mt-1 text-xs leading-5">
                不是必须先画。直接摆 NPC 即可；区域主要用于发现水面、屋顶等错误。
              </p>
              <div className="mt-3 max-h-64 space-y-1 overflow-auto">
                {draft.zones.length ? (
                  [...draft.zones].reverse().map((zone) => (
                    <div
                      key={zone.id}
                      className="border-ink/10 flex items-center justify-between gap-2 border-b py-1.5 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="text-ink truncate">{zone.id}</p>
                        <p className="text-ink-secondary">
                          {zone.kind === 'safe'
                            ? '可站区'
                            : BLOCKED_TYPE_LABELS[
                                zone.blockedType ?? 'other'
                              ]}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-ink-secondary hover:text-crimson"
                        onClick={() =>
                          commit({
                            ...draft,
                            zones: draft.zones.filter(
                              (item) => item.id !== zone.id,
                            ),
                          })
                        }
                      >
                        删除
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-ink-secondary text-xs">
                    目前没有区域标记。
                  </p>
                )}
              </div>
            </section>

            <section className="border-ink/10 border p-3">
              <p className="text-ink text-sm font-semibold">校验</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="border-ink/10 border p-2">
                  <p className="text-ink-secondary">错误</p>
                  <p className="mt-1 text-lg font-semibold text-red-800">
                    {errorCount}
                  </p>
                </div>
                <div className="border-ink/10 border p-2">
                  <p className="text-ink-secondary">警告</p>
                  <p className="mt-1 text-lg font-semibold text-amber-800">
                    {warningCount}
                  </p>
                </div>
              </div>
              <div className="mt-3 max-h-52 space-y-1 overflow-auto text-xs">
                {issues.slice(0, 30).map((issue, index) => (
                  <div
                    key={`${issue.code}-${index}`}
                    className={
                      issue.level === 'error'
                        ? 'border-l-2 border-red-700 bg-red-50 px-2 py-1 text-red-900'
                        : 'border-l-2 border-amber-600 bg-amber-50 px-2 py-1 text-amber-900'
                    }
                  >
                    {issue.message}
                  </div>
                ))}
              </div>
            </section>

            <section className="border-ink/10 border p-3">
              <p className="text-ink text-sm font-semibold">维护</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <InkButton
                  variant="ghost"
                  disabled={saving}
                  onClick={() => void resetToDefault()}
                >
                  恢复全部默认位置
                </InkButton>
              </div>
              <p className="text-ink-secondary mt-2 text-[11px] leading-5">
                Ctrl+S 立即保存 · Ctrl+Z 撤销 · Ctrl+Shift+Z 重做 · Esc 取消拖动/绘制
              </p>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
