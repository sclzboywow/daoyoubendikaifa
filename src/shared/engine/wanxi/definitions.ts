import type {
  WanxiActivityBinding,
  WanxiGameDefinition,
  WanxiLocationDefinition,
  WanxiLocationPlacement,
  WanxiNpcDefinition,
  WanxiNpcPlacement,
  WanxiNpcRoleKey,
  WanxiRegionDefinition,
  WanxiRegionId,
  WanxiSceneDefinition,
  WanxiSceneLabelDefinition,
} from './types';
import { WANXI_WORLD_ACTIVITY_BINDINGS } from './world';

export const WANXI_REGIONS = [
  {
    id: 'gate',
    name: '坊门',
    description: '万戏坊迎来送往之处。',
    center: { x: 50, y: 84 },
    tags: ['入口', '迎客'],
  },
  {
    id: 'square',
    name: '百戏广场',
    description: '坊中最宽阔的公共区域，诸般临时活动皆可在此聚起。',
    center: { x: 50, y: 55 },
    tags: ['公共空间', '活动'],
  },
  {
    id: 'hall',
    name: '万戏楼',
    description: '万戏坊中枢所在，往来掌事多在此议事会客。',
    center: { x: 50, y: 17 },
    tags: ['中枢', '会客'],
  },
  {
    id: 'stage',
    name: '百戏台',
    description: '坊中演艺汇聚之处，台上台下从来不缺新鲜事。',
    center: { x: 82, y: 30 },
    tags: ['演艺', '百戏'],
  },
  {
    id: 'lakeside',
    name: '听澜水境',
    description: '水榭、曲桥与湖岸相连，是万戏坊最开阔的一片水景。',
    center: { x: 77, y: 55 },
    tags: ['水域', '休闲'],
  },
  {
    id: 'west_market',
    name: '闲趣巷',
    description: '小院、铺舍和棚亭错落其间，最适合藏些新奇玩意。',
    center: { x: 24, y: 58 },
    tags: ['街巷', '游艺'],
  },
  {
    id: 'bamboo',
    name: '静竹苑',
    description: '远离坊中喧闹的一片竹苑，鲜少有人专程到此。',
    center: { x: 18, y: 24 },
    tags: ['幽静', '剧情'],
  },
  {
    id: 'southeast',
    name: '临水别院',
    description: '靠水而建的偏僻院落，暂未对外开放太多事务。',
    center: { x: 78, y: 79 },
    tags: ['别院', '扩展'],
  },
] as const satisfies readonly WanxiRegionDefinition[];

