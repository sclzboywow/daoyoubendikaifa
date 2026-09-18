import wanxiFallbackMapUrl from '@app/assets/wanxi/wanxi-map-v1.png';

const generatedSingleMapModules = import.meta.glob(
  '/src/react-app/assets/wanxi/generated/wanxi-map-v1.webp',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>;

const generatedPreviewMapModules = import.meta.glob(
  '/src/react-app/assets/wanxi/generated/wanxi-map-preview.webp',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>;

const generatedTileModules = import.meta.glob(
  '/src/react-app/assets/wanxi/generated/tiles/lod-*/*.webp',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>;

const firstUrl = (modules: Record<string, string>) =>
  Object.values(modules)[0] ?? null;

export const WANXI_SINGLE_MAP_URL =
  firstUrl(generatedSingleMapModules) ?? wanxiFallbackMapUrl;

export const WANXI_PREVIEW_MAP_URL =
  firstUrl(generatedPreviewMapModules) ?? WANXI_SINGLE_MAP_URL;

export const WANXI_MAP_MIN_SCALE = 0.42;
export const WANXI_MAP_TILE_SIZE = 512;

export interface WanxiMapTileAsset {
  col: number;
  row: number;
  url: string;
}

export interface WanxiMapTileLevel {
  ratio: number;
  tiles: readonly WanxiMapTileAsset[];
}

const TILE_PATH_RE = /\/lod-(\d+)\/(\d+)_(\d+)\.webp$/;

const levelMap = new Map<number, WanxiMapTileAsset[]>();

for (const [path, url] of Object.entries(generatedTileModules)) {
  const match = path.match(TILE_PATH_RE);
  if (!match) continue;

  const ratio = Number(match[1]) / 100;
  const col = Number(match[2]);
  const row = Number(match[3]);
  if (!Number.isFinite(ratio) || !Number.isFinite(col) || !Number.isFinite(row)) {
    continue;
  }

  const tiles = levelMap.get(ratio) ?? [];
  tiles.push({ col, row, url });
  levelMap.set(ratio, tiles);
}

export const WANXI_MAP_TILE_LEVELS: readonly WanxiMapTileLevel[] = [
  ...levelMap.entries(),
]
  .map(([ratio, tiles]) => ({
    ratio,
    tiles: tiles.sort((left, right) =>
      left.row === right.row ? left.col - right.col : left.row - right.row,
    ),
  }))
  .sort((left, right) => left.ratio - right.ratio);

const highestGeneratedRatio =
  WANXI_MAP_TILE_LEVELS[WANXI_MAP_TILE_LEVELS.length - 1]?.ratio ?? 1;

// Protect the 1x source from excessive interpolation. A true 2x LOD unlocks
// a slightly wider zoom range without changing scene coordinates.
export const WANXI_MAP_MAX_SCALE = highestGeneratedRatio >= 2 ? 2.2 : 1.85;
