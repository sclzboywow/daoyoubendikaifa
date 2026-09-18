import type { Material } from '@shared/types/cultivator';
import type {
  WanxiLocationId,
  WanxiNpcPlacement,
  WanxiNpcRoleKey,
} from '../types';

export const WANXI_LAMP_STORY_ID = 'wanxi.story.lamp_v1' as const;
export const WANXI_LAMP_STORY_TITLE = '灯火未迟' as const;
export const WANXI_LAMP_STORY_SCHEMA_VERSION = 1 as const;

export const WANXI_LAMP_STORY_STAGES = [
  'not_started',
  'deliver_tassel',
  'return_to_lu',
  'find_artisan',
  'gather_moonsilk',
  'repair_tassel',
  'return_repaired_tassel',
  'after_confrontation',
  'seek_jiang',
  'gather_contract_sand',
  'reveal_contract',
  'battle_ready',
  'show_contract',
  'retrieve_casket',
  'return_casket',
  'reunion',
  'completed',
] as const;

export type WanxiLampStoryStage = (typeof WANXI_LAMP_STORY_STAGES)[number];

export const WANXI_LAMP_STORY_ACTIONS = {
  START: 'wanxi.story.lamp.start',
  LIN_REFUSES: 'wanxi.story.lamp.lin-refuses',
  LU_CLUE: 'wanxi.story.lamp.lu-clue',
  QI_INSPECTS: 'wanxi.story.lamp.qi-inspects',
  TAKE_MOONSILK: 'wanxi.story.lamp.take-moonsilk',
  REPAIR_TASSEL: 'wanxi.story.lamp.repair-tassel',
  CONFRONTATION: 'wanxi.story.lamp.confrontation',
  QI_COUGHS: 'wanxi.story.lamp.qi-coughs',
  JIANG_DIAGNOSES: 'wanxi.story.lamp.jiang-diagnoses',
  TAKE_CONTRACT_SAND: 'wanxi.story.lamp.take-contract-sand',
  REVEAL_CONTRACT: 'wanxi.story.lamp.reveal-contract',
  BATTLE: 'wanxi.story.lamp.battle',
  SHOW_CONTRACT: 'wanxi.story.lamp.show-contract',
  RETRIEVE_CASKET: 'wanxi.story.lamp.retrieve-casket',
  RETURN_CASKET: 'wanxi.story.lamp.return-casket',
  REUNION: 'wanxi.story.lamp.reunion',
} as const;

export type WanxiLampStoryActionId =
  (typeof WANXI_LAMP_STORY_ACTIONS)[keyof typeof WANXI_LAMP_STORY_ACTIONS];

export interface WanxiLampStorySnapshot {
  storyId: typeof WANXI_LAMP_STORY_ID;
  title: typeof WANXI_LAMP_STORY_TITLE;
  schemaVersion: typeof WANXI_LAMP_STORY_SCHEMA_VERSION;
  stage: WanxiLampStoryStage;
  objective: string;
  summary: string;
  completed: boolean;
  startedAt?: string;
  completedAt?: string;
}

export interface WanxiLampStoryMessage {
  id: string;
  speaker?: string;
  body: string;
  gesture?: string;
  tone?: 'normal' | 'muted' | 'attention';
  emotion?: 'calm' | 'hesitate' | 'anger' | 'sadness' | 'relief';
  pauseAfterMs?: number;
}

export type WanxiLampNarrativeTarget =
  | { type: 'npc'; roleKey: WanxiNpcRoleKey }
  | { type: 'location'; locationId: WanxiLocationId };

export interface WanxiLampStoryActionPresentation {
  kicker: string;
  title: string;
  body?: string;
}

export type WanxiLampStoryAttentionTarget =
  | { type: 'npc'; npcId: string }
  | { type: 'location'; locationId: WanxiLocationId }
  | null;

export const WANXI_LAMP_STORY_NPC_IDS = {
  LIN: 'wanxi_npc_stage_musician',
  QI: 'wanxi_npc_mechanist',
  LU: 'wanxi_npc_gate_steward',
  JIANG: 'wanxi_npc_lakeside_guest',
  NING: 'wanxi_npc_roaming_merchant',
} as const;

