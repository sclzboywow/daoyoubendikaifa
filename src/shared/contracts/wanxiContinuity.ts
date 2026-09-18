import type { PlayerStateMutationResponse } from '@shared/contracts/player';
import {
  WANXI_CORE_NPC_ROLE_KEYS,
  type WanxiContinuitySnapshot,
  type WanxiDailyEventNarrativeResult,
  type WanxiDailyEventResolutionResult,
  type WanxiFirstContactResolutionResult,
  type WanxiNpcRelationshipSnapshot,
} from '@shared/engine/wanxi';
import { z } from 'zod';

export const WanxiDailyEventRequestSchema = z.object({
  eventId: z.string().trim().min(1).max(120),
});

export type WanxiDailyEventRequest = z.infer<typeof WanxiDailyEventRequestSchema>;

export const WanxiDailyEventResolveRequestSchema = z.object({
  eventId: z.string().trim().min(1).max(120),
  choiceId: z.string().trim().min(1).max(80),
});

export type WanxiDailyEventResolveRequest = z.infer<
  typeof WanxiDailyEventResolveRequestSchema
>;

export const WanxiCoreNpcRoleSchema = z.enum(WANXI_CORE_NPC_ROLE_KEYS);

export const WanxiFirstContactResolveRequestSchema = z.object({
  choiceId: z.string().trim().min(1).max(80),
});

export type WanxiFirstContactResolveRequest = z.infer<
  typeof WanxiFirstContactResolveRequestSchema
>;

export interface WanxiContinuityReadResponse {
  success: true;
  data: WanxiContinuitySnapshot;
}

export interface WanxiDailyEventNarrativeResponse {
  success: true;
  data: WanxiDailyEventNarrativeResult;
}

export interface WanxiDailyEventResolveResponse {
  success: true;
  data: {
    continuity: WanxiContinuitySnapshot;
    resolution: WanxiDailyEventResolutionResult;
  };
}

export type WanxiFirstContactMutationResponse =
  PlayerStateMutationResponse<{
    continuity: WanxiContinuitySnapshot;
    relationship: WanxiNpcRelationshipSnapshot;
    resolution: WanxiFirstContactResolutionResult;
  }>;

/** @deprecated Interactive Event V2 resolves an event through a player choice. */
export interface WanxiDailyEventCompleteResponse {
  success: true;
  data: WanxiContinuitySnapshot;
}