export const WANXI_LOCATIONS = [
  {
    id: 'gate',
    regionId: 'gate',
    name: '万戏坊坊门',
    description: '穿过牌坊便算正式入坊。往来修士大多在这里先辨清去处。',
    kind: 'gate',
    tags: ['入口', '集散'],
  },
  {
    id: 'notice_board',
    regionId: 'gate',
    name: '坊门告示处',
    description: '坊中近况与临时安排通常会在这里留下只言片语。',
    kind: 'landmark',
    tags: ['公告'],
  },
  {
    id: 'central_square',
    regionId: 'square',
    name: '百戏广场',
    description: '主街在这里豁然开阔，是最适合聚众与临时设场的地方。',
    kind: 'square',
    tags: ['公共活动'],
  },
  {
    id: 'main_hall',
    regionId: 'hall',
    name: '万戏楼',
    description: '万戏坊的主楼。坊主与几位掌事多在此处理坊中事务。',
    kind: 'building',
    tags: ['核心地标'],
  },
  {
    id: 'hall_forecourt',
    regionId: 'hall',
    name: '楼前广场',
    description: '主楼前的宽阔石坪，视野能够直贯南北主街。',
    kind: 'square',
  },
  {
    id: 'stage',
    regionId: 'stage',
    name: '百戏台',
    description: '开放式戏台连着后台侧屋，台前留着大片观演空地。',
    kind: 'stage',
    tags: ['演艺'],
  },
  {
    id: 'stage_forecourt',
    regionId: 'stage',
    name: '戏台前场',
    description: '人多时是观演之地，人少时也常有坊中人停步闲谈。',
    kind: 'square',
  },
  {
    id: 'lakeside',
    regionId: 'lakeside',
    name: '听澜湖岸',
    description: '石岸临水，曲桥与栈道向湖中延伸。',
    kind: 'waterside',
    tags: ['湖岸'],
  },
  {
    id: 'water_pavilion',
    regionId: 'lakeside',
    name: '听澜水榭',
    description: '水榭与荷池相望，远离主街后显得格外清静。',
    kind: 'waterside',
    tags: ['水榭'],
  },
  {
    id: 'west_courtyard',
    regionId: 'west_market',
    name: '闲趣西院',
    description: '几座小院与铺舍围出一块不大的空场，常有人在此摆弄新鲜事物。',
    kind: 'courtyard',
    tags: ['小院'],
  },
  {
    id: 'west_lane',
    regionId: 'west_market',
    name: '闲趣巷',
    description: '道路曲折，铺舍并不规整，却比主街更有烟火气。',
    kind: 'landmark',
    tags: ['街巷'],
  },
  {
    id: 'bamboo_garden',
    regionId: 'bamboo',
    name: '静竹苑',
    description: '竹影遮住了主街的喧声，偶尔有人在这里独坐。',
    kind: 'garden',
    tags: ['竹林', '隐秘'],
  },
  {
    id: 'southeast_courtyard',
    regionId: 'southeast',
    name: '临水别院',
    description: '一处沿水而建的偏院，目前只开放了外侧平台。',
    kind: 'courtyard',
    tags: ['后续扩展'],
  },
] as const satisfies readonly WanxiLocationDefinition[];

export const WANXI_LOCATION_PLACEMENTS = [
  {
    locationId: 'gate',
    point: { x: 50, y: 84 },
    marker: { importance: 'major', minScale: 0.42, hideWhenOccupied: true },
  },
  {
    locationId: 'notice_board',
    point: { x: 43, y: 80 },
    marker: { importance: 'minor', minScale: 1.05 },
  },
  {
    locationId: 'central_square',
    point: { x: 50, y: 56 },
    marker: { importance: 'normal', minScale: 0.76 },
  },
  {
    locationId: 'main_hall',
    point: { x: 50, y: 14 },
    marker: { importance: 'major', minScale: 0.42 },
  },
  {
    locationId: 'hall_forecourt',
    point: { x: 50, y: 28 },
    marker: { importance: 'minor', minScale: 0.98, hideWhenOccupied: true },
  },
  {
    locationId: 'stage',
    point: { x: 82, y: 30 },
    marker: { importance: 'major', minScale: 0.42 },
  },
  {
    locationId: 'stage_forecourt',
    point: { x: 74, y: 37 },
    marker: { importance: 'minor', minScale: 0.98, hideWhenOccupied: true },
  },
  {
    locationId: 'lakeside',
    point: { x: 75, y: 52 },
    marker: { importance: 'major', minScale: 0.42, hideWhenOccupied: true },
  },
  {
    locationId: 'water_pavilion',
    point: { x: 84, y: 60 },
    marker: { importance: 'normal', minScale: 0.78 },
  },
  {
    locationId: 'west_courtyard',
    point: { x: 27, y: 55 },
    marker: { importance: 'major', minScale: 0.42, hideWhenOccupied: true },
  },
  {
    locationId: 'west_lane',
    point: { x: 20, y: 67 },
    marker: { importance: 'normal', minScale: 0.8 },
  },
  {
    locationId: 'bamboo_garden',
    point: { x: 20, y: 27 },
    marker: { importance: 'major', minScale: 0.42, hideWhenOccupied: true },
  },
  {
    locationId: 'southeast_courtyard',
    point: { x: 78, y: 78 },
    marker: { importance: 'minor', minScale: 1.05 },
  },
] as const satisfies readonly WanxiLocationPlacement[];


