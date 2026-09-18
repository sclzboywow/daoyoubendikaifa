import {
  getValidatedJson,
  redisLockErrorResponse,
  requireActiveCultivatorRef,
  validateJson,
} from '@server/lib/hono/middleware';
import { jsonWithStatus } from '@server/lib/hono/response';
import { streamSseEvents } from '@server/lib/hono/streaming';
import type { AppEnv } from '@server/lib/hono/types';
import { toPlayerStateMutationResponse } from '@server/lib/services/ResourceMutationResponse';
import {
  executeWanxiLampStoryAction,
  executeWanxiLampStoryBattle,
  getWanxiLampStorySnapshot,
  WanxiLampStoryError,
} from '@server/lib/services/wanxi/WanxiLampStoryService';
import {
  getWanxiLampNarrative,
  prepareWanxiLampNpcChat,
} from '@server/lib/services/wanxi/WanxiNarrativeService';
import { resolveWanxiSceneRuntimeSnapshot } from '@server/lib/services/wanxi/WanxiSceneService';
import {
  WanxiLampChatRoleSchema,
  WanxiLampNarrativeRequestSchema,
  WanxiLampStoryActionRequestSchema,
  WanxiNpcChatRequestSchema,
  type WanxiLampNarrativeRequest,
  type WanxiLampStoryActionRequest,
  type WanxiNpcChatRequest,
} from '@shared/contracts/wanxiStory';
import { Hono, type Context } from 'hono';
import { randomUUID } from 'node:crypto';

const router = new Hono<AppEnv>();
router.use('*', requireActiveCultivatorRef());

function actor(c: Context<AppEnv>) {
  const active = c.get('activeCultivatorRef');
  if (!active) throw new WanxiLampStoryError('当前没有活跃角色', 404);
  return active;
}

function errorResponse(c: Context<AppEnv>, error: unknown) {
  const lockResponse = redisLockErrorResponse(error);
  if (lockResponse) return lockResponse;
  if (error instanceof WanxiLampStoryError) {
    return jsonWithStatus(
      c,
      { success: false, error: error.message },
      error.status,
    );
  }
  console.error('wanxi api error:', error);
  return c.json({ success: false, error: '万戏坊灵机暂乱，请稍后再试' }, 500);
}

router.get('/scene', async (c) => {
  try {
    const active = actor(c);
    return c.json({
      success: true,
      data: await resolveWanxiSceneRuntimeSnapshot(active.cultivatorId),
    });
  } catch (error) {
    return errorResponse(c, error);
  }
});

router.get('/story/lamp', async (c) => {
  try {
    const active = actor(c);
    return c.json({
      success: true,
      data: await getWanxiLampStorySnapshot(active.cultivatorId),
    });
  } catch (error) {
    return errorResponse(c, error);
  }
});

router.post(
  '/story/lamp/action',
  validateJson(WanxiLampStoryActionRequestSchema),
  async (c) => {
    try {
      const active = actor(c);
      const input = getValidatedJson<WanxiLampStoryActionRequest>(c);
      const committed = await executeWanxiLampStoryAction({
        userId: active.userId,
        cultivatorId: active.cultivatorId,
        actionId: input.actionId,
      });
      return c.json(toPlayerStateMutationResponse(committed));
    } catch (error) {
      return errorResponse(c, error);
    }
  },
);

router.post(
  '/story/lamp/narrative',
  validateJson(WanxiLampNarrativeRequestSchema),
  async (c) => {
    try {
      const active = actor(c);
      const input = getValidatedJson<WanxiLampNarrativeRequest>(c);
      return c.json({
        success: true,
        data: await getWanxiLampNarrative({
          cultivatorId: active.cultivatorId,
          target: input.target,
        }),
      });
    } catch (error) {
      return errorResponse(c, error);
    }
  },
);

router.post(
  '/story/lamp/chat/:roleKey',
  validateJson(WanxiNpcChatRequestSchema),
  async (c) => {
    try {
      const active = actor(c);
      const parsedRole = WanxiLampChatRoleSchema.safeParse(c.req.param('roleKey'));
      if (!parsedRole.success) {
        throw new WanxiLampStoryError('这个人暂时没有开放自由闲谈', 404);
      }
      const request = getValidatedJson<WanxiNpcChatRequest>(c);
      const prepared = await prepareWanxiLampNpcChat({
        cultivatorId: active.cultivatorId,
        roleKey: parsedRole.data,
        request,
      });
      const messageId = randomUUID();

      return streamSseEvents(c, async (stream, isAborted, signal) => {
        await stream.writeSSE({
          data: JSON.stringify({
            type: 'chat-start',
            messageId,
            npcName: prepared.npcName,
          }),
        });
        if (isAborted()) return;

        let body = '';
        try {
          const reply = prepared.stream(signal);
          for await (const chunk of reply.textStream) {
            if (isAborted()) throw new Error('wanxi npc chat disconnected');
            body += chunk;
            await stream.writeSSE({
              data: JSON.stringify({
                type: 'chat-chunk',
                messageId,
                text: chunk,
              }),
            });
          }
          body = body.trim();
          if (!body) throw new Error('empty wanxi npc chat reply');
          if (isAborted()) return;
          await stream.writeSSE({
            data: JSON.stringify({
              type: 'chat-complete',
              messageId,
              body,
            }),
          });
        } catch (error) {
          console.warn('[wanxi] npc chat stream fallback', {
            roleKey: parsedRole.data,
            error,
          });
          if (isAborted()) return;
          await stream.writeSSE({
            data: JSON.stringify({
              type: 'chat-error',
              messageId,
              fallbackBody: prepared.fallbackBody,
            }),
          });
        }
      });
    } catch (error) {
      return errorResponse(c, error);
    }
  },
);

router.post('/story/lamp/battle', async (c) => {
  try {
    const active = actor(c);
    const committed = await executeWanxiLampStoryBattle({
      userId: active.userId,
      cultivatorId: active.cultivatorId,
    });
    return c.json(toPlayerStateMutationResponse(committed));
  } catch (error) {
    return errorResponse(c, error);
  }
});

export default router;
