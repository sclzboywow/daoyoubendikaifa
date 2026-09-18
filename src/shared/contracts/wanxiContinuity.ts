import type {
  WanxiContinuitySnapshot,
  WanxiDailyEventNarrativeResult,
  WanxiDailyEventResolutionResult,
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

/** @deprecated Interactive Event V2 resolves an event through a player choice. */
export interface WanxiDailyEventCompleteResponse {
  success: true;
  data: WanxiContinuitySnapshot;
}