export const WANXI_SCENE_LABELS = [
  {
    id: 'label_main_hall',
    text: '万戏楼',
    kind: 'building',
    point: { x: 50, y: 10.5 },
    minScale: 0.42,
    maxScale: 1.7,
  },
  {
    id: 'label_stage',
    text: '百戏台',
    kind: 'building',
    point: { x: 82, y: 23.5 },
    minScale: 0.42,
    maxScale: 1.7,
  },
  {
    id: 'label_square',
    text: '百戏广场',
    kind: 'region',
    point: { x: 51, y: 59.5 },
    minScale: 0.42,
    maxScale: 1.45,
  },
  {
    id: 'label_lakeside',
    text: '听澜水境',
    kind: 'region',
    point: { x: 84, y: 55.5 },
    minScale: 0.42,
    maxScale: 1.45,
  },
  {
    id: 'label_west_market',
    text: '闲趣巷',
    kind: 'region',
    point: { x: 20, y: 63.5 },
    minScale: 0.42,
    maxScale: 1.45,
    rotation: -5,
  },
  {
    id: 'label_bamboo',
    text: '静竹苑',
    kind: 'region',
    point: { x: 16.5, y: 17 },
    minScale: 0.42,
    maxScale: 1.45,
  },
  {
    id: 'label_main_street',
    text: '百戏长街',
    kind: 'street',
    point: { x: 44.5, y: 42 },
    minScale: 0.55,
    maxScale: 1.35,
    direction: 'vertical',
  },
  {
    id: 'label_southeast',
    text: '临水别院',
    kind: 'region',
    point: { x: 74, y: 76 },
    minScale: 0.82,
    maxScale: 1.55,
  },
  {
    id: 'label_hall_forecourt',
    text: '楼前广场',
    kind: 'detail',
    point: { x: 50, y: 27.5 },
    minScale: 1.05,
  },
  {
    id: 'label_stage_forecourt',
    text: '戏台前场',
    kind: 'detail',
    point: { x: 74, y: 38.5 },
    minScale: 1.05,
  },
  {
    id: 'label_water_pavilion',
    text: '听澜水榭',
    kind: 'detail',
    point: { x: 84.5, y: 67 },
    minScale: 1.05,
  },
  {
    id: 'label_west_courtyard',
    text: '闲趣西院',
    kind: 'detail',
    point: { x: 27, y: 48 },
    minScale: 1.05,
  },
] as const satisfies readonly WanxiSceneLabelDefinition[];

