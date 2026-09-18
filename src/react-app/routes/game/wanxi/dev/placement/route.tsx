import { WanxiPlacementCalibrator } from '@app/components/feature/wanxi/dev/WanxiPlacementCalibrator';
import { InkButton } from '@app/components/ui/InkButton';

export default function WanxiPlacementCalibratorPage() {
  if (!import.meta.env.DEV) {
    return (
      <div className="bg-paper flex h-full items-center justify-center p-6">
        <div className="border-ink/20 bg-bgpaper max-w-md border border-dashed p-6 text-center">
          <p className="text-ink">地图定位校准器只在开发模式开放。</p>
          <p className="text-ink-secondary mt-2 text-sm leading-6">
            请在本地运行 bun run dev 后访问 /game/wanxi/dev/placement。
          </p>
          <InkButton className="mt-4" href="/game/wanxi">返回万戏坊</InkButton>
        </div>
      </div>
    );
  }

  return <WanxiPlacementCalibrator />;
}
