import { InkChoiceButton } from '@app/components/ui/InkChoiceButton';
import {
  getWanxiFirstContactDefinition,
  type WanxiCoreNpcRoleKey,
  type WanxiContinuitySnapshot,
  type WanxiFirstContactResolutionResult,
  type WanxiNpcDefinition,
} from '@shared/engine/wanxi';
import { useEffect, useMemo, useState } from 'react';
import { WanxiNarrativeControls } from './narrative/WanxiNarrativeControls';
import { WanxiNarrativeLines } from './narrative/WanxiNarrativeLines';
import { useNarrativePlayback } from './narrative/useNarrativePlayback';
import { resolveWanxiFirstContact } from './wanxiRelationshipApi';

export function WanxiFirstContactPanel(props: {
  npc: WanxiNpcDefinition;
  roleKey: WanxiCoreNpcRoleKey;
  locationLabel?: string;
}) {
  const definition = getWanxiFirstContactDefinition(props.roleKey);
  const [resolution, setResolution] =
    useState<WanxiFirstContactResolutionResult | null>(null);
  const [resolvingChoiceId, setResolvingChoiceId] =
    useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [committedContinuity, setCommittedContinuity] =
    useState<WanxiContinuitySnapshot | null>(null);
  const [appliedRoleKey, setAppliedRoleKey] = useState(props.roleKey);
  if (appliedRoleKey !== props.roleKey) {
    setAppliedRoleKey(props.roleKey);
    setResolution(null);
    setResolvingChoiceId(null);
    setError(null);
    setCommittedContinuity(null);
  }

  const opening = useNarrativePlayback({
    playbackKey: `wanxi:first-contact:${props.roleKey}`,
    messages: definition?.openingMessages,
    enabled: Boolean(definition),
    rememberPlayed: false,
  });

  const responseMessages = useMemo(() => {
    if (!resolution) return [];
    return [
      {
        id: `wanxi:first-contact:${props.roleKey}:player`,
        speaker: '你',
        body: resolution.choice.playerText,
        tone: 'attention' as const,
        pauseAfterMs: 220,
      },
      ...resolution.messages,
    ];
  }, [props.roleKey, resolution]);

  const response = useNarrativePlayback({
    playbackKey: resolution
      ? `wanxi:first-contact:${props.roleKey}:${resolution.choice.id}:response`
      : `wanxi:first-contact:${props.roleKey}:response:none`,
    messages: responseMessages,
    enabled: Boolean(resolution),
    rememberPlayed: false,
  });

  useEffect(() => {
    if (!resolution || !response.complete || !committedContinuity) return;
    const timer = window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('wanxi:continuity-changed', {
          detail: committedContinuity,
        }),
      );
    }, 500);
    return () => window.clearTimeout(timer);
  }, [committedContinuity, resolution, response.complete]);

  if (!definition) return null;

  const choose = async (choiceId: string) => {
    if (resolvingChoiceId || resolution) return;
    setResolvingChoiceId(choiceId);
    setError(null);
    try {
      const payload = await resolveWanxiFirstContact(
        props.roleKey,
        choiceId,
      );
      setResolution(payload.data.resolution);
      setCommittedContinuity(payload.data.continuity);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : '这句话暂时没有传到对方那里。',
      );
    } finally {
      setResolvingChoiceId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-ink/10 bg-ink/[0.02] border-l-2 px-4 py-3">
        <p className="text-crimson text-xs tracking-[0.1em]">
          第一次正式打照面
        </p>
        <p className="text-ink mt-1 text-sm font-medium">
          {definition.title}
        </p>
        <p className="text-ink-secondary mt-1 text-xs leading-5">
          {props.locationLabel
            ? `${props.locationLabel} · ${definition.summary}`
            : definition.summary}
        </p>
      </div>

      <WanxiNarrativeLines
        messages={opening.visibleMessages}
        onAdvance={
          opening.playing ? opening.revealCurrent : undefined
        }
      />

      {!resolution ? (
        <WanxiNarrativeControls
          playing={opening.playing}
          onRevealCurrent={opening.revealCurrent}
          onSkipAll={opening.skipAll}
        />
      ) : null}

      {opening.complete && !resolution ? (
        <div className="border-ink/10 space-y-2 border-t border-dashed pt-4">
          <p className="text-ink-secondary text-xs leading-5">
            第一次回应不会决定“对错”，但会成为这个人以后记得你的第一件事。
          </p>
          {definition.choices.map((choice) => (
            <InkChoiceButton
              key={choice.id}
              layout="card"
              disabled={Boolean(resolvingChoiceId)}
              selected={resolvingChoiceId === choice.id}
              onClick={() => void choose(choice.id)}
            >
              <span className="block text-sm leading-6">
                {choice.label}
              </span>
              <span className="text-ink-secondary mt-1 block text-xs leading-5">
                “{choice.playerText}”
              </span>
            </InkChoiceButton>
          ))}
        </div>
      ) : null}

      {resolvingChoiceId ? (
        <p className="text-ink-secondary text-xs leading-5">
          对方正在听你把第一句话说完……
        </p>
      ) : null}

      {error ? (
        <p className="text-crimson text-xs leading-5">{error}</p>
      ) : null}

      {resolution ? (
        <div className="border-ink/10 border-t border-dashed pt-4">
          <WanxiNarrativeLines
            messages={response.visibleMessages}
            onAdvance={
              response.playing
                ? response.revealCurrent
                : undefined
            }
          />
          <WanxiNarrativeControls
            playing={response.playing}
            onRevealCurrent={response.revealCurrent}
            onSkipAll={response.skipAll}
          />
          {response.complete ? (
            <p className="text-ink-secondary mt-3 text-xs leading-5">
              你们已经正式认识了。下一次再来，这个人会从“相识”开始记住你。
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