export const WANXI_NPCS = [
  {
    id: 'wanxi_npc_master',
    roleKey: 'master',
    name: '闻人砚',
    identity: '万戏坊坊主',
    description: '万戏坊真正的主人，鲜少亲自过问坊中琐事。',
    sigil: '砚',
    defaultGreeting: '既然来了，不妨多看看。万戏坊里有趣的，从来不只是输赢。',
    conversationKey: 'wanxi.master',
    tags: ['核心人物', '坊主'],
  },
  {
    id: 'wanxi_npc_gate_steward',
    roleKey: 'gate_steward',
    name: '陆清和',
    identity: '迎客执事',
    description: '负责坊门往来事务，对坊中之事极为熟悉。',
    sigil: '和',
    defaultGreeting: '第一次来？不急，坊中地方不少，我可以先与你说说。',
    conversationKey: 'wanxi.gate_steward',
    tags: ['引导', '见闻'],
  },
  {
    id: 'wanxi_npc_stage_curator',
    roleKey: 'stage_curator',
    name: '苏照影',
    identity: '百戏台掌事',
    description: '掌管百戏台诸般事务，昔年似乎也曾亲自登台。',
    sigil: '影',
    defaultGreeting: '台上一刻，台下十年。道友是来看戏，还是想入局？',
    conversationKey: 'wanxi.stage_curator',
    tags: ['演艺', '掌事'],
  },
  {
    id: 'wanxi_npc_lakeside_guest',
    roleKey: 'lakeside_guest',
    name: '江听鹤',
    identity: '水榭客卿',
    description: '常年停留在湖畔，却很少有人知道他真正负责什么。',
    sigil: '鹤',
    defaultGreeting: '水静的时候，看得清的反而更多。',
    conversationKey: 'wanxi.lakeside_guest',
    tags: ['客卿', '湖畔'],
  },
  {
    id: 'wanxi_npc_west_host',
    roleKey: 'west_host',
    name: '韩知巧',
    identity: '闲趣巷掌柜',
    description: '喜欢搜罗各类新奇玩意，对世间奇技颇有兴趣。',
    sigil: '巧',
    defaultGreeting: '又有些新鲜东西，道友若闲着，正好替我试试。',
    conversationKey: 'wanxi.west_host',
    tags: ['游艺', '掌柜'],
  },
  {
    id: 'wanxi_npc_bamboo_stranger',
    roleKey: 'bamboo_stranger',
    name: '白无昼',
    identity: '竹苑来客',
    description: '身份来历皆不明，似乎并不是万戏坊中人。',
    sigil: '白',
    defaultGreeting: '……你能找到这里，倒是比我料想得早。',
    conversationKey: 'wanxi.bamboo_stranger',
    tags: ['神秘', '剧情'],
  },
  {
    id: 'wanxi_npc_roaming_merchant',
    roleKey: 'roaming_merchant',
    name: '宁小满',
    identity: '行脚商人',
    description: '行踪不定，每次出现带来的东西也不同。',
    sigil: '满',
    defaultGreeting: '碰见就是缘分，今天这些东西，明日可未必还有。',
    conversationKey: 'wanxi.roaming_merchant',
    tags: ['流动人物', '商人'],
  },
  {
    id: 'wanxi_npc_storyteller',
    roleKey: 'storyteller',
    name: '温不语',
    identity: '游方说书人',
    description: '在坊中四处说书，故事真假从不解释。',
    sigil: '书',
    defaultGreeting: '世间故事那么多，你怎知自己听到的不是亲身经历？',
    conversationKey: 'wanxi.storyteller',
    tags: ['流动人物', '见闻'],
  },

  // Core roster V1 additions.
  // These definitions are intentionally not added to default map placements yet.
  // Their real coordinates must be selected from calibrated map slots.
  {
    id: 'wanxi_npc_script_scholar',
    roleKey: 'script_scholar',
    name: '沈砚秋',
    identity: '戏本先生',
    description: '替万戏坊收存与修订戏本的人。擅长看透别人的故事，却很少提起自己。',
    sigil: '稿',
    defaultGreeting: '先别急着讲完。故事里最要紧的，往往是你本来打算略过去的那一句。',
    conversationKey: 'wanxi.script_scholar',
    tags: ['万戏楼', '戏本', '区域核心'],
  },
  {
    id: 'wanxi_npc_chess_keeper',
    roleKey: 'chess_keeper',
    name: '迟观棋',
    identity: '棋摊主人',
    description: '常在百戏广场摆残局，看起来输多赢少，却从不为输棋辩解。',
    sigil: '棋',
    defaultGreeting: '坐。输赢可以慢一点再说，先看看你为什么要下这一手。',
    conversationKey: 'wanxi.chess_keeper',
    tags: ['百戏广场', '棋局', '生活人物'],
  },
  {
    id: 'wanxi_npc_chief_musician',
    roleKey: 'chief_musician',
    name: '顾长弦',
    identity: '首席乐师',
    description: '百戏台乐师，做事与说话都极守节拍，对突如其来的变化并不擅长。',
    sigil: '弦',
    defaultGreeting: '先听四拍。你若连自己的呼吸都没听清，谈什么合奏。',
    conversationKey: 'wanxi.chief_musician',
    tags: ['百戏台', '音律', '生活人物'],
  },
  {
    id: 'wanxi_npc_dancer',
    roleKey: 'dancer',
    name: '洛轻罗',
    identity: '舞伶',
    description: '极懂如何让观众喜欢自己，却很少有人知道她真正喜欢什么。',
    sigil: '舞',
    defaultGreeting: '你想看哪一种？……等等，今天先不问你。让我自己挑一次。',
    conversationKey: 'wanxi.dancer',
    tags: ['百戏台', '舞伶', '生活人物'],
  },
  {
    id: 'wanxi_npc_lantern_maker',
    roleKey: 'lantern_maker',
    name: '桑落',
    identity: '花灯匠',
    description: '常在水榭替人做灯，也替人收好那些说出口后又后悔的愿望。',
    sigil: '灯',
    defaultGreeting: '灯可以替你带走一句话，但愿望要不要留下，还是你自己决定。',
    conversationKey: 'wanxi.lantern_maker',
    tags: ['听澜水境', '花灯', '生活人物'],
  },
  {
    id: 'wanxi_npc_tea_physician',
    roleKey: 'tea_physician',
    name: '谢微尘',
    identity: '药茶医师',
    description: '在湖岸配药煮茶，嘴上不留情，却会把每一处小伤记得很清楚。',
    sigil: '茶',
    defaultGreeting: '先坐。你这不叫修行刻苦，叫把自己的身体当一次性法器。',
    conversationKey: 'wanxi.tea_physician',
    tags: ['听澜水境', '药茶', '生活人物'],
  },
  {
    id: 'wanxi_npc_mask_artisan',
    roleKey: 'mask_artisan',
    name: '燕十三娘',
    identity: '面具师',
    description: '闲趣巷面具师，最会替别人挑一张合适的脸，却从不谈自己的真面目。',
    sigil: '面',
    defaultGreeting: '别急着说你不戴面具。先想想，你今天这张脸是给谁看的。',
    conversationKey: 'wanxi.mask_artisan',
    tags: ['闲趣巷', '面具', '生活人物'],
  },
  {
    id: 'wanxi_npc_curio_dealer',
    roleKey: 'curio_dealer',
    name: '莫问生',
    identity: '旧物摊主',
    description: '专收别人舍不得留、又不愿带走的旧物，比起价格更在意来历。',
    sigil: '旧',
    defaultGreeting: '先别问值多少。你若连它为什么会到这里都不知道，买回去也只是占地方。',
    conversationKey: 'wanxi.curio_dealer',
    tags: ['闲趣巷', '旧物', '生活人物'],
  },
  {
    id: 'wanxi_npc_former_challenger',
    roleKey: 'former_challenger',
    name: '裴照川',
    identity: '闲散酒客',
    description: '常在临水别院喝酒投签，看起来只是个闲人，握杯的手却不像没练过。',
    sigil: '川',
    defaultGreeting: '赢过的人太多，记不住。输过的那几次，倒是一闭眼就回来。',
    conversationKey: 'wanxi.former_challenger',
    tags: ['临水别院', '挑战', '身份隐藏'],
  },
  {
    id: 'wanxi_npc_runner_boy',
    roleKey: 'runner_boy',
    name: '唐小雀',
    identity: '跑腿少年',
    description: '整日在坊中替人送东西，脚程快、嘴也快，因为总被忽视反而看见了许多事。',
    sigil: '雀',
    defaultGreeting: '找人？你算问对了——不过我先说好，我只保证刚才看见过。',
    conversationKey: 'wanxi.runner_boy',
    tags: ['流动人物', '跑腿', '地图引导'],
  },
  {
    id: 'wanxi_npc_night_watchman',
    roleKey: 'night_watchman',
    name: '段无声',
    identity: '守夜人',
    description: '只在夜里真正属于万戏坊的人。白天很少有人注意到他。',
    sigil: '夜',
    defaultGreeting: '夜里少走没灯的路。若非要走，至少记清自己是从哪儿进去的。',
    conversationKey: 'wanxi.night_watchman',
    tags: ['夜间人物', '守夜', '流动人物'],
  },
  {
    id: 'wanxi_npc_mysterious_girl',
    roleKey: 'mysterious_girl',
    name: '阿绯',
    identity: '来历不明的少女',
    description: '偶尔出现在不该有人出现的地方。很多常识她不知道，有些旧事却知道得过分清楚。',
    sigil: '绯',
    defaultGreeting: '你们都说“以前”。可如果一个人没有以前，她该从哪里开始算自己？',
    conversationKey: 'wanxi.mysterious_girl',
    tags: ['神秘', '动态人物', '长期主线'],
  },
  {
    id: 'wanxi_npc_stage_musician',
    roleKey: 'stage_musician',
    name: '林照晚',
    identity: '百戏台琴师',
    description: '琴声清冷，很少应客人的点曲。坊中老人说，她年轻时并不是这样的。',
    sigil: '琴',
    defaultGreeting: '若是听琴，坐下便是。若是问旧事……今日不谈。',
    conversationKey: 'wanxi.stage_musician',
    tags: ['琴师', '灯火未迟'],
  },
  {
    id: 'wanxi_npc_mechanist',
    roleKey: 'mechanist',
    name: '祁望川',
    identity: '机关匠',
    description: '刚回到万戏坊不久的机关匠，擅修灯、木偶与各类不起眼的小机关。',
    sigil: '匠',
    defaultGreeting: '若是坏了的东西，放下便好。能修的，我尽量修。',
    conversationKey: 'wanxi.mechanist',
    tags: ['机关匠', '灯火未迟'],
  },
] as const satisfies readonly WanxiNpcDefinition[];

