# 万戏坊地图 WebP / Tile LOD

## 当前策略

- 逻辑坐标固定为 `3056 × 2143`，NPC、地点、剧情坐标不变。
- 原 `wanxi-map-v1.png` 保留为制作源与未生成资源时的兼容回退。
- 若 1x 源图尺寸不是 `3056 × 2143`，生成脚本会按逻辑尺寸缩放后再切瓦片（本仓库当前源图为 `1497 × 1051`）。
- 运行时优先加载生成后的 WebP。
- 默认生成 `0.5x` 与 `1x` 两级 512px WebP 瓦片。
- 当前只有 1x 真源时最大缩放限制为 `1.85x`；检测到真正 2x LOD 后自动放宽到 `2.2x`。
- 瓦片通过 `IntersectionObserver` 延迟设置 `src`，只让视口附近瓦片进入网络/解码路径。
- LOD 根据 `mapScale × devicePixelRatio` 自动选择。

## 第一次生成

```bash
python -m pip install pillow
python scripts/build-wanxi-map-assets.py
```

生成目录：

```text
src/react-app/assets/wanxi/generated/
├── wanxi-map-v1.webp
├── wanxi-map-preview.webp
├── manifest.json
└── tiles/
    ├── lod-050/
    └── lod-100/
```

生成完成后重启 Vite 开发服务器，因为 `import.meta.glob` 在启动/构建时扫描文件。

## 将来增加真正 2x 高清源图

准备与现有地图完全同构、尺寸严格为 `6112 × 4286` 的高清原图，然后执行：

```bash
python scripts/build-wanxi-map-assets.py --source-2x /path/to/wanxi-map-v1@2x.png
```

会新增：

```text
src/react-app/assets/wanxi/generated/tiles/lod-200/
```

前端无需修改，重启开发服务器后会自动发现 `2x` LOD。

不要把现有 1x 图直接普通插值到 2x 后作为 `--source-2x`；那只会增加体积和显存占用，不会增加真实细节。
