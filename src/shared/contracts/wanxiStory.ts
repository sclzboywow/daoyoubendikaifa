import type { PlayerStateMutationResponse } from '@shared/contracts/player';
import type {
  WanxiLampNarrativeTarget,
  WanxiLampStoryActionId,
  WanxiLampStoryMessage,
  WanxiLampStorySnapshot,
  WanxiStoryBattleTuning,
} from '@shared/engine/wanxi';
import type { BattleRecordV3 } from '@shared/types/battle';
import { z } from 'zod';

export const WanxiLampStoryActionRequestSchema = z.object({
  actionId: z.enum([
    'wanxi.story.lamp.start','wanxi.story.lamp.lin-refuses','wanxi.story.lamp.lu-clue','wanxi.story.lamp.qi-inspects','wanxi.story.lamp.take-moonsilk','wanxi.story.lamp.repair-tassel','wanxi.story.lamp.confrontation','wanxi.story.lamp.qi-coughs','wanxi.story.lamp.jiang-diagnoses','wanxi.story.lamp.take-contract-sand','wanxi.story.lamp.reveal-contract','wanxi.story.lamp.show-contract','wanxi.story.lamp.retrieve-casket','wanxi.story.lamp.return-casket','wanxi.story.lamp.reunion',
  ]),
});

export type WanxiLampStoryActionRequest = z.infer<typeof WanxiLampStoryActionRequestSchema> & { actionId: Exclude<WanxiLampStoryActionId, 'wanxi.story.lamp.battle'> };
export interface WanxiLampStoryReadResponse { success: true; data: WanxiLampStorySnapshot; }
export type WanxiLampStoryMutationResponse = PlayerStateMutationResponse<{ story: WanxiLampStorySnapshot }>;
export type WanxiLampStoryBattleResponse = PlayerStateMutationResponse<{ story: WanxiLampStorySnapshot; battleResult: BattleRecordV3; challengeTitle: string; isWin: boolean; battleTuning: WanxiStoryBattleTuning }>;

const lampNarrativeNpcRoleSchema = z.enum(['gate_steward','stage_musician','mechanist','roaming_merchant','lakeside_guest']);
const lampNarrativeLocationSchema = z.enum(['west_courtyard','water_pavilion','main_hall']);
export const WanxiLampNarrativeRequestSchema = z.object({ target: z.discriminatedUnion('type', [z.object({ type: z.literal('npc'), roleKey: lampNarrativeNpcRoleSchema }), z.object({ type: z.literal('location'), locationId: lampNarrativeLocationSchema })]) });
export type WanxiLampNarrativeRequest = { target: WanxiLampNarrativeTarget };
export interface WanxiLampNarrativeResult { stage: WanxiLampStorySnapshot['stage']; targetKey: string; generated: boolean; messages: WanxiLampStoryMessage[]; }
export interface WanxiLampNarrativeResponse { success: true; data: WanxiLampNarrativeResult; }

export const WANXI_LAMP_CHAT_ROLES = ['stage_musician','mechanist'] as const;
export type WanxiLampChatRoleKey = (typeof WANXI_LAMP_CHAT_ROLES)[number];
export const WanxiLampChatRoleSchema = z.enum(WANXI_LAMP_CHAT_ROLES);
const WanxiNpcChatHistoryItemSchema = z.object({ role: z.enum(['user','assistant']), body: z.string().trim().min(1).max(360) });
export const WanxiNpcChatRequestSchema = z.object({ message: z.string().trim().min(1).max(160), history: z.array(WanxiNpcChatHistoryItemSchema).max(8).default([]) });
export type WanxiNpcChatRequest = z.infer<typeof WanxiNpcChatRequestSchema>;
export type WanxiNpcChatStreamEvent =
  | { type: 'chat-start'; messageId: string; npcName: string }
  | { type: 'chat-chunk'; messageId: string; text: string }
  | { type: 'chat-complete'; messageId: string; body: string }
  | { type: 'chat-error'; messageId: string; fallbackBody: string };
