import type { WanxiNpcRoleKey } from './types';

export const WANXI_RELATIONSHIP_STAGES = [
  'stranger',
  'acquainted',
  'familiar',
  'old_friend',
  'confidant',
] as const;

export type WanxiRelationshipStage =
  (typeof WANXI_RELATIONSHIP_STAGES)[number];

export interface WanxiContinuityMessage {
  id: string;
  speaker?: string;
  body: string;
  gesture?: string;
  tone?: 'normal' | 'muted' | 'attention';
  emotion?: 'calm' | 'hesitate' | 'anger' | 'sadness' | 'relief';
  pauseAfterMs?: number;
}

export interface WanxiNpcRelationshipSnapshot {
  roleKey: WanxiNpcRoleKey;
  npcName: string;
  stage: WanxiRelationshipStage;
  stageLabel: string;
  /** Whether the player has actually completed a relationship-forming interaction. */
  met: boolean;
  /** Internal interaction count is exposed for content gating, not as a visible progress bar. */
  interactionCount: number;
  memoryNotes: string[];
  lastInteractionAt?: string;
}

export interface WanxiDailyEventDefinition {
  id: string;
  title: string;
  summary: string;
  promptLabel: string;
  roleKey: WanxiNpcRoleKey;
  locationId: string;
  familiarityDelta: number;
  memoryTag: string;
  memoryText: string;
  messages: readonly WanxiContinuityMessage[];
}

export interface WanxiDailyEventSnapshot {
  id: string;
  title: string;
  summary: string;
  promptLabel: string;
  roleKey: WanxiDailyEventDefinition['roleKey'];
  npcName: string;
  locationId: string;
  locationName: string;
  completed: boolean;
}

export interface WanxiContinuitySnapshot {
  unlocked: boolean;
  dateKey: string;
  relationships: WanxiNpcRelationshipSnapshot[];
  dailyEvents: WanxiDailyEventSnapshot[];
  completedToday: number;
  totalMemories: number;
}

export interface WanxiDailyEventNarrativeResult {
  dateKey: string;
  generated: boolean;
  event: WanxiDailyEventSnapshot;
  messages: WanxiContinuityMessage[];
}

const RELATIONSHIP_THRESHOLDS: Array<{
  min: number;
  stage: WanxiRelationshipStage;
  label: string;
}> = [
  { min: 14, stage: 'confidant', label: '知己' },
  { min: 8, stage: 'old_friend', label: '旧友' },
  { min: 4, stage: 'familiar', label: '熟识' },
  { min: 1, stage: 'acquainted', label: '相识' },
  { min: 0, stage: 'stranger', label: '陌生' },
];

export function resolveWanxiRelationshipStage(familiarity: number) {
  const score = Number.isFinite(familiarity)
    ? Math.max(0, Math.floor(familiarity))
    : 0;
  return (
    RELATIONSHIP_THRESHOLDS.find((entry) => score >= entry.min) ??
    RELATIONSHIP_THRESHOLDS[RELATIONSHIP_THRESHOLDS.length - 1]!
  );
}

export function getWanxiDailyDateKey(now = new Date()): string {
  const beijing = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return beijing.toISOString().slice(0, 10);
}