export const WANXI_LAMP_STORY_ITEMS = {
  OLD_TASSEL: {
    name: '旧灯穗',
    type: 'aux',
    rank: '凡品',
    quantity: 1,
    description: '一截已经褪色的灯穗，线脚极细，看上去被人重新缝过很多次。',
    details: { storyId: WANXI_LAMP_STORY_ID, storyItem: 'old_tassel' },
  },
  MOON_SILK: {
    name: '月蚕丝',
    type: 'aux',
    rank: '凡品',
    quantity: 3,
    description: '月色下泛着微光的细丝，韧而不僵，适合修补精巧旧物。',
    details: { storyId: WANXI_LAMP_STORY_ID, storyItem: 'moon_silk' },
  },
  REPAIRED_TASSEL: {
    name: '修补好的旧灯穗',
    type: 'aux',
    rank: '凡品',
    quantity: 1,
    description: '旧穗被月蚕丝重新接好，翻到内侧，能看见两个极小的旧字：照晚。',
    details: { storyId: WANXI_LAMP_STORY_ID, storyItem: 'repaired_tassel' },
  },
  CONTRACT_SAND: {
    name: '沉契砂',
    type: 'aux',
    rank: '凡品',
    quantity: 1,
    description: '听澜水境石隙里沉积的细砂，遇旧灵契会短暂泛出幽蓝纹路。',
    details: { storyId: WANXI_LAMP_STORY_ID, storyItem: 'contract_sand' },
  },
  BURNED_CONTRACT: {
    name: '焦黑灵契',
    type: 'aux',
    rank: '凡品',
    quantity: 1,
    description: '旧契只剩焦黑边角，却仍能辨出“还音露”“三载取物”“以身为抵”等字样。',
    details: { storyId: WANXI_LAMP_STORY_ID, storyItem: 'burned_contract' },
  },
  QI_HALF_CLASP: {
    name: '祁望川的半枚同心扣',
    type: 'aux',
    rank: '凡品',
    quantity: 1,
    description: '一枚木制同心扣的半边，边缘已被摩挲得极为光滑。',
    details: { storyId: WANXI_LAMP_STORY_ID, storyItem: 'qi_half_clasp' },
  },
  CASKET_KEY: {
    name: '旧琴盒钥匙',
    type: 'aux',
    rank: '凡品',
    quantity: 1,
    description: '林照晚交出的旧钥匙，铜齿已有些发暗。',
    details: { storyId: WANXI_LAMP_STORY_ID, storyItem: 'casket_key' },
  },
  OLD_CASKET: {
    name: '林照晚的旧琴盒',
    type: 'aux',
    rank: '凡品',
    quantity: 1,
    description: '多年未开的旧琴盒，里面没有琴，只放着一枚灯穗和半枚木扣。',
    details: { storyId: WANXI_LAMP_STORY_ID, storyItem: 'old_casket' },
  },
  LIN_HALF_CLASP: {
    name: '林照晚的半枚同心扣',
    type: 'aux',
    rank: '凡品',
    quantity: 1,
    description: '另一半木制同心扣。多年过去，主人仍把它收在旧琴盒最里层。',
    details: { storyId: WANXI_LAMP_STORY_ID, storyItem: 'lin_half_clasp' },
  },
  NEW_HEART_LAMP: {
    name: '新制同心灯',
    type: 'aux',
    rank: '灵品',
    quantity: 1,
    description: '一盏做得很普通的小灯。制灯人说，这次没有在里面刻任何誓言。',
    details: { storyId: WANXI_LAMP_STORY_ID, storyItem: 'new_heart_lamp' },
  },
} as const satisfies Record<string, Omit<Material, 'id'>>;

const TRANSITIONS: Readonly<
  Partial<Record<WanxiLampStoryStage, Partial<Record<WanxiLampStoryActionId, WanxiLampStoryStage>>>>
