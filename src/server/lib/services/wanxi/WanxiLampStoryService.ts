import type { DbTransaction } from '@server/lib/drizzle/db';
import {
  findWanxiStoryProgress,
  saveWanxiStoryProgress,
} from '@server/lib/repositories/wanxiStoryRepository';
import { playerCommandExecutor } from '@server/lib/services/CommandExecutors';
import { MailService } from '@server/lib/services/MailService';
import { RESOURCE_DATA_SCHEMAS } from '@shared/contracts/resources';
import type { ResourceChangeDescriptor } from '@shared/contracts/resources';
import {
  addMaterialToInventoryInTransaction,
  removeMaterialFromInventoryInTransaction,
} from '@server/lib/services/cultivator/CultivatorInventoryRepository';
import { loadCultivatorCombatInput } from '@server/lib/services/cultivator/CultivatorCombatProjectionReader';
import { updateCultivator } from '@server/lib/services/cultivator/CultivatorStateRepository';
import { executePersistentWorldBattle } from '@server/lib/services/BattleStateCoordinator';
import { EnemyGenerator } from '@shared/engine/enemyGenerator';
import {
  applyWanxiStoryBattleLoadout,
  applyWanxiStoryNewcomerAttributeCap,
  assessWanxiStoryCombatReadiness,
  createWanxiLampStorySnapshot,
  resolveWanxiStoryBattleTuning,
  WANXI_LAMP_CONTRACT_SPIRIT_BATTLE_PROFILE,
  resolveWanxiLampStoryTransition,
  WANXI_LAMP_STORY_ACTIONS,
  WANXI_LAMP_STORY_ID,
  WANXI_LAMP_STORY_ITEMS,
  WANXI_LAMP_STORY_SCHEMA_VERSION,
  type WanxiLampStoryActionId,
  type WanxiLampStorySnapshot,
  type WanxiLampStoryStage,
} from '@shared/engine/wanxi';
import type { CultivatorCombatInput } from '@shared/engine/battle-v5/adapters/CultivatorCombatAdapter';
import type { Material } from '@shared/types/cultivator';

export class WanxiLampStoryError extends Error {
  constructor(
    message: string,
    public readonly status = 409,
  ) {
    super(message);
    this.name = 'WanxiLampStoryError';
  }
}

function material(value: Omit<Material, 'id'>): Material {
  return { ...value };
}

function inventoryInvalidation(eventType: string): ResourceChangeDescriptor {
  return {
    resourceTopic: 'inventory.materials',
    eventType,
    operation: 'invalidate',
  };
}

async function loadStage(
  cultivatorId: string,
  tx?: DbTransaction,
): Promise<{
  stage: WanxiLampStoryStage;
  state: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
}> {
  const progress = await findWanxiStoryProgress(cultivatorId, WANXI_LAMP_STORY_ID, tx);
  if (!progress) return { stage: 'not_started', state: {} };
  return {
    stage: progress.stage,
    state: progress.state,
    startedAt: progress.startedAt.toISOString(),
    ...(progress.completedAt
      ? { completedAt: progress.completedAt.toISOString() }
      : {}),
  };
}

export async function getWanxiLampStorySnapshot(
  cultivatorId: string,
): Promise<WanxiLampStorySnapshot> {
  return createWanxiLampStorySnapshot(await loadStage(cultivatorId));
}

async function persistStage(
  cultivatorId: string,
  stage: WanxiLampStoryStage,
  tx: DbTransaction,
  state?: Record<string, unknown>,
) {
  return saveWanxiStoryProgress(
    {
      cultivatorId,
      storyId: WANXI_LAMP_STORY_ID,
      stage,
      schemaVersion: WANXI_LAMP_STORY_SCHEMA_VERSION,
      ...(state ? { state } : {}),
      completedAt: stage === 'completed' ? new Date() : null,
    },
    tx,
  );
}

