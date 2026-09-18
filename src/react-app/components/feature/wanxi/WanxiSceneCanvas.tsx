import wanxiMapUrl from '@app/assets/wanxi/wanxi-map-v1.png';
import {
  getWanxiLocation,
  getWanxiNpcById,
  WANXI_MAIN_SCENE,
  type WanxiLocationRuntimeState,
  type WanxiMarkerImportance,
  type WanxiSceneLabelDefinition,
  type WanxiNpcPlacement,
  type WanxiPoint,
} from '@shared/engine/wanxi';
import { cn } from '@shared/lib/cn';
import {
  memo,
  useMemo,
  useState,
  type MouseEvent,
} from 'react';
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch';

const { width: MAP_WIDTH, height: MAP_HEIGHT } = WANXI_MAIN_SCENE.logicalSize;

export interface WanxiSceneCanvasProps {
  npcPlacements: readonly WanxiNpcPlacement[];
  locationStates: readonly WanxiLocationRuntimeState[];
  selectedNpcId?: string | null;
  selectedLocationId?: string | null;
  onNpcSelect(npcId: string): void;
  onLocationSelect(locationId: string): void;
}

function initialTransform(focus?: WanxiPoint | null) {
  if (typeof window === 'undefined') {
    return { scale: 0.65, x: -700, y: -430 };
  }

  const target = focus ?? { x: 50, y: 53 };
  const scale = window.innerWidth < 768 ? 0.72 : 0.65;
  return {
    scale,
    x: window.innerWidth * 0.5 - (MAP_WIDTH * target.x * scale) / 100,
    y: window.innerHeight * 0.48 - (MAP_HEIGHT * target.y * scale) / 100,
  };
}

function markerUiScale(mapScale: number) {
  return Math.min(1.45, Math.max(0.35, 1 / Math.max(mapScale, 0.01)));
}

function markerSizeClass(importance: WanxiMarkerImportance) {
  if (importance === 'major') return 'size-5';
  if (importance === 'minor') return 'size-3.5';
  return 'size-4';
}

function markerOpacityClass(importance: WanxiMarkerImportance) {
  if (importance === 'major') return 'opacity-95';
  if (importance === 'minor') return 'opacity-65';
  return 'opacity-80';
}


function sceneLabelClass(kind: WanxiSceneLabelDefinition['kind']) {
  if (kind === 'building') {
    return 'font-heading text-[32px] tracking-[0.22em] text-ink/58';
  }
  if (kind === 'street') {
    return 'font-heading text-[21px] tracking-[0.4em] text-ink/32';
  }
  if (kind === 'detail') {
    return 'text-[18px] tracking-[0.2em] text-ink/40';
  }
  return 'font-heading text-[27px] tracking-[0.28em] text-ink/44';
}

