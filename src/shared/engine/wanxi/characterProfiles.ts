import type { WanxiCoreNpcRoleKey } from './npcRoster';
import type { WanxiContinuityMessage } from './continuity';

export interface WanxiCharacterProfile {
  roleKey: WanxiCoreNpcRoleKey;
  publicPersona: string;
  voice: string;
  desire: string;
  fear: string;
  flaw: string;
  boundary: string;
  theme: string;
  relationshipHooks: readonly string[];
}

export interface WanxiFirstContactChoiceDefinition {
  id: string;
  label: string;
  playerText: string;
  familiarityDelta: number;
  memoryTag: string;
  memoryText: string;
  responseMessages: readonly WanxiContinuityMessage[];
}

export interface WanxiFirstContactDefinition {
  roleKey: WanxiCoreNpcRoleKey;
  title: string;
  summary: string;
  openingMessages: readonly WanxiContinuityMessage[];
  choices: readonly WanxiFirstContactChoiceDefinition[];
}

export interface WanxiFirstContactResolutionResult {
  roleKey: WanxiCoreNpcRoleKey;
  choice: {
    id: string;
    label: string;
    playerText: string;
  };
  messages: WanxiContinuityMessage[];
}

export const WANXI_CHARACTER_PROFILES = [
  {
    roleKey: 'master',
    publicPersona: '礼数周全、克制稳重的万戏坊坊主，很少让情绪先于判断。',
    voice: '语速慢，少直接否定，常把决定权用一句反问推回给对方。',
    desire: '让万戏坊长久存在，并让坊中人仍愿意把这里当作归处。',
    fear: '一件旧事被重新翻出后，让所有人再度分裂。',
    flaw: '过度相信隐瞒可以替别人承担代价。',
    boundary: '不轻易谈论被封存的旧事，也不允许别人拿坊中人的隐私取乐。',
    theme: '秩序是否值得用隐瞒维持',
    relationshipHooks: ['白无昼', '江听鹤', '沈砚秋', '陆清和', '阿绯'],
  },
  {
    roleKey: 'script_scholar',
    publicPersona: '替万戏坊收存、改写戏本的人，习惯把任何事情先看成一段结构。',
    voice: '冷静、挑剔，常用“这句话不好”“如果这是戏……”评价眼前的人和事。',
    desire: '写出一部真正属于自己的戏。',
    fear: '一旦认真写自己，便失去旁观者的安全位置。',
    flaw: '太容易把真实人生当成戏剧结构。',
    boundary: '不替当事人公开他们明确要求保密的文字。',
    theme: '讲别人的故事容易，承认自己的故事很难',
    relationshipHooks: ['温不语', '苏照影', '闻人砚', '白无昼'],
  },
  {
    roleKey: 'gate_steward',
    publicPersona: '记得每个来客与离客的迎客执事，是万戏坊最可靠的人际索引。',
    voice: '圆融、清楚，不说废话，擅长把复杂事情解释得像日常小事。',
    desire: '让每个走进万戏坊的人都能找到自己的去处。',
    fear: '有一天没人再需要他，也没人记得他。',
    flaw: '总把自己的需求排到最后。',
    boundary: '不会随便泄露别人离坊、来访和托付的私事。',
    theme: '一直记住别人，却很少有人真正记住自己',
    relationshipHooks: ['唐小雀', '段无声', '闻人砚'],
  },
  {
    roleKey: 'storyteller',
    publicPersona: '在百戏广场说书的游方人，故事真假掺半，常把真事换了名字再讲。',
    voice: '健谈、会吊胃口，喜欢用故事回答问题。',
    desire: '把世间值得留下的故事都讲下去。',
    fear: '自己的那段真事有一天被别人当面认出来。',
    flaw: '容易把他人的隐私也视作可讲述的材料。',
    boundary: '不会替真正求他闭嘴的人公开最后一层身份。',
    theme: '真实的事情成为故事以后，还属于当事人吗',
    relationshipHooks: ['沈砚秋', '唐小雀', '宁小满', '莫问生'],
  },
  {
    roleKey: 'chess_keeper',
    publicPersona: '百戏广场棋摊主人，看起来输多赢少，却从不急着证明自己。',
    voice: '懒散，常借棋局说人，但很少把话说满。',
    desire: '看懂输赢之外，人为什么非要赢。',
    fear: '被人逼着重新证明自己真正的棋力。',
    flaw: '有时会自作主张认为别人“今天需要赢”。',
    boundary: '不拿真正伤人的赌注上桌。',
    theme: '赢是不是唯一有价值的结果',
    relationshipHooks: ['裴照川', '温不语'],
  },
  {
    roleKey: 'stage_curator',
    publicPersona: '百戏台掌事，对时间、节拍、走位和执行细节近乎苛刻。',
    voice: '准确、简短，很少用夸张形容词。',
    desire: '让每一场登台都值得观众花时间来看。',
    fear: '一次失误拖垮所有人的努力。',
    flaw: '渐渐把“没有错误”误当成“真正好”。',
    boundary: '不会让明显不安全的演出为了效果硬上。',
    theme: '完美和真实是不是一回事',
    relationshipHooks: ['顾长弦', '洛轻罗', '沈砚秋', '韩知巧'],
  },
  {
    roleKey: 'chief_musician',
    publicPersona: '百戏台首席乐师，习惯让乐器、物件、时间都维持稳定秩序。',
    voice: '短句、停顿规律，像说话也在数拍子。',
    desire: '让一切在正确的节奏里运行。',
    fear: '不可预期的失控再次伤到身边的人。',
    flaw: '控制欲过强，难以接受即兴。',
    boundary: '不会为了取悦观众故意毁坏乐器或透支演奏者。',
    theme: '如果一切都被控制住，就真的不会出错吗',
    relationshipHooks: ['苏照影', '洛轻罗'],
  },
  {
    roleKey: 'dancer',
    publicPersona: '极懂观众喜欢什么的舞伶，几乎能自然适配每一个人的期待。',
    voice: '亲近、灵活，和不同人说话时语气会明显变化。',
    desire: '被真正地喜欢，而不是只被喜欢她扮演出的样子。',
    fear: '说出自己的喜好以后，发现没人喜欢真正的她。',
    flaw: '习惯迎合，以至于越来越难辨认自己的选择。',
    boundary: '不会拿别人明确的软肋当舞台笑料。',
    theme: '讨人喜欢和成为自己',
    relationshipHooks: ['苏照影', '顾长弦', '燕十三娘'],
  },
  {
    roleKey: 'lakeside_guest',
    publicPersona: '听澜湖岸客卿，知道很多事情，但极少直接替别人下结论。',
    voice: '话少、平静，喜欢用问题让对方自己决定。',
    desire: '让每个人承担属于自己的选择。',
    fear: '再次因为不介入而看着坏事发生。',
    flaw: '容易把“不替别人选择”推到过度旁观。',
    boundary: '不会把别人的决定伪装成自己的建议强塞出去。',
    theme: '旁观是否也是一种选择',
    relationshipHooks: ['闻人砚', '谢微尘', '桑落', '白无昼'],
  },
  {
    roleKey: 'lantern_maker',
    publicPersona: '水榭花灯匠，常替别人收下不敢直接说出口的愿望。',
    voice: '轻、温和，很少使用绝对词。',
    desire: '让别人仍愿意对明天有所期待。',
    fear: '自己真正许下愿望之后仍然失望。',
    flaw: '用“不期待”保护自己。',
    boundary: '不会擅自拆看别人明确封好的愿笺。',
    theme: '不抱希望，真的就不会失望吗',
    relationshipHooks: ['江听鹤', '阿绯', '谢微尘'],
  },
  {
    roleKey: 'tea_physician',
    publicPersona: '湖岸药茶医师，嘴上不留情，却会把每个人的小伤记得很清楚。',
    voice: '直接、冷静、略带讥讽，但不恶毒。',
    desire: '尽可能救下仍然有办法救的人。',
    fear: '再次面对倾尽所学仍无能为力的情况。',
    flaw: '容易把“救不了”视作自己的失败。',
    boundary: '不会拿没有把握的疗法装成确定答案。',
    theme: '接受自己的无能为力',
    relationshipHooks: ['江听鹤', '裴照川', '桑落'],
  },
  {
    roleKey: 'west_host',
    publicPersona: '闲趣西院掌柜，遇到未知的第一反应通常是拆开看看。',
    voice: '快、直接、思路跳跃，一想到办法就想马上试。',
    desire: '把未知问题弄明白。',
    fear: '面对不能拆、不能测、不能验证的关系。',
    flaw: '容易把人也当成可以拆解分析的问题。',
    boundary: '不会明知会伤人还把危险机关塞给毫不知情的人试。',
    theme: '聪明不能代替信任',
    relationshipHooks: ['宁小满', '唐小雀', '莫问生', '苏照影'],
  },
  {
    roleKey: 'mask_artisan',
    publicPersona: '闲趣巷面具师，最会看别人适合哪张脸，却从不谈自己的真脸。',
    voice: '观察尖锐，评价直接，偶尔带点故意让人不舒服的准确。',
    desire: '让人承认“选择一张脸”不等于虚假。',
    fear: '自己的身份被别人定义成唯一答案。',
    flaw: '擅长揭别人，却拒绝别人靠近自己。',
    boundary: '不会强迫别人揭开不愿公开的身份。',
    theme: '面具是否一定意味着虚假',
    relationshipHooks: ['洛轻罗', '莫问生', '白无昼'],
  },
  {
    roleKey: 'curio_dealer',
    publicPersona: '旧物摊主，关心一件东西为什么来到这里，多过它值多少灵石。',
    voice: '慢、绕，常把问题推回物件本身。',
    desire: '让旧物找到真正合适的去处。',
    fear: '把不该流通的东西交给错误的人。',
    flaw: '过度相信物件自身有“意愿”。',
    boundary: '不会因为价高就卖掉自己认定不能卖的旧物。',
    theme: '物品能否保存人的一部分',
    relationshipHooks: ['燕十三娘', '韩知巧', '白无昼', '阿绯'],
  },
  {
    roleKey: 'bamboo_stranger',
    publicPersona: '静竹苑里来历模糊的人，像认识万戏坊，又像只是偶然停在这里。',
    voice: '短句、停顿多，有时像已经知道问题会怎么问。',
    desire: '决定哪些过去还值得被留下。',
    fear: '真相重新出现后，再次伤害所有人。',
    flaw: '习惯替别人决定“忘了更好”。',
    boundary: '不会在没有必要时主动把旧伤翻给无关的人看。',
    theme: '人有没有权让别人忘记真相',
    relationshipHooks: ['闻人砚', '沈砚秋', '莫问生', '江听鹤', '阿绯'],
  },
  {
    roleKey: 'former_challenger',
    publicPersona: '临水别院闲散酒客，看起来早已不在意过去的胜负。',
    voice: '豪爽、自嘲，谈到真正关键的过去时反而会迅速转轻。',
    desire: '找到失败以后仍然值得继续活的自己。',
    fear: '别人永远只记得他的巅峰或最后一次失败。',
    flaw: '把“接受失败”误成彻底放弃。',
    boundary: '不拿别人的性命证明自己的旧名声。',
    theme: '人生是不是只有巅峰才算值得',
    relationshipHooks: ['迟观棋', '谢微尘', '段无声'],
  },
  {
    roleKey: 'roaming_merchant',
    publicPersona: '总说卖完这批就走的行脚商人，却已经在万戏坊来回很多年。',
    voice: '热络、会算账，遇到感情问题就习惯用生意话绕开。',
    desire: '既保持自由，又拥有一个愿意回来的地方。',
    fear: '承认自己有归属以后，就失去离开的自由。',
    flaw: '用“只是路过”逃避归属感。',
    boundary: '不会用假货骗熟客，也不替来路不明的危险东西背书。',
    theme: '一直说只是路过的人，什么时候才算有家',
    relationshipHooks: ['韩知巧', '温不语', '陆清和'],
  },
  {
    roleKey: 'runner_boy',
    publicPersona: '整日在坊中跑腿的少年，常被大人物忽略，却因此看见很多东西。',
    voice: '快、直、爱八卦，真正碰到重要事情时会突然认真。',
    desire: '证明自己不只是替别人传话的人。',
    fear: '所有人永远只把他当小孩和跑腿。',
    flaw: '看到半截真相以后喜欢自作聪明补齐剩下部分。',
    boundary: '真遇到可能伤人的事，不会拿来当八卦四处传。',
    theme: '没有人在意的人，可能看到最多',
    relationshipHooks: ['陆清和', '韩知巧', '温不语', '苏照影'],
  },
  {
    roleKey: 'night_watchman',
    publicPersona: '夜间守坊人，白天很少有人注意，夜里却见过另一套万戏坊。',
    voice: '极简，回答常只有一两句，不喜欢解释自己看到的一切。',
    desire: '让万戏坊平安度过每一个夜晚。',
    fear: '曾经发生过的夜间异常再次出现。',
    flaw: '容易把“我看见了”与“我已经尽责”混为一谈。',
    boundary: '不会拿巡夜时见到的私人事情换人情。',
    theme: '被忽视的人往往看得最清楚',
    relationshipHooks: ['陆清和', '裴照川', '阿绯'],
  },
  {
    roleKey: 'mysterious_girl',
    publicPersona: '偶尔出现在不该有人出现之处的少女，对常识陌生，对某些旧事却异常熟悉。',
    voice: '认真、直白，问问题时没有成年人习惯的掩饰。',
    desire: '弄清自己是谁，并决定以后要成为什么人。',
    fear: '答案证明她只是别人留下来的结果。',
    flaw: '过度依赖过去解释自己的存在。',
    boundary: '不接受别人仅凭过去替她决定现在应该是谁。',
    theme: '人的身份由过去决定，还是由现在的选择决定',
    relationshipHooks: ['闻人砚', '白无昼', '桑落', '段无声', '莫问生'],
  },
] as const satisfies readonly WanxiCharacterProfile[];