> = {
  not_started: { [WANXI_LAMP_STORY_ACTIONS.START]: 'deliver_tassel' },
  deliver_tassel: { [WANXI_LAMP_STORY_ACTIONS.LIN_REFUSES]: 'return_to_lu' },
  return_to_lu: { [WANXI_LAMP_STORY_ACTIONS.LU_CLUE]: 'find_artisan' },
  find_artisan: { [WANXI_LAMP_STORY_ACTIONS.QI_INSPECTS]: 'gather_moonsilk' },
  gather_moonsilk: { [WANXI_LAMP_STORY_ACTIONS.TAKE_MOONSILK]: 'repair_tassel' },
  repair_tassel: { [WANXI_LAMP_STORY_ACTIONS.REPAIR_TASSEL]: 'return_repaired_tassel' },
  return_repaired_tassel: {
    [WANXI_LAMP_STORY_ACTIONS.CONFRONTATION]: 'after_confrontation',
  },
  after_confrontation: { [WANXI_LAMP_STORY_ACTIONS.QI_COUGHS]: 'seek_jiang' },
  seek_jiang: { [WANXI_LAMP_STORY_ACTIONS.JIANG_DIAGNOSES]: 'gather_contract_sand' },
  gather_contract_sand: {
    [WANXI_LAMP_STORY_ACTIONS.TAKE_CONTRACT_SAND]: 'reveal_contract',
  },
  reveal_contract: { [WANXI_LAMP_STORY_ACTIONS.REVEAL_CONTRACT]: 'battle_ready' },
  show_contract: { [WANXI_LAMP_STORY_ACTIONS.SHOW_CONTRACT]: 'retrieve_casket' },
  retrieve_casket: { [WANXI_LAMP_STORY_ACTIONS.RETRIEVE_CASKET]: 'return_casket' },
  return_casket: { [WANXI_LAMP_STORY_ACTIONS.RETURN_CASKET]: 'reunion' },
  reunion: { [WANXI_LAMP_STORY_ACTIONS.REUNION]: 'completed' },
};

const OBJECTIVES: Record<WanxiLampStoryStage, { objective: string; summary: string }> = {
  not_started: {
    objective: '在坊门附近随意看看',
    summary: '陆清和似乎有件不起眼的小事想请人帮忙。',
  },
  deliver_tassel: {
    objective: '把「旧灯穗」送给百戏台琴师林照晚',
    summary: '陆清和只说是旧物，却没有解释它从哪里来。',
  },
  return_to_lu: {
    objective: '回坊门找陆清和',
    summary: '林照晚只看了一眼便说“不是我的”，却明显认得那截灯穗。',
  },
  find_artisan: {
    objective: '去闲趣西院找新来的机关匠祁望川',
    summary: '陆清和说，若想知道旧物为何坏了，不妨先找个真正懂修补的人。',
  },
  gather_moonsilk: {
    objective: '从宁小满处取三缕月蚕丝',
    summary: '祁望川说灯穗并非坏了，而是少了一半。他需要月蚕丝才能接回旧线脚。',
  },
  repair_tassel: {
    objective: '带着三缕月蚕丝回闲趣西院找祁望川',
    summary: '月蚕丝已经备齐。祁望川似乎比他承认的更熟悉这件旧物。',
  },
  return_repaired_tassel: {
    objective: '去闲趣西院，把修好的灯穗交回林照晚',
    summary: '灯穗内侧露出两个极小的旧字——“照晚”。林照晚不知何时已来到西院外。',
  },
  after_confrontation: {
    objective: '再问问祁望川',
    summary: '两位故人多年后的第一场对话，比沉默更伤人。',
  },
  seek_jiang: {
    objective: '找听澜水境的江听鹤看看祁望川的伤',
    summary: '祁望川突然咳血，却只说是旧伤。那道气息并不像普通伤势。',
  },
  gather_contract_sand: {
    objective: '去听澜水榭取一撮「沉契砂」',
    summary: '江听鹤判断那是灵契反噬。沉契砂能让旧契印记短暂显形。',
  },
  reveal_contract: {
    objective: '把「沉契砂」带给祁望川',
    summary: '水榭石隙里的细砂已经取到。',
  },
  battle_ready: {
    objective: '与索契灵一战，替旧事真正结一笔账',
    summary: '旧契显出了“还音露”“三载取物”“以身为抵”。契纹也唤醒了未散的索契灵。',
  },
  show_contract: {
    objective: '把「焦黑灵契」交给林照晚',
    summary: '索契灵已散。留下的旧契足以证明当年的真相，却未必足以换来原谅。',
  },
  retrieve_casket: {
    objective: '拿「旧琴盒钥匙」去万戏楼旧库取回琴盒',
    summary: '林照晚没有要求你替谁解释，只想确认一件她自己也不敢确认的事。',
  },
  return_casket: {
    objective: '把旧琴盒带回百戏台交给林照晚',
    summary: '琴盒里没有贵重之物，只有另一枚旧灯穗，以及另一半同心扣。',
  },
  reunion: {
    objective: '今夜去听澜水榭',
    summary: '有些话不是为了追回从前，而是为了让两个人终于能从今天重新说起。',
  },
  completed: {
    objective: '《灯火未迟》已完结',
    summary: '他们没有回到当年，只答应重新认识一次。奖励已经随传音玉简寄出。',
  },
};