function SceneLabel({
  label,
  mapScale,
}: {
  label: WanxiSceneLabelDefinition;
  mapScale: number;
}) {
  if (mapScale < (label.minScale ?? 0)) return null;
  if (label.maxScale !== undefined && mapScale > label.maxScale) return null;

  const vertical = label.direction === 'vertical';
  const rotation = label.rotation ?? 0;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute z-[5] select-none whitespace-nowrap drop-shadow-[0_1px_0_rgba(248,243,230,0.9)]',
        sceneLabelClass(label.kind),
      )}
      style={{
        left: `${label.point.x}%`,
        top: `${label.point.y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        writingMode: vertical ? 'vertical-rl' : undefined,
      }}
    >
      {label.text}
    </span>
  );
}

interface LocationMarkerProps {
  locationId: string;
  x: number;
  y: number;
  selected: boolean;
  disabled: boolean;
  attention: boolean;
  badge?: string;
  importance: WanxiMarkerImportance;
  uiScale: number;
  onSelect(id: string): void;
}

const LocationMarker = memo(function LocationMarker({
  locationId,
  x,
  y,
  selected,
  disabled,
  attention,
  badge,
  importance,
  uiScale,
  onSelect,
}: LocationMarkerProps) {
  const location = getWanxiLocation(locationId);
  if (!location) return null;

  return (
    <button
      type="button"
      aria-label={`查看${location.name}`}
      disabled={disabled}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onSelect(locationId);
      }}
      className={cn(
        'group absolute z-10 -translate-x-1/2 -translate-y-1/2',
        attention && 'z-30',
        disabled && 'cursor-not-allowed opacity-40',
      )}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span
        className="relative block transition-transform duration-150 group-hover:scale-110 group-focus-visible:scale-110"
        style={{ transform: `scale(${uiScale})` }}
      >
        <span
          aria-hidden="true"
          className={cn(
            'border-ink/35 bg-bgpaper/72 relative flex items-center justify-center rounded-full border shadow-[0_2px_8px_rgba(44,24,16,0.12)] backdrop-blur-[1px] transition-colors',
            markerSizeClass(importance),
            markerOpacityClass(importance),
            selected &&
              'border-crimson bg-bgpaper text-crimson opacity-100 ring-2 ring-crimson/20',
            !selected &&
              'group-hover:border-crimson/55 group-hover:bg-bgpaper/90 group-hover:opacity-100',
          )}
        >
          <span
            className={cn(
              'bg-ink/65 block size-1.5 rounded-full transition-colors',
              selected && 'bg-crimson',
            )}
          />
          {attention ? (
            <span className="bg-crimson border-bgpaper absolute -top-1 -right-1 size-2.5 rounded-full border" />
          ) : null}
        </span>

        {badge ? (
          <span className="border-crimson/30 bg-bgpaper/95 text-crimson pointer-events-none absolute -top-2 left-full ml-1 whitespace-nowrap border px-1.5 py-0.5 text-[9px] leading-none shadow-sm">
            {badge}
          </span>
        ) : null}

        <span
          className={cn(
            'border-ink/15 bg-bgpaper/94 text-ink pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap border px-2 py-1 text-[11px] shadow-sm backdrop-blur-sm transition-all duration-150',
            selected
              ? 'translate-y-0 opacity-100'
              : 'translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100',
          )}
        >
          {location.name}
        </span>
      </span>
    </button>
  );
});

interface NpcMarkerProps {
  placement: WanxiNpcPlacement;
  selected: boolean;
  mapScale: number;
  uiScale: number;
  onSelect(id: string): void;
}

const NpcMarker = memo(function NpcMarker({
  placement,
  selected,
  mapScale,
  uiScale,
  onSelect,
}: NpcMarkerProps) {
  const npc = getWanxiNpcById(placement.npcId);
  if (!npc) return null;

  const importance = placement.marker?.importance ?? 'normal';
  const attention = Boolean(placement.attention);
  const showName = selected || attention || mapScale >= 0.58;
  const showIdentity = selected || mapScale >= 1.3;

  return (
    <button
      type="button"
      aria-label={`与${npc.name}交谈`}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onSelect(npc.id);
      }}
      className="group absolute z-20 -translate-x-1/2 -translate-y-full"
      style={{ left: `${placement.point.x}%`, top: `${placement.point.y}%` }}
    >
      <span
        className="relative block origin-bottom transition-transform duration-150 group-hover:scale-105 group-focus-visible:scale-105"
        style={{ transform: `scale(${uiScale})` }}
      >
        <span
          className={cn(
            'font-heading border-ink/25 bg-bgpaper/88 text-ink relative flex items-center justify-center rounded-full border shadow-[0_5px_14px_rgba(44,24,16,0.14)] backdrop-blur-sm transition-all',
            importance === 'major' ? 'size-9 text-base' : 'size-8 text-sm',
            selected
              ? 'border-crimson bg-bgpaper text-crimson ring-3 ring-crimson/15'
              : attention
                ? 'border-crimson/70 bg-bgpaper text-crimson ring-3 ring-crimson/10'
                : 'group-hover:border-crimson/55 group-hover:bg-bgpaper/95 group-hover:text-crimson',
          )}
        >
          {npc.sigil}
          <span
            className={cn(
              'border-bgpaper absolute right-0 bottom-0 size-2 rounded-full border',
              attention ? 'bg-crimson' : 'bg-ink/65',
            )}
          />
          {attention ? (
            <span className="border-bgpaper bg-crimson text-bgpaper absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full border text-[10px] font-bold leading-none shadow-sm">
              !
            </span>
          ) : null}
        </span>

        <span
          className={cn(
            'pointer-events-none absolute top-full left-1/2 mt-1.5 -translate-x-1/2 whitespace-nowrap text-[12px] leading-none transition-all duration-150',
            selected || attention ? 'text-crimson' : 'text-ink/90',
            showName
              ? 'translate-y-0 opacity-100'
              : 'translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100',
          )}
          style={{
            textShadow:
              '0 1px 2px rgba(248,243,230,0.98), 0 0 5px rgba(248,243,230,0.95)',
          }}
        >
          <span className="font-medium">{npc.name}</span>
          <span
            className={cn(
              'text-ink-secondary ml-1 text-[10px] font-normal',
              showIdentity
                ? 'inline'
                : 'hidden group-hover:inline group-focus-visible:inline',
            )}
          >
            · {npc.identity}
          </span>
        </span>
      </span>
    </button>
  );
});

export function WanxiSceneCanvas({
  npcPlacements,
  locationStates,
  selectedNpcId,
  selectedLocationId,
  onNpcSelect,
  onLocationSelect,
}: WanxiSceneCanvasProps) {
  const locationStateById = useMemo(
    () => new Map(locationStates.map((state) => [state.locationId, state])),
    [locationStates],
  );
  const occupiedLocationIds = useMemo(
    () =>
      new Set(
        npcPlacements.flatMap((placement) =>
          placement.locationId ? [placement.locationId] : [],
        ),
      ),
    [npcPlacements],
  );

  const selectedPlacement = selectedNpcId
    ? npcPlacements.find((placement) => placement.npcId === selectedNpcId)
    : undefined;
  const selectedLocationPlacement = selectedLocationId
    ? WANXI_MAIN_SCENE.locationPlacements.find(
        (placement) => placement.locationId === selectedLocationId,
      )
    : undefined;
  const focusPoint = selectedPlacement?.point ?? selectedLocationPlacement?.point;
  const transform = initialTransform(focusPoint);
  const transformKey = selectedNpcId ?? selectedLocationId ?? 'default';
  const [mapScale, setMapScale] = useState(transform.scale);
  const [scaleKey, setScaleKey] = useState(transformKey);
  if (scaleKey !== transformKey) {
    setScaleKey(transformKey);
    setMapScale(transform.scale);
  }

  const uiScale = markerUiScale(mapScale);

  return (
    <div className="relative h-full w-full cursor-grab overflow-hidden active:cursor-grabbing">
      <TransformWrapper
        key={transformKey}
        initialScale={transform.scale}
        minScale={0.42}
        maxScale={3.5}
        limitToBounds={false}
        initialPositionX={transform.x}
        initialPositionY={transform.y}
        onTransform={(
          _ref: ReactZoomPanPinchRef,
          state: { scale: number; positionX: number; positionY: number },
        ) => setMapScale(state.scale)}
      >
        <TransformComponent
          wrapperClass="w-full h-full"
          contentClass="w-full h-full"
        >
          <div
            className="relative isolate overflow-hidden bg-[#e8e0cf]"
            style={{ width: `${MAP_WIDTH}px`, height: `${MAP_HEIGHT}px` }}
          >
            <img
              src={wanxiMapUrl}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(248,243,230,0.025),rgba(248,243,230,0.08))]" />

            {WANXI_MAIN_SCENE.labels.map((label) => (
              <SceneLabel key={label.id} label={label} mapScale={mapScale} />
            ))}

            {WANXI_MAIN_SCENE.locationPlacements.map((placement) => {
              const runtime = locationStateById.get(placement.locationId);
              if (runtime?.state === 'hidden') return null;

              const selected = selectedLocationId === placement.locationId;
              const marker = placement.marker;
              const minScale = marker?.minScale ?? 0.72;
              const hiddenByNpc =
                Boolean(marker?.hideWhenOccupied) &&
                occupiedLocationIds.has(placement.locationId);
              const shouldRender =
                selected ||
                runtime?.state === 'attention' ||
                (!hiddenByNpc && mapScale >= minScale);
              if (!shouldRender) return null;

              return (
                <LocationMarker
                  key={placement.locationId}
                  locationId={placement.locationId}
                  x={placement.point.x}
                  y={placement.point.y}
                  selected={selected}
                  disabled={runtime?.state === 'disabled'}
                  attention={runtime?.state === 'attention'}
                  badge={runtime?.badge}
                  importance={marker?.importance ?? 'normal'}
                  uiScale={uiScale}
                  onSelect={onLocationSelect}
                />
              );
            })}

            {npcPlacements.map((placement) => {
              const selected = selectedNpcId === placement.npcId;
              const minScale = placement.marker?.minScale ?? 0.55;
              if (!selected && !placement.attention && mapScale < minScale) return null;

              return (
                <NpcMarker
                  key={`${placement.npcId}:${placement.point.x}:${placement.point.y}`}
                  placement={placement}
                  selected={selected}
                  mapScale={mapScale}
                  uiScale={uiScale}
                  onSelect={onNpcSelect}
                />
              );
            })}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