export const WANXI_FIRST_CONTACT_DEFINITIONS = [
  {
    roleKey: 'master',
    title: '坊主的一杯茶',
    summary: '闻人砚没有先问你的来历，只先确认你是否打算在坊中多停几日。',
    openingMessages: [
      { id: 'first.master.1', speaker: '闻人砚', body: '第一次来？万戏坊没有太多必须守的规矩。', pauseAfterMs: 320 },
      { id: 'first.master.2', speaker: '闻人砚', body: '只一条——别急着替别人决定他该成为什么样的人。', gesture: '他替你斟了半盏茶。', pauseAfterMs: 420 },
    ],
    choices: [
      { id: 'ask-himself', label: '那坊主自己呢？', playerText: '那你自己呢？你也从不替别人决定？', familiarityDelta: 1, memoryTag: 'first_master_asked_his_rule', memoryText: '第一次见闻人砚时，你反问他是否也能做到不替别人决定。', responseMessages: [{ id: 'first.master.ask.1', speaker: '闻人砚', body: '做不到。所以这条规矩，我也一直在学。', emotion: 'hesitate' }] },
      { id: 'remember-rule', label: '我记住了', playerText: '我记住这条规矩。', familiarityDelta: 1, memoryTag: 'first_master_remembered_rule', memoryText: '第一次见闻人砚时，你认真答应记住万戏坊那条不写在门上的规矩。', responseMessages: [{ id: 'first.master.remember.1', speaker: '闻人砚', body: '记住容易。真正轮到自己时还能想起来，才难。', emotion: 'calm' }] },
      { id: 'just-looking', label: '我只是来看看', playerText: '我只是来看看，不一定会停很久。', familiarityDelta: 1, memoryTag: 'first_master_said_just_visiting', memoryText: '初见闻人砚时，你说自己也许只是路过。', responseMessages: [{ id: 'first.master.visit.1', speaker: '闻人砚', body: '路过也很好。很多真正重要的地方，一开始都只是路过。', emotion: 'calm' }] },
    ],
  },
  {
    roleKey: 'script_scholar',
    title: '先别把话说完',
    summary: '沈砚秋听你报了姓名，却像在读一段还没写完的开场。',
    openingMessages: [
      { id: 'first.script.1', speaker: '沈砚秋', body: '姓名、来处、目的……这些都像戏本第一行。', pauseAfterMs: 300 },
      { id: 'first.script.2', speaker: '沈砚秋', body: '但我更想知道，你会故意略去哪一句。', gesture: '他把笔搁在纸边。' },
    ],
    choices: [
      { id: 'nothing-hide', label: '我没什么好藏的', playerText: '我没什么特别想藏的。', familiarityDelta: 1, memoryTag: 'first_script_claimed_nothing_hidden', memoryText: '沈砚秋第一次问你会略去哪一句时，你说自己没什么好藏。', responseMessages: [{ id: 'first.script.none.1', speaker: '沈砚秋', body: '这通常是最容易被下一幕推翻的一句话。', emotion: 'calm' }] },
      { id: 'everyone-hides', label: '谁都会略一点', playerText: '谁都会略一点，只是有的人自己没发现。', familiarityDelta: 1, memoryTag: 'first_script_said_everyone_omits', memoryText: '初见沈砚秋时，你说每个人讲自己的故事都会略掉一点东西。', responseMessages: [{ id: 'first.script.omit.1', speaker: '沈砚秋', body: '这句话还行。至少不像开场白。', emotion: 'relief' }] },
      { id: 'ask-his-line', label: '你略掉哪一句？', playerText: '那你自己会略去哪一句？', familiarityDelta: 1, memoryTag: 'first_script_asked_his_omission', memoryText: '第一次见沈砚秋时，你把“会略去哪一句”的问题原样还给了他。', responseMessages: [{ id: 'first.script.back.1', speaker: '沈砚秋', body: '……你比大多数来翻戏本的人麻烦。', emotion: 'hesitate' }] },
    ],
  },
  {
    roleKey: 'gate_steward',
    title: '名字记在门口',
    summary: '陆清和没有拿纸笔，却准确复述了你的姓名。',
    openingMessages: [
      { id: 'first.gate.1', speaker: '陆清和', body: '名字我记住了。若哪天有人来找你，我至少知道该往哪边指。', pauseAfterMs: 320 },
      { id: 'first.gate.2', speaker: '陆清和', body: '万戏坊地方不大，人却很容易走散。' },
    ],
    choices: [
      { id: 'you-remember-all', label: '你都记得？', playerText: '每天这么多人，你全都记得？', familiarityDelta: 1, memoryTag: 'first_gate_asked_memory', memoryText: '初见陆清和时，你惊讶他似乎记得每个来客。', responseMessages: [{ id: 'first.gate.memory.1', speaker: '陆清和', body: '大多记得。忘了谁，比记住谁麻烦得多。', emotion: 'calm' }] },
      { id: 'where-find-you', label: '那我去哪找你？', playerText: '那如果是我找你呢？', familiarityDelta: 1, memoryTag: 'first_gate_asked_find_him', memoryText: '第一次和陆清和说话时，你问如果自己要找他，该去哪里。', responseMessages: [{ id: 'first.gate.find.1', speaker: '陆清和', body: '坊门。大多数时候我都在。少数不在的时候……反而说明真有事。', emotion: 'calm' }] },
      { id: 'dont-get-lost', label: '我尽量不走散', playerText: '那我尽量别让你费心找人。', familiarityDelta: 1, memoryTag: 'first_gate_promised_not_lost', memoryText: '初见陆清和时，你半开玩笑地说尽量不让他费心找人。', responseMessages: [{ id: 'first.gate.lost.1', speaker: '陆清和', body: '这话我听过很多次。通常第二天就有人问路。', emotion: 'relief' }] },
    ],
  },
  {
    roleKey: 'storyteller',
    title: '你想听真的还是假的',
    summary: '温不语刚收了折扇，就把选择题丢给了你。',
    openingMessages: [
      { id: 'first.storyteller.1', speaker: '温不语', body: '第一次坐我的摊？那先选。', pauseAfterMs: 260 },
      { id: 'first.storyteller.2', speaker: '温不语', body: '你想听真的，假的，还是听起来最像真的那一种？' },
    ],
    choices: [
      { id: 'true', label: '听真的', playerText: '真的。至少先让我知道自己被骗的时候该怪谁。', familiarityDelta: 1, memoryTag: 'first_storyteller_chose_true', memoryText: '第一次听温不语说书时，你先选了“真的”。', responseMessages: [{ id: 'first.storyteller.true.1', speaker: '温不语', body: '好。那我先告诉你，真正的故事通常没有传闻好听。', emotion: 'calm' }] },
      { id: 'false', label: '假的更有意思', playerText: '假的。既然听故事，何必太守规矩。', familiarityDelta: 1, memoryTag: 'first_storyteller_chose_false', memoryText: '第一次听温不语说书时，你说假的也许更有意思。', responseMessages: [{ id: 'first.storyteller.false.1', speaker: '温不语', body: '识货。只是假的听多了，有时会认出真事。', emotion: 'relief' }] },
      { id: 'most-true', label: '最像真的', playerText: '就听最像真的那一种。', familiarityDelta: 1, memoryTag: 'first_storyteller_chose_most_true', memoryText: '初见温不语时，你偏偏选了“听起来最像真的”那一种故事。', responseMessages: [{ id: 'first.storyteller.most.1', speaker: '温不语', body: '你这人以后会惹麻烦。因为最像真的，往往就是有人不想承认的真。', emotion: 'calm' }] },
    ],
  },
  {
    roleKey: 'chess_keeper',
    title: '第一局不赌输赢',
    summary: '迟观棋推过来一枚棋子，却没有问你会不会下。',
    openingMessages: [
      { id: 'first.chess.1', speaker: '迟观棋', body: '会不会下都能坐。第一局不赌输赢。', pauseAfterMs: 280 },
      { id: 'first.chess.2', speaker: '迟观棋', body: '我只想看看，你遇到一盘看不懂的棋，会先动哪一子。' },
    ],
    choices: [
      { id: 'center', label: '先动中间', playerText: '看不懂就先动最显眼的。', familiarityDelta: 1, memoryTag: 'first_chess_moved_center', memoryText: '第一次和迟观棋坐到棋盘前，你选择先动最显眼的一子。', responseMessages: [{ id: 'first.chess.center.1', speaker: '迟观棋', body: '直。未必好，但省得自己骗自己。', emotion: 'calm' }] },
      { id: 'edge', label: '先从边上试', playerText: '先动边上，留一点回头路。', familiarityDelta: 1, memoryTag: 'first_chess_moved_edge', memoryText: '初见迟观棋时，你选择从边上试探，给自己留回头路。', responseMessages: [{ id: 'first.chess.edge.1', speaker: '迟观棋', body: '谨慎的人常说自己只是多看一步。其实也是怕一步走死。', emotion: 'calm' }] },
      { id: 'dont-move', label: '先不动', playerText: '既然看不懂，我先不动。', familiarityDelta: 1, memoryTag: 'first_chess_waited', memoryText: '第一次坐迟观棋的棋摊，你没有急着落子。', responseMessages: [{ id: 'first.chess.wait.1', speaker: '迟观棋', body: '不动也是一手。很多人偏偏不肯承认。', emotion: 'relief' }] },
    ],
  },
  {
    roleKey: 'stage_curator',
    title: '台前没有差不多',
    summary: '苏照影先看了一眼戏台，再看你。',
    openingMessages: [
      { id: 'first.stage_curator.1', speaker: '苏照影', body: '百戏台可以随便看，后台不要随便进。', pauseAfterMs: 260 },
      { id: 'first.stage_curator.2', speaker: '苏照影', body: '还有，若你真觉得一场戏“差不多就行”，最好别在我面前说。' },
    ],
    choices: [
      { id: 'why-strict', label: '为什么这么严？', playerText: '一场戏而已，为什么要这么严？', familiarityDelta: 1, memoryTag: 'first_stage_curator_asked_strict', memoryText: '初见苏照影时，你直接问她为什么对一场戏要求那么严。', responseMessages: [{ id: 'first.stage_curator.strict.1', speaker: '苏照影', body: '因为台上一句“差不多”，落到台下就是别人花掉的一段时间。', emotion: 'calm' }] },
      { id: 'agree', label: '我不说差不多', playerText: '那我以后只说哪里好、哪里不好。', familiarityDelta: 1, memoryTag: 'first_stage_curator_agreed_precision', memoryText: '第一次见苏照影时，你答应不拿“差不多”敷衍评价百戏台。', responseMessages: [{ id: 'first.stage_curator.agree.1', speaker: '苏照影', body: '可以。说错也比说空话有用。', emotion: 'calm' }] },
      { id: 'watch-first', label: '我先看一场', playerText: '规矩先记着。我想先认真看一场。', familiarityDelta: 1, memoryTag: 'first_stage_curator_watch_first', memoryText: '初见苏照影时，你没有急着评价，只说想先完整看一场戏。', responseMessages: [{ id: 'first.stage_curator.watch.1', speaker: '苏照影', body: '这句话比多数第一次来的人靠谱。', emotion: 'relief' }] },
    ],
  },
  {
    roleKey: 'chief_musician',
    title: '先听四拍',
    summary: '顾长弦没有马上和你说话，只轻敲了四下桌沿。',
    openingMessages: [
      { id: 'first.music.1', speaker: '顾长弦', body: '一、二、三、四。', pauseAfterMs: 420 },
      { id: 'first.music.2', speaker: '顾长弦', body: '你刚才第二拍开始就急了半息。现在可以说话。' },
    ],
    choices: [
      { id: 'you-count-everything', label: '你什么都数拍？', playerText: '你连别人说话都要数拍子？', familiarityDelta: 1, memoryTag: 'first_music_asked_counting', memoryText: '初见顾长弦时，你问他是不是连别人说话也要数拍子。', responseMessages: [{ id: 'first.music.count.1', speaker: '顾长弦', body: '不是要。只是会听见。听见以后，很难假装没听见。', emotion: 'calm' }] },
      { id: 'try-again', label: '再来一次', playerText: '再来一次。这次我跟上。', familiarityDelta: 1, memoryTag: 'first_music_tried_again', memoryText: '第一次和顾长弦说话时，你让他再打一次四拍。', responseMessages: [{ id: 'first.music.again.1', speaker: '顾长弦', body: '好。别追拍子，让它自己过来。', emotion: 'calm' }] },
      { id: 'not-performance', label: '我又不是来演出的', playerText: '我又不是来演出的，也要这么准？', familiarityDelta: 1, memoryTag: 'first_music_not_performer', memoryText: '初见顾长弦时，你笑他对一个普通来客也要计较节拍。', responseMessages: [{ id: 'first.music.not.1', speaker: '顾长弦', body: '不用准。只是你既然已经听见了，就会开始在意。', emotion: 'relief' }] },
    ],
  },
  {
    roleKey: 'dancer',
    title: '这次不问你喜欢哪种',
    summary: '洛轻罗本来像要问你喜欢什么，话到嘴边又改了。',
    openingMessages: [
      { id: 'first.dancer.1', speaker: '洛轻罗', body: '第一次看我跳？那你喜欢——', pauseAfterMs: 260 },
      { id: 'first.dancer.2', speaker: '洛轻罗', body: '算了。今天不问你。今天我自己挑。', gesture: '她笑了一下，像是刚改掉一个习惯。' },
    ],
    choices: [
      { id: 'your-choice', label: '那就你自己选', playerText: '好。你想跳什么就跳什么。', familiarityDelta: 1, memoryTag: 'first_dancer_let_her_choose', memoryText: '初见洛轻罗时，你没有点曲目，只让她自己选想跳的。', responseMessages: [{ id: 'first.dancer.choose.1', speaker: '洛轻罗', body: '这句话听起来很轻松，真轮到我选反而有点难。', emotion: 'hesitate' }] },
      { id: 'what-you-like', label: '你自己喜欢什么？', playerText: '那你自己最喜欢什么？', familiarityDelta: 1, memoryTag: 'first_dancer_asked_preference', memoryText: '第一次见洛轻罗时，你直接问她自己最喜欢什么。', responseMessages: [{ id: 'first.dancer.like.1', speaker: '洛轻罗', body: '……你一上来就问这么难的问题？', emotion: 'hesitate' }] },
      { id: 'surprise-me', label: '随便，给我惊喜', playerText: '不用照顾我，随便挑一个让我意外的。', familiarityDelta: 1, memoryTag: 'first_dancer_asked_surprise', memoryText: '初见洛轻罗时，你让她不用迎合自己，只管选一个意外的。', responseMessages: [{ id: 'first.dancer.surprise.1', speaker: '洛轻罗', body: '好。这句我喜欢。至少失败了也算我自己的。', emotion: 'relief' }] },
    ],
  },
  {
    roleKey: 'lakeside_guest',
    title: '湖边的问题',
    summary: '江听鹤没有问你来做什么，只问了一个看似没来由的问题。',
    openingMessages: [
      { id: 'first.lakeside.1', speaker: '江听鹤', body: '若你明知道朋友会做错一件事，会不会替他拦下来？', pauseAfterMs: 360 },
      { id: 'first.lakeside.2', speaker: '江听鹤', body: '不急着答。湖边最不缺时间。' },
    ],
    choices: [
      { id: 'stop', label: '会拦', playerText: '会。看着他犯错不管，也是一种选择。', familiarityDelta: 1, memoryTag: 'first_lakeside_would_stop', memoryText: '初见江听鹤时，你说看着朋友犯错不管，同样是一种选择。', responseMessages: [{ id: 'first.lakeside.stop.1', speaker: '江听鹤', body: '是。只是拦下以后，你也要承认自己替他改变了路。', emotion: 'calm' }] },
      { id: 'let-choose', label: '让他自己选', playerText: '如果代价主要由他承担，我会让他自己选。', familiarityDelta: 1, memoryTag: 'first_lakeside_let_choose', memoryText: '第一次和江听鹤谈话时，你更愿意把选择留给当事人。', responseMessages: [{ id: 'first.lakeside.choose.1', speaker: '江听鹤', body: '这答案我熟。熟到不敢说它一定对。', emotion: 'hesitate' }] },
      { id: 'depends', label: '先看会伤到谁', playerText: '先看这件错事会不会伤到别人。', familiarityDelta: 1, memoryTag: 'first_lakeside_depends_harm', memoryText: '初见江听鹤时，你认为是否介入要先看错误会伤到谁。', responseMessages: [{ id: 'first.lakeside.depends.1', speaker: '江听鹤', body: '至少你没有把“不干涉”当成一句万能答案。', emotion: 'relief' }] },
    ],
  },
  {
    roleKey: 'lantern_maker',
    title: '一盏不写愿望的灯',
    summary: '桑落递给你一张小小的愿笺，却说不写也可以。',
    openingMessages: [
      { id: 'first.lantern.1', speaker: '桑落', body: '来都来了，要不要写一个愿望？', pauseAfterMs: 300 },
      { id: 'first.lantern.2', speaker: '桑落', body: '不写也行。空白的灯也能漂很远。' },
    ],
    choices: [
      { id: 'write', label: '写一个', playerText: '那就写一个。愿望不一定非要实现才有用。', familiarityDelta: 1, memoryTag: 'first_lantern_wrote_wish', memoryText: '第一次见桑落时，你选择认真写下一张愿笺。', responseMessages: [{ id: 'first.lantern.write.1', speaker: '桑落', body: '嗯。至少写下那一刻，你知道自己真正想要什么。', emotion: 'calm' }] },
      { id: 'blank', label: '就留空白', playerText: '我先留空白。等真想到的时候再写。', familiarityDelta: 1, memoryTag: 'first_lantern_left_blank', memoryText: '初见桑落时，你选择让第一张愿笺保持空白。', responseMessages: [{ id: 'first.lantern.blank.1', speaker: '桑落', body: '也好。空白不等于没有，只是还没决定。', emotion: 'relief' }] },
      { id: 'ask-hers', label: '你自己的呢？', playerText: '你每天替别人做灯，你自己的愿望呢？', familiarityDelta: 1, memoryTag: 'first_lantern_asked_hers', memoryText: '第一次见桑落时，你问她替那么多人做灯，为什么没有自己的愿望。', responseMessages: [{ id: 'first.lantern.hers.1', speaker: '桑落', body: '我？我手上忙不过来，先替别人做。', gesture: '她低头理了理灯骨，没有继续说。', emotion: 'hesitate' }] },
    ],
  },
  {
    roleKey: 'tea_physician',
    title: '先坐，再嘴硬',
    summary: '谢微尘看了你一眼，第一句话并不客气。',
    openingMessages: [
      { id: 'first.physician.1', speaker: '谢微尘', body: '脸色还行，走路也没飘。至少今天不用我救。', pauseAfterMs: 260 },
      { id: 'first.physician.2', speaker: '谢微尘', body: '不过既然站到药炉边了，先坐。别拿“没事”当诊断。' },
    ],
    choices: [
      { id: 'fine', label: '我真没事', playerText: '我真没事，只是路过。', familiarityDelta: 1, memoryTag: 'first_physician_said_fine', memoryText: '初见谢微尘时，你第一反应就是强调自己没事。', responseMessages: [{ id: 'first.physician.fine.1', speaker: '谢微尘', body: '“没事”是病人最爱说、医师最不爱听的两个字。', emotion: 'calm' }] },
      { id: 'tea', label: '那给我杯茶', playerText: '行。既然坐了，给我一杯你最放心的。', familiarityDelta: 1, memoryTag: 'first_physician_asked_tea', memoryText: '第一次见谢微尘时，你坐下来向他要了一杯他最放心的药茶。', responseMessages: [{ id: 'first.physician.tea.1', speaker: '谢微尘', body: '终于有人知道药炉不只是摆设。等着。', emotion: 'relief' }] },
      { id: 'you-rest', label: '你自己休息吗？', playerText: '你总叫别人坐，你自己会休息吗？', familiarityDelta: 1, memoryTag: 'first_physician_asked_rest', memoryText: '初见谢微尘时，你反问这个总让别人休息的医师自己会不会休息。', responseMessages: [{ id: 'first.physician.rest.1', speaker: '谢微尘', body: '……你是来看病还是来找医师的毛病？', emotion: 'hesitate' }] },
    ],
  },
  {
    roleKey: 'west_host',
    title: '拆开看看',
    summary: '韩知巧正盯着一件不知用途的小机关，眼睛比招呼你时亮得多。',
    openingMessages: [
      { id: 'first.west.1', speaker: '韩知巧', body: '来得正好。你看这个——不知道干什么的。', pauseAfterMs: 280 },
      { id: 'first.west.2', speaker: '韩知巧', body: '所以我准备拆。你觉得先拆哪边？' },
    ],
    choices: [
      { id: 'left', label: '先拆左边', playerText: '左边。看起来像是先装上去的。', familiarityDelta: 1, memoryTag: 'first_west_chose_left', memoryText: '初见韩知巧时，你真的陪她研究了一件来路不明的小机关。', responseMessages: [{ id: 'first.west.left.1', speaker: '韩知巧', body: '我也这么想。很好，你至少不是只会说“别乱动”。', emotion: 'relief' }] },
      { id: 'dont', label: '先别拆', playerText: '连用途都不知道，先别拆。', familiarityDelta: 1, memoryTag: 'first_west_said_dont_dismantle', memoryText: '第一次见韩知巧时，你第一句话就是劝她别急着拆未知机关。', responseMessages: [{ id: 'first.west.dont.1', speaker: '韩知巧', body: '你跟莫问生一定聊得来。你们都觉得“不拆”也是办法。', emotion: 'calm' }] },
      { id: 'ask-owner', label: '先问是谁的', playerText: '先问清楚是谁的，不然拆完才发现要赔。', familiarityDelta: 1, memoryTag: 'first_west_asked_owner', memoryText: '初见韩知巧时，你提醒她拆东西以前至少先确认物主。', responseMessages: [{ id: 'first.west.owner.1', speaker: '韩知巧', body: '……这个问题很实际。比“能不能拆”更实际。', emotion: 'hesitate' }] },
    ],
  },
  {
    roleKey: 'mask_artisan',
    title: '你适合哪张脸',
    summary: '燕十三娘只看了你几眼，就从墙上摘下一张面具。',
    openingMessages: [
      { id: 'first.mask.1', speaker: '燕十三娘', body: '别动。让我看看。', pauseAfterMs: 260 },
      { id: 'first.mask.2', speaker: '燕十三娘', body: '你这种人，适合戴一张看起来什么都不怕的脸。', gesture: '她把面具在你脸前比了比。' },
    ],
    choices: [
      { id: 'why', label: '为什么？', playerText: '为什么偏偏是“什么都不怕”的脸？', familiarityDelta: 1, memoryTag: 'first_mask_asked_why', memoryText: '初见燕十三娘时，你追问她为什么觉得你适合一张“什么都不怕”的脸。', responseMessages: [{ id: 'first.mask.why.1', speaker: '燕十三娘', body: '因为真正什么都不怕的人，通常不需要戴这一张。', emotion: 'calm' }] },
      { id: 'no-mask', label: '我不戴', playerText: '我不想戴面具。', familiarityDelta: 1, memoryTag: 'first_mask_refused', memoryText: '第一次见燕十三娘时，你直接拒绝了她递来的面具。', responseMessages: [{ id: 'first.mask.no.1', speaker: '燕十三娘', body: '不戴当然也行。只要你别误以为“不戴”就等于没有。', emotion: 'relief' }] },
      { id: 'her-mask', label: '那你的呢？', playerText: '你替别人挑得这么准，你自己的面具是哪张？', familiarityDelta: 1, memoryTag: 'first_mask_asked_hers', memoryText: '初见燕十三娘时，你第一件事就是反问她自己的面具是哪一张。', responseMessages: [{ id: 'first.mask.hers.1', speaker: '燕十三娘', body: '第一次见面就这么不客气？……有意思。', emotion: 'hesitate' }] },
    ],
  },
  {
    roleKey: 'curio_dealer',
    title: '先问它为什么在这里',
    summary: '莫问生没有招呼你买东西，只把一枚磨损严重的旧扣子推近一点。',
    openingMessages: [
      { id: 'first.curio.1', speaker: '莫问生', body: '你觉得这东西值多少？', pauseAfterMs: 260 },
      { id: 'first.curio.2', speaker: '莫问生', body: '别看材质。先看它为什么会磨成这样。' },
    ],
    choices: [
      { id: 'used-often', label: '主人常用', playerText: '边缘磨得这么平，原主人应该天天用。', familiarityDelta: 1, memoryTag: 'first_curio_noticed_use', memoryText: '初见莫问生时，你没有先估价，而是注意到旧物被长期使用的痕迹。', responseMessages: [{ id: 'first.curio.use.1', speaker: '莫问生', body: '至少你先看见了人，再看见价。不错。', emotion: 'relief' }] },
      { id: 'price', label: '还是先说价', playerText: '旧物也得有价。你先说想卖多少。', familiarityDelta: 1, memoryTag: 'first_curio_asked_price', memoryText: '第一次见莫问生时，你坚持先谈旧物的实际价格。', responseMessages: [{ id: 'first.curio.price.1', speaker: '莫问生', body: '当然有价。只是有些价钱，不是拿灵石算。', emotion: 'calm' }] },
      { id: 'not-mine', label: '跟我没关系', playerText: '它为什么磨成这样，是原主人的事。', familiarityDelta: 1, memoryTag: 'first_curio_said_not_mine', memoryText: '初见莫问生时，你认为旧物过去的故事未必与你有关。', responseMessages: [{ id: 'first.curio.notmine.1', speaker: '莫问生', body: '也对。不是每件东西都非要被人理解。', emotion: 'calm' }] },
    ],
  },
  {
    roleKey: 'bamboo_stranger',
    title: '竹苑里的人',
    summary: '白无昼像是早就知道你会在这里停下。',
    openingMessages: [
      { id: 'first.bamboo.1', speaker: '白无昼', body: '你走到这里，比我想的早。', pauseAfterMs: 360 },
      { id: 'first.bamboo.2', speaker: '白无昼', body: '不过没关系。早一点看见，不代表早一点看懂。' },
    ],
    choices: [
      { id: 'know-me', label: '你认识我？', playerText: '你听起来像认识我。', familiarityDelta: 1, memoryTag: 'first_bamboo_asked_recognition', memoryText: '第一次在静竹苑见白无昼时，你觉得他的话像是早就认识你。', responseMessages: [{ id: 'first.bamboo.know.1', speaker: '白无昼', body: '不认识。只是有些问题，不管谁来都会问。', emotion: 'calm' }] },
      { id: 'what-understand', label: '要看懂什么？', playerText: '这里有什么是我现在看不懂的？', familiarityDelta: 1, memoryTag: 'first_bamboo_asked_understand', memoryText: '初见白无昼时，你直接问他静竹苑究竟有什么需要“看懂”。', responseMessages: [{ id: 'first.bamboo.understand.1', speaker: '白无昼', body: '等你真的看见时，我希望你还记得今天问过这句话。', emotion: 'hesitate' }] },
      { id: 'leave', label: '那我先不问', playerText: '既然现在看不懂，我先不问。', familiarityDelta: 1, memoryTag: 'first_bamboo_did_not_press', memoryText: '第一次见白无昼时，你没有追问他的来历。', responseMessages: [{ id: 'first.bamboo.leave.1', speaker: '白无昼', body: '这反而比追问难。', emotion: 'relief' }] },
    ],
  },
  {
    roleKey: 'former_challenger',
    title: '酒客不谈旧名',
    summary: '裴照川把签筒往旁边推了推，像是给你腾位置。',
    openingMessages: [
      { id: 'first.former.1', speaker: '裴照川', body: '坐。要喝酒自己倒，要抽签自己抽。', pauseAfterMs: 280 },
      { id: 'first.former.2', speaker: '裴照川', body: '至于别人说我以前是谁——那故事太旧，不值酒钱。' },
    ],
    choices: [
      { id: 'dont-care-past', label: '那就不问以前', playerText: '行。我跟现在的你喝，不跟以前的名号喝。', familiarityDelta: 1, memoryTag: 'first_former_ignored_old_name', memoryText: '初见裴照川时，你没有追问他的旧名声，只把他当眼前的酒客。', responseMessages: [{ id: 'first.former.now.1', speaker: '裴照川', body: '好。你这句话值一杯。', emotion: 'relief' }] },
      { id: 'ask-past', label: '我偏想知道', playerText: '你越这么说，我越想知道你以前是谁。', familiarityDelta: 1, memoryTag: 'first_former_asked_past', memoryText: '第一次见裴照川时，你直白地追问他不愿提的旧名声。', responseMessages: [{ id: 'first.former.past.1', speaker: '裴照川', body: '那你慢慢听。别人嘴里的我，比我自己会讲。', emotion: 'calm' }] },
      { id: 'draw-stick', label: '先抽一支签', playerText: '名号晚点说。先看看今天手气。', familiarityDelta: 1, memoryTag: 'first_former_drew_stick', memoryText: '初见裴照川时，你没有问过去，先伸手去抽了赌签。', responseMessages: [{ id: 'first.former.stick.1', speaker: '裴照川', body: '这才像来别院的人。输赢先别当真。', emotion: 'relief' }] },
    ],
  },
  {
    roleKey: 'roaming_merchant',
    title: '最后一批货',
    summary: '宁小满照例说这批卖完就走，语气熟练得像背过很多次。',
    openingMessages: [
      { id: 'first.merchant.1', speaker: '宁小满', body: '看看？这批卖完我就走，错过可真没了。', pauseAfterMs: 260 },
      { id: 'first.merchant.2', speaker: '宁小满', body: '……你别听陆清和乱说。我上次也是真的准备走。' },
    ],
    choices: [
      { id: 'believe', label: '我信你这次', playerText: '行，我信你这次是真的要走。', familiarityDelta: 1, memoryTag: 'first_merchant_believed_departure', memoryText: '初见宁小满时，你一本正经地表示相信他这次真要离开万戏坊。', responseMessages: [{ id: 'first.merchant.believe.1', speaker: '宁小满', body: '你这语气怎么比不信还伤人？', emotion: 'relief' }] },
      { id: 'dont-believe', label: '我不信', playerText: '听起来你已经“最后一次”很多次了。', familiarityDelta: 1, memoryTag: 'first_merchant_doubted_departure', memoryText: '第一次见宁小满时，你当面拆穿他“卖完就走”大概已经说过很多次。', responseMessages: [{ id: 'first.merchant.doubt.1', speaker: '宁小满', body: '做生意讲究气氛。你这样以后很难砍价。', emotion: 'relief' }] },
      { id: 'see-goods', label: '先看货', playerText: '走不走以后说。先让我看看你带了什么。', familiarityDelta: 1, memoryTag: 'first_merchant_checked_goods', memoryText: '初见宁小满时，你对他的去留没兴趣，只先看货。', responseMessages: [{ id: 'first.merchant.goods.1', speaker: '宁小满', body: '对，这才是正经事。来，别碰最左边那个。', emotion: 'calm' }] },
    ],
  },
  {
    roleKey: 'runner_boy',
    title: '刚才我看见了',
    summary: '唐小雀明明在赶路，却主动停下来问你是不是找人。',
    openingMessages: [
      { id: 'first.runner.1', speaker: '唐小雀', body: '你是不是找人？别乱走，我刚从西边跑回来。', pauseAfterMs: 240 },
      { id: 'first.runner.2', speaker: '唐小雀', body: '我不保证人现在还在，但至少一刻钟前我多半见过。' },
    ],
    choices: [
      { id: 'know-everyone', label: '你认识所有人？', playerText: '听起来你认识坊里所有人。', familiarityDelta: 1, memoryTag: 'first_runner_asked_everyone', memoryText: '初见唐小雀时，你觉得他好像知道所有人的去向。', responseMessages: [{ id: 'first.runner.everyone.1', speaker: '唐小雀', body: '认识不敢说。见过是真的。大人物都不太看脚下跑腿的。', emotion: 'calm' }] },
      { id: 'not-looking', label: '我没找人', playerText: '我没找人，只是随便逛。', familiarityDelta: 1, memoryTag: 'first_runner_just_wandering', memoryText: '第一次碰到唐小雀时，你说自己只是随便逛逛。', responseMessages: [{ id: 'first.runner.wander.1', speaker: '唐小雀', body: '那更好。万戏坊最有意思的事，经常都是没打算找的时候撞见的。', emotion: 'relief' }] },
      { id: 'ask-name', label: '先问你的名字', playerText: '先不问别人。你叫什么？', familiarityDelta: 1, memoryTag: 'first_runner_asked_his_name', memoryText: '初见唐小雀时，你没有把他当跑腿问路，先认真问了他的名字。', responseMessages: [{ id: 'first.runner.name.1', speaker: '唐小雀', body: '唐小雀。……你居然先问我？行，我记住你了。', emotion: 'relief' }] },
    ],
  },
  {
    roleKey: 'night_watchman',
    title: '夜里别走没灯的路',
    summary: '段无声停下巡夜的脚步，只提醒了你一句。',
    openingMessages: [
      { id: 'first.night.1', speaker: '段无声', body: '夜里少走没灯的路。', pauseAfterMs: 300 },
      { id: 'first.night.2', speaker: '段无声', body: '非要走，记清自己从哪儿进去。' },
    ],
    choices: [
      { id: 'why', label: '为什么？', playerText: '没灯的路怎么了？', familiarityDelta: 1, memoryTag: 'first_night_asked_dark_road', memoryText: '第一次见段无声时，你追问为什么夜里不能随便走没有灯的路。', responseMessages: [{ id: 'first.night.why.1', speaker: '段无声', body: '大多数时候没什么。少数时候，路会比白天多一条。', emotion: 'calm' }] },
      { id: 'remember', label: '我记住了', playerText: '好，我会记路。', familiarityDelta: 1, memoryTag: 'first_night_remembered_route', memoryText: '初见段无声时，你认真记下了他关于夜路的提醒。', responseMessages: [{ id: 'first.night.remember.1', speaker: '段无声', body: '嗯。记路比记怪谈有用。', emotion: 'calm' }] },
      { id: 'walk-together', label: '那跟你走？', playerText: '那我跟着守夜人走，总不会错吧？', familiarityDelta: 1, memoryTag: 'first_night_asked_follow', memoryText: '第一次见段无声时，你问跟着守夜人走是不是最安全。', responseMessages: [{ id: 'first.night.follow.1', speaker: '段无声', body: '我走的路，不一定适合你。', emotion: 'hesitate' }] },
    ],
  },
  {
    roleKey: 'mysterious_girl',
    title: '从哪里开始算自己',
    summary: '阿绯先问了一个听起来不像第一次见面该问的问题。',
    openingMessages: [
      { id: 'first.girl.1', speaker: '阿绯', body: '你们说一个人“以前是什么样”，是不是很重要？', pauseAfterMs: 320 },
      { id: 'first.girl.2', speaker: '阿绯', body: '如果一个人不记得以前，她还是原来那个人吗？' },
    ],
    choices: [
      { id: 'still', label: '还是', playerText: '我觉得还是。忘了过去，不等于过去不存在。', familiarityDelta: 1, memoryTag: 'first_girl_said_still_same', memoryText: '初见阿绯时，你认为忘记过去的人仍然是原来的那个人。', responseMessages: [{ id: 'first.girl.still.1', speaker: '阿绯', body: '那过去像影子？看不见的时候也还跟着？', emotion: 'calm' }] },
      { id: 'can-change', label: '也可以变成新的', playerText: '也许不必一直是原来的人。现在的选择也算。', familiarityDelta: 1, memoryTag: 'first_girl_said_can_change', memoryText: '第一次见阿绯时，你告诉她，人也可以靠现在的选择变成新的自己。', responseMessages: [{ id: 'first.girl.change.1', speaker: '阿绯', body: '这句话我想记住。比“找回以前”听起来轻一点。', emotion: 'relief' }] },
      { id: 'dont-know', label: '我也不知道', playerText: '我也不知道。也许要真的遇到才知道。', familiarityDelta: 1, memoryTag: 'first_girl_said_unknown', memoryText: '初见阿绯时，你没有替她给“身份”这个问题下结论。', responseMessages: [{ id: 'first.girl.unknown.1', speaker: '阿绯', body: '原来“不知道”也可以算回答。', emotion: 'relief' }] },
    ],
  },
] as const satisfies readonly WanxiFirstContactDefinition[];

