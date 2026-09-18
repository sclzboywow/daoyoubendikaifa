import { NpcConversation } from '@app/components/feature/room';
import { InkButton } from '@app/components/ui/InkButton';
import { InkDetailDrawer } from '@app/components/ui/InkDetailDrawer';
import { InkTag } from '@app/components/ui/InkTag';
import type { WanxiLampChatRoleKey } from '@shared/contracts/wanxiStory';
import { useMemo } from 'react';
import {
  getWanxiEnabledBindings,
  getWanxiLocation,
  getWanxiRegion,
  type WanxiContinuitySnapshot,
  type WanxiLampStorySnapshot,
  type WanxiLocationDefinition,
  type WanxiNpcDefinition,
  type WanxiNpcPlacement,
} from '@shared/engine/wanxi';
import { WanxiNarrativeControls } from './narrative/WanxiNarrativeControls';
import { WanxiNarrativeLines } from './narrative/WanxiNarrativeLines';
import { WanxiNpcChatComposer } from './narrative/WanxiNpcChatComposer';
import { useNarrativePlayback } from './narrative/useNarrativePlayback';
import { useWanxiLampNarrative } from './narrative/useWanxiLampNarrative';
import { useWanxiNpcChat } from './narrative/useWanxiNpcChat';

export interface WanxiNpcDetailDrawerProps {
  npc: WanxiNpcDefinition;
  placement?: WanxiNpcPlacement | null;
  enabledActivityBindingIds: readonly string[];
  story?: WanxiLampStorySnapshot | null;
  continuity?: WanxiContinuitySnapshot | null;
  busy?: boolean;
  onClose(): void;
  onActivitySelect?(bindingId: string): void;
}

function resolveChatRole(npc: WanxiNpcDefinition): WanxiLampChatRoleKey {
  return npc.roleKey === 'mechanist' ? 'mechanist' : 'stage_musician';
}

export function WanxiNpcDetailDrawer({
  npc,
  placement,
  enabledActivityBindingIds,
  story,
  continuity,
  busy = false,
  onClose,
  onActivitySelect,
}: WanxiNpcDetailDrawerProps) {
  const location = placement?.locationId ? getWanxiLocation(placement.locationId) : null;
  const region = placement ? getWanxiRegion(placement.regionId) : null;
  const storyOptions = getWanxiEnabledBindings({
    npcId: npc.id,
    locationId: placement?.locationId,
    enabledIds: enabledActivityBindingIds,
  }).map((binding) => ({ id: binding.id, label: binding.label, tone: 'primary' as const }));
  const dailyOptions = (continuity?.dailyEvents ?? [])
    .filter((event) => !event.completed && event.roleKey === npc.roleKey)
    .map((event) => ({
      id: event.id,
      label: `今日见闻 · ${event.promptLabel}`,
      tone: 'primary' as const,
    }));
  const options = [...storyOptions, ...dailyOptions];
  const relationship = continuity?.relationships.find(
    (candidate) => candidate.roleKey === npc.roleKey,
  );

  const narrative = useWanxiLampNarrative({ story, target: { type: 'npc', roleKey: npc.roleKey } });
  const hasStoryNarrative = Boolean(narrative.messages);
  const greetingBody =
    story?.completed && npc.roleKey === 'stage_musician'
      ? '今天只是练琴。你若不赶时间，坐一会儿也无妨。'
      : story?.completed && npc.roleKey === 'mechanist'
        ? '那盏新灯还在改。不急，这一次本来就不用赶。'
        : npc.defaultGreeting;
  const greetingMessages = useMemo(
    () => [
      {
        id: `${npc.id}:greeting`,
        speaker: npc.name,
        body: greetingBody,
        pauseAfterMs: 280,
      },
    ],
    [greetingBody, npc.id, npc.name],
  );
  const playbackMessages = narrative.messages ?? greetingMessages;
  const playbackKey = hasStoryNarrative
    ? narrative.key
    : `wanxi:npc-greeting:${npc.id}:${story?.completed ? 'completed' : 'default'}`;
  const playback = useNarrativePlayback({
    playbackKey,
    messages: playbackMessages,
    enabled: !narrative.loading,
  });
  const canFreeChat = Boolean(story?.completed && (npc.roleKey === 'stage_musician' || npc.roleKey === 'mechanist'));
  const chat = useWanxiNpcChat({ roleKey: resolveChatRole(npc), npcName: npc.name, enabled: canFreeChat });

  const baseMessages = narrative.loading
    ? [{ id: `${narrative.key}:loading`, speaker: npc.name, body: '', gesture: '他似乎正在斟酌这一刻该如何开口。' }]
    : playback.visibleMessages.map((message) => ({
        id: message.id,
        speaker: message.speaker,
        body: message.body,
        tone: message.tone,
        gesture: message.gesture,
      }));
  const messages = [
    ...baseMessages,
    ...chat.messages.map((message) => ({ id: message.id, speaker: message.speaker, body: message.body, align: message.align })),
  ];
  const narrativeReady = playback.complete;
  const visibleOptions = narrativeReady && !narrative.loading ? options : [];

  return (
    <InkDetailDrawer isOpen onClose={onClose} title={`与${npc.name}交谈`} description={npc.identity} size="xl" closeLabel="回到坊中">
      <div onClick={playback.playing ? playback.revealCurrent : undefined}>
        <NpcConversation
          actor={{ sigil: npc.sigil, name: npc.name, identity: npc.identity, responsibility: npc.description }}
          context={
            <div className="space-y-1">
              {region ? <p className="text-ink-secondary text-xs leading-5">所在：<span className="text-ink">{region.name}{location && location.name !== region.name ? ` · ${location.name}` : ''}</span></p> : null}
              {story && !story.completed ? <p className="text-crimson/80 text-xs leading-5">灯火未迟 · {story.objective}</p> : story?.completed && canFreeChat ? <p className="text-ink-secondary text-xs leading-5">《灯火未迟》之后，你们已经有些真正说得上话的旧交情了。</p> : null}
              {relationship ? <p className="text-ink-secondary text-xs leading-5">关系：<span className="text-crimson">{relationship.stageLabel}</span>{relationship.memoryNotes.length > 0 ? ` · 共同记忆 ${relationship.memoryNotes.length}` : ''}</p> : null}
            </div>
          }
          messages={messages}
          options={visibleOptions}
          busy={busy || narrative.loading || chat.busy}
          containedTranscript
          density="compact"
          onSelectOption={(bindingId: string) => onActivitySelect?.(bindingId)}
          actions={<WanxiNarrativeControls playing={playback.playing} onRevealCurrent={playback.revealCurrent} onSkipAll={playback.skipAll} />}
          composer={
            canFreeChat && narrativeReady && !narrative.loading ? (
              <WanxiNpcChatComposer npcName={npc.name} value={chat.draft} busy={chat.busy} error={chat.error} onChange={chat.setDraft} onSend={() => void chat.send()} />
            ) : undefined
          }
          footer={
            visibleOptions.length === 0 && !canFreeChat && narrativeReady ? (
              <p className="text-ink-secondary text-sm leading-6">{hasStoryNarrative ? '话已经说到这里。再往前，需要去见另一个人，或换个地方。' : '此人眼下没有更多事情要说。'}</p>
            ) : undefined
          }
        />
      </div>
    </InkDetailDrawer>
  );
}