export function createWanxiLampStorySnapshot(args: {
  stage: WanxiLampStoryStage;
  startedAt?: string | null;
  completedAt?: string | null;
}): WanxiLampStorySnapshot {
  const copy = OBJECTIVES[args.stage];
  return {
    storyId: WANXI_LAMP_STORY_ID,
    title: WANXI_LAMP_STORY_TITLE,
    schemaVersion: WANXI_LAMP_STORY_SCHEMA_VERSION,
    stage: args.stage,
    objective: copy.objective,
    summary: copy.summary,
    completed: args.stage === 'completed',
    ...(args.startedAt ? { startedAt: args.startedAt } : {}),
    ...(args.completedAt ? { completedAt: args.completedAt } : {}),
  };
}

export function resolveWanxiLampStoryTransition(
  stage: WanxiLampStoryStage,
  actionId: WanxiLampStoryActionId,
): WanxiLampStoryStage | null {
  if (stage === 'battle_ready' && actionId === WANXI_LAMP_STORY_ACTIONS.BATTLE) {
    return 'battle_ready';
  }
  return TRANSITIONS[stage]?.[actionId] ?? null;
}

export function isWanxiLampStoryActionId(value: string): value is WanxiLampStoryActionId {
  return Object.values(WANXI_LAMP_STORY_ACTIONS).includes(
    value as WanxiLampStoryActionId,
  );
}


const AI_NARRATIVE_TARGET_KEYS = new Set([
  'deliver_tassel:npc:stage_musician',
  'return_repaired_tassel:location:west_courtyard',
  'after_confrontation:location:west_courtyard',
  'battle_ready:npc:mechanist',
  'show_contract:npc:stage_musician',
  'return_casket:npc:stage_musician',
  'reunion:location:water_pavilion',
]);

export function getWanxiLampNarrativeTargetKey(
  stage: WanxiLampStoryStage,
  target: WanxiLampNarrativeTarget,
): string {
  return target.type === 'npc'
    ? `${stage}:npc:${target.roleKey}`
    : `${stage}:location:${target.locationId}`;
}

export function shouldUseWanxiLampAiNarrative(
  stage: WanxiLampStoryStage,
  target: WanxiLampNarrativeTarget,
): boolean {
  return AI_NARRATIVE_TARGET_KEYS.has(
    getWanxiLampNarrativeTargetKey(stage, target),
  );
}

const ACTION_PRESENTATIONS: Partial<
  Record<WanxiLampStoryActionId, WanxiLampStoryActionPresentation>
