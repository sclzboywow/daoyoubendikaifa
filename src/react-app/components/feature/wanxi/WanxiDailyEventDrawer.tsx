import { InkButton } from '@app/components/ui/InkButton';
import { InkDetailDrawer } from '@app/components/ui/InkDetailDrawer';
import type { WanxiDailyEventNarrativeResult } from '@shared/engine/wanxi';
import { WanxiNarrativeControls } from './narrative/WanxiNarrativeControls';
import { WanxiNarrativeLines } from './narrative/WanxiNarrativeLines';
import { useNarrativePlayback } from './narrative/useNarrativePlayback';

export function WanxiDailyEventDrawer(props: {
  narrative: WanxiDailyEventNarrativeResult | null;
  busy?: boolean;
  onClose(): void;
  onComplete(eventId: string): void;
}) {
  const narrative = props.narrative;
  const playback = useNarrativePlayback({
    playbackKey: narrative
      ? `wanxi:daily:${narrative.dateKey}:${narrative.event.id}`
      : 'wanxi:daily:none',
    messages: narrative?.messages,
    enabled: Boolean(narrative),
  });

  return (
    <InkDetailDrawer
      isOpen={Boolean(narrative)}
      onClose={props.onClose}
      title={narrative?.event.title ?? '坊中见闻'}
      description={narrative?.event.summary}
      size="md"
      closeLabel="先放一放"
      footer={
        narrative && playback.complete ? (
          <InkButton
            className="w-full justify-center"
            disabled={props.busy}
            pending={props.busy}
            onClick={() => props.onComplete(narrative.event.id)}
          >
            记下这一刻
          </InkButton>
        ) : undefined
      }
    >
      {narrative ? (
        <div className="space-y-4">
          <p className="text-ink-secondary text-xs leading-5">
            {narrative.event.npcName} · {narrative.event.locationName}
          </p>
          <WanxiNarrativeLines
            messages={playback.visibleMessages}
            onAdvance={playback.playing ? playback.revealCurrent : undefined}
          />
          <WanxiNarrativeControls
            playing={playback.playing}
            onRevealCurrent={playback.revealCurrent}
            onSkipAll={playback.skipAll}
          />
        </div>
      ) : null}
    </InkDetailDrawer>
  );
}