export const WANXI_DEFAULT_NPC_PLACEMENTS = [
  {
    npcId: 'wanxi_npc_master',
    regionId: 'hall',
    locationId: 'hall_forecourt',
    point: { x: 51, y: 24 },
    anchor: 'bottom',
    priority: 100,
    marker: { importance: 'major', minScale: 0.48 },
  },
  {
    npcId: 'wanxi_npc_gate_steward',
    regionId: 'gate',
    locationId: 'gate',
    point: { x: 47, y: 81 },
    anchor: 'bottom',
    priority: 100,
    marker: { importance: 'major', minScale: 0.48 },
  },
  {
    npcId: 'wanxi_npc_stage_curator',
    regionId: 'stage',
    locationId: 'stage_forecourt',
    point: { x: 76, y: 36 },
    anchor: 'bottom',
    priority: 100,
    marker: { importance: 'major', minScale: 0.48 },
  },
  {
    npcId: 'wanxi_npc_lakeside_guest',
    regionId: 'lakeside',
    locationId: 'lakeside',
    point: { x: 69, y: 51 },
    anchor: 'bottom',
    priority: 100,
    marker: { importance: 'major', minScale: 0.48 },
  },
  {
    npcId: 'wanxi_npc_west_host',
    regionId: 'west_market',
    locationId: 'west_courtyard',
    point: { x: 27, y: 55 },
    anchor: 'bottom',
    priority: 100,
    marker: { importance: 'major', minScale: 0.48 },
  },
  {
    npcId: 'wanxi_npc_bamboo_stranger',
    regionId: 'bamboo',
    locationId: 'bamboo_garden',
    point: { x: 20, y: 27 },
    anchor: 'bottom',
    priority: 100,
    marker: { importance: 'normal', minScale: 0.62 },
  },
] as const satisfies readonly WanxiNpcPlacement[];

