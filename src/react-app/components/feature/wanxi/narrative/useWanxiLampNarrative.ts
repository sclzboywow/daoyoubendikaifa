import {
  getWanxiLampNarrativeTargetKey,
  getWanxiLampStoryLocationMessages,
  getWanxiLampStoryNpcMessages,
  shouldUseWanxiLampAiNarrative,
  type WanxiLampNarrativeTarget,
  type WanxiLampStoryMessage,
  type WanxiLampStorySnapshot,
} from '@shared/engine/wanxi';
import { useEffect, useMemo, useState } from 'react';
import { fetchWanxiLampNarrative } from '../wanxiAiApi';
const cache = new Map<string, { generated: boolean; messages: WanxiLampStoryMessage[] }>();

export function useWanxiLampNarrative(args: { story?: WanxiLampStorySnapshot | null; target: WanxiLampNarrativeTarget }) {
  const targetIdentity = args.target.type === 'npc' ? `npc:${args.target.roleKey}` : `location:${args.target.locationId}`;
  const target = useMemo<WanxiLampNarrativeTarget>(() => args.target.type === 'npc' ? { type: 'npc', roleKey: args.target.roleKey } : { type: 'location', locationId: args.target.locationId }, [targetIdentity]);
  const key = args.story ? getWanxiLampNarrativeTargetKey(args.story.stage, target) : `no-story:${targetIdentity}`;
  const canonical = useMemo<WanxiLampStoryMessage[] | null>(() => {
    if (!args.story) return null;
    const m = target.type === 'npc' ? getWanxiLampStoryNpcMessages(args.story.stage, target.roleKey) : getWanxiLampStoryLocationMessages(args.story.stage, target.locationId);
    return m ? m.map((x) => ({ ...x })) : null;
  }, [args.story, key, target]);
  const shouldGenerate = Boolean(args.story && shouldUseWanxiLampAiNarrative(args.story.stage, target));
  const [state, setState] = useState({ key, loading: false, generated: false, messages: canonical as WanxiLampStoryMessage[] | null });
  useEffect(() => {
    if (!args.story || !canonical || !shouldGenerate) { setState({ key, loading: false, generated: false, messages: canonical }); return; }
    const cached = cache.get(key);
    if (cached) { setState({ key, loading: false, ...cached }); return; }
    const controller = new AbortController();
    setState({ key, loading: true, generated: false, messages: canonical });
    void fetchWanxiLampNarrative(target, controller.signal).then((r) => {
      if (controller.signal.aborted) return;
      const next = { generated: r.generated, messages: r.messages };
      cache.set(key, next); setState({ key, loading: false, ...next });
    }).catch(() => { if (!controller.signal.aborted) setState({ key, loading: false, generated: false, messages: canonical }); });
    return () => controller.abort();
  }, [args.story, canonical, key, shouldGenerate, target]);
  return state;
}