> = {
  [WANXI_LAMP_STORY_ACTIONS.START]: { kicker: '获得物品', title: '旧灯穗 ×1', body: '褪色的线脚很细，像是被人反复修过。' },
  [WANXI_LAMP_STORY_ACTIONS.TAKE_MOONSILK]: { kicker: '获得物品', title: '月蚕丝 ×3', body: '细丝在光下泛着很淡的银白。' },
  [WANXI_LAMP_STORY_ACTIONS.REPAIR_TASSEL]: { kicker: '旧物修复', title: '修补好的旧灯穗', body: '翻到内侧，两个旧字终于露了出来：照晚。' },
  [WANXI_LAMP_STORY_ACTIONS.TAKE_CONTRACT_SAND]: { kicker: '获得物品', title: '沉契砂 ×1', body: '细砂触到掌心时，隐约泛起幽蓝契纹。' },
  [WANXI_LAMP_STORY_ACTIONS.SHOW_CONTRACT]: { kicker: '获得物品', title: '旧琴盒钥匙 ×1', body: '林照晚没有替任何人作答，只把一把旧钥匙放到你手里。' },
  [WANXI_LAMP_STORY_ACTIONS.RETRIEVE_CASKET]: { kicker: '旧库所得', title: '林照晚的旧琴盒', body: '盒中没有琴，只有旧灯穗与另一半同心扣。' },
  [WANXI_LAMP_STORY_ACTIONS.REUNION]: { kicker: '支线完结', title: '灯火未迟', body: '他们没有回到当年，只答应从今天重新认识。奖励已寄往传音玉简。' },
};

export function getWanxiLampStoryActionPresentation(
  actionId: WanxiLampStoryActionId,
): WanxiLampStoryActionPresentation | null {
  return ACTION_PRESENTATIONS[actionId] ?? null;
}

export function getWanxiLampStoryActiveBindingIds(
  stage: WanxiLampStoryStage,
): readonly WanxiLampStoryActionId[] {
  const stageActions: Partial<Record<WanxiLampStoryStage, WanxiLampStoryActionId>> = {
    not_started: WANXI_LAMP_STORY_ACTIONS.START,
    deliver_tassel: WANXI_LAMP_STORY_ACTIONS.LIN_REFUSES,
    return_to_lu: WANXI_LAMP_STORY_ACTIONS.LU_CLUE,
    find_artisan: WANXI_LAMP_STORY_ACTIONS.QI_INSPECTS,
    gather_moonsilk: WANXI_LAMP_STORY_ACTIONS.TAKE_MOONSILK,
    repair_tassel: WANXI_LAMP_STORY_ACTIONS.REPAIR_TASSEL,
    return_repaired_tassel: WANXI_LAMP_STORY_ACTIONS.CONFRONTATION,
    after_confrontation: WANXI_LAMP_STORY_ACTIONS.QI_COUGHS,
    seek_jiang: WANXI_LAMP_STORY_ACTIONS.JIANG_DIAGNOSES,
    gather_contract_sand: WANXI_LAMP_STORY_ACTIONS.TAKE_CONTRACT_SAND,
    reveal_contract: WANXI_LAMP_STORY_ACTIONS.REVEAL_CONTRACT,
    battle_ready: WANXI_LAMP_STORY_ACTIONS.BATTLE,
    show_contract: WANXI_LAMP_STORY_ACTIONS.SHOW_CONTRACT,
    retrieve_casket: WANXI_LAMP_STORY_ACTIONS.RETRIEVE_CASKET,
    return_casket: WANXI_LAMP_STORY_ACTIONS.RETURN_CASKET,
    reunion: WANXI_LAMP_STORY_ACTIONS.REUNION,
  };
  const action = stageActions[stage];
  return action ? [action] : [];
}

export function getWanxiLampStoryAttentionTarget(
  stage: WanxiLampStoryStage,
): WanxiLampStoryAttentionTarget {
  switch (stage) {
    case 'not_started':
    case 'return_to_lu':
      return { type: 'npc', npcId: WANXI_LAMP_STORY_NPC_IDS.LU };
    case 'deliver_tassel':
    case 'show_contract':
    case 'return_casket':
      return { type: 'npc', npcId: WANXI_LAMP_STORY_NPC_IDS.LIN };
    case 'find_artisan':
    case 'repair_tassel':
    case 'after_confrontation':
    case 'reveal_contract':
    case 'battle_ready':
      return { type: 'npc', npcId: WANXI_LAMP_STORY_NPC_IDS.QI };
    case 'gather_moonsilk':
      return { type: 'npc', npcId: WANXI_LAMP_STORY_NPC_IDS.NING };
    case 'return_repaired_tassel':
      return { type: 'location', locationId: 'west_courtyard' };
    case 'seek_jiang':
      return { type: 'npc', npcId: WANXI_LAMP_STORY_NPC_IDS.JIANG };
    case 'gather_contract_sand':
    case 'reunion':
      return { type: 'location', locationId: 'water_pavilion' };
    case 'retrieve_casket':
      return { type: 'location', locationId: 'main_hall' };
    case 'completed':
      return null;
  }
}