/**
 * V1 keeps bindings declarative but does not yet activate concrete game/story workspaces.
 * Consumers must only expose ids included by WanxiSceneRuntimeSnapshot.enabledActivityBindingIds.
 */
export const WANXI_ACTIVITY_BINDINGS = [
  {
    id: 'wanxi.master.story.intro',
    source: { type: 'npc', npcId: 'wanxi_npc_master' },
    activity: { type: 'story', id: 'wanxi.story.intro' },
    priority: 10,
    label: '谈谈万戏坊',
  },
  {
    id: 'wanxi.stage.event.today',
    source: { type: 'npc', npcId: 'wanxi_npc_stage_curator' },
    activity: { type: 'event', id: 'wanxi.stage.today' },
    priority: 20,
    label: '问问今日台上有什么',
  },
  {
    id: 'wanxi.lakeside.story.rumor',
    source: { type: 'npc', npcId: 'wanxi_npc_lakeside_guest' },
    activity: { type: 'story', id: 'wanxi.lakeside.rumor' },
    priority: 20,
    label: '聊聊湖上的传闻',
  },
  {
    id: 'wanxi.west.event.curio',
    source: { type: 'npc', npcId: 'wanxi_npc_west_host' },
    activity: { type: 'event', id: 'wanxi.west.curio' },
    priority: 20,
    label: '看看今日的新鲜玩意',
  },
  {
    id: 'wanxi.bamboo.story.stranger',
    source: { type: 'npc', npcId: 'wanxi_npc_bamboo_stranger' },
    activity: { type: 'story', id: 'wanxi.bamboo.stranger' },
    priority: 10,
    label: '问问他的来历',
  },
  {
    id: 'wanxi.story.lamp.start',
    source: { type: 'npc', npcId: 'wanxi_npc_gate_steward' },
    activity: { type: 'story', id: 'wanxi.story.lamp_v1' },
    priority: 5,
    label: '帮忙送一件旧物',
  },
  {
    id: 'wanxi.story.lamp.lin-refuses',
    source: { type: 'npc', npcId: 'wanxi_npc_stage_musician' },
    activity: { type: 'story', id: 'wanxi.story.lamp_v1' },
    priority: 5,
    label: '把旧灯穗递给她',
  },
  {
    id: 'wanxi.story.lamp.lu-clue',
    source: { type: 'npc', npcId: 'wanxi_npc_gate_steward' },
    activity: { type: 'story', id: 'wanxi.story.lamp_v1' },
    priority: 5,
    label: '告诉他林照晚没有收下',
  },
  {
    id: 'wanxi.story.lamp.qi-inspects',
    source: { type: 'npc', npcId: 'wanxi_npc_mechanist' },
    activity: { type: 'story', id: 'wanxi.story.lamp_v1' },
    priority: 5,
    label: '请他看看旧灯穗',
  },
  {
    id: 'wanxi.story.lamp.take-moonsilk',
    source: { type: 'npc', npcId: 'wanxi_npc_roaming_merchant' },
    activity: { type: 'story', id: 'wanxi.story.lamp_v1' },
    priority: 5,
    label: '取三缕月蚕丝',
  },
  {
    id: 'wanxi.story.lamp.repair-tassel',
    source: { type: 'npc', npcId: 'wanxi_npc_mechanist' },
    activity: { type: 'story', id: 'wanxi.story.lamp_v1' },
    priority: 5,
    label: '请他修好灯穗',
  },
  {
    id: 'wanxi.story.lamp.confrontation',
    source: { type: 'location', locationId: 'west_courtyard' },
    activity: { type: 'story', id: 'wanxi.story.lamp_v1' },
    priority: 5,
    label: '把修好的灯穗递过去',
  },
  {
    id: 'wanxi.story.lamp.qi-coughs',
    source: { type: 'npc', npcId: 'wanxi_npc_mechanist' },
    activity: { type: 'story', id: 'wanxi.story.lamp_v1' },
    priority: 5,
    label: '追问他的伤势',
  },
  {
    id: 'wanxi.story.lamp.jiang-diagnoses',
    source: { type: 'npc', npcId: 'wanxi_npc_lakeside_guest' },
    activity: { type: 'story', id: 'wanxi.story.lamp_v1' },
    priority: 5,
    label: '请他辨认祁望川的伤',
  },
  {
    id: 'wanxi.story.lamp.take-contract-sand',
    source: { type: 'location', locationId: 'water_pavilion' },
    activity: { type: 'story', id: 'wanxi.story.lamp_v1' },
    priority: 5,
    label: '从石隙取一撮沉契砂',
  },
  {
    id: 'wanxi.story.lamp.reveal-contract',
    source: { type: 'npc', npcId: 'wanxi_npc_mechanist' },
    activity: { type: 'story', id: 'wanxi.story.lamp_v1' },
    priority: 5,
    label: '让旧灵契显形',
  },
  {
    id: 'wanxi.story.lamp.battle',
    source: { type: 'npc', npcId: 'wanxi_npc_mechanist' },
    activity: { type: 'story', id: 'wanxi.story.lamp_v1' },
    priority: 5,
    label: '迎战索契灵',
  },
  {
    id: 'wanxi.story.lamp.show-contract',
    source: { type: 'npc', npcId: 'wanxi_npc_stage_musician' },
    activity: { type: 'story', id: 'wanxi.story.lamp_v1' },
    priority: 5,
    label: '把焦黑灵契留下',
  },
  {
    id: 'wanxi.story.lamp.retrieve-casket',
    source: { type: 'location', locationId: 'main_hall' },
    activity: { type: 'story', id: 'wanxi.story.lamp_v1' },
    priority: 5,
    label: '用钥匙打开旧库琴盒',
  },
  {
    id: 'wanxi.story.lamp.return-casket',
    source: { type: 'npc', npcId: 'wanxi_npc_stage_musician' },
    activity: { type: 'story', id: 'wanxi.story.lamp_v1' },
    priority: 5,
    label: '把旧琴盒交给她',
  },
  {
    id: 'wanxi.story.lamp.reunion',
    source: { type: 'location', locationId: 'water_pavilion' },
    activity: { type: 'story', id: 'wanxi.story.lamp_v1' },
    priority: 5,
    label: '听他们把旧事说完',
  },
  ...WANXI_WORLD_ACTIVITY_BINDINGS,
] as const satisfies readonly WanxiActivityBinding[];

