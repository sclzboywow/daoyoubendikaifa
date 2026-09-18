import {
  WanxiChronicleDrawer,
  WanxiDailyEventDrawer,
  WanxiLocationDetailDrawer,
  WanxiNpcDetailDrawer,
  WanxiSceneCanvas,
  WanxiSceneChrome,
  WanxiStoryEffectNotice,
  useWanxiContinuityQuery,
  useWanxiLampStoryQuery,
  useWanxiSceneQuery,
} from '@app/components/feature/wanxi';
import { GameLoadingState } from '@app/components/game-shell/GameLoadingState';
import { useInkUI } from '@app/components/providers/InkUIProvider';
import { InkButton } from '@app/components/ui/InkButton';
import { useResourceMutation } from '@app/lib/resources/mutations';
import {
  fetchWanxiDailyEventNarrative,
  resolveWanxiDailyEvent,
} from '@app/components/feature/wanxi/wanxiContinuityApi';
import {
  getWanxiLampStoryActionPresentation,
  getWanxiLocation,
  getWanxiNpcById,
  getWanxiNpcByRoleKey,
  isWanxiDailyEventId,
  isWanxiLampStoryActionId,
  WANXI_LAMP_STORY_ACTIONS,
  type WanxiDailyEventNarrativeResult,
  type WanxiDailyEventSnapshot,
  type WanxiLampStoryActionPresentation,
  type WanxiLampStorySnapshot,
} from '@shared/engine/wanxi';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

type WanxiSelection =
  | { kind: 'npc'; roleKey: string }
  | { kind: 'location'; locationId: string };

const CLOSE_SELECT_SUPPRESS_MS = 450;