export interface WanxiLocationDetailDrawerProps {
  location: WanxiLocationDefinition;
  enabledActivityBindingIds: readonly string[];
  story?: WanxiLampStorySnapshot | null;
  busy?: boolean;
  onClose(): void;
  onActivitySelect?(bindingId: string): void;
}

export function WanxiLocationDetailDrawer({
  location,
  enabledActivityBindingIds,
  story,
  busy = false,
  onClose,
  onActivitySelect,
}: WanxiLocationDetailDrawerProps) {
  const region = getWanxiRegion(location.regionId);
  const options = getWanxiEnabledBindings({ locationId: location.id, enabledIds: enabledActivityBindingIds });
  const narrative = useWanxiLampNarrative({ story, target: { type: 'location', locationId: location.id } });
  const hasStoryNarrative = Boolean(narrative.messages);
  const playback = useNarrativePlayback({ playbackKey: narrative.key, messages: narrative.messages, enabled: hasStoryNarrative && !narrative.loading });
  const narrativeReady = !hasStoryNarrative || playback.complete;
  const visibleOptions = narrativeReady && !narrative.loading ? options : [];

  return (
    <InkDetailDrawer
      isOpen
      onClose={onClose}
      title={location.name}
      description={location.description}
      size={hasStoryNarrative ? 'md' : 'sm'}
      closeLabel="继续逛逛"
      footer={visibleOptions.length > 0 ? <div className="space-y-2">{visibleOptions.map((binding) => <InkButton key={binding.id} className="w-full justify-start" variant="secondary" disabled={busy} pending={busy} onClick={() => onActivitySelect?.(binding.id)}>{binding.label}</InkButton>)}</div> : undefined}
    >
      <div className="space-y-4">
        {region ? <p className="text-ink-secondary text-sm leading-7">所在区域：<span className="text-ink">{region.name}</span></p> : null}
        {story && !story.completed ? <div className="border-crimson/20 bg-crimson/[0.035] border-l-2 px-3 py-2"><p className="text-crimson text-xs">灯火未迟</p><p className="text-ink-secondary mt-1 text-sm leading-6">{story.objective}</p></div> : null}
        {narrative.loading ? <div className="border-ink/10 border-t border-dashed pt-4"><p className="text-ink-secondary text-sm leading-7">湖风、灯影与旧事像是同时慢了半拍……</p></div> : hasStoryNarrative ? <><WanxiNarrativeLines messages={playback.visibleMessages} onAdvance={playback.playing ? playback.revealCurrent : undefined} /><WanxiNarrativeControls playing={playback.playing} onRevealCurrent={playback.revealCurrent} onSkipAll={playback.skipAll} /></> : null}
        {location.tags && location.tags.length > 0 ? <div className="flex flex-wrap gap-2">{location.tags.map((tag) => <InkTag key={tag} tone="neutral" variant="outline">{tag}</InkTag>)}</div> : null}
      </div>
    </InkDetailDrawer>
  );
}