function storyNpcPlacement(
  npcId: string,
  regionId: WanxiNpcPlacement['regionId'],
  locationId: string,
  x: number,
  y: number,
  attention = false,
): WanxiNpcPlacement {
  return {
    npcId,
    regionId,
    locationId,
    point: { x, y },
    anchor: 'bottom',
    priority: 150,
    attention,
    marker: { importance: 'major', minScale: 0.42 },
  };
}

export function getWanxiLampStoryNpcPlacements(
  stage: WanxiLampStoryStage,
): readonly WanxiNpcPlacement[] {
  const attention = getWanxiLampStoryAttentionTarget(stage);
  const isNpcAttention = (npcId: string) =>
    attention?.type === 'npc' && attention.npcId === npcId;

  if (stage === 'reunion') {
    return [
      storyNpcPlacement(WANXI_LAMP_STORY_NPC_IDS.LIN, 'lakeside', 'water_pavilion', 82.2, 60.5),
      storyNpcPlacement(WANXI_LAMP_STORY_NPC_IDS.QI, 'lakeside', 'water_pavilion', 86.1, 61.2),
    ];
  }

  if (stage === 'return_repaired_tassel') {
    return [
      storyNpcPlacement(WANXI_LAMP_STORY_NPC_IDS.LIN, 'west_market', 'west_courtyard', 24.6, 53.7),
      storyNpcPlacement(WANXI_LAMP_STORY_NPC_IDS.QI, 'west_market', 'west_courtyard', 30.8, 56.2),
    ];
  }

  const placements: WanxiNpcPlacement[] = [
    storyNpcPlacement(
      WANXI_LAMP_STORY_NPC_IDS.LIN,
      'stage',
      'stage_forecourt',
      79.2,
      35.2,
      isNpcAttention(WANXI_LAMP_STORY_NPC_IDS.LIN),
    ),
  ];

  const qiVisible = !['not_started', 'deliver_tassel', 'return_to_lu'].includes(stage);
  if (qiVisible) {
    placements.push(
      storyNpcPlacement(
        WANXI_LAMP_STORY_NPC_IDS.QI,
        'west_market',
        'west_courtyard',
        31.2,
        56.2,
        isNpcAttention(WANXI_LAMP_STORY_NPC_IDS.QI),
      ),
    );
  }

  if (stage === 'gather_moonsilk') {
    placements.push(
      storyNpcPlacement(
        WANXI_LAMP_STORY_NPC_IDS.NING,
        'west_market',
        'west_lane',
        19.6,
        65.5,
        true,
      ),
    );
  }

  return placements;
}