const profileMap = new Map<WanxiCoreNpcRoleKey, WanxiCharacterProfile>(
  WANXI_CHARACTER_PROFILES.map((profile) => [profile.roleKey, profile]),
);

const firstContactMap = new Map<WanxiCoreNpcRoleKey, WanxiFirstContactDefinition>(
  WANXI_FIRST_CONTACT_DEFINITIONS.map((definition) => [
    definition.roleKey,
    definition,
  ]),
);


const firstContactMemoryTextByTag = new Map<string, string>(
  WANXI_FIRST_CONTACT_DEFINITIONS.flatMap((definition) =>
    definition.choices.map((choice) => [
      choice.memoryTag,
      choice.memoryText,
    ] as const),
  ),
);

export function describeWanxiFirstContactMemoryTag(
  tag: string,
): string | null {
  return firstContactMemoryTextByTag.get(tag) ?? null;
}

export function getWanxiCharacterProfile(roleKey: string) {
  return profileMap.get(roleKey as WanxiCoreNpcRoleKey) ?? null;
}

export function getWanxiFirstContactDefinition(roleKey: string) {
  return firstContactMap.get(roleKey as WanxiCoreNpcRoleKey) ?? null;
}

export function getWanxiFirstContactChoice(roleKey: string, choiceId: string) {
  return (
    getWanxiFirstContactDefinition(roleKey)?.choices.find(
      (choice) => choice.id === choiceId,
    ) ?? null
  );
}