/** Concrete mini-games are intentionally empty in V1; new games register here. */
export const WANXI_GAME_REGISTRY = [] as const satisfies readonly WanxiGameDefinition[];

export const WANXI_MAIN_SCENE: WanxiSceneDefinition = {
  id: 'wanxi_main',
  name: '万戏坊',
  backgroundAssetKey: 'wanxi.main-map.v1',
  logicalSize: { width: 3056, height: 2143 },
  regions: WANXI_REGIONS,
  locations: WANXI_LOCATIONS,
  locationPlacements: WANXI_LOCATION_PLACEMENTS,
  labels: WANXI_SCENE_LABELS,
};

const npcById = new Map<string, WanxiNpcDefinition>(
  WANXI_NPCS.map((npc) => [npc.id, npc]),
);
const npcByRoleKey = new Map<WanxiNpcRoleKey, WanxiNpcDefinition>(
  WANXI_NPCS.map((npc) => [npc.roleKey, npc]),
);
const locationById = new Map<string, WanxiLocationDefinition>(
  WANXI_LOCATIONS.map((location) => [location.id, location]),
);
const regionById = new Map<WanxiRegionId, WanxiRegionDefinition>(
  WANXI_REGIONS.map((region) => [region.id, region]),
);

export function getWanxiNpcById(id: string) {
  return npcById.get(id) ?? null;
}

