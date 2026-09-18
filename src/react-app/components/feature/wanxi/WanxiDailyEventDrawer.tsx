import { InkButton } from '@app/components/ui/InkButton';
import { InkChoiceButton } from '@app/components/ui/InkChoiceButton';
import { InkDetailDrawer } from '@app/components/ui/InkDetailDrawer';
import {
  getWanxiDailyEventChoices,
  type WanxiDailyEventNarrativeResult,
  type WanxiDailyEventResolutionResult,
} from '@shared/engine/wanxi';
import { useEffect, useMemo, useState } from 'react';
import { WanxiNarrativeControls } from './narrative/WanxiNarrativeControls';
import { WanxiNarrativeLines } from './narrative/WanxiNarrativeLines';
import { useNarrativePlayback } from './narrative/useNarrativePlayback';

export function WanxiDailyEventDrawer(props: {
  narrative: WanxiDailyEventNarrativeResult | null;
  onClose(): void;
  onResolve(
    eventId: string,
    choiceId: string,
  ): Promise<WanxiDailyEventResolutionResult>;
}) {
  const narrative = props.narrative;
  const [resolution, setResolution] =
    useState<WanxiDailyEventResolutionResult | null>(null);
  const [resolvingChoiceId, setResolvingChoiceId] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);

  useEffect(() => {
    setResolution(null);
    setResolvingChoiceId(null);
    setResolveError(null);
  }, [narrative?.dateKey, narrative?.event.id]);

  const choices = useMemo(
    () => (narrative ? getWanxiDailyEventChoices(narrative.event.id) : []),
    [narrative],
  );

  const openingPlayback = useNarrativePlayback({
    playbackKey: narrative
      ? `wanxi:daily:opening:${narrative.dateKey}:${narrative.event.id}`
      : 'wanxi:daily:opening:none',
    messages: narrative?.messages,
    enabled: Boolean(narrative),
    rememberPlayed: false,
  });

  const responsePlayback = useNarrativePlayback({
    playbackKey: resolution
      ? `wanxi:daily:response:${resolution.dateKey}:${resolution.event.id}:${resolution.choice.id}`
      : 'wanxi:daily:response:none',
    messages: resolution?.messages,
    enabled: Boolean(resolution),
    rememberPlayed: false,
  });

  const choose = async (choiceId: string) => {
    if (!narrative || resolvingChoiceId || resolution) return;
    setResolvingChoiceId(choiceId);
    setResolveError(null);
    try {
      const next = await props.onResolve(narrative.event.id, choiceId);
      setResolution(next);
    } catch (error) {
      setResolveError(
        error instanceof Error ? error.message : '这句话暂时没有传到对方那里。',
      );
    } finally {
      setResolvingChoiceId(null);
    }
  };

  const activePlayback = resolution ? responsePlayback : openingPlayback;
  const canChoose = Boolean(
    narrative && openingPlayback.complete && !resolution && choices.length > 0,
  );

  return (
    <InkDetailDrawer
      isOpen={Boolean(narrative)}
      onClose={props.onClose}
      title={narrative?.event.title ?? '坊中见闻'}
      description={narrative?.event.summary}
      size="md"
      closeLabel={resolution ? '收起' : '先放一放'}
      footer={
        resolution && responsePlayback.complete ? (
          <InkButton
            className="w-full justify-center"
            onClick={props.onClose}
          >
            收起这段见闻
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
            messages={openingPlayback.visibleMessages}
            onAdvance={
              openingPlayback.playing ? openingPlayback.revealCurrent : undefined
            }
          />

          {!resolution ? (
            <WanxiNarrativeControls
              playing={openingPlayback.playing}
              onRevealCurrent={openingPlayback.revealCurrent}
              onSkipAll={openingPlayback.skipAll}
            />
          ) : null}

          {canChoose ? (
            <div className="border-ink/10 space-y-2 border-t border-dashed pt-4">
              <p className="text-ink-secondary text-xs leading-5">
                你准备怎么回应？没有标准答案，这句话会成为你们共同经历的一部分。
              </p>
              <div className="grid gap-2">
                {choices.map((choice) => (
                  <InkChoiceButton
                    key={choice.id}
                    layout="card"
                    disabled={Boolean(resolvingChoiceId)}
                    selected={resolvingChoiceId === choice.id}
                    onClick={() => void choose(choice.id)}
                  >
                    <span className="block text-sm leading-6">{choice.label}</span>
                    <span className="text-ink-secondary mt-1 block text-xs leading-5">
                      “{choice.playerText}”
                    </span>
                  </InkChoiceButton>
                ))}
              </div>
            </div>
          ) : null}

          {resolvingChoiceId ? (
            <p className="text-ink-secondary text-xs leading-5">
              对方正在听你把话说完……
            </p>
          ) : null}

          {resolveError ? (
            <p className="text-crimson text-xs leading-5">{resolveError}</p>
          ) : null}

          {resolution ? (
            <div className="border-ink/10 border-t border-dashed pt-4">
              <WanxiNarrativeLines
                messages={responsePlayback.visibleMessages}
                onAdvance={
                  responsePlayback.playing
                    ? responsePlayback.revealCurrent
                    : undefined
                }
              />
              <WanxiNarrativeControls
                playing={responsePlayback.playing}
                onRevealCurrent={responsePlayback.revealCurrent}
                onSkipAll={responsePlayback.skipAll}
              />
              {responsePlayback.complete ? (
                <p className="text-ink-secondary mt-3 text-xs leading-5">
                  这次不是“看过一段故事”，而是你真的在这件小事里说过一句话。
                </p>
              ) : null}
            </div>
          ) : null}

          {!activePlayback.playing && !canChoose && !resolution && choices.length === 0 ? (
            <p className="text-ink-secondary text-xs leading-5">
              这件见闻暂时没有可回应的内容。
            </p>
          ) : null}
        </div>
      ) : null}
    </InkDetailDrawer>
  );
}
