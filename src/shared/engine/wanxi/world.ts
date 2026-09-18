import type {
  WanxiActivityBinding,
  WanxiLocationId,
  WanxiNpcRoleKey,
  WanxiPropDefinition,
  WanxiPropPlacement,
  WanxiWorldDaypart,
} from './types';

export type WanxiWorldEncounterKind =
  | 'life'
  | 'cross'
  | 'prop'
  | 'regional_story';

export interface WanxiWorldEncounterChoice {
  id: string;
  label: string;
  playerText: string;
  response: ReadonlyArray<{
    speaker?: string;
    body: string;
    gesture?: string;
    tone?: 'normal' | 'muted' | 'attention';
  }>;
}

export interface WanxiWorldEncounterDefinition {
  id: string;
  kind: WanxiWorldEncounterKind;
  title: string;
  summary: string;
  promptLabel: string;
  source:
    | { type: 'npc'; roleKey: WanxiNpcRoleKey }
    | { type: 'prop'; propId: string };
  participants: readonly WanxiNpcRoleKey[];
  locationId: WanxiLocationId;
  opening: ReadonlyArray<{
    speaker?: string;
    body: string;
    gesture?: string;
    tone?: 'normal' | 'muted' | 'attention';
  }>;
  choices: readonly WanxiWorldEncounterChoice[];
  memoryTag: string;
  memoryText: string;
  familiarityDelta: number;
  storyStage?: string;
  nextStoryStage?: string;
}

export interface WanxiNpcAttendanceRule {
  roleKey: WanxiNpcRoleKey;
  dayparts: readonly WanxiWorldDaypart[];
  mode: 'resident' | 'rotation' | 'mobile' | 'night' | 'rare';
}

export const WANXI_WORLD_STORY_ID = 'wanxi.story.unnamed_playbill';

export const WANXI_NPC_ATTENDANCE_RULES = [
  { roleKey: 'master', mode: 'resident', dayparts: ['day', 'evening'] },
  { roleKey: 'script_scholar', mode: 'resident', dayparts: ['day', 'evening'] },
  { roleKey: 'gate_steward', mode: 'resident', dayparts: ['dawn', 'day', 'evening'] },
  { roleKey: 'storyteller', mode: 'mobile', dayparts: ['day', 'evening'] },
  { roleKey: 'chess_keeper', mode: 'rotation', dayparts: ['day', 'evening'] },
  { roleKey: 'stage_curator', mode: 'resident', dayparts: ['day', 'evening'] },
  { roleKey: 'chief_musician', mode: 'resident', dayparts: ['day', 'evening'] },
  { roleKey: 'dancer', mode: 'rotation', dayparts: ['day', 'evening'] },
  { roleKey: 'lakeside_guest', mode: 'resident', dayparts: ['dawn', 'day', 'evening', 'night'] },
  { roleKey: 'lantern_maker', mode: 'resident', dayparts: ['day', 'evening', 'night'] },
  { roleKey: 'tea_physician', mode: 'resident', dayparts: ['dawn', 'day', 'evening'] },
  { roleKey: 'west_host', mode: 'resident', dayparts: ['day', 'evening'] },
  { roleKey: 'mask_artisan', mode: 'rotation', dayparts: ['day', 'evening'] },
  { roleKey: 'curio_dealer', mode: 'resident', dayparts: ['day', 'evening'] },
  { roleKey: 'bamboo_stranger', mode: 'rare', dayparts: ['day', 'evening', 'night'] },
  { roleKey: 'former_challenger', mode: 'rotation', dayparts: ['day', 'evening', 'night'] },
  { roleKey: 'roaming_merchant', mode: 'mobile', dayparts: ['day', 'evening'] },
  { roleKey: 'runner_boy', mode: 'mobile', dayparts: ['dawn', 'day', 'evening', 'night'] },
  { roleKey: 'night_watchman', mode: 'night', dayparts: ['night'] },
  { roleKey: 'mysterious_girl', mode: 'rare', dayparts: ['evening', 'night'] },
] as const satisfies readonly WanxiNpcAttendanceRule[];

