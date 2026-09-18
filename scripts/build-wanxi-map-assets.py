#!/usr/bin/env python3
"""Generate WebP + tiled LOD assets for the Wanxi scene.

The source PNG remains the authoring/fallback asset. Runtime code automatically
prefers generated WebP assets when they exist.
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
from pathlib import Path

try:
    from PIL import Image
except ImportError as exc:
    raise SystemExit(
        "Pillow is required. Install it with: python -m pip install pillow"
    ) from exc

LOGICAL_WIDTH = 3056
LOGICAL_HEIGHT = 2143
TILE_SIZE = 512
DEFAULT_QUALITY = 92

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "src/react-app/assets/wanxi/wanxi-map-v1.png"
OUTPUT_DIR = ROOT / "src/react-app/assets/wanxi/generated"


def ratio_code(ratio: float) -> str:
    return f"{round(ratio * 100):03d}"


def validate_source(image: Image.Image, ratio: float, path: Path) -> None:
    expected = (round(LOGICAL_WIDTH * ratio), round(LOGICAL_HEIGHT * ratio))
    if image.size != expected:
        raise SystemExit(
            f"{path} has size {image.size[0]}x{image.size[1]}, expected "
            f"{expected[0]}x{expected[1]} for {ratio:g}x source."
        )


def save_webp(image: Image.Image, path: Path, quality: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "WEBP", quality=quality, method=6)


def build_tiles(image: Image.Image, ratio: float, quality: int) -> dict[str, object]:
    level_dir = OUTPUT_DIR / "tiles" / f"lod-{ratio_code(ratio)}"
    level_dir.mkdir(parents=True, exist_ok=True)

    cols = math.ceil(image.width / TILE_SIZE)
    rows = math.ceil(image.height / TILE_SIZE)

    for row in range(rows):
        for col in range(cols):
            left = col * TILE_SIZE
            top = row * TILE_SIZE
            right = min(left + TILE_SIZE, image.width)
            bottom = min(top + TILE_SIZE, image.height)
            tile = image.crop((left, top, right, bottom))
            save_webp(tile, level_dir / f"{col}_{row}.webp", quality)

    return {
        "ratio": ratio,
        "rasterWidth": image.width,
        "rasterHeight": image.height,
        "tileSize": TILE_SIZE,
        "cols": cols,
        "rows": rows,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-1x", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument(
        "--source-2x",
        type=Path,
        default=None,
        help="Optional true 2x source (6112x4286). Do not pass an AI/browser upscaled 1x image.",
    )
    parser.add_argument("--quality", type=int, default=DEFAULT_QUALITY)
    parser.add_argument(
        "--keep",
        action="store_true",
        help="Do not remove previously generated assets before rebuilding.",
    )
    args = parser.parse_args()

    if not 1 <= args.quality <= 100:
        raise SystemExit("--quality must be between 1 and 100")

    source_1x = args.source_1x.resolve()
    if not source_1x.exists():
        raise SystemExit(f"1x source not found: {source_1x}")

    if OUTPUT_DIR.exists() and not args.keep:
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    levels: list[dict[str, object]] = []

    with Image.open(source_1x) as opened:
        source = opened.convert("RGB")
    expected_1x = (LOGICAL_WIDTH, LOGICAL_HEIGHT)
    if source.size != expected_1x:
        print(
            f"Warning: {source_1x} is {source.size[0]}x{source.size[1]}, "
            f"resizing to {expected_1x[0]}x{expected_1x[1]} to match logical 1x."
        )
        source = source.resize(expected_1x, Image.Resampling.LANCZOS)
    else:
        validate_source(source, 1.0, source_1x)

    save_webp(source, OUTPUT_DIR / "wanxi-map-v1.webp", args.quality)

    preview = source.resize(
        (round(LOGICAL_WIDTH * 0.5), round(LOGICAL_HEIGHT * 0.5)),
        Image.Resampling.LANCZOS,
    )
    save_webp(preview, OUTPUT_DIR / "wanxi-map-preview.webp", args.quality)

    levels.append(build_tiles(preview, 0.5, args.quality))
    levels.append(build_tiles(source, 1.0, args.quality))

    if args.source_2x is not None:
        source_2x_path = args.source_2x.resolve()
        if not source_2x_path.exists():
            raise SystemExit(f"2x source not found: {source_2x_path}")
        with Image.open(source_2x_path) as opened:
            source_2x = opened.convert("RGB")
        validate_source(source_2x, 2.0, source_2x_path)
        levels.append(build_tiles(source_2x, 2.0, args.quality))

    manifest = {
        "logicalSize": {"width": LOGICAL_WIDTH, "height": LOGICAL_HEIGHT},
        "quality": args.quality,
        "levels": levels,
        "notes": [
            "Runtime discovers generated tiles with Vite import.meta.glob.",
            "Restart the Vite dev server after adding or removing LOD files.",
            "2x LOD is generated only from a true 6112x4286 source.",
        ],
    }
    (OUTPUT_DIR / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Generated Wanxi map assets in: {OUTPUT_DIR}")
    for level in levels:
        print(
            f"  LOD {level['ratio']}x: {level['rasterWidth']}x{level['rasterHeight']} "
            f"({level['cols']}x{level['rows']} tiles)"
        )


if __name__ == "__main__":
    main()
