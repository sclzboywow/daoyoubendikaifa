import { WANXI_MAIN_SCENE } from '@shared/engine/wanxi';
import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  WANXI_MAP_TILE_LEVELS,
  WANXI_MAP_TILE_SIZE,
  WANXI_PREVIEW_MAP_URL,
  WANXI_SINGLE_MAP_URL,
  type WanxiMapTileAsset,
  type WanxiMapTileLevel,
} from './wanxiMapAssets';

const { width: MAP_WIDTH, height: MAP_HEIGHT } = WANXI_MAIN_SCENE.logicalSize;
const TILE_OVERSCAN_MARGIN = '800px';

export { WANXI_MAP_MAX_SCALE, WANXI_MAP_MIN_SCALE } from './wanxiMapAssets';

function effectiveDevicePixelRatio() {
  if (typeof window === 'undefined') return 1;
  return Math.min(Math.max(window.devicePixelRatio || 1, 1), 1.5);
}

function pickTileLevel(mapScale: number): WanxiMapTileLevel | null {
  if (!WANXI_MAP_TILE_LEVELS.length) return null;

  const targetRatio = Math.max(0.25, mapScale * effectiveDevicePixelRatio());
  let best = WANXI_MAP_TILE_LEVELS[0];
  let bestDistance = Math.abs(Math.log(best.ratio / targetRatio));

  for (const level of WANXI_MAP_TILE_LEVELS.slice(1)) {
    const distance = Math.abs(Math.log(level.ratio / targetRatio));
    if (distance < bestDistance) {
      best = level;
      bestDistance = distance;
    }
  }

  return best;
}

function DeferredTile({
  tile,
  style,
}: {
  tile: WanxiMapTileAsset;
  style: CSSProperties;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [shouldLoad, setShouldLoad] = useState(
    typeof IntersectionObserver === 'undefined',
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { root: null, rootMargin: TILE_OVERSCAN_MARGIN },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <img
      ref={ref}
      src={shouldLoad ? tile.url : undefined}
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      className="pointer-events-none absolute select-none"
      style={style}
    />
  );
}

export const WanxiMapBackground = memo(function WanxiMapBackground({
  mapScale,
}: {
  mapScale: number;
}) {
  const level = useMemo(() => pickTileLevel(mapScale), [mapScale]);

  if (!level) {
    return (
      <img
        src={WANXI_SINGLE_MAP_URL}
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
      />
    );
  }

  const logicalTileSize = WANXI_MAP_TILE_SIZE / level.ratio;

  return (
    <>
      <img
        src={WANXI_PREVIEW_MAP_URL}
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        data-wanxi-map-lod={level.ratio}
      >
        {level.tiles.map((tile) => {
          const left = tile.col * logicalTileSize;
          const top = tile.row * logicalTileSize;
          const width = Math.min(logicalTileSize, MAP_WIDTH - left);
          const height = Math.min(logicalTileSize, MAP_HEIGHT - top);
          if (width <= 0 || height <= 0) return null;

          return (
            <DeferredTile
              key={`${level.ratio}:${tile.col}:${tile.row}`}
              tile={tile}
              style={{
                left,
                top,
                width: width + 0.5,
                height: height + 0.5,
              }}
            />
          );
        })}
      </div>
    </>
  );
});
