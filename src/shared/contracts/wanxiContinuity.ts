import type {
  WanxiContinuitySnapshot,
  WanxiDailyEventNarrativeResult,
} from '@shared/engine/wanxi';
import { z } from 'zod';

export const WanxiDailyEventRequestSchema = z.object({
  eventId: z.string().trim().min(1).max(120),
});

export type WanxiDailyEventRequest = z.infer<typeof WanxiDailyEventRequestSchema>;

export interface WanxiContinuityReadResponse {
  success: true;
  data: WanxiContinuitySnapshot;
}

export interface WanxiDailyEventNarrativeResponse {
  success: true;
  data: WanxiDailyEventNarrativeResult;
}

export interface WanxiDailyEventCompleteResponse {
  success: true;
  data: WanxiContinuitySnapshot;
}