export function getWanxiLampStoryNpcMessages(
  stage: WanxiLampStoryStage,
  roleKey: WanxiNpcRoleKey,
): readonly WanxiLampStoryMessage[] | null {
  const line = (
    id: string,
    speaker: string,
    body: string,
    gesture?: string,
    tone?: WanxiLampStoryMessage['tone'],
  ): WanxiLampStoryMessage => ({ id, speaker, body, ...(gesture ? { gesture } : {}), ...(tone ? { tone } : {}) });

  if (roleKey === 'gate_steward') {
    if (stage === 'not_started') {
      return [line('lu:start', '陆清和', '若是顺路，能否替我把一件旧物送去百戏台？不值什么灵石，只是一直放在我这里也不妥。')];
    }
    if (stage === 'return_to_lu') {
      return [line('lu:return', '陆清和', '她没收？……那倒奇怪。闲趣西院最近来了个修旧物的匠人，你拿去让他看看，也许能看出些门道。')];
    }
    if (stage === 'find_artisan') {
      return [line('lu:clue', '陆清和', '姓祁，名望川。话不多，手倒很稳。你到闲趣西院，多半能见到他。')];
    }
  }

  if (roleKey === 'stage_musician') {
    if (stage === 'deliver_tassel') {
      return [
        line('lin:first-look', '林照晚', '……这东西，你从哪里拿来的？', '她刚收起琴弦，目光却在那截褪色灯穗上停了一瞬。'),
      ];
    }
    if (stage === 'return_to_lu') {
      return [line('lin:refused', '林照晚', '不是我的。', '她把手收回袖中，语气平静得像从未认出它。', 'muted')];
    }
    if (stage === 'return_repaired_tassel') {
      return [
        line('lin:courtyard', '林照晚', '祁望川。你把那截旧穗修好了。'),
      ];
    }
    if (stage === 'show_contract') {
      return [
        line('lin:contract-1', '林照晚', '如果你是来替他说话，就不用说了。'),
        line('lin:contract-2', '林照晚', '……把你手里的东西放下吧。', '她没有伸手，只看着焦黑契纸。'),
      ];
    }
    if (stage === 'retrieve_casket') {
      return [line('lin:key', '林照晚', '我想确认一件事。万戏楼旧库里还有一只琴盒，这是钥匙。帮我把它取回来。')];
    }
    if (stage === 'return_casket') {
      return [
        line('lin:casket-1', '林照晚', '我以前一直以为，我留着这些，是因为我恨他。'),
        line('lin:casket-2', '林照晚', '后来我才发现……如果真的恨一个人，是不会记得他做的灯为什么总是歪的。', undefined, 'attention'),
      ];
    }
    if (stage === 'reunion') {
      return [line('lin:invite', '林照晚', '听澜水榭。今夜。你若愿意，也来吧。有些话拖得太久，再不说，就真的只剩旧物了。')];
    }
  }

  if (roleKey === 'mechanist') {
    if (stage === 'find_artisan') {
      return [
        line('qi:inspect-1', '祁望川', '这个不是坏了。', '他接过灯穗，只看了一眼针脚。'),
        line('qi:inspect-2', '祁望川', '少了一半。'),
      ];
    }
    if (stage === 'gather_moonsilk') {
      return [line('qi:silk', '祁望川', '要接回旧线，普通丝会把原来的针眼撑坏。找三缕月蚕丝来。宁小满手里应该有。')];
    }
    if (stage === 'repair_tassel') {
      return [line('qi:repair-ready', '祁望川', '月蚕丝够了。把旧灯穗给我。')];
    }
    if (stage === 'return_repaired_tassel') {
      return [line('qi:letters', '祁望川', '里面这两个字本来一直都在。只是后来缝线翻了过去。……“照晚”。')];
    }
    if (stage === 'after_confrontation') {
      return [line('qi:cough', '祁望川', '咳……没事。旧伤而已。', '他说到一半忽然偏过脸，指缝间落下一点暗红。')];
    }
    if (stage === 'seek_jiang') {
      return [line('qi:deny', '祁望川', '不必惊动别人。')];
    }
    if (stage === 'reveal_contract') {
      return [line('qi:sand', '祁望川', '沉契砂？江听鹤连这个都告诉你了……罢了。')];
    }
    if (stage === 'battle_ready') {
      return [
        line('qi:contract-1', '祁望川', '三载取物，七处险地，以身为抵。最后一处，我没能走完。'),
        line('qi:contract-2', '祁望川', '当年换来的东西叫“还音露”。她的经脉若不及时续上，以后便再也奏不了琴。'),
        line('qi:contract-3', '祁望川', '这笔债本该我自己还。', '旧契纹路忽然亮起，水一样的暗光从他腕间爬出。', 'attention'),
      ];
    }
  }

  if (roleKey === 'roaming_merchant' && stage === 'gather_moonsilk') {
    return [line('ning:silk', '宁小满', '月蚕丝？有啊。祁木头要的吧？三缕拿去，别跟他说我又叫他木头。')];
  }

  if (roleKey === 'lakeside_guest') {
    if (stage === 'seek_jiang') {
      return [
        line('jiang:diagnose-1', '江听鹤', '这不是旧伤。'),
        line('jiang:diagnose-2', '江听鹤', '是灵契反噬。若想看清旧契，去水榭石隙里取一撮沉契砂。它只显旧账，不替人评是非。'),
      ];
    }
    if (stage === 'gather_contract_sand') {
      return [line('jiang:after', '江听鹤', '把砂撒在契纹上。你看到什么，就是什么。至于该不该原谅，不是契纸能替谁回答的。')];
    }
  }

  return null;
}