async function grant(
  cultivatorId: string,
  item: Omit<Material, 'id'>,
  tx: DbTransaction,
) {
  await addMaterialToInventoryInTransaction(cultivatorId, material(item), tx);
}

async function consume(
  cultivatorId: string,
  name: string,
  quantity: number,
  tx: DbTransaction,
) {
  try {
    await removeMaterialFromInventoryInTransaction(
      cultivatorId,
      name,
      quantity,
      tx,
    );
  } catch (error) {
    throw new WanxiLampStoryError(
      error instanceof Error ? error.message : `缺少 ${name}`,
      409,
    );
  }
}

async function applyStoryActionSideEffects(
  cultivatorId: string,
  actionId: WanxiLampStoryActionId,
  tx: DbTransaction,
): Promise<ResourceChangeDescriptor[]> {
  switch (actionId) {
    case WANXI_LAMP_STORY_ACTIONS.START:
      await grant(cultivatorId, WANXI_LAMP_STORY_ITEMS.OLD_TASSEL, tx);
      return [inventoryInvalidation('inventory.wanxi-lamp.old-tassel')];
    case WANXI_LAMP_STORY_ACTIONS.TAKE_MOONSILK:
      await grant(cultivatorId, WANXI_LAMP_STORY_ITEMS.MOON_SILK, tx);
      return [inventoryInvalidation('inventory.wanxi-lamp.moon-silk')];
    case WANXI_LAMP_STORY_ACTIONS.REPAIR_TASSEL:
      await consume(cultivatorId, WANXI_LAMP_STORY_ITEMS.MOON_SILK.name, 3, tx);
      await consume(cultivatorId, WANXI_LAMP_STORY_ITEMS.OLD_TASSEL.name, 1, tx);
      await grant(cultivatorId, WANXI_LAMP_STORY_ITEMS.REPAIRED_TASSEL, tx);
      return [inventoryInvalidation('inventory.wanxi-lamp.tassel-repaired')];
    case WANXI_LAMP_STORY_ACTIONS.CONFRONTATION:
      await consume(
        cultivatorId,
        WANXI_LAMP_STORY_ITEMS.REPAIRED_TASSEL.name,
        1,
        tx,
      );
      return [inventoryInvalidation('inventory.wanxi-lamp.tassel-returned')];
    case WANXI_LAMP_STORY_ACTIONS.TAKE_CONTRACT_SAND:
      await grant(cultivatorId, WANXI_LAMP_STORY_ITEMS.CONTRACT_SAND, tx);
      return [inventoryInvalidation('inventory.wanxi-lamp.contract-sand')];
    case WANXI_LAMP_STORY_ACTIONS.REVEAL_CONTRACT:
      await consume(
        cultivatorId,
        WANXI_LAMP_STORY_ITEMS.CONTRACT_SAND.name,
        1,
        tx,
      );
      return [inventoryInvalidation('inventory.wanxi-lamp.contract-revealed')];
    case WANXI_LAMP_STORY_ACTIONS.SHOW_CONTRACT:
      await consume(
        cultivatorId,
        WANXI_LAMP_STORY_ITEMS.BURNED_CONTRACT.name,
        1,
        tx,
      );
      await grant(cultivatorId, WANXI_LAMP_STORY_ITEMS.CASKET_KEY, tx);
      return [inventoryInvalidation('inventory.wanxi-lamp.contract-shown')];
    case WANXI_LAMP_STORY_ACTIONS.RETRIEVE_CASKET:
      await consume(cultivatorId, WANXI_LAMP_STORY_ITEMS.CASKET_KEY.name, 1, tx);
      await grant(cultivatorId, WANXI_LAMP_STORY_ITEMS.OLD_CASKET, tx);
      await grant(cultivatorId, WANXI_LAMP_STORY_ITEMS.LIN_HALF_CLASP, tx);
      return [inventoryInvalidation('inventory.wanxi-lamp.casket-retrieved')];
    case WANXI_LAMP_STORY_ACTIONS.RETURN_CASKET:
      await consume(cultivatorId, WANXI_LAMP_STORY_ITEMS.OLD_CASKET.name, 1, tx);
      return [inventoryInvalidation('inventory.wanxi-lamp.casket-returned')];
    case WANXI_LAMP_STORY_ACTIONS.REUNION:
      await consume(cultivatorId, WANXI_LAMP_STORY_ITEMS.QI_HALF_CLASP.name, 1, tx);
      await consume(cultivatorId, WANXI_LAMP_STORY_ITEMS.LIN_HALF_CLASP.name, 1, tx);
      await MailService.sendMail(
        cultivatorId,
        '【万戏坊 · 灯火未迟】',
        '几日后，祁望川托人送来一盏新灯。做得并不精巧，灯腹里也没有刻任何誓言。随灯附着一句话：有些路不必保证走到哪里，愿意并肩再走一段，便已经很好。',
        [
          {
            type: 'material',
            name: WANXI_LAMP_STORY_ITEMS.NEW_HEART_LAMP.name,
            quantity: 1,
            data: material(WANXI_LAMP_STORY_ITEMS.NEW_HEART_LAMP),
          },
          { type: 'spirit_stones', name: '灵石', quantity: 1000 },
        ],
        'reward',
        tx,
      );
      return [inventoryInvalidation('inventory.wanxi-lamp.reconciled')];
    default:
      return [];
  }
}

