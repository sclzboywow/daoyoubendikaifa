import { InkButton } from '@app/components/ui/InkButton';
import { InkDetailDrawer } from '@app/components/ui/InkDetailDrawer';
import { InkTag } from '@app/components/ui/InkTag';
import type {
  WanxiContinuitySnapshot,
  WanxiDailyEventSnapshot,
} from '@shared/engine/wanxi';

export function WanxiChronicleDrawer(props: {
  isOpen: boolean;
  continuity: WanxiContinuitySnapshot | null;
  loading?: boolean;
  onClose(): void;
  onLocate(event: WanxiDailyEventSnapshot): void;
}) {
  const continuity = props.continuity;
  return (
    <InkDetailDrawer
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="万戏坊纪事"
      description="这里记下的不是任务清单，而是你与坊中人真正经历过的事。"
      size="lg"
      closeLabel="回到坊中"
    >
      <div className="space-y-6">
        {props.loading && !continuity ? (
          <p className="text-ink-secondary text-sm leading-7">正在翻开旧页……</p>
        ) : !continuity?.unlocked ? (
          <div className="border-ink/12 bg-ink/[0.025] border-l-2 px-4 py-3">
            <p className="text-ink text-sm">有些关系，要等故事真正结束以后才会继续生长。</p>
            <p className="text-ink-secondary mt-1 text-sm leading-6">
              完成《灯火未迟》后，这里会开始记录坊中人物与你之后的日常。
            </p>
          </div>
        ) : (
          <>
            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-ink text-sm font-medium">坊中人物</p>
                  <p className="text-ink-secondary mt-1 text-xs leading-5">
                    关系阶段来自共同经历，不直接展示数值进度。
                  </p>
                </div>
                <InkTag tone="neutral" variant="outline">
                  记忆 {continuity.totalMemories}
                </InkTag>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {continuity.relationships.map((relationship) => (
                  <article
                    key={relationship.roleKey}
                    className="border-ink/12 bg-bgpaper/70 border border-dashed px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-ink text-sm font-medium">{relationship.npcName}</h3>
                      <span className="text-crimson text-xs">{relationship.stageLabel}</span>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {relationship.memoryNotes.slice(-3).map((memory) => (
                        <p key={memory} className="text-ink-secondary text-xs leading-5">
                          · {memory}
                        </p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-ink text-sm font-medium">今日坊中见闻</p>
                  <p className="text-ink-secondary mt-1 text-xs leading-5">
                    每日零点（北京时间）换一批；同一天刷新页面不会重抽。
                  </p>
                </div>
                <InkTag tone="neutral" variant="outline">
                  {continuity.completedToday}/{continuity.dailyEvents.length}
                </InkTag>
              </div>
              <div className="space-y-3">
                {continuity.dailyEvents.map((event) => (
                  <article
                    key={event.id}
                    className="border-ink/12 bg-ink/[0.02] border-l-2 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-ink text-sm font-medium">{event.title}</h3>
                          <span className="text-ink-secondary text-xs">
                            {event.npcName} · {event.locationName}
                          </span>
                        </div>
                        <p className="text-ink-secondary mt-1 text-sm leading-6">
                          {event.summary}
                        </p>
                      </div>
                      {event.completed ? (
                        <span className="text-ink-secondary shrink-0 text-xs">已记下</span>
                      ) : (
                        <InkButton
                          variant="ghost"
                          className="shrink-0"
                          onClick={() => props.onLocate(event)}
                        >
                          去看看
                        </InkButton>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </InkDetailDrawer>
  );
}