export function getWanxiLampStoryLocationMessages(
  stage: WanxiLampStoryStage,
  locationId: WanxiLocationId,
): readonly WanxiLampStoryMessage[] | null {
  if (locationId === 'west_courtyard' && stage === 'return_repaired_tassel') {
    return [
      { id: 'confront:arrival', speaker: '林照晚', body: '祁望川。' },
      { id: 'confront:reply', speaker: '祁望川', body: '照晚。' },
      { id: 'confront:cut', speaker: '林照晚', body: '别这么叫我。' },
    ];
  }
  if (locationId === 'west_courtyard' && stage === 'after_confrontation') {
    return [
      { id: 'confront:q', speaker: '林照晚', body: '当年那封信，是你写的吗？' },
      { id: 'confront:a', speaker: '祁望川', body: '是。' },
      { id: 'confront:why', speaker: '林照晚', body: '所以你现在回来做什么？看看我有没有过得很惨？' },
      { id: 'confront:enough', speaker: '祁望川', body: '你现在过得很好。这样就够了。' },
      { id: 'confront:end', body: '林照晚没有再问，转身离开了西院。', tone: 'muted' },
    ];
  }
  if (locationId === 'water_pavilion' && stage === 'gather_contract_sand') {
    return [{ id: 'sand:before', body: '水榭石阶贴着湖面，石缝里沉着一层极细的银灰砂。' }];
  }
  if (locationId === 'water_pavilion' && stage === 'reveal_contract') {
    return [{ id: 'sand:after', body: '一小包沉契砂握在手中，细砂偶尔泛起幽蓝。' }];
  }
  if (locationId === 'main_hall' && stage === 'retrieve_casket') {
    return [{ id: 'casket:before', body: '万戏楼旧库多年少有人来。木架最深处果然放着一只落灰的旧琴盒。' }];
  }
  if (locationId === 'main_hall' && stage === 'return_casket') {
    return [{ id: 'casket:after', body: '琴盒已经取出。里面没有琴，只有一枚旧灯穗和半枚木制同心扣。' }];
  }
  if (locationId === 'water_pavilion' && stage === 'reunion') {
    return [
      { id: 'reunion:1', speaker: '祁望川', body: '对不起。' },
      { id: 'reunion:2', speaker: '林照晚', body: '哪一件？' },
      { id: 'reunion:3', speaker: '祁望川', body: '所有。我那时以为，只要你还能弹琴，别的都不重要。' },
      { id: 'reunion:4', speaker: '林照晚', body: '可你有没有想过，我愿不愿意拿琴换你？' },
      { id: 'reunion:5', speaker: '祁望川', body: '没有。' },
      { id: 'reunion:6', speaker: '林照晚', body: '所以我不能因为你当年救过我，就说你做得对。' },
      { id: 'reunion:7', speaker: '祁望川', body: '我知道。' },
      { id: 'reunion:8', speaker: '林照晚', body: '但我也不能再骗自己，说这些年我一点都没有等过。', tone: 'attention' },
    ];
  }
  if (locationId === 'water_pavilion' && stage === 'completed') {
    return [
      { id: 'done:1', speaker: '林照晚', body: '以前那一半，已经过去了。' },
      { id: 'done:2', body: '她把自己的半枚木扣放在石桌上，又把另一半推到祁望川面前。' },
      { id: 'done:3', speaker: '林照晚', body: '要不要重新做一枚？' },
      { id: 'done:4', speaker: '祁望川', body: '好。' },
      { id: 'done:5', body: '他们没有回到当年。只是第一次愿意从今天重新认识。', tone: 'muted' },
      { id: 'done:6', body: '几日后，一盏没有刻任何誓言的小灯随传音玉简送到了你手中。', tone: 'attention' },
    ];
  }
  return null;
}
