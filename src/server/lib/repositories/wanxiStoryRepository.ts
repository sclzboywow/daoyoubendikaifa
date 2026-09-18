import { getExecutor, type DbExecutor, type DbTransaction } from '@server/lib/drizzle/db';
import { wanxiStoryProgress } from '@server/lib/drizzle/schema';
import type { WanxiLampStoryStage } from '@shared/engine/wanxi';
import { and, eq } from 'drizzle-orm';

export type WanxiStoryProgressState = Record<string, unknown>;

export interface WanxiStoryProgressRecord {
  id: string;
  cultivatorId: string;
  storyId: string;
  stage: WanxiLampStoryStage;
  schemaVersion: number;
  state: WanxiStoryProgressState;
  startedAt: Date;
  completedAt: Date | null;
}

function normalizeState(value: unknown): WanxiStoryProgressState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as WanxiStoryProgressState;
}

export async function findWanxiStoryProgress(
  cultivatorId: string,
  storyId: string,
  executor?: DbExecutor | DbTransaction,
): Promise<WanxiStoryProgressRecord | null> {
  const q = executor ?? getExecutor();
  const [row] = await q
    .select({
      id: wanxiStoryProgress.id,
      cultivatorId: wanxiStoryProgress.cultivatorId,
      storyId: wanxiStoryProgress.storyId,
      stage: wanxiStoryProgress.stage,
      schemaVersion: wanxiStoryProgress.schemaVersion,
      state: wanxiStoryProgress.state,
      startedAt: wanxiStoryProgress.startedAt,
      completedAt: wanxiStoryProgress.completedAt,
    })
    .from(wanxiStoryProgress)
    .where(
      and(
        eq(wanxiStoryProgress.cultivatorId, cultivatorId),
        eq(wanxiStoryProgress.storyId, storyId),
      ),
    )
    .limit(1);
  if (!row) return null;
  return {
    ...row,
    stage: row.stage as WanxiLampStoryStage,
    state: normalizeState(row.state),
  };
}

export async function saveWanxiStoryProgress(
  args: {
    cultivatorId: string;
    storyId: string;
    stage: WanxiLampStoryStage;
    schemaVersion: number;
    state?: WanxiStoryProgressState;
    completedAt?: Date | null;
  },
  tx: DbTransaction,
): Promise<WanxiStoryProgressRecord> {
  const current = await findWanxiStoryProgress(args.cultivatorId, args.storyId, tx);
  if (!current) {
    const [inserted] = await tx
      .insert(wanxiStoryProgress)
      .values({
        cultivatorId: args.cultivatorId,
        storyId: args.storyId,
        stage: args.stage,
        schemaVersion: args.schemaVersion,
        state: args.state ?? {},
        completedAt: args.completedAt ?? null,
      })
      .returning();
    if (!inserted) throw new Error('万戏坊剧情进度创建失败');
    return {
      ...inserted,
      stage: inserted.stage as WanxiLampStoryStage,
      state: normalizeState(inserted.state),
    };
  }

  const [updated] = await tx
    .update(wanxiStoryProgress)
    .set({
      stage: args.stage,
      schemaVersion: args.schemaVersion,
      state: args.state ?? current.state,
      completedAt: args.completedAt ?? current.completedAt,
    })
    .where(eq(wanxiStoryProgress.id, current.id))
    .returning();
  if (!updated) throw new Error('万戏坊剧情进度更新失败');
  return {
    ...updated,
    stage: updated.stage as WanxiLampStoryStage,
    state: normalizeState(updated.state),
  };
}
