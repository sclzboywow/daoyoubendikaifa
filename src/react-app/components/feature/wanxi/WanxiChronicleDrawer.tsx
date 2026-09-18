import { InkButton } from '@app/components/ui/InkButton';
import { InkDetailDrawer } from '@app/components/ui/InkDetailDrawer';
import { InkTag } from '@app/components/ui/InkTag';
import {
  isWanxiCoreNpcRoleKey,
  type WanxiContinuitySnapshot,
  type WanxiDailyEventSnapshot,
} from '@shared/engine/wanxi';

export function WanxiChronicleDrawer(props: {
  isOpen: boolean;
  continuity: WanxiContinuitySnapshot | null;
  loading?: boolean;
  onClose(): void;
  onLocate(event: WanxiDailyEventSnapshot): void;
}) {
  const continuity = props.continuity;
  const coreRelationships =
    continuity?.relationships.filter((relationship) =>
      isWanxiCoreNpcRoleKey(relationship.roleKey),
    ) ?? [];
  const met = coreRelationships.filter(
    (relationship) => relationship.met,
  );
  const strangers = coreRelationships.filter(
    (relationship) => !relationship.met,
  );
  const coreMemoryCount = coreRelationships.reduce(
    (total, relationship) =>
      total + relationship.memoryNotes.length,
    0,
  );

  return (
    <InkDetailDrawer
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="万戏坊纪事"
      description="人物关系从第一次真正打过照面开始记录；这里不是任务清单。"
      size="lg"
      closeLabel="回到坊中"
    >
      <div className="space-y-6">
        {props.loading && !continuity ? (
          <p className="text-ink-secondary text-sm leading-7">
            正在翻开旧页……
          </p>
        ) : !continuity ? (
          <p className="text-ink-secondary text-sm leading-7">
            暂时没有读到坊中人物记录。
          </p>
        ) : (
          <>
            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-ink text-sm font-medium">
                    坊中人物
                  </p>
                  <p className="text-ink-secondary mt-1 text-xs leading-5">
                    已认识 {met.length}/{coreRelationships.length}。关系阶段来自共同经历，不展示数值进度。
                  </p>
                </div>
                <InkTag tone="neutral" variant="outline">
                  共同记忆 {coreMemoryCount}
                </InkTag>
              </div>

              {met.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {met.map((relationship) => (
                    <article
                      key={relationship.roleKey}
                      className="border-ink/12 bg-bgpaper/70 border border-dashed px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-ink text-sm font-medium">
                          {relationship.npcName}
                        </h3>
                        <span className="text-crimson text-xs">
                          {relationship.stageLabel}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {relationship.memoryNotes
                          .slice(-3)
                          .map((memory) => (
                            <p
                              key={memory}
                              className="text-ink-secondary text-xs leading-5"
                            >
                              · {memory}
                            </p>
                          ))}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="border-ink/12 bg-ink/[0.02] border-l-2 px-4 py-3">
                  <p className="text-ink text-sm">
                    你还没有和谁真正打过照面。
                  </p>
                  <p className="text-ink-secondary mt-1 text-xs leading-5">
                    点开地图上的人物，第一次回应会成为你们关系里的第一条记忆。
                  </p>
                </div>
              )}

              {strangers.length ? (
                <div className="mt-4">
                  <p className="text-ink-secondary mb-2 text-xs">
                    尚未正式认识
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {strangers.map((relationship) => (
                      <InkTag
                        key={relationship.roleKey}
                        tone="neutral"
                        variant="outline"
                      >
                        {relationship.npcName}
                      </InkTag>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            {continuity.unlocked &&
            continuity.dailyEvents.length > 0 ? (
              <section>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-ink text-sm font-medium">
                      今日坊中见闻
                    </p>
                    <p className="text-ink-secondary mt-1 text-xs leading-5">
                      现有《灯火未迟》后日谈继续保留；正式20人的日常事件会直接接在同一套关系系统上。
                    </p>
                  </div>
                  <InkTag tone="neutral" variant="outline">
                    {continuity.completedToday}/
                    {continuity.dailyEvents.length}
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
                            <h3 className="text-ink text-sm font-medium">
                              {event.title}
                            </h3>
                            <span className="text-ink-secondary text-xs">
                              {event.npcName} · {event.locationName}
                            </span>
                          </div>
                          <p className="text-ink-secondary mt-1 text-sm leading-6">
                            {event.summary}
                          </p>
                        </div>
                        {event.completed ? (
                          <span className="text-ink-secondary shrink-0 text-xs">
                            已记下
                          </span>
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
            ) : null}
          </>
        )}
      </div>
    </InkDetailDrawer>
  );
}