export async function executeWanxiLampStoryAction(args: {
  userId: string;
  cultivatorId: string;
  actionId: Exclude<WanxiLampStoryActionId, 'wanxi.story.lamp.battle'>;
}) {
  return playerCommandExecutor.executeWithLock({
    userId: args.userId,
    cultivatorId: args.cultivatorId,
    source: 'wanxi_lamp_story_action',
    allowEmpty: true,
    command: async (tx) => {
      const current = await loadStage(args.cultivatorId, tx);
      const nextStage = resolveWanxiLampStoryTransition(current.stage, args.actionId);
      if (!nextStage) {
        throw new WanxiLampStoryError('眼下还不能这样推进这段故事');
      }

      const resourceChanges = await applyStoryActionSideEffects(
        args.cultivatorId,
        args.actionId,
        tx,
      );
      const saved = await persistStage(args.cultivatorId, nextStage, tx);
      return {
        result: {
          story: createWanxiLampStorySnapshot({
            stage: saved.stage,
            startedAt: saved.startedAt.toISOString(),
            completedAt: saved.completedAt?.toISOString(),
          }),
        },
        resourceChanges,
      };
    },
  });
}

const lampStoryEnemyGenerator = new EnemyGenerator();

function readBattleLosses(state: Record<string, unknown>): number {
  const value = state.battleLosses;
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;
}

function buildContractSpirit(args: {
  player: CultivatorCombatInput;
  battleLosses: number;
}) {
  const profile = WANXI_LAMP_CONTRACT_SPIRIT_BATTLE_PROFILE;
  const readiness = assessWanxiStoryCombatReadiness(args.player);
  const tuning = resolveWanxiStoryBattleTuning({
    profile,
    realm: args.player.realm,
    battleLosses: args.battleLosses,
    readiness,
  });
  const draft = lampStoryEnemyGenerator.buildDraft({
    realm: args.player.realm,
    realmStage: '初期',
    race: profile.race,
    difficulty: tuning.difficulty,
    isBoss: profile.isBoss,
    name: '索契灵·残契执事',
    background:
      '旧灵契残存的索债意志。它并非真正的修士，只会依照契文追索未清之债；每次被击退，契纹都会进一步崩裂。祁望川也在旁牵制契纹。',
    description:
      '幽蓝契纹缠成的人形残影，气息锚定挑战者当前大境界，却只有初期根基。对战斗准备不足的新修士，护灯会进一步压住残契之力。',
  });
  const bareOpponent = applyWanxiStoryBattleLoadout(draft.cultivator, profile);
  const opponent = applyWanxiStoryNewcomerAttributeCap(
    bareOpponent,
    args.player,
    tuning.enemyAttributeCapMultiplier,
  );
  return { opponent, tuning };
}

