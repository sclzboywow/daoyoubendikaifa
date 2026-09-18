import type {
  WanxiContinuityMessage,
  WanxiDailyEventSnapshot,
} from './continuity';

export interface WanxiDailyEventChoiceDefinition {
  id: string;
  label: string;
  playerText: string;
  memoryTag: string;
  memoryText: string;
  responseMessages: readonly WanxiContinuityMessage[];
}

export interface WanxiDailyEventChoiceSnapshot {
  id: string;
  label: string;
  playerText: string;
}

export interface WanxiDailyEventResolutionResult {
  dateKey: string;
  generated: boolean;
  event: WanxiDailyEventSnapshot;
  choice: WanxiDailyEventChoiceSnapshot;
  messages: WanxiContinuityMessage[];
}

const WANXI_DAILY_EVENT_CHOICES: Record<
  string,
  readonly WanxiDailyEventChoiceDefinition[]
> = {
  'wanxi.daily.lin.new-song': [
    {
      id: 'leave-unnamed',
      label: '先别取名',
      playerText: '先别取名。等它自己长出名字。',
      memoryTag: 'lin_new_song_left_unnamed',
      memoryText: '林照晚为新曲犹豫时，你劝她先别急着给它取名。',
      responseMessages: [
        {
          id: 'lin-new-song:leave-unnamed:1',
          speaker: '林照晚',
          body: '你也这么想？那就先欠它一个名字。',
          gesture: '她把写到一半的曲名轻轻划掉。',
          emotion: 'relief',
          pauseAfterMs: 420,
        },
      ],
    },
    {
      id: 'suggest-weichi',
      label: '叫《未迟》？',
      playerText: '要不叫《未迟》？',
      memoryTag: 'lin_new_song_suggested_weichi',
      memoryText: '你曾替林照晚的新曲提过《未迟》这个名字。',
      responseMessages: [
        {
          id: 'lin-new-song:suggest-weichi:1',
          speaker: '林照晚',
          body: '“未迟”……比“旧灯”好一点。只是我还想再等等。',
          gesture: '她把这两个字念得很轻，没有立刻写下来。',
          emotion: 'hesitate',
          pauseAfterMs: 520,
        },
      ],
    },
    {
      id: 'hear-again',
      label: '再弹一遍给我听',
      playerText: '名字先不急。你再弹一遍给我听。',
      memoryTag: 'lin_new_song_heard_twice',
      memoryText: '你没有急着替新曲取名，只让林照晚再弹了一遍。',
      responseMessages: [
        {
          id: 'lin-new-song:hear-again:1',
          speaker: '林照晚',
          body: '好。这一次，你别急着猜它会落在哪个音上。',
          gesture: '她重新把手放回琴弦。',
          emotion: 'calm',
          pauseAfterMs: 430,
        },
      ],
    },
  ],

  'wanxi.daily.qi.crooked-lamp': [
    {
      id: 'crooked-is-fine',
      label: '歪一点也挺好',
      playerText: '歪一点也挺好，至少一眼就知道是你做的。',
      memoryTag: 'qi_crooked_lamp_liked_imperfection',
      memoryText: '面对祁望川那盏仍有些歪的新灯，你说歪一点也挺好。',
      responseMessages: [
        {
          id: 'qi-crooked-lamp:crooked-is-fine:1',
          speaker: '祁望川',
          body: '这听起来不像夸人。',
          gesture: '他嘴上这么说，却没有再把灯掰正。',
          emotion: 'relief',
          pauseAfterMs: 380,
        },
      ],
    },
    {
      id: 'not-laughing',
      label: '我可没笑',
      playerText: '我可没笑，是你自己先心虚。',
      memoryTag: 'qi_crooked_lamp_teased_him',
      memoryText: '祁望川担心你笑他做歪了灯，你反过来笑他先心虚。',
      responseMessages: [
        {
          id: 'qi-crooked-lamp:not-laughing:1',
          speaker: '祁望川',
          body: '……那你现在嘴角是什么？',
          gesture: '他盯着你看了两息，也终于笑了。',
          emotion: 'relief',
          pauseAfterMs: 360,
        },
      ],
    },
    {
      id: 'help-check',
      label: '我帮你看看',
      playerText: '给我看看，也许不是灯骨的问题。',
      memoryTag: 'qi_crooked_lamp_helped_check',
      memoryText: '你曾和祁望川一起检查那盏怎么也做不正的新灯。',
      responseMessages: [
        {
          id: 'qi-crooked-lamp:help-check:1',
          speaker: '祁望川',
          body: '行。你看左边，我重新量一遍底座。',
          gesture: '他很自然地给你腾出了半张工作台。',
          emotion: 'calm',
          pauseAfterMs: 360,
        },
      ],
    },
  ],

  'wanxi.daily.lin.broken-string': [
    {
      id: 'replace-it',
      label: '换新的吧',
      playerText: '既然旧了，就换新的吧。',
      memoryTag: 'lin_broken_string_said_replace',
      memoryText: '面对林照晚的断弦，你说旧了就换新的，不必强求接回原样。',
      responseMessages: [
        {
          id: 'lin-broken-string:replace-it:1',
          speaker: '林照晚',
          body: '嗯。以前我会舍不得，现在觉得这样也很好。',
          gesture: '她把新弦从木匣里取了出来。',
          emotion: 'relief',
          pauseAfterMs: 420,
        },
      ],
    },
    {
      id: 'keep-old',
      label: '要不要留着？',
      playerText: '不接回去也行。要不要把旧弦留着？',
      memoryTag: 'lin_broken_string_kept_old',
      memoryText: '林照晚换下断弦时，你问她要不要把旧弦留下。',
      responseMessages: [
        {
          id: 'lin-broken-string:keep-old:1',
          speaker: '林照晚',
          body: '留一小截吧。不是为了回头，只是它陪了我很久。',
          gesture: '她剪下最完整的一小段，收进木匣。',
          emotion: 'calm',
          pauseAfterMs: 460,
        },
      ],
    },
    {
      id: 'still-regret',
      label: '现在还会可惜吗？',
      playerText: '现在弦断了，你还会觉得可惜吗？',
      memoryTag: 'lin_broken_string_asked_regret',
      memoryText: '你曾问林照晚，面对一根断弦，她现在还会不会觉得可惜。',
      responseMessages: [
        {
          id: 'lin-broken-string:still-regret:1',
          speaker: '林照晚',
          body: '会。只是可惜和一定要修回去，是两回事。',
          gesture: '她看着断口，神情很平静。',
          emotion: 'calm',
          pauseAfterMs: 500,
        },
      ],
    },
  ],

  'wanxi.daily.qi.wooden-bird': [
    {
      id: 'search-together',
      label: '我陪你去找',
      playerText: '我陪你去找。西边还是东边？',
      memoryTag: 'qi_wooden_bird_searched_together',
      memoryText: '木鸟飞过院墙没有回来时，你主动陪祁望川去找它。',
      responseMessages: [
        {
          id: 'qi-wooden-bird:search-together:1',
          speaker: '祁望川',
          body: '……好。西边你找，我去东边。',
          gesture: '他怔了一下，已经顺手把工具袋拎了起来。',
          emotion: 'relief',
          pauseAfterMs: 380,
        },
      ],
    },
    {
      id: 'tease-broken',
      label: '你确定不是做坏了？',
      playerText: '你确定它不是做坏了，只是飞得比较有主见？',
      memoryTag: 'qi_wooden_bird_teased_broken',
      memoryText: '木鸟没回来时，你笑祁望川也许只是把它做坏了。',
      responseMessages: [
        {
          id: 'qi-wooden-bird:tease-broken:1',
          speaker: '祁望川',
          body: '理论上没有坏。实际……这句话你先别告诉林照晚。',
          gesture: '他停顿得有些可疑。',
          emotion: 'hesitate',
          pauseAfterMs: 420,
        },
      ],
    },
    {
      id: 'wait-longer',
      label: '再等等',
      playerText: '再等等吧，说不定它真的认得回来。',
      memoryTag: 'qi_wooden_bird_waited_together',
      memoryText: '木鸟飞走后，你和祁望川在院墙下又等了一阵。',
      responseMessages: [
        {
          id: 'qi-wooden-bird:wait-longer:1',
          speaker: '祁望川',
          body: '再等十息。十息以后……我承认它可能不认识路。',
          gesture: '他真的抬头认真数了起来。',
          emotion: 'hesitate',
          pauseAfterMs: 420,
        },
      ],
    },
  ],

  'wanxi.daily.lin.name-the-tune': [
    {
      id: 'choose-old-lamp',
      label: '“旧灯”',
      playerText: '如果非要选，我觉得“旧灯”更像它。',
      memoryTag: 'lin_tune_name_chose_old_lamp',
      memoryText: '林照晚在两个曲名间犹豫时，你曾偏向“旧灯”。',
      responseMessages: [
        {
          id: 'lin-name-tune:choose-old-lamp:1',
          speaker: '林照晚',
          body: '太像回头看了。可你这么一说，我倒知道自己为什么不喜欢它。',
          emotion: 'calm',
          pauseAfterMs: 430,
        },
      ],
    },
    {
      id: 'choose-late-lamp',
      label: '“迟灯”',
      playerText: '那我选“迟灯”，听起来没那么沉。',
      memoryTag: 'lin_tune_name_chose_late_lamp',
      memoryText: '林照晚在两个曲名间犹豫时，你曾偏向“迟灯”。',
      responseMessages: [
        {
          id: 'lin-name-tune:choose-late-lamp:1',
          speaker: '林照晚',
          body: '还是像在解释过去。不过比另一个轻一点。',
          gesture: '她用笔尖在“迟”字旁点了一下。',
          emotion: 'hesitate',
          pauseAfterMs: 430,
        },
      ],
    },
    {
      id: 'choose-neither',
      label: '都先别取',
      playerText: '都别选。等曲子自己告诉你它叫什么。',
      memoryTag: 'lin_tune_name_chose_neither',
      memoryText: '你劝林照晚不要急着在“旧灯”和“迟灯”之间做选择。',
      responseMessages: [
        {
          id: 'lin-name-tune:choose-neither:1',
          speaker: '林照晚',
          body: '这倒像我现在会做的事。那就空着。',
          gesture: '她把两个备选名字一起划去。',
          emotion: 'relief',
          pauseAfterMs: 420,
        },
      ],
    },
  ],

  'wanxi.daily.qi.old-lamp': [
    {
      id: 'why-not-repair',
      label: '为什么不修？',
      playerText: '你不是最见不得东西坏着吗？为什么不修？',
      memoryTag: 'qi_old_lamp_asked_why_not_repair',
      memoryText: '你问过祁望川，为什么偏偏不修那盏坏掉的旧灯。',
      responseMessages: [
        {
          id: 'qi-old-lamp:why-not-repair:1',
          speaker: '祁望川',
          body: '因为现在修好它，只是在证明我有本事，不是在补回什么。',
          gesture: '他没有把灯从架上拿下来。',
          emotion: 'calm',
          pauseAfterMs: 520,
        },
      ],
    },
    {
      id: 'leave-it',
      label: '留着也挺好',
      playerText: '那就留着吧。坏着也不妨碍它是一盏灯。',
      memoryTag: 'qi_old_lamp_agreed_leave_it',
      memoryText: '面对那盏坏掉的旧灯，你认同祁望川不必把它修回原样。',
      responseMessages: [
        {
          id: 'qi-old-lamp:leave-it:1',
          speaker: '祁望川',
          body: '嗯。我现在也这么想。',
          gesture: '他把架子上的灰轻轻拂掉，只碰了灯旁边。',
          emotion: 'relief',
          pauseAfterMs: 420,
        },
      ],
    },
    {
      id: 'help-store',
      label: '要我帮你收好？',
      playerText: '不修也行。要我帮你把它收好一点吗？',
      memoryTag: 'qi_old_lamp_helped_store',
      memoryText: '你曾提出帮祁望川把那盏不再修的旧灯好好收起来。',
      responseMessages: [
        {
          id: 'qi-old-lamp:help-store:1',
          speaker: '祁望川',
          body: '放这里就好。看得见，但不用天天碰。',
          gesture: '他说完，给旧灯旁边让出了一点位置。',
          emotion: 'calm',
          pauseAfterMs: 420,
        },
      ],
    },
  ],

  'wanxi.daily.lin.watch-a-play': [
    {
      id: 'forgetting-is-fine',
      label: '忘词也没什么',
      playerText: '忘一句词也没什么，台下的人未必都在挑错。',
      memoryTag: 'lin_watch_play_said_forgetting_is_fine',
      memoryText: '看排戏时，你对林照晚说，忘一句词也没有那么严重。',
      responseMessages: [
        {
          id: 'lin-watch-play:forgetting-is-fine:1',
          speaker: '林照晚',
          body: '是。站在台上太久的人，反而最容易忘记这一点。',
          gesture: '她没有看台上，先看了你一眼。',
          emotion: 'calm',
          pauseAfterMs: 420,
        },
      ],
    },
    {
      id: 'were-you-nervous',
      label: '你以前也会紧张？',
      playerText: '你以前第一次上台，也会怕忘词吗？',
      memoryTag: 'lin_watch_play_asked_first_stage',
      memoryText: '你曾问林照晚，她第一次上台时是不是也会紧张。',
      responseMessages: [
        {
          id: 'lin-watch-play:were-you-nervous:1',
          speaker: '林照晚',
          body: '我不怕忘词。我怕弹错一个音以后，所有人都只记得那个错音。',
          gesture: '她笑了一下，像在说很久以前的事。',
          emotion: 'relief',
          pauseAfterMs: 520,
        },
      ],
    },
    {
      id: 'watch-to-end',
      label: '我陪你看完',
      playerText: '那就别点评了。今天我陪你把这场看完。',
      memoryTag: 'lin_watch_play_watched_to_end',
      memoryText: '有一次百戏台排戏，你和林照晚什么也没点评，只一起看到了最后。',
      responseMessages: [
        {
          id: 'lin-watch-play:watch-to-end:1',
          speaker: '林照晚',
          body: '好。那今天只当观众。',
          gesture: '她往旁边挪了半个座位。',
          emotion: 'relief',
          pauseAfterMs: 360,
        },
      ],
    },
  ],

  'wanxi.daily.qi.cool-tea': [
    {
      id: 'drink-first',
      label: '先喝茶',
      playerText: '机关先放一下。先喝茶。',
      memoryTag: 'qi_cool_tea_told_drink_first',
      memoryText: '祁望川又把茶放凉时，你直接让他先停手喝茶。',
      responseMessages: [
        {
          id: 'qi-cool-tea:drink-first:1',
          speaker: '祁望川',
          body: '……好。你这句话听起来很像命令。',
          gesture: '他说着，还是把杯子端了起来。',
          emotion: 'relief',
          pauseAfterMs: 360,
        },
      ],
    },
    {
      id: 'change-hot-tea',
      label: '给你换杯热的',
      playerText: '别喝凉的了。我去给你换杯热的。',
      memoryTag: 'qi_cool_tea_offered_hot_tea',
      memoryText: '祁望川忙忘了茶时，你曾提出替他换一杯热的。',
      responseMessages: [
        {
          id: 'qi-cool-tea:change-hot-tea:1',
          speaker: '祁望川',
          body: '不用每次都照顾我。……不过这次，多谢。',
          gesture: '他终于把手里的小锉刀放下。',
          emotion: 'hesitate',
          pauseAfterMs: 420,
        },
      ],
    },
    {
      id: 'say-next-time',
      label: '下次我直接说',
      playerText: '行。下次再看见你忘了，我就直接说。',
      memoryTag: 'qi_cool_tea_promised_remind',
      memoryText: '你答应祁望川，以后再看见他忙到忘记喝茶就直接提醒。',
      responseMessages: [
        {
          id: 'qi-cool-tea:say-next-time:1',
          speaker: '祁望川',
          body: '那我大概会经常听见你说。',
          gesture: '他看了看桌上另一只已经凉掉的杯子。',
          emotion: 'relief',
          pauseAfterMs: 360,
        },
      ],
    },
  ],

  'wanxi.daily.lin.rain-sound': [
    {
      id: 'listen-rain',
      label: '那就听雨',
      playerText: '那今天不弹了。我陪你听一会儿雨。',
      memoryTag: 'lin_rain_listened_together',
      memoryText: '有一场雨里，你没有催林照晚练琴，只陪她在檐下听雨。',
      responseMessages: [
        {
          id: 'lin-rain:listen-rain:1',
          speaker: '林照晚',
          body: '好。难得有人来百戏台，却不是为了听琴。',
          gesture: '她把手从琴上收了回来。',
          emotion: 'relief',
          pauseAfterMs: 420,
        },
      ],
    },
    {
      id: 'play-the-rain',
      label: '能把雨弹进曲子里吗？',
      playerText: '你能把今天这场雨弹进曲子里吗？',
      memoryTag: 'lin_rain_asked_play_rain',
      memoryText: '你曾问林照晚，能不能把百戏台檐下的一场雨写进曲子里。',
      responseMessages: [
        {
          id: 'lin-rain:play-the-rain:1',
          speaker: '林照晚',
          body: '能。但真写进去以后，就不该让每一个音都听我的。',
          gesture: '她随雨点落下的间隙轻轻拨了一根弦。',
          emotion: 'calm',
          pauseAfterMs: 480,
        },
      ],
    },
    {
      id: 'rest-today',
      label: '今天不练也没关系',
      playerText: '雨都替你打拍子了，今天不练原来的也没关系。',
      memoryTag: 'lin_rain_said_rest_today',
      memoryText: '雨天练琴时，你对林照晚说，偶尔不按原来的安排也没关系。',
      responseMessages: [
        {
          id: 'lin-rain:rest-today:1',
          speaker: '林照晚',
          body: '以前我会觉得一天都不能少。现在少一天，也不会有什么东西因此消失。',
          emotion: 'relief',
          pauseAfterMs: 500,
        },
      ],
    },
  ],

  'wanxi.daily.qi.small-dispute': [
    {
      id: 'did-right',
      label: '这次做得对',
      playerText: '这次你做得对。知道答案，也不代表能替她说。',
      memoryTag: 'qi_not_answer_praised_boundary',
      memoryText: '祁望川没有替林照晚回答时，你认可了他把选择留给她。',
      responseMessages: [
        {
          id: 'qi-small-dispute:did-right:1',
          speaker: '祁望川',
          body: '我也是后来才知道，这么简单的事，做起来反而要重新学。',
          gesture: '他没有抬头，手里的动作却慢了一些。',
          emotion: 'calm',
          pauseAfterMs: 460,
        },
      ],
    },
    {
      id: 'wanted-to-answer',
      label: '你其实很想替她答吧',
      playerText: '你刚才是不是差一点就替她答了？',
      memoryTag: 'qi_not_answer_admitted_impulse',
      memoryText: '你看出祁望川其实差一点又替林照晚回答，他也没有否认。',
      responseMessages: [
        {
          id: 'qi-small-dispute:wanted-to-answer:1',
          speaker: '祁望川',
          body: '是。话都到嘴边了。',
          gesture: '他很坦然地承认。',
          emotion: 'hesitate',
          pauseAfterMs: 340,
        },
        {
          id: 'qi-small-dispute:wanted-to-answer:2',
          speaker: '祁望川',
          body: '所以我才更应该停一下。',
          pauseAfterMs: 420,
        },
      ],
    },
    {
      id: 'let-her-say',
      label: '让她自己说就好',
      playerText: '让她自己说就好。你不用每次都提前猜答案。',
      memoryTag: 'qi_not_answer_told_stop_guessing',
      memoryText: '你提醒祁望川，不必总提前猜林照晚会怎么回答。',
      responseMessages: [
        {
          id: 'qi-small-dispute:let-her-say:1',
          speaker: '祁望川',
          body: '嗯。猜得准，也不等于有资格替她说。',
          gesture: '他把这句话重复了一遍，像是记给自己听。',
          emotion: 'calm',
          pauseAfterMs: 480,
        },
      ],
    },
  ],
};


