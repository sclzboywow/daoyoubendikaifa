import { BattlePageLayout } from '@app/components/feature/battle/BattlePageLayout';
import { BattlePlaybackPanel } from '@app/components/feature/battle/v3/BattlePlaybackPanel';
import { useBattlePlaybackState } from '@app/components/feature/battle/v3/useBattlePlaybackState';
import { CombatResultDialog } from '@app/components/feature/battle/v5/CombatResultDialog';
import { GameImmersiveLoading } from '@app/components/game-shell';
import { InkButton } from '@app/components/ui/InkButton';
import { consumeResourceMutation } from '@app/lib/resources/mutations';
import type { WanxiLampStoryBattleResponse } from '@shared/contracts/wanxiStory';
import type { WanxiStoryBattleTuning } from '@shared/engine/wanxi';
import type { BattleRecordV3 } from '@shared/types/battle';
import { Suspense, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

type WanxiLampBattleData = WanxiLampStoryBattleResponse['data'];

const battleRequests = new Map<string, Promise<WanxiLampBattleData>>();

function startWanxiLampBattleOnce() {
  const key = 'wanxi.story.lamp.battle';
  const current = battleRequests.get(key);
  if (current) return current;
  const request = fetch('/api/wanxi/story/lamp/battle', { method: 'POST' })
    .then((response) => consumeResourceMutation<WanxiLampBattleData>(response))
    .finally(() => {
      battleRequests.delete(key);
    });
  battleRequests.set(key, request);
  return request;
}

function WanxiLampBattleContent() {
  const navigate = useNavigate();
  const [battleResult, setBattleResult] = useState<BattleRecordV3>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [isWin, setIsWin] = useState(false);
  const [battleTuning, setBattleTuning] = useState<WanxiStoryBattleTuning>();
  const playback = useBattlePlaybackState(battleResult);

  useEffect(() => {
    let cancelled = false;

    void startWanxiLampBattleOnce()
      .then((data) => {
        if (cancelled) return;
        setBattleResult(data.battleResult);
        setIsWin(data.isWin);
        setBattleTuning(data.battleTuning);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(
          reason instanceof Error ? reason.message : '旧契索命战无法开始',
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-20">
        <div className="border-battle-rule-strong bg-[rgba(248,243,230,0.92)] max-w-md border border-dashed px-5 py-5 text-center">
          <p className="mb-4 text-crimson">{error}</p>
          <div className="flex justify-center gap-2">
            <InkButton onClick={() => navigate('/game/wanxi?npc=mechanist')}>
              返回闲趣西院
            </InkButton>
            <InkButton variant="ghost" onClick={() => navigate('/game/inn')}>
              去灵眼之泉
            </InkButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BattlePageLayout
      title="旧契索命"
      subtitle="契未终，债未清。祁望川牵制旧契，你替他把这笔账真正打完。"
      variant="immersive-battle"
      loading={loading}
      battleResult={battleResult}
    >
      <BattlePlaybackPanel battleResult={battleResult} playback={playback} />
      <CombatResultDialog
        key={`wanxi-lamp-${battleResult?.outcome.turns}-${battleResult?.outcome.winner.id ?? 'unknown'}`}
        dialogKey={`wanxi-lamp-${battleResult?.outcome.turns}-${battleResult?.outcome.winner.id ?? 'unknown'}`}
        open={!!battleResult && playback.isPlaybackFinished}
        title={isWin ? '旧契已断' : '旧契未散'}
        confirmLabel={isWin ? '去百戏台找林照晚' : '回闲趣西院'}
        cancelLabel="去灵眼之泉疗伤"
        onConfirm={() =>
          navigate(
            isWin
              ? '/game/wanxi?npc=stage_musician'
              : '/game/wanxi?npc=mechanist',
          )
        }
        onCancel={() => navigate('/game/inn')}
        content={
          <div className="space-y-2 leading-8">
            <p>
              {isWin
                ? '索契灵终于散去。焦黑契纸从暗光里落下，祁望川掌心还攥着半枚磨得发亮的木扣。'
                : '索契灵仍在旧契中盘旋。先稳住伤势，再回来结这笔旧账。'}
            </p>
            {isWin ? (
              <div className="text-ink-secondary space-y-1 text-sm">
                <p>这份真相能解释当年，却不能替任何人决定是否原谅。</p>
                {battleTuning?.newcomerProtection ? (
                  <p>祁望川的「护灯」替你压住了大半残契之力。这一战本就不是要考验新修士的装备。</p>
                ) : null}
              </div>
            ) : battleTuning ? (
              <div className="text-ink-secondary space-y-1 text-sm">
                <p>旧契已经在这一战中出现新的裂痕。</p>
                {battleTuning.newcomerProtection ? (
                  <p>祁望川会继续以「护灯」牵制契纹，新号不会被这场剧情战永久卡住。</p>
                ) : null}
                <p>
                  下次挑战将进入「{battleTuning.nextAssistLabel}」，索契灵会进一步衰弱。
                </p>
                <p>先去灵眼之泉稳住伤势，再回来即可。</p>
              </div>
            ) : null}
          </div>
        }
      />
    </BattlePageLayout>
  );
}

export default function WanxiLampBattlePage() {
  return (
    <Suspense fallback={<GameImmersiveLoading message="旧契正在显形……" />}>
      <WanxiLampBattleContent />
    </Suspense>
  );
}
