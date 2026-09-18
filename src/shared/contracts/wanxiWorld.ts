import { z } from 'zod';
import type {
  WanxiContinuityMessage,
  WanxiWorldDaypart,
  WanxiWorldEncounterKind,
} from '@shared/engine/wanxi';

export const WanxiWorldEncounterRequestSchema = z.object({
  encounterId: z.string().trim().min(1).max(180),
});

export const WanxiWorldEncounterResolveSchema = z.object({
  encounterId: z.string().trim().min(1).max(180),
  choiceId: z.string().trim().min(1).max(80),
});

export type WanxiWorldEncounterRequest = z.infer<
  typeof WanxiWorldEncounterRequestSchema
>;
export type WanxiWorldEncounterResolveRequest = z.infer<
  typeof WanxiWorldEncounterResolveSchema
>;

export interface WanxiWorldEncounterView {
  id: string;
  kind: WanxiWorldEncounterKind;
  title: string;
  summary: string;
  promptLabel: string;
  actor: {
    id: string;
    sigil: string;
    name: string;
    identity: string;
    responsibility: string;
    appearance: 'person' | 'facility';
  };
  participants: Array<{
    roleKey: string;
    name: string;
  }>;
  locationId: string;
  opening: WanxiContinuityMessage[];
  choices: Array<{
    id: string;
    label: string;
    playerText: string;
  }>;
}

export interface WanxiWorldEncounterOpenResponse {
  success: true;
  data: WanxiWorldEncounterView;
}

export interface WanxiWorldEncounterResolution {
  encounterId: string;
  choice: {
    id: string;
    label: string;
    playerText: string;
  };
  messages: WanxiContinuityMessage[];
  memoryText: string;
  storyCompleted?: boolean;
}

export interface WanxiWorldEncounterResolveResponse {
  success: true;
  data: WanxiWorldEncounterResolution;
}

export interface WanxiWorldRuntimeDebug {
  dateKey: string;
  daypart: WanxiWorldDaypart;
  visibleRoleKeys: string[];
  activeEncounterIds: string[];
  storyStage: string;
}