export const WANXI_LIFE_EVENT_DEFINITIONS =
[
  {
    "id": "wanxi.life.master.closed-ledger",
    "kind": "life",
    "title": "合上的旧账",
    "summary": "闻人砚把一本旧账合得比平时更快。",
    "promptLabel": "问问那本旧账",
    "source": {
      "type": "npc",
      "roleKey": "master"
    },
    "participants": [
      "master"
    ],
    "locationId": "hall_forecourt",
    "opening": [
      {
        "speaker": "闻人砚",
        "body": "“有些账，记清楚不难。难的是决定什么时候该再翻。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“合上的旧账”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "闻人砚",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "闻人砚",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "闻人砚",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_master_closed_ledger",
    "memoryText": "你曾和闻人砚一起经历“合上的旧账”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.master.late-lamp",
    "kind": "life",
    "title": "坊主最后一盏灯",
    "summary": "万戏楼其他灯都熄了，闻人砚桌上的灯还亮着。",
    "promptLabel": "陪他坐一会儿",
    "source": {
      "type": "npc",
      "roleKey": "master"
    },
    "participants": [
      "master"
    ],
    "locationId": "hall_forecourt",
    "opening": [
      {
        "speaker": "闻人砚",
        "body": "“我只是想把今天的事看完。每一天都这么说，就会变得很晚。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“坊主最后一盏灯”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "闻人砚",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "闻人砚",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "闻人砚",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_master_late_lamp",
    "memoryText": "你曾和闻人砚一起经历“坊主最后一盏灯”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.master.empty-seat",
    "kind": "life",
    "title": "空着的座位",
    "summary": "会客处一直留着一张没人坐的椅子。",
    "promptLabel": "问那张椅子",
    "source": {
      "type": "npc",
      "roleKey": "master"
    },
    "participants": [
      "master"
    ],
    "locationId": "hall_forecourt",
    "opening": [
      {
        "speaker": "闻人砚",
        "body": "“不是等谁。至少现在不是。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“空着的座位”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "闻人砚",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "闻人砚",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "闻人砚",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_master_empty_seat",
    "memoryText": "你曾和闻人砚一起经历“空着的座位”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.script_scholar.missing-line",
    "kind": "life",
    "title": "缺了一句",
    "summary": "沈砚秋发现一册旧戏本少了最关键的一句。",
    "promptLabel": "看看缺句的地方",
    "source": {
      "type": "npc",
      "roleKey": "script_scholar"
    },
    "participants": [
      "script_scholar"
    ],
    "locationId": "main_hall",
    "opening": [
      {
        "speaker": "沈砚秋",
        "body": "“少一句以后，前后两场戏都变得像在说另一件事。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“缺了一句”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "沈砚秋",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "沈砚秋",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "沈砚秋",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_script_scholar_missing_line",
    "memoryText": "你曾和沈砚秋一起经历“缺了一句”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.script_scholar.rejected-ending",
    "kind": "life",
    "title": "不要这个结局",
    "summary": "他刚写完一个结局，又立刻整页撕掉。",
    "promptLabel": "问问为什么撕掉",
    "source": {
      "type": "npc",
      "roleKey": "script_scholar"
    },
    "participants": [
      "script_scholar"
    ],
    "locationId": "main_hall",
    "opening": [
      {
        "speaker": "沈砚秋",
        "body": "“写得太像一个聪明人会写的结局，不像里面的人会做的选择。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“不要这个结局”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "沈砚秋",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "沈砚秋",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "沈砚秋",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_script_scholar_rejected_ending",
    "memoryText": "你曾和沈砚秋一起经历“不要这个结局”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.script_scholar.blank-title",
    "kind": "life",
    "title": "没有名字的戏",
    "summary": "一册新戏本已经写了十几页，封面仍然空白。",
    "promptLabel": "看看这部无名戏",
    "source": {
      "type": "npc",
      "roleKey": "script_scholar"
    },
    "participants": [
      "script_scholar"
    ],
    "locationId": "main_hall",
    "opening": [
      {
        "speaker": "沈砚秋",
        "body": "“名字会让人太早以为自己知道它在讲什么。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“没有名字的戏”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "沈砚秋",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "沈砚秋",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "沈砚秋",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_script_scholar_blank_title",
    "memoryText": "你曾和沈砚秋一起经历“没有名字的戏”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.gate_steward.visitor-name",
    "kind": "life",
    "title": "记错一次名字",
    "summary": "陆清和难得把一个来客的名字记错了。",
    "promptLabel": "问问那个名字",
    "source": {
      "type": "npc",
      "roleKey": "gate_steward"
    },
    "participants": [
      "gate_steward"
    ],
    "locationId": "gate",
    "opening": [
      {
        "speaker": "陆清和",
        "body": "“我记得他的脸、衣裳、来意，偏偏把名字记成了另一个人。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“记错一次名字”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "陆清和",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "陆清和",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "陆清和",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_gate_steward_visitor_name",
    "memoryText": "你曾和陆清和一起经历“记错一次名字”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.gate_steward.unclaimed-parcel",
    "kind": "life",
    "title": "无人认领的包裹",
    "summary": "失物架上有一只包裹三天无人领取。",
    "promptLabel": "看看那只包裹",
    "source": {
      "type": "npc",
      "roleKey": "gate_steward"
    },
    "participants": [
      "gate_steward"
    ],
    "locationId": "notice_board",
    "opening": [
      {
        "speaker": "陆清和",
        "body": "“我知道谁放下的，却不知道他是不是还想拿回去。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“无人认领的包裹”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "陆清和",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "陆清和",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "陆清和",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_gate_steward_unclaimed_parcel",
    "memoryText": "你曾和陆清和一起经历“无人认领的包裹”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.gate_steward.departure-note",
    "kind": "life",
    "title": "没说出口的告别",
    "summary": "访客簿夹着一张只写了半句的离坊留言。",
    "promptLabel": "看看那半句话",
    "source": {
      "type": "npc",
      "roleKey": "gate_steward"
    },
    "participants": [
      "gate_steward"
    ],
    "locationId": "gate",
    "opening": [
      {
        "speaker": "陆清和",
        "body": "“有些人走的时候，反而不知道该对留下的人说什么。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“没说出口的告别”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "陆清和",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "陆清和",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "陆清和",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_gate_steward_departure_note",
    "memoryText": "你曾和陆清和一起经历“没说出口的告别”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.storyteller.same-story",
    "kind": "life",
    "title": "同一个故事",
    "summary": "温不语今天把昨天的故事讲出了完全不同的结局。",
    "promptLabel": "问问哪个是真的",
    "source": {
      "type": "npc",
      "roleKey": "storyteller"
    },
    "participants": [
      "storyteller"
    ],
    "locationId": "central_square",
    "opening": [
      {
        "speaker": "温不语",
        "body": "“两个都是真的，只是当事人后来改了自己记住的部分。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“同一个故事”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "温不语",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "温不语",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "温不语",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_storyteller_same_story",
    "memoryText": "你曾和温不语一起经历“同一个故事”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.storyteller.wrong-name",
    "kind": "life",
    "title": "故意讲错的名字",
    "summary": "故事里一个明显重要的人，被他连续三次换了名字。",
    "promptLabel": "追问那个名字",
    "source": {
      "type": "npc",
      "roleKey": "storyteller"
    },
    "participants": [
      "storyteller"
    ],
    "locationId": "central_square",
    "opening": [
      {
        "speaker": "温不语",
        "body": "“名字有时候比事情本身更容易伤到人。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“故意讲错的名字”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "温不语",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "温不语",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "温不语",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_storyteller_wrong_name",
    "memoryText": "你曾和温不语一起经历“故意讲错的名字”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.storyteller.unfinished-tale",
    "kind": "life",
    "title": "说到一半",
    "summary": "温不语第一次在最精彩的地方主动停了下来。",
    "promptLabel": "问他为什么不讲完",
    "source": {
      "type": "npc",
      "roleKey": "storyteller"
    },
    "participants": [
      "storyteller"
    ],
    "locationId": "central_square",
    "opening": [
      {
        "speaker": "温不语",
        "body": "“因为后半段还属于活着的人，我不该替他们先讲完。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“说到一半”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "温不语",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "温不语",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "温不语",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_storyteller_unfinished_tale",
    "memoryText": "你曾和温不语一起经历“说到一半”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.chess_keeper.missing-piece",
    "kind": "life",
    "title": "缺角棋子",
    "summary": "迟观棋的棋盘上少了一枚常用的棋子。",
    "promptLabel": "问问那枚棋子",
    "source": {
      "type": "npc",
      "roleKey": "chess_keeper"
    },
    "participants": [
      "chess_keeper"
    ],
    "locationId": "central_square",
    "opening": [
      {
        "speaker": "迟观棋",
        "body": "“少一枚不妨碍下棋，只是会逼你承认有些局本来就不完整。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“缺角棋子”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "迟观棋",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "迟观棋",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "迟观棋",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_chess_keeper_missing_piece",
    "memoryText": "你曾和迟观棋一起经历“缺角棋子”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.chess_keeper.deliberate-loss",
    "kind": "life",
    "title": "像是故意输",
    "summary": "他在必赢的时候走了一手明显的坏棋。",
    "promptLabel": "问他为什么让棋",
    "source": {
      "type": "npc",
      "roleKey": "chess_keeper"
    },
    "participants": [
      "chess_keeper"
    ],
    "locationId": "central_square",
    "opening": [
      {
        "speaker": "迟观棋",
        "body": "“赢这盘对我没什么，输这盘对对面的人也许有一点用。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“像是故意输”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "迟观棋",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "迟观棋",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "迟观棋",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_chess_keeper_deliberate_loss",
    "memoryText": "你曾和迟观棋一起经历“像是故意输”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.chess_keeper.empty-board",
    "kind": "life",
    "title": "空棋盘",
    "summary": "迟观棋今天没有摆残局，只放着一块空棋盘。",
    "promptLabel": "坐到空棋盘前",
    "source": {
      "type": "npc",
      "roleKey": "chess_keeper"
    },
    "participants": [
      "chess_keeper"
    ],
    "locationId": "central_square",
    "opening": [
      {
        "speaker": "迟观棋",
        "body": "“有时候最难的一步，是承认今天不想下。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“空棋盘”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "迟观棋",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "迟观棋",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "迟观棋",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_chess_keeper_empty_board",
    "memoryText": "你曾和迟观棋一起经历“空棋盘”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.stage_curator.late-curtain",
    "kind": "life",
    "title": "晚了一息的幕",
    "summary": "百戏台落幕比计划晚了一息，苏照影却没有责备任何人。",
    "promptLabel": "问问那一息",
    "source": {
      "type": "npc",
      "roleKey": "stage_curator"
    },
    "participants": [
      "stage_curator"
    ],
    "locationId": "stage_forecourt",
    "opening": [
      {
        "speaker": "苏照影",
        "body": "“因为那一息是台上的人自己决定留下的，不是失误。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“晚了一息的幕”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "苏照影",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "苏照影",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "苏照影",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_stage_curator_late_curtain",
    "memoryText": "你曾和苏照影一起经历“晚了一息的幕”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.stage_curator.crooked-mark",
    "kind": "life",
    "title": "歪掉的站位线",
    "summary": "地上的站位线偏了半寸，她盯着看了很久。",
    "promptLabel": "帮她重新量线",
    "source": {
      "type": "npc",
      "roleKey": "stage_curator"
    },
    "participants": [
      "stage_curator"
    ],
    "locationId": "stage_forecourt",
    "opening": [
      {
        "speaker": "苏照影",
        "body": "“以前我会立刻擦掉。今天忽然想看看，偏半寸会发生什么。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“歪掉的站位线”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "苏照影",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "苏照影",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "苏照影",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_stage_curator_crooked_mark",
    "memoryText": "你曾和苏照影一起经历“歪掉的站位线”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.stage_curator.empty-rehearsal",
    "kind": "life",
    "title": "取消的排练",
    "summary": "她临时取消了原本排得很满的一场排练。",
    "promptLabel": "问为什么停一天",
    "source": {
      "type": "npc",
      "roleKey": "stage_curator"
    },
    "participants": [
      "stage_curator"
    ],
    "locationId": "stage_forecourt",
    "opening": [
      {
        "speaker": "苏照影",
        "body": "“继续练下去，只会让所有人更像机器。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“取消的排练”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "苏照影",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "苏照影",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "苏照影",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_stage_curator_empty_rehearsal",
    "memoryText": "你曾和苏照影一起经历“取消的排练”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.chief_musician.missing-beat",
    "kind": "life",
    "title": "缺失的一拍",
    "summary": "顾长弦在排练里故意少弹了一拍。",
    "promptLabel": "问那一拍去了哪里",
    "source": {
      "type": "npc",
      "roleKey": "chief_musician"
    },
    "participants": [
      "chief_musician"
    ],
    "locationId": "stage",
    "opening": [
      {
        "speaker": "顾长弦",
        "body": "“我想知道别人会不会自己把它接起来。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“缺失的一拍”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "顾长弦",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "顾长弦",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "顾长弦",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_chief_musician_missing_beat",
    "memoryText": "你曾和顾长弦一起经历“缺失的一拍”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.chief_musician.broken-metronome",
    "kind": "life",
    "title": "停掉的节拍器",
    "summary": "用了多年的节拍器突然停了，他没有立刻修。",
    "promptLabel": "看看停掉的节拍器",
    "source": {
      "type": "npc",
      "roleKey": "chief_musician"
    },
    "participants": [
      "chief_musician"
    ],
    "locationId": "stage",
    "opening": [
      {
        "speaker": "顾长弦",
        "body": "“坏了以后，屋子反而第一次这么安静。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“停掉的节拍器”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "顾长弦",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "顾长弦",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "顾长弦",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_chief_musician_broken_metronome",
    "memoryText": "你曾和顾长弦一起经历“停掉的节拍器”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.chief_musician.unplanned-rest",
    "kind": "life",
    "title": "没有安排的休息",
    "summary": "顾长弦今天给自己留了一刻钟没有安排任何事。",
    "promptLabel": "陪他坐完这刻钟",
    "source": {
      "type": "npc",
      "roleKey": "chief_musician"
    },
    "participants": [
      "chief_musician"
    ],
    "locationId": "stage",
    "opening": [
      {
        "speaker": "顾长弦",
        "body": "“我本来以为不安排就是浪费。现在还没习惯。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“没有安排的休息”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "顾长弦",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "顾长弦",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "顾长弦",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_chief_musician_unplanned_rest",
    "memoryText": "你曾和顾长弦一起经历“没有安排的休息”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.dancer.wrong-costume",
    "kind": "life",
    "title": "拿错的衣裳",
    "summary": "洛轻罗穿着一件明显不是为她准备的戏服，却没急着换。",
    "promptLabel": "问她要不要换",
    "source": {
      "type": "npc",
      "roleKey": "dancer"
    },
    "participants": [
      "dancer"
    ],
    "locationId": "stage_forecourt",
    "opening": [
      {
        "speaker": "洛轻罗",
        "body": "“奇怪的是，我穿上以后反而觉得挺像自己。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“拿错的衣裳”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "洛轻罗",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "洛轻罗",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "洛轻罗",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_dancer_wrong_costume",
    "memoryText": "你曾和洛轻罗一起经历“拿错的衣裳”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.dancer.favorite-step",
    "kind": "life",
    "title": "最喜欢的一步",
    "summary": "有人问她最喜欢哪段舞，她第一次没有马上回答。",
    "promptLabel": "等她自己回答",
    "source": {
      "type": "npc",
      "roleKey": "dancer"
    },
    "participants": [
      "dancer"
    ],
    "locationId": "stage_forecourt",
    "opening": [
      {
        "speaker": "洛轻罗",
        "body": "“我以前总先想观众最喜欢哪一段。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“最喜欢的一步”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "洛轻罗",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "洛轻罗",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "洛轻罗",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_dancer_favorite_step",
    "memoryText": "你曾和洛轻罗一起经历“最喜欢的一步”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.dancer.empty-applause",
    "kind": "life",
    "title": "没有掌声的排练",
    "summary": "一段舞跳完，台下没人鼓掌，她却笑了。",
    "promptLabel": "问她为什么笑",
    "source": {
      "type": "npc",
      "roleKey": "dancer"
    },
    "participants": [
      "dancer"
    ],
    "locationId": "stage_forecourt",
    "opening": [
      {
        "speaker": "洛轻罗",
        "body": "“因为刚才那一段我自己喜欢，这次不用等别人告诉我。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“没有掌声的排练”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "洛轻罗",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "洛轻罗",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "洛轻罗",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_dancer_empty_applause",
    "memoryText": "你曾和洛轻罗一起经历“没有掌声的排练”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.lakeside_guest.stone-in-water",
    "kind": "life",
    "title": "扔进湖里的石子",
    "summary": "江听鹤把一枚石子在手里握很久，最后才扔进湖里。",
    "promptLabel": "问他在犹豫什么",
    "source": {
      "type": "npc",
      "roleKey": "lakeside_guest"
    },
    "participants": [
      "lakeside_guest"
    ],
    "locationId": "lakeside",
    "opening": [
      {
        "speaker": "江听鹤",
        "body": "“我只是想知道，不做这件事和做了以后，哪一种更像逃避。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“扔进湖里的石子”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "江听鹤",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "江听鹤",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "江听鹤",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_lakeside_guest_stone_in_water",
    "memoryText": "你曾和江听鹤一起经历“扔进湖里的石子”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.lakeside_guest.unanswered-question",
    "kind": "life",
    "title": "没有回答的问题",
    "summary": "有人留下一个问题请江听鹤转答，他却把纸折好收起。",
    "promptLabel": "问为什么不回答",
    "source": {
      "type": "npc",
      "roleKey": "lakeside_guest"
    },
    "participants": [
      "lakeside_guest"
    ],
    "locationId": "lakeside",
    "opening": [
      {
        "speaker": "江听鹤",
        "body": "“因为那不是问我的。知道答案也不代表该替别人说。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“没有回答的问题”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "江听鹤",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "江听鹤",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "江听鹤",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_lakeside_guest_unanswered_question",
    "memoryText": "你曾和江听鹤一起经历“没有回答的问题”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.lakeside_guest.borrowed-umbrella",
    "kind": "life",
    "title": "借来的伞",
    "summary": "水榭里放着一把多年没还的旧伞。",
    "promptLabel": "问问那把伞",
    "source": {
      "type": "npc",
      "roleKey": "lakeside_guest"
    },
    "participants": [
      "lakeside_guest"
    ],
    "locationId": "water_pavilion",
    "opening": [
      {
        "speaker": "江听鹤",
        "body": "“借伞的人后来回来过，只是两边都没再提还伞。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“借来的伞”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "江听鹤",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "江听鹤",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "江听鹤",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_lakeside_guest_borrowed_umbrella",
    "memoryText": "你曾和江听鹤一起经历“借来的伞”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.lantern_maker.blank-wish",
    "kind": "life",
    "title": "空白愿笺",
    "summary": "桑落收到一张什么都没写的愿笺。",
    "promptLabel": "看看空白愿笺",
    "source": {
      "type": "npc",
      "roleKey": "lantern_maker"
    },
    "participants": [
      "lantern_maker"
    ],
    "locationId": "water_pavilion",
    "opening": [
      {
        "speaker": "桑落",
        "body": "“空白也可以是愿望。有时候只是还没敢写。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“空白愿笺”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "桑落",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "桑落",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "桑落",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_lantern_maker_blank_wish",
    "memoryText": "你曾和桑落一起经历“空白愿笺”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.lantern_maker.burnt-lantern",
    "kind": "life",
    "title": "烧坏的一盏灯",
    "summary": "一盏新灯还没下水就烧坏了，她没有丢掉。",
    "promptLabel": "问那盏坏灯",
    "source": {
      "type": "npc",
      "roleKey": "lantern_maker"
    },
    "participants": [
      "lantern_maker"
    ],
    "locationId": "water_pavilion",
    "opening": [
      {
        "speaker": "桑落",
        "body": "“它没完成原本的事，可也不是因此就没有存在过。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“烧坏的一盏灯”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "桑落",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "桑落",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "桑落",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_lantern_maker_burnt_lantern",
    "memoryText": "你曾和桑落一起经历“烧坏的一盏灯”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.lantern_maker.unreleased-lantern",
    "kind": "life",
    "title": "从未放出的灯",
    "summary": "灯架最里面有一盏做了很久却从未放走的灯。",
    "promptLabel": "问她为什么留着",
    "source": {
      "type": "npc",
      "roleKey": "lantern_maker"
    },
    "participants": [
      "lantern_maker"
    ],
    "locationId": "water_pavilion",
    "opening": [
      {
        "speaker": "桑落",
        "body": "“这是我的。大概正因为是我的，才一直没决定写什么。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“从未放出的灯”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "桑落",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "桑落",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "桑落",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_lantern_maker_unreleased_lantern",
    "memoryText": "你曾和桑落一起经历“从未放出的灯”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.tea_physician.cold-tea",
    "kind": "life",
    "title": "又凉掉的药茶",
    "summary": "谢微尘给自己煮的茶又一次放凉了。",
    "promptLabel": "提醒他喝茶",
    "source": {
      "type": "npc",
      "roleKey": "tea_physician"
    },
    "participants": [
      "tea_physician"
    ],
    "locationId": "lakeside",
    "opening": [
      {
        "speaker": "谢微尘",
        "body": "“我知道。医师也会明知故犯，这不值得写进医书。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“又凉掉的药茶”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "谢微尘",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "谢微尘",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "谢微尘",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_tea_physician_cold_tea",
    "memoryText": "你曾和谢微尘一起经历“又凉掉的药茶”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.tea_physician.wrong-herb",
    "kind": "life",
    "title": "拿错的一味药",
    "summary": "药柜里一味药被放错了格，他却先问是谁整理的。",
    "promptLabel": "帮他核对药柜",
    "source": {
      "type": "npc",
      "roleKey": "tea_physician"
    },
    "participants": [
      "tea_physician"
    ],
    "locationId": "lakeside",
    "opening": [
      {
        "speaker": "谢微尘",
        "body": "“先找原因，再找人。顺序反了，事情通常只会更乱。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“拿错的一味药”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "谢微尘",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "谢微尘",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "谢微尘",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_tea_physician_wrong_herb",
    "memoryText": "你曾和谢微尘一起经历“拿错的一味药”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.tea_physician.patient-left",
    "kind": "life",
    "title": "没等到的人",
    "summary": "约好来复诊的人没有出现。",
    "promptLabel": "问他担不担心",
    "source": {
      "type": "npc",
      "roleKey": "tea_physician"
    },
    "participants": [
      "tea_physician"
    ],
    "locationId": "lakeside",
    "opening": [
      {
        "speaker": "谢微尘",
        "body": "“担心有用，但不能把别人绑来让我放心。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“没等到的人”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "谢微尘",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "谢微尘",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "谢微尘",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_tea_physician_patient_left",
    "memoryText": "你曾和谢微尘一起经历“没等到的人”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.west_host.mystery-spring",
    "kind": "life",
    "title": "多出来的弹簧",
    "summary": "韩知巧拆完机关，桌上却多出一根弹簧。",
    "promptLabel": "一起找它原本的位置",
    "source": {
      "type": "npc",
      "roleKey": "west_host"
    },
    "participants": [
      "west_host"
    ],
    "locationId": "west_courtyard",
    "opening": [
      {
        "speaker": "韩知巧",
        "body": "“别笑。多出来比少一根麻烦，说明我根本没看懂它。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“多出来的弹簧”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "韩知巧",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "韩知巧",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "韩知巧",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_west_host_mystery_spring",
    "memoryText": "你曾和韩知巧一起经历“多出来的弹簧”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.west_host.unopened-box",
    "kind": "life",
    "title": "偏偏不拆的盒子",
    "summary": "她面前有一只从没打开过的盒子。",
    "promptLabel": "问她为什么没拆",
    "source": {
      "type": "npc",
      "roleKey": "west_host"
    },
    "participants": [
      "west_host"
    ],
    "locationId": "west_courtyard",
    "opening": [
      {
        "speaker": "韩知巧",
        "body": "“因为莫问生说这次先问主人。我答应了，就只好忍着。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“偏偏不拆的盒子”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "韩知巧",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "韩知巧",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "韩知巧",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_west_host_unopened_box",
    "memoryText": "你曾和韩知巧一起经历“偏偏不拆的盒子”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.west_host.failed-gadget",
    "kind": "life",
    "title": "完全没用的机关",
    "summary": "她做了半天的小机关最后什么也没做到。",
    "promptLabel": "试试那个失败机关",
    "source": {
      "type": "npc",
      "roleKey": "west_host"
    },
    "participants": [
      "west_host"
    ],
    "locationId": "west_courtyard",
    "opening": [
      {
        "speaker": "韩知巧",
        "body": "“失败得很干净。反而省得我继续骗自己它差一点就行。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“完全没用的机关”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "韩知巧",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "韩知巧",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "韩知巧",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_west_host_failed_gadget",
    "memoryText": "你曾和韩知巧一起经历“完全没用的机关”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.mask_artisan.faceless-mask",
    "kind": "life",
    "title": "没有眼孔的面具",
    "summary": "燕十三娘新做了一张没有眼孔的面具。",
    "promptLabel": "问这张面具给谁",
    "source": {
      "type": "npc",
      "roleKey": "mask_artisan"
    },
    "participants": [
      "mask_artisan"
    ],
    "locationId": "west_lane",
    "opening": [
      {
        "speaker": "燕十三娘",
        "body": "“给总觉得戴上面具才能看清别人的人。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“没有眼孔的面具”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "燕十三娘",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "燕十三娘",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "燕十三娘",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_mask_artisan_faceless_mask",
    "memoryText": "你曾和燕十三娘一起经历“没有眼孔的面具”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.mask_artisan.cracked-mask",
    "kind": "life",
    "title": "裂开的旧面具",
    "summary": "一张旧面具从中间裂开，她却把两半都留下。",
    "promptLabel": "看看裂开的面具",
    "source": {
      "type": "npc",
      "roleKey": "mask_artisan"
    },
    "participants": [
      "mask_artisan"
    ],
    "locationId": "west_lane",
    "opening": [
      {
        "speaker": "燕十三娘",
        "body": "“裂了以后，反而第一次能看见里面是什么。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“裂开的旧面具”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "燕十三娘",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "燕十三娘",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "燕十三娘",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_mask_artisan_cracked_mask",
    "memoryText": "你曾和燕十三娘一起经历“裂开的旧面具”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.mask_artisan.child-mask",
    "kind": "life",
    "title": "孩子挑的面具",
    "summary": "一个孩子选了最普通的一张脸，她似乎很意外。",
    "promptLabel": "问她在意什么",
    "source": {
      "type": "npc",
      "roleKey": "mask_artisan"
    },
    "participants": [
      "mask_artisan"
    ],
    "locationId": "west_lane",
    "opening": [
      {
        "speaker": "燕十三娘",
        "body": "“大人总选想成为的样子。孩子有时候只是选自己觉得好看的。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“孩子挑的面具”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "燕十三娘",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "燕十三娘",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "燕十三娘",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_mask_artisan_child_mask",
    "memoryText": "你曾和燕十三娘一起经历“孩子挑的面具”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.curio_dealer.nameless-bell",
    "kind": "life",
    "title": "无名铜铃",
    "summary": "一只铜铃没人知道从哪里来，摇起来却有人觉得耳熟。",
    "promptLabel": "听听那只铜铃",
    "source": {
      "type": "npc",
      "roleKey": "curio_dealer"
    },
    "participants": [
      "curio_dealer"
    ],
    "locationId": "west_lane",
    "opening": [
      {
        "speaker": "莫问生",
        "body": "“认不出来不代表没见过。人的耳朵有时比记忆诚实。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“无名铜铃”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "莫问生",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "莫问生",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "莫问生",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_curio_dealer_nameless_bell",
    "memoryText": "你曾和莫问生一起经历“无名铜铃”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.curio_dealer.unsold-comb",
    "kind": "life",
    "title": "不卖的旧梳",
    "summary": "有人出很高的价，他仍不肯卖一把旧木梳。",
    "promptLabel": "问为什么不卖",
    "source": {
      "type": "npc",
      "roleKey": "curio_dealer"
    },
    "participants": [
      "curio_dealer"
    ],
    "locationId": "west_lane",
    "opening": [
      {
        "speaker": "莫问生",
        "body": "“价钱够了，去处不对。不是所有东西都该跟最高价走。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“不卖的旧梳”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "莫问生",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "莫问生",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "莫问生",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_curio_dealer_unsold_comb",
    "memoryText": "你曾和莫问生一起经历“不卖的旧梳”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.curio_dealer.stained-token",
    "kind": "life",
    "title": "洗不掉的痕迹",
    "summary": "一枚旧牌洗了几遍，暗色痕迹还是留着。",
    "promptLabel": "看看那块旧牌",
    "source": {
      "type": "npc",
      "roleKey": "curio_dealer"
    },
    "participants": [
      "curio_dealer"
    ],
    "locationId": "west_lane",
    "opening": [
      {
        "speaker": "莫问生",
        "body": "“洗掉它会更好看，但那也会让它变成另一件东西。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“洗不掉的痕迹”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "莫问生",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "莫问生",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "莫问生",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_curio_dealer_stained_token",
    "memoryText": "你曾和莫问生一起经历“洗不掉的痕迹”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.bamboo_stranger.erased-name",
    "kind": "life",
    "title": "被磨掉的名字",
    "summary": "残碑上一个名字被人为磨掉了。",
    "promptLabel": "问那个名字是谁",
    "source": {
      "type": "npc",
      "roleKey": "bamboo_stranger"
    },
    "participants": [
      "bamboo_stranger"
    ],
    "locationId": "bamboo_garden",
    "opening": [
      {
        "speaker": "白无昼",
        "body": "“有人以为磨掉名字，事情就会少一个见证。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“被磨掉的名字”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "白无昼",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "白无昼",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "白无昼",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_bamboo_stranger_erased_name",
    "memoryText": "你曾和白无昼一起经历“被磨掉的名字”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.bamboo_stranger.bamboo-note",
    "kind": "life",
    "title": "竹叶上的字",
    "summary": "一片竹叶上写着半个已经模糊的字。",
    "promptLabel": "请他辨认那个字",
    "source": {
      "type": "npc",
      "roleKey": "bamboo_stranger"
    },
    "participants": [
      "bamboo_stranger"
    ],
    "locationId": "bamboo_garden",
    "opening": [
      {
        "speaker": "白无昼",
        "body": "“看得出是什么，不代表现在就该说出来。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“竹叶上的字”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "白无昼",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "白无昼",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "白无昼",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_bamboo_stranger_bamboo_note",
    "memoryText": "你曾和白无昼一起经历“竹叶上的字”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.bamboo_stranger.mirror-dust",
    "kind": "life",
    "title": "镜上的灰",
    "summary": "照心镜蒙了一层灰，白无昼没有擦。",
    "promptLabel": "问为什么不擦镜子",
    "source": {
      "type": "npc",
      "roleKey": "bamboo_stranger"
    },
    "participants": [
      "bamboo_stranger"
    ],
    "locationId": "bamboo_garden",
    "opening": [
      {
        "speaker": "白无昼",
        "body": "“有时候看不清，比看得太清楚更适合活下去。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“镜上的灰”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "白无昼",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "白无昼",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "白无昼",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_bamboo_stranger_mirror_dust",
    "memoryText": "你曾和白无昼一起经历“镜上的灰”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.former_challenger.missing-dart",
    "kind": "life",
    "title": "少了一支投签",
    "summary": "签筒里少了一支常用的签，裴照川却说不用找。",
    "promptLabel": "问那支签",
    "source": {
      "type": "npc",
      "roleKey": "former_challenger"
    },
    "participants": [
      "former_challenger"
    ],
    "locationId": "southeast_courtyard",
    "opening": [
      {
        "speaker": "裴照川",
        "body": "“最后一次用它的时候，我赢了最不想赢的一局。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“少了一支投签”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "裴照川",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "裴照川",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "裴照川",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_former_challenger_missing_dart",
    "memoryText": "你曾和裴照川一起经历“少了一支投签”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.former_challenger.old-wound",
    "kind": "life",
    "title": "旧伤发作",
    "summary": "他拿酒杯的手微微发抖，又很快压住。",
    "promptLabel": "问问他的手",
    "source": {
      "type": "npc",
      "roleKey": "former_challenger"
    },
    "participants": [
      "former_challenger"
    ],
    "locationId": "southeast_courtyard",
    "opening": [
      {
        "speaker": "裴照川",
        "body": "“旧伤。比旧名声诚实，天气一变就提醒我还在。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“旧伤发作”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "裴照川",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "裴照川",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "裴照川",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_former_challenger_old_wound",
    "memoryText": "你曾和裴照川一起经历“旧伤发作”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.former_challenger.empty-cup",
    "kind": "life",
    "title": "一直没倒满的酒杯",
    "summary": "他今天每次只倒半杯。",
    "promptLabel": "问为什么只喝半杯",
    "source": {
      "type": "npc",
      "roleKey": "former_challenger"
    },
    "participants": [
      "former_challenger"
    ],
    "locationId": "southeast_courtyard",
    "opening": [
      {
        "speaker": "裴照川",
        "body": "“喝满容易让人以为今天非得尽兴。半杯就不用。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“一直没倒满的酒杯”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "裴照川",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "裴照川",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "裴照川",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_former_challenger_empty_cup",
    "memoryText": "你曾和裴照川一起经历“一直没倒满的酒杯”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.roaming_merchant.last-batch",
    "kind": "life",
    "title": "又是最后一批",
    "summary": "宁小满再次宣布这是离坊前最后一批货。",
    "promptLabel": "问他到底哪天走",
    "source": {
      "type": "npc",
      "roleKey": "roaming_merchant"
    },
    "participants": [
      "roaming_merchant"
    ],
    "locationId": "central_square",
    "opening": [
      {
        "speaker": "宁小满",
        "body": "“计划一直是真的，只是万戏坊总有下一笔生意。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“又是最后一批”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "宁小满",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "宁小满",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "宁小满",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_roaming_merchant_last_batch",
    "memoryText": "你曾和宁小满一起经历“又是最后一批”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.roaming_merchant.wrong-price",
    "kind": "life",
    "title": "写错的价签",
    "summary": "一件普通小物被他标了一个明显离谱的低价。",
    "promptLabel": "提醒他看价签",
    "source": {
      "type": "npc",
      "roleKey": "roaming_merchant"
    },
    "participants": [
      "roaming_merchant"
    ],
    "locationId": "central_square",
    "opening": [
      {
        "speaker": "宁小满",
        "body": "“看见了。今天就这个价，偶尔做亏本生意也能记住一个人。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“写错的价签”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "宁小满",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "宁小满",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "宁小满",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_roaming_merchant_wrong_price",
    "memoryText": "你曾和宁小满一起经历“写错的价签”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.roaming_merchant.returned-goods",
    "kind": "life",
    "title": "被退回的货",
    "summary": "有人把买走很久的东西原样退了回来。",
    "promptLabel": "问他收不收退货",
    "source": {
      "type": "npc",
      "roleKey": "roaming_merchant"
    },
    "participants": [
      "roaming_merchant"
    ],
    "locationId": "central_square",
    "opening": [
      {
        "speaker": "宁小满",
        "body": "“按规矩不该收。但规矩是为了少麻烦，不是为了让人更麻烦。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“被退回的货”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "宁小满",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "宁小满",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "宁小满",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_roaming_merchant_returned_goods",
    "memoryText": "你曾和宁小满一起经历“被退回的货”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.runner_boy.wrong-letter",
    "kind": "life",
    "title": "送错的信",
    "summary": "唐小雀手里有一封没有署名、也没有收信人的信。",
    "promptLabel": "帮他猜收信人",
    "source": {
      "type": "npc",
      "roleKey": "runner_boy"
    },
    "participants": [
      "runner_boy"
    ],
    "locationId": "gate",
    "opening": [
      {
        "speaker": "唐小雀",
        "body": "“最麻烦的不是送错，是所有人看完都觉得像写给自己。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“送错的信”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "唐小雀",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "唐小雀",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "唐小雀",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_runner_boy_wrong_letter",
    "memoryText": "你曾和唐小雀一起经历“送错的信”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.runner_boy.shortcut",
    "kind": "life",
    "title": "今天不走捷径",
    "summary": "一向抄近路的唐小雀今天绕了很远。",
    "promptLabel": "问他为什么绕路",
    "source": {
      "type": "npc",
      "roleKey": "runner_boy"
    },
    "participants": [
      "runner_boy"
    ],
    "locationId": "central_square",
    "opening": [
      {
        "speaker": "唐小雀",
        "body": "“那条近路今天有人想一个人待着。我跑腿快，不差这点路。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“今天不走捷径”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "唐小雀",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "唐小雀",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "唐小雀",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_runner_boy_shortcut",
    "memoryText": "你曾和唐小雀一起经历“今天不走捷径”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.runner_boy.forgotten-name",
    "kind": "life",
    "title": "突然想不起名字",
    "summary": "他记得一个人的所有特征，却死活想不起名字。",
    "promptLabel": "陪他一起想",
    "source": {
      "type": "npc",
      "roleKey": "runner_boy"
    },
    "participants": [
      "runner_boy"
    ],
    "locationId": "gate",
    "opening": [
      {
        "speaker": "唐小雀",
        "body": "“我平时最会记这些。越急着想，脑子越像空的。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“突然想不起名字”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "唐小雀",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "唐小雀",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "唐小雀",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_runner_boy_forgotten_name",
    "memoryText": "你曾和唐小雀一起经历“突然想不起名字”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.night_watchman.extra-footprint",
    "kind": "life",
    "title": "多出来的脚印",
    "summary": "夜巡路上多出一串没有来处的湿脚印。",
    "promptLabel": "跟他看看脚印",
    "source": {
      "type": "npc",
      "roleKey": "night_watchman"
    },
    "participants": [
      "night_watchman"
    ],
    "locationId": "gate",
    "opening": [
      {
        "speaker": "段无声",
        "body": "“先看它往哪去，别急着猜它从哪来。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“多出来的脚印”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "段无声",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "段无声",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "段无声",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_night_watchman_extra_footprint",
    "memoryText": "你曾和段无声一起经历“多出来的脚印”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.night_watchman.dark-lantern",
    "kind": "life",
    "title": "没点亮的坊门灯",
    "summary": "一盏坊门灯今夜一直没亮，段无声却没去点。",
    "promptLabel": "问为什么不点灯",
    "source": {
      "type": "npc",
      "roleKey": "night_watchman"
    },
    "participants": [
      "night_watchman"
    ],
    "locationId": "gate",
    "opening": [
      {
        "speaker": "段无声",
        "body": "“灯不是坏了。有人需要这段路暗一会儿。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“没点亮的坊门灯”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "段无声",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "段无声",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "段无声",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_night_watchman_dark_lantern",
    "memoryText": "你曾和段无声一起经历“没点亮的坊门灯”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.night_watchman.open-door",
    "kind": "life",
    "title": "自己开的门",
    "summary": "一扇平时锁着的小门夜里自己开了。",
    "promptLabel": "问门后有什么",
    "source": {
      "type": "npc",
      "roleKey": "night_watchman"
    },
    "participants": [
      "night_watchman"
    ],
    "locationId": "southeast_courtyard",
    "opening": [
      {
        "speaker": "段无声",
        "body": "“白天是一堵墙后面的杂间。夜里……我还没决定要不要进去。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“自己开的门”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "段无声",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "段无声",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "段无声",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_night_watchman_open_door",
    "memoryText": "你曾和段无声一起经历“自己开的门”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.mysterious_girl.common-word",
    "kind": "life",
    "title": "一个普通的词",
    "summary": "阿绯忽然问“回家”到底是什么意思。",
    "promptLabel": "回答她什么是回家",
    "source": {
      "type": "npc",
      "roleKey": "mysterious_girl"
    },
    "participants": [
      "mysterious_girl"
    ],
    "locationId": "bamboo_garden",
    "opening": [
      {
        "speaker": "阿绯",
        "body": "“原来不一定是出生的地方。那就比我想的宽很多。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“一个普通的词”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "阿绯",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "阿绯",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "阿绯",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_mysterious_girl_common_word",
    "memoryText": "你曾和阿绯一起经历“一个普通的词”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.mysterious_girl.sealed-door",
    "kind": "life",
    "title": "她知道门后有什么",
    "summary": "她指着一处封住的旧门，说出了里面的摆设。",
    "promptLabel": "问她怎么知道",
    "source": {
      "type": "npc",
      "roleKey": "mysterious_girl"
    },
    "participants": [
      "mysterious_girl"
    ],
    "locationId": "bamboo_garden",
    "opening": [
      {
        "speaker": "阿绯",
        "body": "“我不知道。我只是看见门的时候，就知道里面是什么。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“她知道门后有什么”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "阿绯",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "阿绯",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "阿绯",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_mysterious_girl_sealed_door",
    "memoryText": "你曾和阿绯一起经历“她知道门后有什么”。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.life.mysterious_girl.old-song",
    "kind": "life",
    "title": "从没听过却会唱",
    "summary": "她哼出一段早已没人唱的旧调。",
    "promptLabel": "请她继续唱",
    "source": {
      "type": "npc",
      "roleKey": "mysterious_girl"
    },
    "participants": [
      "mysterious_girl"
    ],
    "locationId": "water_pavilion",
    "opening": [
      {
        "speaker": "阿绯",
        "body": "“我不知道后面。唱到这里的时候，脑子里就只剩水声。”"
      }
    ],
    "choices": [
      {
        "id": "ask",
        "label": "顺着问下去",
        "playerText": "关于“从没听过却会唱”，我想听你自己怎么说。",
        "response": [
          {
            "speaker": "阿绯",
            "body": "你倒问得直接。既然已经看见了，就不用装作没看见。"
          }
        ]
      },
      {
        "id": "help",
        "label": "搭把手",
        "playerText": "如果你愿意，我可以陪你把这件事做完。",
        "response": [
          {
            "speaker": "阿绯",
            "body": "好。那就一起。有人在旁边，事情会变得不太一样。"
          }
        ]
      },
      {
        "id": "leave-space",
        "label": "先不替你下结论",
        "playerText": "不用急着解释。我陪你再看一会儿。",
        "response": [
          {
            "speaker": "阿绯",
            "body": "……这样也好。有些话晚一点说，反而更接近真的。"
          }
        ]
      }
    ],
    "memoryTag": "life_mysterious_girl_old_song",
    "memoryText": "你曾和阿绯一起经历“从没听过却会唱”。",
    "familiarityDelta": 1
  }
] as const satisfies readonly WanxiWorldEncounterDefinition[];

export const WANXI_CROSS_EVENT_DEFINITIONS =
[
  {
    "id": "wanxi.cross.master_lakeside",
    "kind": "cross",
    "title": "该不该拦",
    "summary": "闻人砚与江听鹤为了“是否应该阻止别人犯错”又一次没有谈拢。",
    "promptLabel": "听听“该不该拦”",
    "source": {
      "type": "npc",
      "roleKey": "master"
    },
    "participants": [
      "master",
      "lakeside_guest"
    ],
    "locationId": "hall_forecourt",
    "opening": [
      {
        "speaker": "闻人砚",
        "body": "闻人砚与江听鹤为了“是否应该阻止别人犯错”又一次没有谈拢。"
      }
    ],
    "choices": [
      {
        "id": "support-master",
        "label": "应该拦",
        "playerText": "明知会出事，还是什么都不做，也是在做选择。",
        "response": [
          {
            "speaker": "闻人砚",
            "body": "至少你承认介入也要承担责任。"
          }
        ]
      },
      {
        "id": "support-jiang",
        "label": "让他自己选",
        "playerText": "只要代价主要由本人承担，选择应该留给他。",
        "response": [
          {
            "speaker": "江听鹤",
            "body": "把选择还给本人，不等于不在乎。"
          }
        ]
      },
      {
        "id": "third",
        "label": "先看会伤到谁",
        "playerText": "先别争原则，先看这件事会伤到谁。",
        "response": [
          {
            "speaker": "闻人砚",
            "body": "这答案不漂亮，但更接近真正需要做决定的时候。"
          }
        ]
      }
    ],
    "memoryTag": "cross_master_lakeside",
    "memoryText": "你参与过“该不该拦”，也看见了两个人并不相同的立场。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.cross.script_storyteller",
    "kind": "cross",
    "title": "两个版本",
    "summary": "沈砚秋与温不语讲的是同一件旧事，却连主角是谁都不一致。",
    "promptLabel": "听听“两个版本”",
    "source": {
      "type": "npc",
      "roleKey": "script_scholar"
    },
    "participants": [
      "script_scholar",
      "storyteller"
    ],
    "locationId": "main_hall",
    "opening": [
      {
        "speaker": "沈砚秋",
        "body": "沈砚秋与温不语讲的是同一件旧事，却连主角是谁都不一致。"
      }
    ],
    "choices": [
      {
        "id": "script",
        "label": "按原稿来",
        "playerText": "至少先把最早留下的文字当作基准。",
        "response": [
          {
            "speaker": "沈砚秋",
            "body": "文字会撒谎，但改过的文字至少会留下痕迹。"
          }
        ]
      },
      {
        "id": "story",
        "label": "听活人讲",
        "playerText": "纸上的版本不一定比活着的人记得更真。",
        "response": [
          {
            "speaker": "温不语",
            "body": "这句话我喜欢。可活人的记忆也会为了活下去而改。"
          }
        ]
      },
      {
        "id": "compare",
        "label": "两个都留",
        "playerText": "别急着选一个是真的，把差别本身留下。",
        "response": [
          {
            "speaker": "沈砚秋",
            "body": "差别有时就是最重要的证词。"
          }
        ]
      }
    ],
    "memoryTag": "cross_script_storyteller",
    "memoryText": "你参与过“两个版本”，也看见了两个人并不相同的立场。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.cross.stage_west",
    "kind": "cross",
    "title": "机关要不要上台",
    "summary": "韩知巧想把一套新机关装进百戏台，苏照影认为还不够可靠。",
    "promptLabel": "听听“机关要不要上台”",
    "source": {
      "type": "npc",
      "roleKey": "stage_curator"
    },
    "participants": [
      "stage_curator",
      "west_host"
    ],
    "locationId": "stage_forecourt",
    "opening": [
      {
        "speaker": "苏照影",
        "body": "韩知巧想把一套新机关装进百戏台，苏照影认为还不够可靠。"
      }
    ],
    "choices": [
      {
        "id": "safe",
        "label": "先不上台",
        "playerText": "没验证清楚以前，不该拿演出当测试。",
        "response": [
          {
            "speaker": "苏照影",
            "body": "至少今天不用让观众替我们承担试错。"
          }
        ]
      },
      {
        "id": "test",
        "label": "小范围试",
        "playerText": "可以先空台试一次，不必直接用于正式演出。",
        "response": [
          {
            "speaker": "韩知巧",
            "body": "对！能试就不是死局。"
          }
        ]
      },
      {
        "id": "simple",
        "label": "不用也行",
        "playerText": "如果机关只是为了炫技，不如先问这场戏需不需要。",
        "response": [
          {
            "speaker": "苏照影",
            "body": "终于有人先问戏，而不是先问机关。"
          }
        ]
      }
    ],
    "memoryTag": "cross_stage_west",
    "memoryText": "你参与过“机关要不要上台”，也看见了两个人并不相同的立场。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.cross.music_dancer",
    "kind": "cross",
    "title": "提前半拍",
    "summary": "洛轻罗想故意抢半拍，顾长弦坚持那会破坏整段节奏。",
    "promptLabel": "听听“提前半拍”",
    "source": {
      "type": "npc",
      "roleKey": "chief_musician"
    },
    "participants": [
      "chief_musician",
      "dancer"
    ],
    "locationId": "stage",
    "opening": [
      {
        "speaker": "顾长弦",
        "body": "洛轻罗想故意抢半拍，顾长弦坚持那会破坏整段节奏。"
      }
    ],
    "choices": [
      {
        "id": "keep",
        "label": "守拍",
        "playerText": "先把整段稳定住，再谈故意打破。",
        "response": [
          {
            "speaker": "顾长弦",
            "body": "我不是反对变化。我反对不知道自己在改什么。"
          }
        ]
      },
      {
        "id": "break",
        "label": "让她试",
        "playerText": "既然她知道自己在做什么，就让这一拍先走出去。",
        "response": [
          {
            "speaker": "洛轻罗",
            "body": "看吧，至少有人愿意让我自己摔一次。"
          }
        ]
      },
      {
        "id": "once",
        "label": "只试一遍",
        "playerText": "先试一次，听完再决定保不保留。",
        "response": [
          {
            "speaker": "顾长弦",
            "body": "可以。试验和正式演出不是一回事。"
          }
        ]
      }
    ],
    "memoryTag": "cross_music_dancer",
    "memoryText": "你参与过“提前半拍”，也看见了两个人并不相同的立场。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.cross.dancer_mask",
    "kind": "cross",
    "title": "没有眼孔的面具",
    "summary": "燕十三娘做了一张没有眼孔的面具，洛轻罗却说想戴着它排一次舞。",
    "promptLabel": "听听“没有眼孔的面具”",
    "source": {
      "type": "npc",
      "roleKey": "mask_artisan"
    },
    "participants": [
      "dancer",
      "mask_artisan"
    ],
    "locationId": "west_lane",
    "opening": [
      {
        "speaker": "燕十三娘",
        "body": "燕十三娘做了一张没有眼孔的面具，洛轻罗却说想戴着它排一次舞。"
      }
    ],
    "choices": [
      {
        "id": "dont",
        "label": "别戴着跳",
        "playerText": "看不见还要跳，不值得拿受伤证明什么。",
        "response": [
          {
            "speaker": "燕十三娘",
            "body": "我做面具，不代表我希望每张都真的被戴上。"
          }
        ]
      },
      {
        "id": "try",
        "label": "慢慢试",
        "playerText": "空台、慢拍、有人看护，可以试。",
        "response": [
          {
            "speaker": "洛轻罗",
            "body": "这就够了。我想知道看不见观众以后，我会不会更像自己。"
          }
        ]
      },
      {
        "id": "ask",
        "label": "先问为什么",
        "playerText": "先别讨论能不能，先问你为什么想戴它。",
        "response": [
          {
            "speaker": "洛轻罗",
            "body": "……因为我想知道没有观众的脸以后，我还会怎么跳。"
          }
        ]
      }
    ],
    "memoryTag": "cross_dancer_mask",
    "memoryText": "你参与过“没有眼孔的面具”，也看见了两个人并不相同的立场。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.cross.jiang_physician",
    "kind": "cross",
    "title": "救还是等",
    "summary": "谢微尘想强行留下一个不肯治疗的人，江听鹤认为应把决定还给对方。",
    "promptLabel": "听听“救还是等”",
    "source": {
      "type": "npc",
      "roleKey": "tea_physician"
    },
    "participants": [
      "lakeside_guest",
      "tea_physician"
    ],
    "locationId": "lakeside",
    "opening": [
      {
        "speaker": "谢微尘",
        "body": "谢微尘想强行留下一个不肯治疗的人，江听鹤认为应把决定还给对方。"
      }
    ],
    "choices": [
      {
        "id": "save",
        "label": "先救命",
        "playerText": "如果不治会立刻恶化，就先把人留下。",
        "response": [
          {
            "speaker": "谢微尘",
            "body": "至少有人知道“尊重选择”不能拿来替死人解释。"
          }
        ]
      },
      {
        "id": "choose",
        "label": "让他决定",
        "playerText": "先把后果说清楚，再让本人决定。",
        "response": [
          {
            "speaker": "江听鹤",
            "body": "选择需要知道代价，否则只是被推着走。"
          }
        ]
      },
      {
        "id": "time",
        "label": "给一炷香",
        "playerText": "给他一点时间，不放走，也不立刻强迫。",
        "response": [
          {
            "speaker": "谢微尘",
            "body": "行。一炷香以后我再问一次。"
          }
        ]
      }
    ],
    "memoryTag": "cross_jiang_physician",
    "memoryText": "你参与过“救还是等”，也看见了两个人并不相同的立场。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.cross.west_curio",
    "kind": "cross",
    "title": "拆了就回不去了",
    "summary": "韩知巧想拆开一件旧物研究，莫问生坚持这东西一拆就失去原来的意义。",
    "promptLabel": "听听“拆了就回不去了”",
    "source": {
      "type": "npc",
      "roleKey": "west_host"
    },
    "participants": [
      "west_host",
      "curio_dealer"
    ],
    "locationId": "west_courtyard",
    "opening": [
      {
        "speaker": "韩知巧",
        "body": "韩知巧想拆开一件旧物研究，莫问生坚持这东西一拆就失去原来的意义。"
      }
    ],
    "choices": [
      {
        "id": "dont",
        "label": "别拆",
        "playerText": "如果拆开会不可逆，那就先不动。",
        "response": [
          {
            "speaker": "莫问生",
            "body": "能忍住好奇，有时候也是本事。"
          }
        ]
      },
      {
        "id": "document",
        "label": "先记录再拆",
        "playerText": "先把现在的样子完整记录，再决定。",
        "response": [
          {
            "speaker": "韩知巧",
            "body": "好！这至少不是一句“别碰”。"
          }
        ]
      },
      {
        "id": "owner",
        "label": "先找主人",
        "playerText": "先确认这东西还有没有真正的主人。",
        "response": [
          {
            "speaker": "莫问生",
            "body": "找到人以后，问题可能就不再是东西的问题。"
          }
        ]
      }
    ],
    "memoryTag": "cross_west_curio",
    "memoryText": "你参与过“拆了就回不去了”，也看见了两个人并不相同的立场。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.cross.gate_runner",
    "kind": "cross",
    "title": "谁记得那位客人",
    "summary": "陆清和与唐小雀都记得一个来客，却记得完全不同的细节。",
    "promptLabel": "听听“谁记得那位客人”",
    "source": {
      "type": "npc",
      "roleKey": "gate_steward"
    },
    "participants": [
      "gate_steward",
      "runner_boy"
    ],
    "locationId": "gate",
    "opening": [
      {
        "speaker": "陆清和",
        "body": "陆清和与唐小雀都记得一个来客，却记得完全不同的细节。"
      }
    ],
    "choices": [
      {
        "id": "lu",
        "label": "信陆清和",
        "playerText": "先按访客簿与陆清和的记录查。",
        "response": [
          {
            "speaker": "陆清和",
            "body": "记录的好处，是它不会因为后来发生的事改口。"
          }
        ]
      },
      {
        "id": "tang",
        "label": "听唐小雀",
        "playerText": "唐小雀看见的是人离开登记处以后发生的事。",
        "response": [
          {
            "speaker": "唐小雀",
            "body": "对！人出了坊门口那一小块地方，才会做真正想做的事。"
          }
        ]
      },
      {
        "id": "both",
        "label": "拼起来",
        "playerText": "一个记来处，一个记去向，两个都别丢。",
        "response": [
          {
            "speaker": "陆清和",
            "body": "这样查最慢，但也最不容易把人写成一条记录。"
          }
        ]
      }
    ],
    "memoryTag": "cross_gate_runner",
    "memoryText": "你参与过“谁记得那位客人”，也看见了两个人并不相同的立场。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.cross.chess_former",
    "kind": "cross",
    "title": "缺角棋子",
    "summary": "迟观棋拿出一枚缺角棋子，裴照川一眼认出却说从没见过。",
    "promptLabel": "听听“缺角棋子”",
    "source": {
      "type": "npc",
      "roleKey": "chess_keeper"
    },
    "participants": [
      "chess_keeper",
      "former_challenger"
    ],
    "locationId": "central_square",
    "opening": [
      {
        "speaker": "迟观棋",
        "body": "迟观棋拿出一枚缺角棋子，裴照川一眼认出却说从没见过。"
      }
    ],
    "choices": [
      {
        "id": "press",
        "label": "继续问",
        "playerText": "既然一眼就认出来，就别说没见过。",
        "response": [
          {
            "speaker": "裴照川",
            "body": "你们这些人怎么都喜欢抓别人一句话里的破绽。"
          }
        ]
      },
      {
        "id": "leave",
        "label": "先不追问",
        "playerText": "他不想说，就先把棋下完。",
        "response": [
          {
            "speaker": "迟观棋",
            "body": "有些答案非要当场拿到手，就会变成另一种赢。"
          }
        ]
      },
      {
        "id": "piece",
        "label": "问棋子",
        "playerText": "先问这枚棋子经历过什么，不问人。",
        "response": [
          {
            "speaker": "迟观棋",
            "body": "好。东西不会害怕承认自己缺了一角。"
          }
        ]
      }
    ],
    "memoryTag": "cross_chess_former",
    "memoryText": "你参与过“缺角棋子”，也看见了两个人并不相同的立场。",
    "familiarityDelta": 1
  },
  {
    "id": "wanxi.cross.night_girl",
    "kind": "cross",
    "title": "夜里多出来的一道门",
    "summary": "段无声说夜里某处多了一道门，阿绯却准确说出门后的摆设。",
    "promptLabel": "听听“夜里多出来的一道门”",
    "source": {
      "type": "npc",
      "roleKey": "night_watchman"
    },
    "participants": [
      "night_watchman",
      "mysterious_girl"
    ],
    "locationId": "southeast_courtyard",
    "opening": [
      {
        "speaker": "段无声",
        "body": "段无声说夜里某处多了一道门，阿绯却准确说出门后的摆设。"
      }
    ],
    "choices": [
      {
        "id": "enter",
        "label": "进去看看",
        "playerText": "既然门已经出现，就进去确认。",
        "response": [
          {
            "speaker": "段无声",
            "body": "可以。但进去的人要记得自己从哪一步开始觉得熟悉。"
          }
        ]
      },
      {
        "id": "dont",
        "label": "今晚别进",
        "playerText": "她知道得太具体，今晚先别动那扇门。",
        "response": [
          {
            "speaker": "阿绯",
            "body": "你是在怕我知道，还是怕里面真的和我说的一样？"
          }
        ]
      },
      {
        "id": "ask",
        "label": "先问阿绯",
        "playerText": "先让阿绯把她知道的全部说完。",
        "response": [
          {
            "speaker": "阿绯",
            "body": "我只能说到门后第三步。再后面就是空的。"
          }
        ]
      }
    ],
    "memoryTag": "cross_night_girl",
    "memoryText": "你参与过“夜里多出来的一道门”，也看见了两个人并不相同的立场。",
    "familiarityDelta": 1
  }
] as const satisfies readonly WanxiWorldEncounterDefinition[];

export const WANXI_REGIONAL_STORY_ENCOUNTERS =
[
  {
    "id": "wanxi.story.playbill.start",
    "kind": "regional_story",
    "title": "无名戏单",
    "summary": "百戏台前场的戏单墙上，有一张被抹掉剧名与主演的旧戏单。",
    "promptLabel": "揭开《无名戏单》",
    "source": {
      "type": "prop",
      "propId": "wanxi_prop_stage_unnamed_playbill_wall"
    },
    "participants": [
      "stage_curator"
    ],
    "locationId": "stage_forecourt",
    "opening": [
      {
        "speaker": "旁白",
        "body": "旧纸边缘已经发脆，剧名和主演的位置却不是自然褪色，而是被人耐心刮掉。"
      }
    ],
    "choices": [
      {
        "id": "trace",
        "label": "先查戏本",
        "playerText": "先去万戏楼找同期戏本。",
        "response": [
          {
            "speaker": "旁白",
            "body": "戏单右下角还有一个极淡的编目号，正好可以从藏戏架追下去。"
          }
        ]
      },
      {
        "id": "ask-stage",
        "label": "先问苏照影",
        "playerText": "先问现在管百戏台的人。",
        "response": [
          {
            "speaker": "苏照影",
            "body": "这张戏单比我接手百戏台还早。真正会留编目的人在万戏楼。"
          }
        ]
      },
      {
        "id": "copy",
        "label": "先把残字拓下来",
        "playerText": "先把还看得见的残字记下来。",
        "response": [
          {
            "speaker": "旁白",
            "body": "你拓下几处残墨，其中一个“白”字旁像还有被磨掉的偏旁。"
          }
        ]
      }
    ],
    "memoryTag": "playbill_started",
    "memoryText": "你在百戏台发现了一张被人为抹去名字的旧戏单。",
    "familiarityDelta": 0,
    "storyStage": "not_started",
    "nextStoryStage": "ask_shen"
  },
  {
    "id": "wanxi.story.playbill.ask_shen",
    "kind": "regional_story",
    "title": "藏戏架里的缺页",
    "summary": "沈砚秋从编目号里找到了那部戏，却发现最关键的演员页被整页割走。",
    "promptLabel": "把戏单交给沈砚秋",
    "source": {
      "type": "npc",
      "roleKey": "script_scholar"
    },
    "participants": [
      "script_scholar"
    ],
    "locationId": "main_hall",
    "opening": [
      {
        "speaker": "沈砚秋",
        "body": "有记录。奇怪的是，戏本还在，演员页被整张割走了。干净得不像临时起意。"
      }
    ],
    "choices": [
      {
        "id": "who",
        "label": "谁有资格改档？",
        "playerText": "能动藏戏架的人应该不多。",
        "response": [
          {
            "speaker": "沈砚秋",
            "body": "当年能直接改档的，至少有三个人。现在有两个还在坊里。"
          }
        ]
      },
      {
        "id": "mask",
        "label": "查角色装束",
        "playerText": "演员页没了，服装和面具记录还可能在。",
        "response": [
          {
            "speaker": "沈砚秋",
            "body": "对。那一场用了定制面具，做面具的人应该留下过底样。"
          }
        ]
      },
      {
        "id": "why",
        "label": "为什么只割演员页？",
        "playerText": "如果要删一部戏，为什么只删演员名字？",
        "response": [
          {
            "speaker": "沈砚秋",
            "body": "因为有人想保留发生过的事，只是不想留下“是谁”。"
          }
        ]
      }
    ],
    "memoryTag": "playbill_missing_cast",
    "memoryText": "你和沈砚秋确认《无名戏单》对应的戏本仍在，但演员页被人为割走。",
    "familiarityDelta": 1,
    "storyStage": "ask_shen",
    "nextStoryStage": "ask_yan"
  },
  {
    "id": "wanxi.story.playbill.ask_yan",
    "kind": "regional_story",
    "title": "没有眼孔的旧面",
    "summary": "燕十三娘认出底样：那是一批故意遮住双眼的旧面具。",
    "promptLabel": "问燕十三娘旧面具",
    "source": {
      "type": "npc",
      "roleKey": "mask_artisan"
    },
    "participants": [
      "mask_artisan",
      "dancer"
    ],
    "locationId": "west_lane",
    "opening": [
      {
        "speaker": "燕十三娘",
        "body": "这种做法现在没人用了。不是为了让演员看不见，是为了让台下认不出演员。"
      }
    ],
    "choices": [
      {
        "id": "who",
        "label": "谁要求这么做？",
        "playerText": "谁会要求把所有演员的脸都藏起来？",
        "response": [
          {
            "speaker": "燕十三娘",
            "body": "订单上没有名字，只有旧印。白无昼应该认得那种印。"
          }
        ]
      },
      {
        "id": "purpose",
        "label": "那场戏演什么？",
        "playerText": "既然脸要藏起来，那场戏到底演了什么？",
        "response": [
          {
            "speaker": "燕十三娘",
            "body": "不知道。但面具内侧都写了同一个字：忘。"
          }
        ]
      },
      {
        "id": "keep",
        "label": "还有旧面具吗？",
        "playerText": "有没有一张真的留下来？",
        "response": [
          {
            "speaker": "燕十三娘",
            "body": "有。莫问生不肯卖，我也没让他毁。后来被送去了静竹苑。"
          }
        ]
      }
    ],
    "memoryTag": "playbill_blind_masks",
    "memoryText": "燕十三娘告诉你，那场无名戏使用了故意遮眼、隐藏演员身份的旧面具。",
    "familiarityDelta": 1,
    "storyStage": "ask_yan",
    "nextStoryStage": "seek_bai"
  },
  {
    "id": "wanxi.story.playbill.seek_bai",
    "kind": "regional_story",
    "title": "被要求忘记的人",
    "summary": "白无昼承认那场戏确实存在，也承认自己参与过抹去名字。",
    "promptLabel": "把线索带到静竹苑",
    "source": {
      "type": "npc",
      "roleKey": "bamboo_stranger"
    },
    "participants": [
      "bamboo_stranger"
    ],
    "locationId": "bamboo_garden",
    "opening": [
      {
        "speaker": "白无昼",
        "body": "那不是一场给观众看的戏。是给一群想把同一件事忘掉的人看的。演完以后，他们要求把自己的名字删掉。"
      }
    ],
    "choices": [
      {
        "id": "right",
        "label": "他们有权删吗？",
        "playerText": "发生过的事，参与者真的有权把自己从记录里删掉？",
        "response": [
          {
            "speaker": "白无昼",
            "body": "当年我觉得有。现在我只敢说，我替他们做了这个决定。"
          }
        ]
      },
      {
        "id": "wenren",
        "label": "闻人砚知道吗？",
        "playerText": "这件事闻人砚从头到尾都知道？",
        "response": [
          {
            "speaker": "白无昼",
            "body": "知道。他留下了戏本，删掉了名字。那是我们当时认为最温和的办法。"
          }
        ]
      },
      {
        "id": "restore",
        "label": "还能恢复名字吗？",
        "playerText": "如果有人现在想把名字找回来呢？",
        "response": [
          {
            "speaker": "白无昼",
            "body": "去问闻人砚。最后一份原始名册，一直不在我这里。"
          }
        ]
      }
    ],
    "memoryTag": "playbill_erased_people",
    "memoryText": "白无昼承认自己参与抹去了那场旧戏的演员名字。",
    "familiarityDelta": 1,
    "storyStage": "seek_bai",
    "nextStoryStage": "confront_wenren"
  },
  {
    "id": "wanxi.story.playbill.confront_wenren",
    "kind": "regional_story",
    "title": "名字要不要回来",
    "summary": "闻人砚拿出了最后一份原始名册，但没有替你决定它应该公开、封存还是只留下事实。",
    "promptLabel": "和闻人砚谈最后一份名册",
    "source": {
      "type": "npc",
      "roleKey": "master"
    },
    "participants": [
      "master"
    ],
    "locationId": "hall_forecourt",
    "opening": [
      {
        "speaker": "闻人砚",
        "body": "名单在这里。多年以前，他们请求我们删掉名字。多年以后，没有一个人回来撤回这个请求。你现在知道了事情，却未必因此拥有替他们公开的权利。"
      }
    ],
    "choices": [
      {
        "id": "seal",
        "label": "继续封存名字",
        "playerText": "保留事情本身，但继续封存名字。",
        "response": [
          {
            "speaker": "闻人砚",
            "body": "那就让事实留下，让名字仍属于他们自己。"
          }
        ]
      },
      {
        "id": "restore",
        "label": "恢复完整档案",
        "playerText": "记录如果被人为删改，就应该恢复原貌。",
        "response": [
          {
            "speaker": "闻人砚",
            "body": "我会恢复档案，但不会把它贴到坊门。保存真相和展示真相，仍是两件事。"
          }
        ]
      },
      {
        "id": "annotate",
        "label": "留下删改经过",
        "playerText": "名字暂不公开，但把“曾经被删除”这件事完整记下来。",
        "response": [
          {
            "speaker": "闻人砚",
            "body": "这大概是我当年最该做、却没有做的一步。"
          }
        ]
      }
    ],
    "memoryTag": "playbill_final_choice",
    "memoryText": "你查完《无名戏单》，并参与决定那份被删除过的旧档案该如何留下。",
    "familiarityDelta": 1,
    "storyStage": "confront_wenren",
    "nextStoryStage": "completed"
  }
] as const satisfies readonly WanxiWorldEncounterDefinition[];

export const WANXI_PROPS =
[
  {
    "id": "wanxi_prop_gate_visitor_book",
    "name": "访客簿",
    "category": "social",
    "locationId": "gate",
    "regionId": "gate",
    "sigil": "访",
    "description": "客来客往的名字都从这里留下第一笔。",
    "promptLabel": "翻翻最近的访客记录",
    "relatedRoleKey": "gate_steward"
  },
  {
    "id": "wanxi_prop_gate_lanterns",
    "name": "两盏坊门灯",
    "category": "world",
    "locationId": "gate",
    "regionId": "gate",
    "sigil": "两",
    "description": "两盏灯并不总在同一刻亮起。",
    "promptLabel": "看看坊门灯",
    "relatedRoleKey": "night_watchman"
  },
  {
    "id": "wanxi_prop_notice_board",
    "name": "万戏榜",
    "category": "world",
    "locationId": "notice_board",
    "regionId": "gate",
    "sigil": "万",
    "description": "坊中公开的活动、传闻与临时告示都会贴在这里。",
    "promptLabel": "读读今天的榜",
    "relatedRoleKey": "gate_steward"
  },
  {
    "id": "wanxi_prop_notice_lost_found",
    "name": "失物架",
    "category": "social",
    "locationId": "notice_board",
    "regionId": "gate",
    "sigil": "失",
    "description": "东西被放回来了，故事却往往没有。",
    "promptLabel": "看看失物架",
    "relatedRoleKey": "runner_boy"
  },
  {
    "id": "wanxi_prop_notice_torn_notice",
    "name": "撕掉一角的旧告示",
    "category": "memory",
    "locationId": "notice_board",
    "regionId": "gate",
    "sigil": "撕",
    "description": "一张很旧的告示被撕掉了最关键的一角。",
    "promptLabel": "辨认旧告示",
    "relatedRoleKey": "bamboo_stranger"
  },
  {
    "id": "wanxi_prop_square_story_platform",
    "name": "说书台",
    "category": "social",
    "locationId": "central_square",
    "regionId": "square",
    "sigil": "说",
    "description": "没有说书人的时候，台上也会留下昨天的尾音。",
    "promptLabel": "靠近说书台",
    "relatedRoleKey": "storyteller"
  },
  {
    "id": "wanxi_prop_square_chessboard",
    "name": "残局棋盘",
    "category": "puzzle",
    "locationId": "central_square",
    "regionId": "square",
    "sigil": "残",
    "description": "棋局总停在最让人不甘心的一步。",
    "promptLabel": "看看残局",
    "relatedRoleKey": "chess_keeper"
  },
  {
    "id": "wanxi_prop_square_silent_drum",
    "name": "未响之鼓",
    "category": "activity",
    "locationId": "central_square",
    "regionId": "square",
    "sigil": "未",
    "description": "鼓面完好，却很久没人真正敲响。",
    "promptLabel": "摸摸鼓面",
    "relatedRoleKey": "stage_curator"
  },
  {
    "id": "wanxi_prop_hall_ledger",
    "name": "坊中旧账簿",
    "category": "memory",
    "locationId": "main_hall",
    "regionId": "hall",
    "sigil": "坊",
    "description": "旧账里记的不只有灵石。",
    "promptLabel": "翻开旧账",
    "relatedRoleKey": "master"
  },
  {
    "id": "wanxi_prop_hall_script_shelf",
    "name": "藏戏架",
    "category": "memory",
    "locationId": "main_hall",
    "regionId": "hall",
    "sigil": "藏",
    "description": "许多没再上演的戏仍整齐放着。",
    "promptLabel": "抽一本戏本",
    "relatedRoleKey": "script_scholar"
  },
  {
    "id": "wanxi_prop_hall_archive_cabinet",
    "name": "封存卷宗柜",
    "category": "memory",
    "locationId": "main_hall",
    "regionId": "hall",
    "sigil": "封",
    "description": "柜门上的封条明显换过不止一次。",
    "promptLabel": "看看封条",
    "relatedRoleKey": "master"
  },
  {
    "id": "wanxi_prop_hall_old_seal",
    "name": "坊主旧印碑",
    "category": "memory",
    "locationId": "hall_forecourt",
    "regionId": "hall",
    "sigil": "坊",
    "description": "石碑上的旧印比现在使用的印记多了一笔。",
    "promptLabel": "辨认旧印",
    "relatedRoleKey": "bamboo_stranger"
  },
  {
    "id": "wanxi_prop_hall_empty_demo",
    "name": "空置演示台",
    "category": "world",
    "locationId": "hall_forecourt",
    "regionId": "hall",
    "sigil": "空",
    "description": "像是为某件迟迟没有出现的东西预留。",
    "promptLabel": "看看空台",
    "relatedRoleKey": "script_scholar"
  },
  {
    "id": "wanxi_prop_stage_echo_stone",
    "name": "留声石",
    "category": "memory",
    "locationId": "stage",
    "regionId": "stage",
    "sigil": "留",
    "description": "靠近时偶尔能听见不属于今天的半个音。",
    "promptLabel": "听一听",
    "relatedRoleKey": "chief_musician"
  },
  {
    "id": "wanxi_prop_stage_curtain_mechanism",
    "name": "戏台幕机关",
    "category": "puzzle",
    "locationId": "stage",
    "regionId": "stage",
    "sigil": "戏",
    "description": "幕布升降全靠一套老机关。",
    "promptLabel": "观察幕机关",
    "relatedRoleKey": "west_host"
  },
  {
    "id": "wanxi_prop_stage_main_platform",
    "name": "主演出台",
    "category": "activity",
    "locationId": "stage",
    "regionId": "stage",
    "sigil": "主",
    "description": "真正登台前，每个人都会在这里等半步。",
    "promptLabel": "站到台边",
    "relatedRoleKey": "dancer"
  },
  {
    "id": "wanxi_prop_stage_empty_seat",
    "name": "无人座椅",
    "category": "social",
    "locationId": "stage_forecourt",
    "regionId": "stage",
    "sigil": "无",
    "description": "排练时总有一把椅子没人坐。",
    "promptLabel": "坐一会儿",
    "relatedRoleKey": "stage_curator"
  },
  {
    "id": "wanxi_prop_stage_unnamed_playbill_wall",
    "name": "无名戏单墙",
    "category": "memory",
    "locationId": "stage_forecourt",
    "regionId": "stage",
    "sigil": "无",
    "description": "一张戏单被抹掉了剧名与主演，只剩演出日期。",
    "promptLabel": "查看无名戏单",
    "relatedRoleKey": "script_scholar"
  },
  {
    "id": "wanxi_prop_lakeside_reflection",
    "name": "水中灯影",
    "category": "world",
    "locationId": "lakeside",
    "regionId": "lakeside",
    "sigil": "水",
    "description": "水面上的灯有时比岸上的多一盏。",
    "promptLabel": "看看倒影",
    "relatedRoleKey": "lakeside_guest"
  },
  {
    "id": "wanxi_prop_lakeside_tea_stove",
    "name": "药茶炉",
    "category": "social",
    "locationId": "lakeside",
    "regionId": "lakeside",
    "sigil": "药",
    "description": "炉火很小，却几乎没有真正熄过。",
    "promptLabel": "闻闻药茶",
    "relatedRoleKey": "tea_physician"
  },
  {
    "id": "wanxi_prop_pavilion_tea_table",
    "name": "无主茶桌",
    "category": "social",
    "locationId": "water_pavilion",
    "regionId": "lakeside",
    "sigil": "无",
    "description": "桌上经常多出一杯不知道是谁留下的茶。",
    "promptLabel": "坐到茶桌旁",
    "relatedRoleKey": "lantern_maker"
  },
  {
    "id": "wanxi_prop_pavilion_wish_rack",
    "name": "许愿灯架",
    "category": "social",
    "locationId": "water_pavilion",
    "regionId": "lakeside",
    "sigil": "许",
    "description": "写过愿望与没写过愿望的灯都挂在这里。",
    "promptLabel": "看看灯架",
    "relatedRoleKey": "lantern_maker"
  },
  {
    "id": "wanxi_prop_pavilion_old_rope",
    "name": "旧系绳柱",
    "category": "memory",
    "locationId": "water_pavilion",
    "regionId": "lakeside",
    "sigil": "旧",
    "description": "绳结的磨痕说明这里曾长期系过什么。",
    "promptLabel": "摸摸旧绳痕",
    "relatedRoleKey": "lakeside_guest"
  },
  {
    "id": "wanxi_prop_west_treasure_box",
    "name": "百宝匣",
    "category": "puzzle",
    "locationId": "west_courtyard",
    "regionId": "west_market",
    "sigil": "百",
    "description": "每一层都像装着不该出现在一起的零件。",
    "promptLabel": "打开一层看看",
    "relatedRoleKey": "west_host"
  },
  {
    "id": "wanxi_prop_west_wooden_bird",
    "name": "机关木鸟架",
    "category": "activity",
    "locationId": "west_courtyard",
    "regionId": "west_market",
    "sigil": "机",
    "description": "几只木鸟的翅膀角度都不一样。",
    "promptLabel": "拨动木鸟",
    "relatedRoleKey": "west_host"
  },
  {
    "id": "wanxi_prop_west_half_artifact",
    "name": "半拆法器台",
    "category": "puzzle",
    "locationId": "west_courtyard",
    "regionId": "west_market",
    "sigil": "半",
    "description": "台上的法器已经被拆到很难恢复原样。",
    "promptLabel": "看看拆到哪了",
    "relatedRoleKey": "west_host"
  },
  {
    "id": "wanxi_prop_lane_mask_wall",
    "name": "百面墙",
    "category": "memory",
    "locationId": "west_lane",
    "regionId": "west_market",
    "sigil": "百",
    "description": "不同面具排在一起，像一群互不相认的人。",
    "promptLabel": "挑一张面具",
    "relatedRoleKey": "mask_artisan"
  },
  {
    "id": "wanxi_prop_lane_curio_case",
    "name": "旧物柜",
    "category": "memory",
    "locationId": "west_lane",
    "regionId": "west_market",
    "sigil": "旧",
    "description": "柜中旧物都挂着没有价格的纸牌。",
    "promptLabel": "看看旧物牌",
    "relatedRoleKey": "curio_dealer"
  },
  {
    "id": "wanxi_prop_lane_empty_stall",
    "name": "流动摊位空位",
    "category": "world",
    "locationId": "west_lane",
    "regionId": "west_market",
    "sigil": "流",
    "description": "今天空着，明天未必。",
    "promptLabel": "看看谁会来",
    "relatedRoleKey": "roaming_merchant"
  },
  {
    "id": "wanxi_prop_bamboo_mirror",
    "name": "照心镜",
    "category": "memory",
    "locationId": "bamboo_garden",
    "regionId": "bamboo",
    "sigil": "照",
    "description": "镜面不会照得更漂亮，只会照得更像当下。",
    "promptLabel": "照一照",
    "relatedRoleKey": "bamboo_stranger"
  },
  {
    "id": "wanxi_prop_bamboo_sealed_box",
    "name": "封存戏箱",
    "category": "memory",
    "locationId": "bamboo_garden",
    "regionId": "bamboo",
    "sigil": "封",
    "description": "箱角刻着已经不再使用的万戏坊旧印。",
    "promptLabel": "看看旧印",
    "relatedRoleKey": "bamboo_stranger"
  },
  {
    "id": "wanxi_prop_bamboo_stele",
    "name": "残缺石碑",
    "category": "memory",
    "locationId": "bamboo_garden",
    "regionId": "bamboo",
    "sigil": "残",
    "description": "碑文中间有一段被人为磨去。",
    "promptLabel": "辨认残文",
    "relatedRoleKey": "mysterious_girl"
  },
  {
    "id": "wanxi_prop_southeast_lot_tube",
    "name": "赌签筒",
    "category": "activity",
    "locationId": "southeast_courtyard",
    "regionId": "southeast",
    "sigil": "赌",
    "description": "签筒里有赢、有输，也有一句都不解释的空签。",
    "promptLabel": "抽一支签",
    "relatedRoleKey": "former_challenger"
  },
  {
    "id": "wanxi_prop_southeast_challenge_wall",
    "name": "旧战帖墙",
    "category": "memory",
    "locationId": "southeast_courtyard",
    "regionId": "southeast",
    "sigil": "旧",
    "description": "很多名字已经褪色，有一个位置被整块刮去。",
    "promptLabel": "看看旧战帖",
    "relatedRoleKey": "former_challenger"
  },
  {
    "id": "wanxi_prop_southeast_training_dummy",
    "name": "演武木人",
    "category": "activity",
    "locationId": "southeast_courtyard",
    "regionId": "southeast",
    "sigil": "演",
    "description": "木人身上的击痕新旧叠在一起。",
    "promptLabel": "试一招",
    "relatedRoleKey": "former_challenger"
  }
] as const satisfies readonly WanxiPropDefinition[];

export const WANXI_PROP_PLACEMENTS =
[
  {
    "propId": "wanxi_prop_gate_visitor_book",
    "point": {
      "x": 48.4,
      "y": 82.4
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_gate_lanterns",
    "point": {
      "x": 51.8,
      "y": 82.2
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_notice_board",
    "point": {
      "x": 42.0,
      "y": 78.7
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_notice_lost_found",
    "point": {
      "x": 44.0,
      "y": 81.2
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_notice_torn_notice",
    "point": {
      "x": 41.4,
      "y": 81.4
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_square_story_platform",
    "point": {
      "x": 46.0,
      "y": 57.5
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_square_chessboard",
    "point": {
      "x": 55.3,
      "y": 57.8
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_square_silent_drum",
    "point": {
      "x": 51.8,
      "y": 53.5
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_hall_ledger",
    "point": {
      "x": 47.0,
      "y": 17.8
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_hall_script_shelf",
    "point": {
      "x": 52.5,
      "y": 17.5
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_hall_archive_cabinet",
    "point": {
      "x": 55.5,
      "y": 20.0
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_hall_old_seal",
    "point": {
      "x": 48.0,
      "y": 26.0
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_hall_empty_demo",
    "point": {
      "x": 53.0,
      "y": 28.2
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_stage_echo_stone",
    "point": {
      "x": 82.8,
      "y": 31.9
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_stage_curtain_mechanism",
    "point": {
      "x": 79.8,
      "y": 32.2
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_stage_main_platform",
    "point": {
      "x": 84.6,
      "y": 28.0
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_stage_empty_seat",
    "point": {
      "x": 73.5,
      "y": 39.5
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_stage_unnamed_playbill_wall",
    "point": {
      "x": 77.2,
      "y": 38.2
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_lakeside_reflection",
    "point": {
      "x": 73.8,
      "y": 54.3
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_lakeside_tea_stove",
    "point": {
      "x": 71.5,
      "y": 60.0
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_pavilion_tea_table",
    "point": {
      "x": 82.4,
      "y": 61.5
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_pavilion_wish_rack",
    "point": {
      "x": 85.2,
      "y": 59.5
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_pavilion_old_rope",
    "point": {
      "x": 86.5,
      "y": 63.0
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_west_treasure_box",
    "point": {
      "x": 25.0,
      "y": 55.7
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_west_wooden_bird",
    "point": {
      "x": 29.5,
      "y": 53.4
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_west_half_artifact",
    "point": {
      "x": 30.0,
      "y": 57.8
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_lane_mask_wall",
    "point": {
      "x": 18.0,
      "y": 65.0
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_lane_curio_case",
    "point": {
      "x": 22.0,
      "y": 65.5
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_lane_empty_stall",
    "point": {
      "x": 24.0,
      "y": 68.0
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_bamboo_mirror",
    "point": {
      "x": 18.5,
      "y": 28.8
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_bamboo_sealed_box",
    "point": {
      "x": 22.0,
      "y": 26.5
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_bamboo_stele",
    "point": {
      "x": 16.2,
      "y": 23.8
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_southeast_lot_tube",
    "point": {
      "x": 75.5,
      "y": 79.0
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_southeast_challenge_wall",
    "point": {
      "x": 80.3,
      "y": 76.5
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  },
  {
    "propId": "wanxi_prop_southeast_training_dummy",
    "point": {
      "x": 81.5,
      "y": 81.5
    },
    "marker": {
      "minScale": 1.05,
      "importance": "minor"
    }
  }
] as const satisfies readonly WanxiPropPlacement[];

function propEncounter(prop: WanxiPropDefinition): WanxiWorldEncounterDefinition {
  const related = prop.relatedRoleKey ? [prop.relatedRoleKey] : [];
  return {
    id: `wanxi.prop.${prop.id}`,
    kind: 'prop',
    title: prop.name,
    summary: prop.description,
    promptLabel: prop.promptLabel,
    source: { type: 'prop', propId: prop.id },
    participants: related,
    locationId: prop.locationId,
    opening: [
      {
        body: prop.description,
        tone: 'muted',
      },
    ],
    choices: [
      {
        id: 'inspect',
        label: '仔细看看',
        playerText: `我再仔细看看“${prop.name}”。`,
        response: [{ body: '你没有急着碰它，而是把能看到的细节先记了下来。', tone: 'muted' }],
      },
      {
        id: 'touch',
        label: '试着互动',
        playerText: `我想试试“${prop.name}”会有什么反应。`,
        response: [{ body: '它没有立刻给出答案，但这个动作本身像是让某段旧痕迹变得更清楚。', tone: 'muted' }],
      },
      {
        id: 'leave',
        label: '先记住这里',
        playerText: '先不动它。我记住这里，之后再回来。',
        response: [{ body: '你把这个细节留在心里，没有为了“互动”而强行把事情做完。', tone: 'muted' }],
      },
    ],
    memoryTag: `prop_${prop.id.replace(/^wanxi_prop_/, '')}`,
    memoryText: `你曾认真留意过“${prop.name}”。`,
    familiarityDelta: related.length ? 1 : 0,
  };
}

export const WANXI_PROP_EVENT_DEFINITIONS = WANXI_PROPS.map(propEncounter);

export const WANXI_WORLD_ENCOUNTER_DEFINITIONS = [
  ...WANXI_LIFE_EVENT_DEFINITIONS,
  ...WANXI_CROSS_EVENT_DEFINITIONS,
  ...WANXI_PROP_EVENT_DEFINITIONS,
  ...WANXI_REGIONAL_STORY_ENCOUNTERS,
] as const;

const encounterById = new Map<string, WanxiWorldEncounterDefinition>(
  WANXI_WORLD_ENCOUNTER_DEFINITIONS.map((event) => [event.id, event]),
);

const propById = new Map<string, WanxiPropDefinition>(
  WANXI_PROPS.map((prop) => [prop.id, prop]),
);

export function getWanxiWorldEncounterDefinition(id: string) {
  return encounterById.get(id) ?? null;
}

export function getWanxiPropById(id: string) {
  return propById.get(id) ?? null;
}

export function isWanxiWorldEncounterId(id: string) {
  return encounterById.has(id);
}

function sourceBinding(event: WanxiWorldEncounterDefinition): WanxiActivityBinding {
  if (event.source.type === 'npc') {
    return {
      id: event.id,
      source: { type: 'npc', npcId: `wanxi_npc_${event.source.roleKey}` },
      activity: {
        type: event.kind === 'regional_story' ? 'story' : 'event',
        id: event.id,
      },
      priority: event.kind === 'regional_story' ? 4 : event.kind === 'cross' ? 12 : 18,
      label:
        event.kind === 'regional_story'
          ? `坊中旧事 · ${event.promptLabel}`
          : event.kind === 'cross'
            ? `两人之间 · ${event.promptLabel}`
            : `今日小事 · ${event.promptLabel}`,
    };
  }
  return {
    id: event.id,
    source: { type: 'prop', propId: event.source.propId },
    activity: {
      type: event.kind === 'regional_story' ? 'story' : 'event',
      id: event.id,
    },
    priority: event.kind === 'regional_story' ? 4 : 22,
    label:
      event.kind === 'regional_story'
        ? `坊中旧事 · ${event.promptLabel}`
        : event.promptLabel,
  };
}

export const WANXI_WORLD_ACTIVITY_BINDINGS =
  WANXI_WORLD_ENCOUNTER_DEFINITIONS.map(sourceBinding);

export function getWanxiWorldDaypart(now = new Date()): WanxiWorldDaypart {
  const beijing = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const hour = beijing.getUTCHours();
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(values: readonly T[], count: number, seed: string): T[] {
  return [...values]
    .map((value, index) => ({
      value,
      score: hashText(`${seed}:${index}`),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map((entry) => entry.value);
}

export function resolveWanxiScheduledCoreRoles(args: {
  seed: string;
  daypart: WanxiWorldDaypart;
}): WanxiNpcRoleKey[] {
  if (args.daypart === 'dawn') {
    return [
      'gate_steward',
      'tea_physician',
      'lakeside_guest',
      'runner_boy',
      ...pick(['storyteller', 'roaming_merchant', 'bamboo_stranger'] as const, 1, `${args.seed}:dawn`),
    ];
  }
  if (args.daypart === 'night') {
    return [
      'lakeside_guest',
      'lantern_maker',
      'former_challenger',
      'night_watchman',
      ...pick(
        ['bamboo_stranger', 'mysterious_girl', 'storyteller', 'runner_boy'] as const,
        2,
        `${args.seed}:night`,
      ),
    ];
  }

  const base: WanxiNpcRoleKey[] =
    args.daypart === 'day'
      ? [
          'master',
          'script_scholar',
          'gate_steward',
          'stage_curator',
          'chief_musician',
          'lakeside_guest',
          'lantern_maker',
          'tea_physician',
          'west_host',
          'curio_dealer',
        ]
      : [
          'master',
          'script_scholar',
          'gate_steward',
          'stage_curator',
          'chief_musician',
          'lakeside_guest',
          'lantern_maker',
          'west_host',
          'curio_dealer',
        ];

  const rotation = pick(
    ['chess_keeper', 'dancer', 'mask_artisan', 'former_challenger', 'bamboo_stranger'] as const,
    2,
    `${args.seed}:${args.daypart}:rotation`,
  );
  const rareRoll = hashText(`${args.seed}:${args.daypart}:rare`) % 5;
  const mobilePool =
    rareRoll === 0
      ? (['mysterious_girl'] as const)
      : (['storyteller', 'roaming_merchant', 'runner_boy'] as const);
  const mobile = pick(
    mobilePool,
    1,
    `${args.seed}:${args.daypart}:mobile`,
  );
  return [...base, ...rotation, ...mobile];
}

export function resolveWanxiMobileLocation(args: {
  roleKey: WanxiNpcRoleKey;
  seed: string;
  fallbackLocationId: string;
}): string {
  const candidates: Partial<Record<WanxiNpcRoleKey, readonly string[]>> = {
    storyteller: ['central_square', 'water_pavilion', 'west_lane'],
    roaming_merchant: ['gate', 'central_square', 'west_lane'],
    runner_boy: ['gate', 'central_square', 'stage_forecourt', 'west_lane'],
    night_watchman: ['gate', 'central_square', 'southeast_courtyard'],
    mysterious_girl: ['bamboo_garden', 'water_pavilion', 'southeast_courtyard'],
  };
  const values = candidates[args.roleKey];
  if (!values?.length) return args.fallbackLocationId;
  return pick(values, 1, `${args.seed}:${args.roleKey}:location`)[0] ?? args.fallbackLocationId;
}

export function selectWanxiLifeEvents(args: {
  seed: string;
  visibleRoleKeys: ReadonlySet<WanxiNpcRoleKey>;
  metRoleKeys: ReadonlySet<WanxiNpcRoleKey>;
  count?: number;
}) {
  const byRole = new Map<WanxiNpcRoleKey, WanxiWorldEncounterDefinition[]>();
  for (const event of WANXI_LIFE_EVENT_DEFINITIONS) {
    const roleKey = event.participants[0];
    if (
      !args.visibleRoleKeys.has(roleKey) ||
      !args.metRoleKeys.has(roleKey)
    ) {
      continue;
    }
    const bucket = byRole.get(roleKey) ?? [];
    bucket.push(event);
    byRole.set(roleKey, bucket);
  }

  const onePerRole = [...byRole.entries()].flatMap(
    ([roleKey, events]) =>
      pick(events, 1, `${args.seed}:life:${roleKey}`),
  );
  return pick(onePerRole, args.count ?? 4, `${args.seed}:life:roles`);
}

export function selectWanxiCrossEvents(args: {
  seed: string;
  visibleRoleKeys: ReadonlySet<WanxiNpcRoleKey>;
  metRoleKeys: ReadonlySet<WanxiNpcRoleKey>;
  count?: number;
}) {
  const candidates = WANXI_CROSS_EVENT_DEFINITIONS.filter((event) =>
    event.participants.every(
      (roleKey) =>
        args.visibleRoleKeys.has(roleKey) &&
        args.metRoleKeys.has(roleKey),
    ),
  );
  return pick(candidates, args.count ?? 1, `${args.seed}:cross`);
}

export function selectWanxiPropEvents(args: { seed: string; count?: number }) {
  return pick(
    WANXI_PROP_EVENT_DEFINITIONS,
    args.count ?? 3,
    `${args.seed}:props`,
  );
}

export function resolveWanxiRegionalStoryEncounter(stage: string) {
  return (
    WANXI_REGIONAL_STORY_ENCOUNTERS.find(
      (event) => event.storyStage === stage,
    ) ?? null
  );
}


const worldMemoryTextByTag = new Map<string, string>(
  WANXI_WORLD_ENCOUNTER_DEFINITIONS.map((event) => [
    event.memoryTag,
    event.memoryText,
  ]),
);

export function describeWanxiWorldMemoryTag(tag: string): string | null {
  return worldMemoryTextByTag.get(tag) ?? null;
}
