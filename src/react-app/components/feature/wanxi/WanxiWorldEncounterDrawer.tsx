import { NpcConversation } from '@app/components/feature/room';
import { InkDetailDrawer } from '@app/components/ui/InkDetailDrawer';
import type {
  WanxiWorldEncounterResolution,
  WanxiWorldEncounterView,
} from '@shared/contracts/wanxiWorld';
import { useMemo, useState } from 'react';
import { resolveWanxiWorldEncounter } from './wanxiWorldApi';

export function WanxiWorldEncounterDrawer(props: {
  encounter: WanxiWorldEncounterView | null;
  busy?: boolean;
  onClose(): void;
  onResolved?(resolution: WanxiWorldEncounterResolution): void;
}) {
  const [resolution, setResolution] =
    useState<WanxiWorldEncounterResolution | null>(null);
  const [resolvingChoiceId, setResolvingChoiceId] =
    useState<string | null>(null);
  const [error, setError] = useState<string>();
  const encounterId = props.encounter?.id ?? '';
  const [appliedEncounterId, setAppliedEncounterId] = useState(encounterId);
  if (appliedEncounterId !== encounterId) {
    setAppliedEncounterId(encounterId);
    setResolution(null);
    setResolvingChoiceId(null);
    setError(undefined);
  }

  const messages = useMemo(() => {
    if (!props.encounter) return [];
    const opening = props.encounter.opening.map((message) => ({
      id: message.id,
      speaker: message.speaker,
      body: message.body,
      tone: message.tone,
      gesture: message.gesture,
      align: 'start' as const,
    }));
    if (!resolution) return opening;
    return [
      ...opening,
      ...resolution.messages.map((message) => ({
        id: message.id,
        speaker: message.speaker,
        body:
          message.speaker === '你'
            ? `你：${message.body}`
            : message.body,
        tone: message.tone,
        gesture: message.gesture,
        align:
          message.speaker === '你'
            ? ('end' as const)
            : ('start' as const),
      })),
    ];
  }, [props.encounter, resolution]);

  if (!props.encounter) return null;

  const encounter = props.encounter;
  const resolved = Boolean(resolution);

  const choose = async (choiceId: string) => {
    if (resolvingChoiceId || resolved) return;
    setResolvingChoiceId(choiceId);
    setError(undefined);
    try {
      const next = await resolveWanxiWorldEncounter(
        encounter.id,
        choiceId,
      );
      setResolution(next);
      props.onResolved?.(next);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : '这段对话没有接上。',
      );
    } finally {
      setResolvingChoiceId(null);
    }
  };

  return (
    <InkDetailDrawer
      isOpen
      onClose={props.onClose}
      title={encounter.title}
      description={encounter.summary}
      size="xl"
      closeLabel={resolved ? '把这件事记下' : '先离开'}
    >
      <NpcConversation
        actor={encounter.actor}
        messages={messages}
        busy={props.busy || Boolean(resolvingChoiceId)}
        error={error}
        containedTranscript
        density="compact"
        context={
          <div className="space-y-1 text-xs leading-5">
            <p className="text-crimson tracking-[0.08em]">
              {encounter.kind === 'regional_story'
                ? '坊中旧事'
                : encounter.kind === 'cross'
                  ? '两人之间'
                  : encounter.kind === 'prop'
                    ? '物件见闻'
                    : '今日小事'}
            </p>
            {encounter.participants.length > 1 ? (
              <p className="text-ink-secondary">
                在场：
                {encounter.participants
                  .map((item) => item.name)
                  .join('、')}
              </p>
            ) : null}
          </div>
        }
        options={
          resolved
            ? []
            : encounter.choices.map((choice) => ({
                id: choice.id,
                label: `${choice.label} · “${choice.playerText}”`,
                tone: 'primary' as const,
              }))
        }
        selectedOptionId={resolvingChoiceId ?? undefined}
        onSelectOption={(choiceId) => void choose(choiceId)}
        footer={
          resolution ? (
            <div className="border-ink/15 border-t border-dashed pt-3">
              <p className="text-ink-secondary text-xs leading-5">
                记忆 · {resolution.memoryText}
              </p>
              {resolution.storyCompleted ? (
                <p className="text-crimson mt-2 text-xs leading-5">
                  《无名戏单》已经告一段落。答案被留下，但没有替任何人变成唯一结论。
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-ink-secondary text-xs leading-5">
              和暗巷黑市一样，这里把交互保持在连续对话里：先看见事情，再开口，再得到针对你的回应。
            </p>
          )
        }
      />
    </InkDetailDrawer>
  );
}
