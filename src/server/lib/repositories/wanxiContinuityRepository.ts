import { getExecutor, type DbExecutor, type DbTransaction } from '@server/lib/drizzle/db';
import {
  wanxiDailyEventProgress,
  wanxiNpcRelationships,
} from '@server/lib/drizzle/schema';
import type { WanxiNpcRoleKey } from '@shared/engine/wanxi';
import { and, eq } from 'drizzle-orm';

export interface WanxiNpcRelationshipRecord {
  id: string;
  cultivatorId: string;
  npcRoleKey: WanxiNpcRoleKey;
  familiarity: number;
  interactionCount: number;
  memoryTags: string[];
  milestones: string[];
  lastInteractionAt: Date | null;
}

export interface WanxiDailyEventProgressRecord {
  id: string;
  cultivatorId: string;
  eventDate: string;
  eventId: string;
  completedAt: Date;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0))];
}

function mapRelationship(row: typeof wanxiNpcRelationships.$inferSelect): WanxiNpcRelationshipRecord {
  return {
    id: row.id,
    cultivatorId: row.cultivatorId,
    npcRoleKey: row.npcRoleKey as WanxiNpcRoleKey,
    familiarity: Math.max(0, row.familiarity),
    interactionCount: Math.max(0, row.interactionCount),
    memoryTags: stringArray(row.memoryTags),
    milestones: stringArray(row.milestones),
    lastInteractionAt: row.lastInteractionAt,
  };
}

export async function listWanxiNpcRelationships(
  cultivatorId: string,
  executor?: DbExecutor | DbTransaction,
): Promise<WanxiNpcRelationshipRecord[]> {
  const q = executor ?? getExecutor();
  const rows = await q
    .select()
    .from(wanxiNpcRelationships)
    .where(eq(wanxiNpcRelationships.cultivatorId, cultivatorId));
  return rows.map(mapRelationship);
}

export async function findWanxiNpcRelationship(
  cultivatorId: string,
  npcRoleKey: WanxiNpcRoleKey,
  executor?: DbExecutor | DbTransaction,
): Promise<WanxiNpcRelationshipRecord | null> {
  const q = executor ?? getExecutor();
  const [row] = await q
    .select()
    .from(wanxiNpcRelationships)
    .where(
      and(
        eq(wanxiNpcRelationships.cultivatorId, cultivatorId),
        eq(wanxiNpcRelationships.npcRoleKey, npcRoleKey),
      ),
    )
    .limit(1);
  return row ? mapRelationship(row) : null;
}

export async function saveWanxiNpcRelationship(
  args: {
    cultivatorId: string;
    npcRoleKey: WanxiNpcRoleKey;
    familiarity: number;
    interactionCount: number;
    memoryTags: readonly string[];
    milestones?: readonly string[];
    lastInteractionAt?: Date | null;
  },
  tx: DbTransaction,
): Promise<WanxiNpcRelationshipRecord> {
  const current = await findWanxiNpcRelationship(
    args.cultivatorId,
    args.npcRoleKey,
    tx,
  );
  const values = {
    familiarity: Math.max(0, Math.floor(args.familiarity)),
    interactionCount: Math.max(0, Math.floor(args.interactionCount)),
    memoryTags: [...new Set(args.memoryTags)],
    milestones: [...new Set(args.milestones ?? current?.milestones ?? [])],
    lastInteractionAt: args.lastInteractionAt ?? new Date(),
  };
  if (!current) {
    const [inserted] = await tx
      .insert(wanxiNpcRelationships)
      .values({
        cultivatorId: args.cultivatorId,
        npcRoleKey: args.npcRoleKey,
        ...values,
      })
      .returning();
    if (!inserted) throw new Error('万戏坊人物关系创建失败');
    return mapRelationship(inserted);
  }
  const [updated] = await tx
    .update(wanxiNpcRelationships)
    .set(values)
    .where(eq(wanxiNpcRelationships.id, current.id))
    .returning();
  if (!updated) throw new Error('万戏坊人物关系更新失败');
  return mapRelationship(updated);
}

export async function listWanxiDailyEventProgress(
  cultivatorId: string,
  eventDate: string,
  executor?: DbExecutor | DbTransaction,
): Promise<WanxiDailyEventProgressRecord[]> {
  const q = executor ?? getExecutor();
  return q
    .select({
      id: wanxiDailyEventProgress.id,
      cultivatorId: wanxiDailyEventProgress.cultivatorId,
      eventDate: wanxiDailyEventProgress.eventDate,
      eventId: wanxiDailyEventProgress.eventId,
      completedAt: wanxiDailyEventProgress.completedAt,
    })
    .from(wanxiDailyEventProgress)
    .where(
      and(
        eq(wanxiDailyEventProgress.cultivatorId, cultivatorId),
        eq(wanxiDailyEventProgress.eventDate, eventDate),
      ),
    );
}

export async function findWanxiDailyEventProgress(
  cultivatorId: string,
  eventDate: string,
  eventId: string,
  executor?: DbExecutor | DbTransaction,
): Promise<WanxiDailyEventProgressRecord | null> {
  const q = executor ?? getExecutor();
  const [row] = await q
    .select({
      id: wanxiDailyEventProgress.id,
      cultivatorId: wanxiDailyEventProgress.cultivatorId,
      eventDate: wanxiDailyEventProgress.eventDate,
      eventId: wanxiDailyEventProgress.eventId,
      completedAt: wanxiDailyEventProgress.completedAt,
    })
    .from(wanxiDailyEventProgress)
    .where(
      and(
        eq(wanxiDailyEventProgress.cultivatorId, cultivatorId),
        eq(wanxiDailyEventProgress.eventDate, eventDate),
        eq(wanxiDailyEventProgress.eventId, eventId),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function completeWanxiDailyEvent(
  args: { cultivatorId: string; eventDate: string; eventId: string },
  tx: DbTransaction,
): Promise<WanxiDailyEventProgressRecord> {
  const current = await findWanxiDailyEventProgress(
    args.cultivatorId,
    args.eventDate,
    args.eventId,
    tx,
  );
  if (current) return current;
  const [inserted] = await tx
    .insert(wanxiDailyEventProgress)
    .values({
      cultivatorId: args.cultivatorId,
      eventDate: args.eventDate,
      eventId: args.eventId,
    })
    .returning({
      id: wanxiDailyEventProgress.id,
      cultivatorId: wanxiDailyEventProgress.cultivatorId,
      eventDate: wanxiDailyEventProgress.eventDate,
      eventId: wanxiDailyEventProgress.eventId,
      completedAt: wanxiDailyEventProgress.completedAt,
    });
  if (!inserted) throw new Error('万戏坊今日见闻记录失败');
  return inserted;
}
