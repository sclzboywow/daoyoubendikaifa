import { getExecutor, type DbExecutor } from '@server/lib/drizzle/db';
import { wanxiSceneEditorStates } from '@server/lib/drizzle/schema';
import type { WanxiMapCalibrationDraft } from '@shared/engine/wanxi/calibration';
import { eq, sql } from 'drizzle-orm';

export async function findWanxiSceneEditorState(
  sceneId: string,
  executor?: DbExecutor,
) {
  const db = executor ?? getExecutor();
  return db.query.wanxiSceneEditorStates.findFirst({
    where: eq(wanxiSceneEditorStates.sceneId, sceneId),
  });
}

export async function saveWanxiSceneEditorState(
  args: {
    sceneId: string;
    payload: WanxiMapCalibrationDraft;
    updatedByUserId: string | null;
  },
  executor?: DbExecutor,
) {
  const db = executor ?? getExecutor();
  const now = new Date();
  const [row] = await db
    .insert(wanxiSceneEditorStates)
    .values({
      sceneId: args.sceneId,
      revision: 1,
      payload: args.payload,
      updatedByUserId: args.updatedByUserId,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: wanxiSceneEditorStates.sceneId,
      set: {
        payload: args.payload,
        updatedByUserId: args.updatedByUserId,
        revision: sql`${wanxiSceneEditorStates.revision} + 1`,
        updatedAt: now,
      },
    })
    .returning();

  if (!row) {
    throw new Error('万戏坊地图配置保存失败');
  }
  return row;
}