export function getWanxiNpcByRoleKey(roleKey: string) {
  return npcByRoleKey.get(roleKey as WanxiNpcRoleKey) ?? null;
}

export function getWanxiLocation(id: string) {
  return locationById.get(id) ?? null;
}

export function getWanxiRegion(id: string) {
  return regionById.get(id as (typeof WANXI_REGIONS)[number]['id']) ?? null;
}

export function getWanxiBindingsForNpc(npcId: string) {
  return WANXI_ACTIVITY_BINDINGS.filter(
    (binding) => binding.source.type === 'npc' && binding.source.npcId === npcId,
  ).sort((left, right) => left.priority - right.priority);
}

export function getWanxiBindingsForLocation(locationId: string) {
  return WANXI_ACTIVITY_BINDINGS.filter(
    (binding) =>
      binding.source.type === 'location' &&
      binding.source.locationId === locationId,
  ).sort((a, b) => a.priority - b.priority);
}

export function getWanxiBindingsForProp(propId: string) {
  return WANXI_ACTIVITY_BINDINGS.filter(
    (binding) =>
      binding.source.type === 'prop' &&
      binding.source.propId === propId,
  ).sort((a, b) => a.priority - b.priority);
}

export function getWanxiEnabledBindings(args: {
  npcId?: string;
  locationId?: string | null;
  propId?: string;
  enabledIds: readonly string[];
}) {
  const enabled = new Set(args.enabledIds);
  const bindings = [
    ...(args.npcId ? getWanxiBindingsForNpc(args.npcId) : []),
    ...(args.locationId ? getWanxiBindingsForLocation(args.locationId) : []),
    ...(args.propId ? getWanxiBindingsForProp(args.propId) : []),
  ].filter((binding) => enabled.has(binding.id));

  const seen = new Set<string>();
  return bindings.filter((binding) => {
    if (seen.has(binding.id)) return false;
    seen.add(binding.id);
    return true;
  });
}

