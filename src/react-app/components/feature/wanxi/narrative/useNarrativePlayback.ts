import type { WanxiLampStoryMessage } from '@shared/engine/wanxi';
import { useCallback, useEffect, useMemo, useState } from 'react';

type PlaybackPhase = 'idle' | 'typing' | 'waiting' | 'complete';
type PlaybackState = {
  phase: PlaybackPhase;
  messageIndex: number;
  visibleCharacters: number;
};
const PREFIX = 'wanxi:narrative:played:';
const EMPTY_MESSAGES: readonly WanxiLampStoryMessage[] = [];

function reducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}
function played(key: string) {
  try {
    return window.sessionStorage.getItem(PREFIX + key) === '1';
  } catch {
    return false;
  }
}
function markPlayed(key: string) {
  try {
    window.sessionStorage.setItem(PREFIX + key, '1');
  } catch {
    /* ignore */
  }
}
function charDelay(c: string) {
  if ('。！？!?'.includes(c)) return 190;
  if ('，、；：,;:'.includes(c)) return 90;
  if ('…'.includes(c)) return 160;
  return 30;
}

function samePlaybackState(a: PlaybackState, b: PlaybackState) {
  return (
    a.phase === b.phase &&
    a.messageIndex === b.messageIndex &&
    a.visibleCharacters === b.visibleCharacters
  );
}

export function useNarrativePlayback(args: {
  playbackKey: string;
  messages?: readonly WanxiLampStoryMessage[] | null;
  enabled?: boolean;
  rememberPlayed?: boolean;
}) {
  const enabled = args.enabled ?? true;
  const rememberPlayed = args.rememberPlayed ?? true;
  const messages = args.messages ?? EMPTY_MESSAGES;
  const [state, setState] = useState<PlaybackState>({
    phase: 'idle',
    messageIndex: 0,
    visibleCharacters: 0,
  });

  useEffect(() => {
    let next: PlaybackState;
    if (!enabled || messages.length === 0) {
      next = {
        phase: messages.length ? 'idle' : 'complete',
        messageIndex: 0,
        visibleCharacters: 0,
      };
    } else if (
      reducedMotion() ||
      (rememberPlayed && played(args.playbackKey))
    ) {
      next = {
        phase: 'complete',
        messageIndex: messages.length - 1,
        visibleCharacters: messages.at(-1)?.body.length ?? 0,
      };
    } else {
      next = { phase: 'typing', messageIndex: 0, visibleCharacters: 0 };
    }
    setState((current) => (samePlaybackState(current, next) ? current : next));
  }, [args.playbackKey, enabled, messages, rememberPlayed]);

  useEffect(() => {
    if (!enabled || state.phase === 'idle' || state.phase === 'complete') return;
    const current = messages[state.messageIndex];
    if (!current) {
      if (rememberPlayed) markPlayed(args.playbackKey);
      setState((v) => ({ ...v, phase: 'complete' }));
      return;
    }
    if (state.phase === 'typing') {
      if (state.visibleCharacters >= current.body.length) {
        setState((v) => ({ ...v, phase: 'waiting' }));
        return;
      }
      const timer = window.setTimeout(
        () =>
          setState((v) => ({
            ...v,
            visibleCharacters: v.visibleCharacters + 1,
          })),
        charDelay(current.body[state.visibleCharacters] ?? ''),
      );
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      if (state.messageIndex >= messages.length - 1) {
        if (rememberPlayed) markPlayed(args.playbackKey);
        setState((v) => ({ ...v, phase: 'complete' }));
      } else {
        setState({
          phase: 'typing',
          messageIndex: state.messageIndex + 1,
          visibleCharacters: 0,
        });
      }
    }, current.pauseAfterMs ?? 360);
    return () => window.clearTimeout(timer);
  }, [args.playbackKey, enabled, messages, rememberPlayed, state]);

  const revealCurrent = useCallback(() => {
    if (state.phase === 'typing') {
      const current = messages[state.messageIndex];
      if (current) {
        setState((v) => ({ ...v, visibleCharacters: current.body.length }));
      }
    } else if (state.phase === 'waiting') {
      if (state.messageIndex >= messages.length - 1) {
        if (rememberPlayed) markPlayed(args.playbackKey);
        setState((v) => ({ ...v, phase: 'complete' }));
      } else {
        setState({
          phase: 'typing',
          messageIndex: state.messageIndex + 1,
          visibleCharacters: 0,
        });
      }
    }
  }, [args.playbackKey, messages, rememberPlayed, state]);

  const skipAll = useCallback(() => {
    if (rememberPlayed) markPlayed(args.playbackKey);
    setState({
      phase: 'complete',
      messageIndex: Math.max(0, messages.length - 1),
      visibleCharacters: messages.at(-1)?.body.length ?? 0,
    });
  }, [args.playbackKey, messages, rememberPlayed]);

  const visibleMessages = useMemo(() => {
    if (state.phase === 'idle') return [];
    if (state.phase === 'complete') return messages.map((m) => ({ ...m }));
    return messages.slice(0, state.messageIndex + 1).map((m, i) =>
      i === state.messageIndex
        ? { ...m, body: m.body.slice(0, state.visibleCharacters) }
        : { ...m },
    );
  }, [messages, state]);

  return {
    visibleMessages,
    playing: state.phase === 'typing' || state.phase === 'waiting',
    complete: state.phase === 'complete',
    revealCurrent,
    skipAll,
  };
}