export async function executeWanxiLampStoryBattle(args: {
  userId: string;
  cultivatorId: string;
}) {
  return playerCommandExecutor.executeWithLock({
    userId: args.userId,
    cultivatorId: args.cultivatorId,
    source: 'wanxi_lamp_story_battle',
    command: async (tx) => {
      const current = await loadStage(args.cultivatorId, tx);
      if (current.stage !== 'battle_ready') {
        throw new WanxiLampStoryError('旧契尚未显形，索契灵也无从现身');
      }

      const loaded = await loadCultivatorCombatInput(args.cultivatorId, tx);
      if (!loaded) throw new WanxiLampStoryError('当前角色无法进入战斗', 404);
      const battleLosses = readBattleLosses(current.state);
      const { opponent, tuning } = buildContractSpirit({
        player: loaded.cultivator,
        battleLosses,
      });
      const hp = loaded.cultivator.condition?.resources.hp;
      const hpMax = hp?.max ?? 0;
      const hpCurrent = hp?.current ?? 0;
      if (
        tuning.newcomerProtection &&
        hpMax > 0 &&
        hpCurrent / hpMax < 0.45
      ) {
        throw new WanxiLampStoryError('你现在伤势太重。祁望川已经把旧契压住，先去灵眼之泉稳住伤势，再回来也不迟。');
      }
      const execution = executePersistentWorldBattle({
        strategyId: 'persistent_world',
        player: loaded.cultivator,
        opponent,
        ...(tuning.newcomerProtection
          ? {
              playerFragment: {
                resourceState: {
                  shield: { mode: 'percent' as const, value: 0.35 },
                },
              },
            }
          : {}),
      });
      const savedCondition = await updateCultivator(
        args.cultivatorId,
        { condition: execution.nextCondition },
        tx,
      );
      if (!savedCondition) throw new WanxiLampStoryError('战斗状态保存失败', 500);

      const resourceChanges: ResourceChangeDescriptor[] = [
        {
          resourceTopic: 'player.condition',
          eventType: 'condition.wanxi-lamp.battle-settled',
          operation: 'replace',
          payload: RESOURCE_DATA_SCHEMAS['player.condition'].parse(
            execution.nextCondition,
          ),
        },
      ];

      let stage: WanxiLampStoryStage = current.stage;
      let startedAt = current.startedAt;
      let completedAt = current.completedAt;
      if (!execution.didLose) {
        await grant(args.cultivatorId, WANXI_LAMP_STORY_ITEMS.BURNED_CONTRACT, tx);
        await grant(args.cultivatorId, WANXI_LAMP_STORY_ITEMS.QI_HALF_CLASP, tx);
        resourceChanges.push(
          inventoryInvalidation('inventory.wanxi-lamp.contract-spirit-defeated'),
        );
        const saved = await persistStage(args.cultivatorId, 'show_contract', tx, {
          ...current.state,
          battleLosses,
          lastBattleDifficulty: tuning.difficulty,
          battleClearedAt: new Date().toISOString(),
        });
        stage = saved.stage;
        startedAt = saved.startedAt.toISOString();
        completedAt = saved.completedAt?.toISOString();
      } else {
        await persistStage(args.cultivatorId, 'battle_ready', tx, {
          ...current.state,
          battleLosses: battleLosses + 1,
          lastBattleDifficulty: tuning.difficulty,
          lastBattleFailedAt: new Date().toISOString(),
        });
      }

      return {
        result: {
          story: createWanxiLampStorySnapshot({ stage, startedAt, completedAt }),
          battleResult: execution.battleResult,
          challengeTitle: '旧契索命',
          isWin: !execution.didLose,
          battleTuning: tuning,
        },
        resourceChanges,
      };
    },
  });
}