export default function WanxiPage() {
  const query = useWanxiSceneQuery();
  const storyQuery = useWanxiLampStoryQuery();
  const continuityQuery = useWanxiContinuityQuery();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mutate } = useResourceMutation();
  const { pushToast } = useInkUI();
  const [acting, setActing] = useState(false);
  const [chronicleOpen, setChronicleOpen] = useState(false);
  const [dailyNarrative, setDailyNarrative] =
    useState<WanxiDailyEventNarrativeResult | null>(null);
  const suppressSelectUntilRef = useRef(0);
  const [selection, setSelectionState] = useState<WanxiSelection | null>(() => {
    const npc = searchParams.get('npc');
    if (npc) return { kind: 'npc', roleKey: npc };
    const location = searchParams.get('location');
    if (location) return { kind: 'location', locationId: location };
    return null;
  });
  const [storyEffect, setStoryEffect] = useState<{
    key: number;
    presentation: WanxiLampStoryActionPresentation;
  } | null>(null);
  const clearStoryEffect = useCallback(() => setStoryEffect(null), []);

  const isSelectSuppressed = () => Date.now() < suppressSelectUntilRef.current;

  useEffect(() => {
    if (isSelectSuppressed()) {
      if (!searchParams.get('npc') && !searchParams.get('location')) {
        setSelectionState((current) => (current === null ? current : null));
      }
      return;
    }

    const npc = searchParams.get('npc');
    const location = searchParams.get('location');
    if (npc) {
      setSelectionState((current) =>
        current?.kind === 'npc' && current.roleKey === npc
          ? current
          : { kind: 'npc', roleKey: npc },
      );
      return;
    }
    if (location) {
      setSelectionState((current) =>
        current?.kind === 'location' && current.locationId === location
          ? current
          : { kind: 'location', locationId: location },
      );
      return;
    }
    setSelectionState((current) => (current === null ? current : null));
  }, [searchParams]);

  const selectedNpc =
    selection?.kind === 'npc' ? getWanxiNpcByRoleKey(selection.roleKey) : null;
  const selectedLocation =
    selection?.kind === 'location'
      ? getWanxiLocation(selection.locationId)
      : null;

  const setSelection = useCallback(
    (next: { npc?: string; location?: string }) => {
      if (isSelectSuppressed() && (next.npc || next.location)) {
        return;
      }

      if (next.npc) {
        setSelectionState({ kind: 'npc', roleKey: next.npc });
      } else if (next.location) {
        setSelectionState({ kind: 'location', locationId: next.location });
      } else {
        setSelectionState(null);
      }

      const params = new URLSearchParams(searchParams);
      params.delete('npc');
      params.delete('location');
      if (next.npc) params.set('npc', next.npc);
      if (next.location) params.set('location', next.location);
      const search = params.toString();
      navigate(
        {
          pathname: '/game/wanxi',
          search: search ? `?${search}` : '',
        },
        { replace: true },
      );
    },
    [navigate, searchParams],
  );

  const clearSelection = useCallback(() => {
    suppressSelectUntilRef.current = Date.now() + CLOSE_SELECT_SUPPRESS_MS;
    setSelectionState(null);
    navigate('/game/wanxi', { replace: true });
  }, [navigate]);

  const openDailyEvent = async (eventId: string) => {
    setActing(true);
    try {
      const narrative = await fetchWanxiDailyEventNarrative(eventId);
      setSelection({});
      setDailyNarrative(narrative);
    } catch (error) {
      pushToast({
        message: error instanceof Error ? error.message : '这件坊中见闻暂时接不上',
        tone: 'warning',
      });
    } finally {
      setActing(false);
    }
  };

  const resolveDailyEvent = async (eventId: string, choiceId: string) => {
    const result = await resolveWanxiDailyEvent(eventId, choiceId);
    continuityQuery.reload();
    query.reload();
    return result.resolution;
  };

  const runActivity = async (bindingId: string) => {
    if (isWanxiDailyEventId(bindingId)) {
      await openDailyEvent(bindingId);
      return;
    }
    if (!isWanxiLampStoryActionId(bindingId)) {
      pushToast({ message: '这个活动暂未开放', tone: 'warning' });
      return;
    }
    if (bindingId === WANXI_LAMP_STORY_ACTIONS.BATTLE) {
      navigate('/game/wanxi/story/lamp/battle');
      return;
    }

    setActing(true);
    try {
      await mutate<{ story: WanxiLampStorySnapshot }>(
        fetch('/api/wanxi/story/lamp/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actionId: bindingId }),
        }),
      );
      const presentation = getWanxiLampStoryActionPresentation(bindingId);
      if (presentation) {
        setStoryEffect({ key: Date.now(), presentation });
      }
      if (bindingId === WANXI_LAMP_STORY_ACTIONS.CONFRONTATION) {
        setSelection({ location: 'west_courtyard' });
      }
      query.reload();
      storyQuery.reload();
      continuityQuery.reload();
    } catch (error) {
      pushToast({
        message: error instanceof Error ? error.message : '这段故事暂时无法继续',
        tone: 'warning',
      });
    } finally {
      setActing(false);
    }
  };

  const locateDailyEvent = (event: WanxiDailyEventSnapshot) => {
    setChronicleOpen(false);
    setSelection({ npc: event.roleKey });
  };

  if (query.loading && !query.data) {
    return <GameLoadingState message="正穿过坊门……" variant="fullscreen" />;
  }

  if (query.error || !query.data) {
    return (
      <div className="bg-paper flex h-full min-h-[100dvh] items-center justify-center p-6">
        <div className="border-ink/20 bg-bgpaper max-w-md border border-dashed p-6 text-center shadow-sm">
          <p className="text-ink">万戏坊今日似乎尚未开门。</p>
          <p className="text-ink-secondary mt-2 text-sm leading-6">
            {query.error ?? '无法读取场景状态'}
          </p>
          <InkButton className="mt-5" onClick={query.reload}>
            再问一次
          </InkButton>
        </div>
      </div>
    );
  }

  const snapshot = query.data;
  const story = storyQuery.data;
  const continuity = continuityQuery.data;
  const selectedNpcPlacement = selectedNpc
    ? snapshot.npcPlacements.find((placement) => placement.npcId === selectedNpc.id)
    : null;
  const resolvedSelectedNpc = selectedNpcPlacement ? selectedNpc : null;

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#e8e0cf]">
      <WanxiSceneCanvas
        npcPlacements={snapshot.npcPlacements}
        locationStates={snapshot.locationStates}
        selectedNpcId={resolvedSelectedNpc?.id ?? null}
        selectedLocationId={selectedLocation?.id ?? null}
        onNpcSelect={(npcId) => {
          const npc = getWanxiNpcById(npcId);
          if (npc) setSelection({ npc: npc.roleKey });
        }}
        onLocationSelect={(locationId) => setSelection({ location: locationId })}
      />

      <WanxiSceneChrome onOpenChronicle={() => setChronicleOpen(true)} />

      {story && !story.completed ? (
        <div className="pointer-events-none absolute bottom-[max(env(safe-area-inset-bottom),0.75rem)] left-[max(env(safe-area-inset-left),0.75rem)] z-30 max-w-[min(26rem,calc(100vw-1.5rem))]">
          <div className="border-ink/15 bg-bgpaper/92 border border-dashed px-4 py-3 shadow-[0_8px_28px_rgba(44,24,16,0.09)] backdrop-blur-sm">
            <p className="text-crimson text-xs tracking-[0.12em]">坊中见闻 · 灯火未迟</p>
            <p className="text-ink mt-1 text-sm">{story.objective}</p>
            <p className="text-ink-secondary mt-1 line-clamp-2 text-xs leading-5">
              {story.summary}
            </p>
          </div>
        </div>
      ) : continuity?.unlocked ? (
        <button
          type="button"
          onClick={() => setChronicleOpen(true)}
          className="border-ink/15 bg-bgpaper/92 pointer-events-auto absolute bottom-[max(env(safe-area-inset-bottom),0.75rem)] left-[max(env(safe-area-inset-left),0.75rem)] z-30 max-w-[min(24rem,calc(100vw-1.5rem))] border border-dashed px-4 py-3 text-left shadow-[0_8px_28px_rgba(44,24,16,0.09)] backdrop-blur-sm"
        >
          <p className="text-crimson text-xs tracking-[0.12em]">今日坊中见闻</p>
          <p className="text-ink mt-1 text-sm">
            {continuity.completedToday}/{continuity.dailyEvents.length} 已记下
          </p>
          <p className="text-ink-secondary mt-1 text-xs leading-5">
            故事结束了，坊中人的日子还在继续。
          </p>
        </button>
      ) : null}

      {storyEffect ? (
        <WanxiStoryEffectNotice
          noticeKey={storyEffect.key}
          presentation={storyEffect.presentation}
          onDone={clearStoryEffect}
        />
      ) : null}

      {resolvedSelectedNpc ? (
        <WanxiNpcDetailDrawer
          npc={resolvedSelectedNpc}
          placement={selectedNpcPlacement}
          enabledActivityBindingIds={snapshot.enabledActivityBindingIds}
          story={story}
          continuity={continuity}
          busy={acting}
          onClose={clearSelection}
          onActivitySelect={runActivity}
        />
      ) : selectedLocation ? (
        <WanxiLocationDetailDrawer
          location={selectedLocation}
          enabledActivityBindingIds={snapshot.enabledActivityBindingIds}
          story={story}
          busy={acting}
          onClose={clearSelection}
          onActivitySelect={runActivity}
        />
      ) : null}

      <WanxiChronicleDrawer
        isOpen={chronicleOpen}
        continuity={continuity}
        loading={continuityQuery.loading}
        onClose={() => setChronicleOpen(false)}
        onLocate={locateDailyEvent}
      />

      <WanxiDailyEventDrawer
        narrative={dailyNarrative}
        onClose={() => setDailyNarrative(null)}
        onResolve={resolveDailyEvent}
      />
    </div>
  );
}