const WANXI_DAILY_EVENT_OPENING_BEAT_COUNTS: Record<string, number> = {
  'wanxi.daily.lin.new-song': 1,
  'wanxi.daily.qi.crooked-lamp': 2,
  'wanxi.daily.lin.broken-string': 1,
  'wanxi.daily.qi.wooden-bird': 2,
  'wanxi.daily.lin.name-the-tune': 1,
  'wanxi.daily.qi.old-lamp': 1,
  'wanxi.daily.lin.watch-a-play': 1,
  'wanxi.daily.qi.cool-tea': 2,
  'wanxi.daily.lin.rain-sound': 3,
  'wanxi.daily.qi.small-dispute': 1,
};

export function getWanxiDailyEventOpeningMessages(
  eventId: string,
  messages: readonly WanxiContinuityMessage[],
): WanxiContinuityMessage[] {
  const count = WANXI_DAILY_EVENT_OPENING_BEAT_COUNTS[eventId] ?? messages.length;
  return messages.slice(0, Math.max(1, Math.min(count, messages.length))).map((message) => ({
    ...message,
  }));
}

export function getWanxiDailyEventChoices(
  eventId: string,
): readonly WanxiDailyEventChoiceDefinition[] {
  return WANXI_DAILY_EVENT_CHOICES[eventId] ?? [];
}

export function getWanxiDailyEventChoice(
  eventId: string,
  choiceId: string,
): WanxiDailyEventChoiceDefinition | null {
  return (
    getWanxiDailyEventChoices(eventId).find((choice) => choice.id === choiceId) ??
    null
  );
}

const interactiveMemoryTextByTag = new Map<string, string>(
  Object.values(WANXI_DAILY_EVENT_CHOICES)
    .flat()
    .map((choice) => [choice.memoryTag, choice.memoryText]),
);

export function describeWanxiInteractiveMemoryTag(tag: string): string | null {
  return interactiveMemoryTextByTag.get(tag) ?? null;
}
