import { useNavigate } from 'react-router';

export function WanxiSceneChrome(props: { onOpenChronicle?(): void }) {
  const navigate = useNavigate();

  const leave = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/game');
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between pt-[calc(env(safe-area-inset-top)+0.65rem)] pr-[max(env(safe-area-inset-right),0.75rem)] pl-[max(env(safe-area-inset-left),0.75rem)] md:pr-[max(env(safe-area-inset-right),1.25rem)] md:pl-[max(env(safe-area-inset-left),1.25rem)]">
      <div className="pointer-events-auto flex gap-2">
        <button
          type="button"
          onClick={leave}
          className="border-battle-rule-strong text-battle-muted hover:text-crimson border border-dashed bg-[rgba(248,243,230,0.94)] px-3 py-2 text-sm shadow-[0_10px_30px_rgba(44,24,16,0.08)] backdrop-blur-sm transition"
        >
          [离开万戏坊]
        </button>
        {props.onOpenChronicle ? (
          <button
            type="button"
            onClick={props.onOpenChronicle}
            className="border-battle-rule-strong text-battle-muted hover:text-crimson border border-dashed bg-[rgba(248,243,230,0.94)] px-3 py-2 text-sm shadow-[0_10px_30px_rgba(44,24,16,0.08)] backdrop-blur-sm transition"
          >
            [坊中纪事]
          </button>
        ) : null}
      </div>

      <div className="border-battle-rule-strong pointer-events-auto border border-dashed bg-[rgba(248,243,230,0.94)] px-4 py-2 text-right shadow-[0_10px_30px_rgba(44,24,16,0.08)] backdrop-blur-sm">
        <div className="text-ink font-semibold">万戏坊</div>
        <div className="text-battle-muted text-xs tracking-[0.12em]">
          拖动探索 · 滚轮或双指缩放
        </div>
      </div>
    </div>
  );
}
