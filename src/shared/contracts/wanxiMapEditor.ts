import { z } from 'zod';

export const WanxiEditorRegionIdSchema = z.enum([
  'gate',
  'square',
  'hall',
  'stage',
  'lakeside',
  'west_market',
  'bamboo',
  'southeast',
]);

export const WanxiEditorPixelPointSchema = z.object({
  x: z.number().finite().min(0).max(3056),
  y: z.number().finite().min(0).max(2143),
});

export const WanxiEditorBlockedZoneTypeSchema = z.enum([
  'water',
  'building',
  'vegetation',
  'decoration',
  'other',
]);

export const WanxiEditorSlotSchema = z.object({
  id: z.string().trim().min(1).max(128),
  regionId: WanxiEditorRegionIdSchema,
  locationId: z.string().trim().min(1).max(128).optional(),
  label: z.string().trim().max(160).optional(),
  point: WanxiEditorPixelPointSchema,
  tags: z.array(z.string().trim().min(1).max(64)).max(24).optional(),
});

export const WanxiEditorNpcPlacementSchema = z.object({
  npcId: z.string().trim().min(1).max(128),
  regionId: WanxiEditorRegionIdSchema,
  locationId: z.string().trim().min(1).max(128).optional(),
  point: WanxiEditorPixelPointSchema,
  locked: z.boolean().default(false),
  runtimeVisible: z.boolean().default(false),
});

export const WanxiEditorZoneSchema = z.object({
  id: z.string().trim().min(1).max(128),
  kind: z.enum(['safe', 'blocked']),
  regionId: WanxiEditorRegionIdSchema,
  locationId: z.string().trim().min(1).max(128).optional(),
  blockedType: WanxiEditorBlockedZoneTypeSchema.optional(),
  polygon: z.array(WanxiEditorPixelPointSchema).min(3).max(1024),
  note: z.string().trim().max(500).optional(),
});

export const WanxiMapEditorStateSchema = z.object({
  version: z.literal(1),
  sceneId: z.literal('wanxi_main'),
  logicalSize: z.object({
    width: z.literal(3056),
    height: z.literal(2143),
  }),
  slots: z.array(WanxiEditorSlotSchema).max(256),
  zones: z.array(WanxiEditorZoneSchema).max(256),
  npcPlacements: z.array(WanxiEditorNpcPlacementSchema).max(128),
});

export const WanxiMapEditorSaveRequestSchema = z.object({
  state: WanxiMapEditorStateSchema,
});

export type WanxiMapEditorState = z.infer<typeof WanxiMapEditorStateSchema>;
export type WanxiMapEditorSaveRequest = z.infer<
  typeof WanxiMapEditorSaveRequestSchema
>;

export interface WanxiMapEditorSnapshot {
  state: WanxiMapEditorState;
  revision: number;
  persisted: boolean;
  updatedAt: string | null;
}