function hashText(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export const WANXI_DAILY_EVENT_DEFINITIONS = [
  {
    id: 'wanxi.daily.lin.new-song',
    title: '新曲未名',
    summary: '林照晚新写了半阕曲子，却迟迟没有给它取名。',
    promptLabel: '听听那半阕新曲',
    roleKey: 'stage_musician',
    locationId: 'stage_forecourt',
    familiarityDelta: 1,
    memoryTag: 'heard_new_song',
    memoryText: '你听过林照晚那首尚未取名的新曲。',
    messages: [
      {
        id: 'lin-new-song:1',
        speaker: '林照晚',
        body: '我写了半阕曲子。写到这里，却不知道该叫什么。',
        gesture: '她把琴谱往你这边推了半寸。',
        pauseAfterMs: 420,
      },
      {
        id: 'lin-new-song:2',
        speaker: '林照晚',
        body: '名字先空着也好。有些东西，太早下定论，反而容易写窄了。',
        emotion: 'calm',
        pauseAfterMs: 520,
      },
      {
        id: 'lin-new-song:3',
        body: '她重新拨动琴弦。这一次，最后一个音没有急着落下。',
        tone: 'muted',
      },
    ],
  },
  {
    id: 'wanxi.daily.qi.crooked-lamp',
    title: '还是有些歪',
    summary: '祁望川又做了一盏灯，明明比以前精巧，却还是歪了一点。',
    promptLabel: '看看他的新灯',
    roleKey: 'mechanist',
    locationId: 'west_courtyard',
    familiarityDelta: 1,
    memoryTag: 'saw_crooked_lamp',
    memoryText: '你见过祁望川那盏“明明量过三遍却还是有些歪”的新灯。',
    messages: [
      {
        id: 'qi-crooked-lamp:1',
        speaker: '祁望川',
        body: '我这次量了三遍。',
        gesture: '他把一盏新灯端起来，认真看了半天。',
        pauseAfterMs: 300,
      },
      {
        id: 'qi-crooked-lamp:2',
        speaker: '祁望川',
        body: '……你先别笑。',
        emotion: 'hesitate',
        pauseAfterMs: 430,
      },
      {
        id: 'qi-crooked-lamp:3',
        body: '灯确实还是歪了一点。但这一次，他也跟着笑了。',
        tone: 'muted',
      },
    ],
  },
  {
    id: 'wanxi.daily.lin.broken-string',
    title: '断弦之后',
    summary: '一根旧琴弦忽然断了。林照晚没有急着换新的。',
    promptLabel: '问问那根断弦',
    roleKey: 'stage_musician',
    locationId: 'stage_forecourt',
    familiarityDelta: 1,
    memoryTag: 'talked_about_broken_string',
    memoryText: '林照晚曾与你谈过一根断弦，以及“不必什么都留住”。',
    messages: [
      {
        id: 'lin-broken-string:1',
        speaker: '林照晚',
        body: '以前弦一断，我总觉得是哪里没照顾好。',
        gesture: '她把断弦绕在指间，没有立刻丢掉。',
        pauseAfterMs: 420,
      },
      {
        id: 'lin-broken-string:2',
        speaker: '林照晚',
        body: '后来才知道，弦本来就会旧。不是所有断掉的东西，都一定要接回原来的样子。',
        emotion: 'relief',
        pauseAfterMs: 560,
      },
      {
        id: 'lin-broken-string:3',
        body: '她把旧弦放进木匣，换上了新的。',
        tone: 'muted',
      },
    ],
  },
  {
    id: 'wanxi.daily.qi.wooden-bird',
    title: '会回来的木鸟',
    summary: '祁望川做了一只木鸟，据说飞出去以后会自己回来。',
    promptLabel: '试试那只木鸟',
    roleKey: 'mechanist',
    locationId: 'west_courtyard',
    familiarityDelta: 1,
    memoryTag: 'tested_wooden_bird',
    memoryText: '你陪祁望川试过那只“理论上会自己飞回来”的木鸟。',
    messages: [
      {
        id: 'qi-wooden-bird:1',
        speaker: '祁望川',
        body: '理论上，它会自己飞回来。',
        gesture: '他把木鸟放在掌心，神情比迎战索契灵时还认真。',
        pauseAfterMs: 360,
      },
      {
        id: 'qi-wooden-bird:2',
        body: '木鸟扑棱着飞过院墙。',
        tone: 'muted',
        pauseAfterMs: 700,
      },
      {
        id: 'qi-wooden-bird:3',
        speaker: '祁望川',
        body: '……明天我去找。',
        emotion: 'hesitate',
      },
    ],
  },
  {
    id: 'wanxi.daily.lin.name-the-tune',
    title: '一字之差',
    summary: '林照晚在两个曲名之间犹豫，最后却都没有采用。',
    promptLabel: '陪她想想曲名',
    roleKey: 'stage_musician',
    locationId: 'stage_forecourt',
    familiarityDelta: 1,
    memoryTag: 'discussed_tune_name',
    memoryText: '你曾陪林照晚为一首曲子想名字，最后两个人都决定先不取。',
    messages: [
      {
        id: 'lin-name-tune:1',
        speaker: '林照晚',
        body: '“旧灯”和“迟灯”，你觉得哪一个更好？',
        pauseAfterMs: 420,
      },
      {
        id: 'lin-name-tune:2',
        speaker: '林照晚',
        body: '算了，都不好。听起来像非要把过去写进曲子里。',
        gesture: '她自己先摇了摇头。',
        pauseAfterMs: 420,
      },
      {
        id: 'lin-name-tune:3',
        speaker: '林照晚',
        body: '等它自己长出名字吧。',
        emotion: 'calm',
      },
    ],
  },
  {
    id: 'wanxi.daily.qi.old-lamp',
    title: '旧灯不修',
    summary: '祁望川收着一盏早就坏掉的旧灯，却没有打算把它修好。',
    promptLabel: '问问那盏旧灯',
    roleKey: 'mechanist',
    locationId: 'west_courtyard',
    familiarityDelta: 1,
    memoryTag: 'talked_about_old_lamp',
    memoryText: '祁望川告诉你，有些旧物留下来不是为了修回原样。',
    messages: [
      {
        id: 'qi-old-lamp:1',
        speaker: '祁望川',
        body: '这盏不修。',
        gesture: '他把一盏缺了半边灯骨的旧灯收回架子。',
        pauseAfterMs: 380,
      },
      {
        id: 'qi-old-lamp:2',
        speaker: '祁望川',
        body: '以前我总觉得，坏了就应该修好。后来发现，有些东西留下来，只是为了记得它确实发生过。',
        emotion: 'calm',
        pauseAfterMs: 520,
      },
      {
        id: 'qi-old-lamp:3',
        body: '他没有再碰那盏灯。',
        tone: 'muted',
      },
    ],
  },
  {
    id: 'wanxi.daily.lin.watch-a-play',
    title: '坐在台下',
    summary: '难得没有演出安排，林照晚反而坐在台下看别人排戏。',
    promptLabel: '陪她坐一会儿',
    roleKey: 'stage_musician',
    locationId: 'stage_forecourt',
    familiarityDelta: 1,
    memoryTag: 'sat_below_stage',
    memoryText: '你曾和林照晚一起坐在百戏台下，看别人排了一场并不完美的戏。',
    messages: [
      {
        id: 'lin-watch-play:1',
        speaker: '林照晚',
        body: '台上的人总觉得，下面的人什么都看得出来。',
        gesture: '她坐在最后一排，手里没有琴。',
        pauseAfterMs: 380,
      },
      {
        id: 'lin-watch-play:2',
        speaker: '林照晚',
        body: '其实大多数时候，大家只是在等一个自己愿意相信的结局。',
        pauseAfterMs: 520,
      },
      {
        id: 'lin-watch-play:3',
        body: '台上有人忘了词。她轻轻笑了一声，没有催。',
        tone: 'muted',
      },
    ],
  },
  {
    id: 'wanxi.daily.qi.cool-tea',
    title: '茶已经凉了',
    summary: '祁望川忙着修一个小机关，直到茶彻底凉了才想起来。',
    promptLabel: '提醒他喝茶',
    roleKey: 'mechanist',
    locationId: 'west_courtyard',
    familiarityDelta: 1,
    memoryTag: 'reminded_qi_about_tea',
    memoryText: '你提醒过祁望川，机关可以晚一点修，茶最好别每次都放凉。',
    messages: [
      {
        id: 'qi-cool-tea:1',
        body: '桌边那杯茶已经彻底没有热气。',
        tone: 'muted',
        pauseAfterMs: 300,
      },
      {
        id: 'qi-cool-tea:2',
        speaker: '祁望川',
        body: '我记得刚才还是热的。',
        gesture: '他摸了摸杯沿。',
        pauseAfterMs: 380,
      },
      {
        id: 'qi-cool-tea:3',
        speaker: '祁望川',
        body: '……下次你看见我忘了，直接说。',
        emotion: 'relief',
      },
    ],
  },
  {
    id: 'wanxi.daily.lin.rain-sound',
    title: '雨声也是拍子',
    summary: '雨落在百戏台檐角，林照晚索性没有继续练原来的曲子。',
    promptLabel: '听一会儿雨',
    roleKey: 'stage_musician',
    locationId: 'stage_forecourt',
    familiarityDelta: 1,
    memoryTag: 'listened_to_rain_with_lin',
    memoryText: '你和林照晚在百戏台檐下听过一阵雨，她说雨声也是拍子。',
    messages: [
      {
        id: 'lin-rain:1',
        body: '雨点落在檐角，原本规整的琴声渐渐停了。',
        tone: 'muted',
        pauseAfterMs: 460,
      },
      {
        id: 'lin-rain:2',
        speaker: '林照晚',
        body: '今天不练原来的。',
        pauseAfterMs: 320,
      },
      {
        id: 'lin-rain:3',
        speaker: '林照晚',
        body: '你听。雨声也是拍子，只是从来不等人准备好。',
        emotion: 'calm',
      },
    ],
  },
  {
    id: 'wanxi.daily.qi.small-dispute',
    title: '这次没有替她答',
    summary: '有人问起林照晚会不会参加一场演出，祁望川明明知道答案，却没有替她说。',
    promptLabel: '问问刚才怎么了',
    roleKey: 'mechanist',
    locationId: 'west_courtyard',
    familiarityDelta: 1,
    memoryTag: 'noticed_qi_not_answer_for_lin',
    memoryText: '你见过祁望川明明知道林照晚的想法，却仍让别人亲自去问她。',
    messages: [
      {
        id: 'qi-small-dispute:1',
        speaker: '祁望川',
        body: '我知道她大概会怎么答。',
        pauseAfterMs: 360,
      },
      {
        id: 'qi-small-dispute:2',
        speaker: '祁望川',
        body: '但“大概知道”和“可以替她回答”，不是一回事。',
        gesture: '他说得很慢，像是在提醒自己。',
        pauseAfterMs: 520,
      },
      {
        id: 'qi-small-dispute:3',
        body: '说完，他低头继续修手里的灯骨。',
        tone: 'muted',
      },
    ],
  },
] as const satisfies readonly WanxiDailyEventDefinition[];

const dailyEventMap = new Map<string, WanxiDailyEventDefinition>(
  WANXI_DAILY_EVENT_DEFINITIONS.map((event) => [event.id, event]),
);

export function getWanxiDailyEventDefinition(eventId: string) {
  return dailyEventMap.get(eventId) ?? null;
}

export function isWanxiDailyEventId(value: string): boolean {
  return dailyEventMap.has(value);
}

export function selectWanxiDailyEvents(args: {
  seed: string;
  count?: number;
}): WanxiDailyEventDefinition[] {
  const count = Math.max(1, Math.min(args.count ?? 3, WANXI_DAILY_EVENT_DEFINITIONS.length));
  const sorted = [...WANXI_DAILY_EVENT_DEFINITIONS].sort((left, right) => {
    const l = hashText(`${args.seed}:${left.id}`);
    const r = hashText(`${args.seed}:${right.id}`);
    return l - r || left.id.localeCompare(right.id);
  });

  const picked: WanxiDailyEventDefinition[] = [];
  const perRole = new Map<WanxiDailyEventDefinition['roleKey'], number>();
  for (const event of sorted) {
    if ((perRole.get(event.roleKey) ?? 0) >= 2) continue;
    picked.push(event);
    perRole.set(event.roleKey, (perRole.get(event.roleKey) ?? 0) + 1);
    if (picked.length >= count) break;
  }
  return picked;
}

export type WanxiLegacyContinuityRoleKey = Extract<
  WanxiNpcRoleKey,
  'stage_musician' | 'mechanist'
>;

export const WANXI_BASE_STORY_MEMORIES: Record<
  WanxiLegacyContinuityRoleKey,
  { familiarity: number; memoryTags: string[]; memoryNotes: string[] }
> = {
  stage_musician: {
    familiarity: 4,
    memoryTags: [
      'helped_lamp_story',
      'returned_old_casket',
      'witnessed_reunion',
    ],
    memoryNotes: [
      '你帮助查清旧灯穗与旧灵契的真相。',
      '你把旧琴盒交还给了林照晚。',
      '你见证她与祁望川在听澜水榭重新谈话。',
    ],
  },
  mechanist: {
    familiarity: 4,
    memoryTags: [
      'helped_lamp_story',
      'defeated_contract_spirit',
      'witnessed_reunion',
    ],
    memoryNotes: [
      '你帮助查清并斩断了祁望川身上的旧灵契。',
      '你曾迎战索契灵·残契执事。',
      '你见证他向林照晚道歉，并决定不再替她作决定。',
    ],
  },
};

const baseMemoryTextByRoleTag = new Map<string, string>(
  Object.entries(WANXI_BASE_STORY_MEMORIES).flatMap(([roleKey, value]) =>
    value.memoryTags.map(
      (tag, index) =>
        [`${roleKey}:${tag}`, value.memoryNotes[index] ?? tag] as const,
    ),
  ),
);

const dailyMemoryTextByTag = new Map<string, string>(
  WANXI_DAILY_EVENT_DEFINITIONS.map(
    (event) => [event.memoryTag, event.memoryText] as const,
  ),
);

export function describeWanxiMemoryTagForRole(
  roleKey: WanxiNpcRoleKey,
  tag: string,
): string {
  return (
    baseMemoryTextByRoleTag.get(`${roleKey}:${tag}`) ??
    dailyMemoryTextByTag.get(tag) ??
    tag
  );
}

/** @deprecated Prefer describeWanxiMemoryTagForRole when the NPC role is known. */
export function describeWanxiMemoryTag(tag: string): string {
  return dailyMemoryTextByTag.get(tag) ?? tag;
}
