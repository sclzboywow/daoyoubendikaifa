import usherMaidSpriteUrl from '@app/assets/wanxi/npc/usher-maid.webp';

export interface WanxiNpcSpritePresentation {
  src: string;
  /** Width in logical map pixels. Height follows the asset aspect ratio. */
  width: number;
  /** Fine-tune the anchored sprite without changing calibrated map data. */
  offsetX?: number;
  offsetY?: number;
}

const WANXI_NPC_SPRITES: Readonly<Record<string, WanxiNpcSpritePresentation>> = {
  // V1 visual test: reuse the generated usher-maid artwork for the existing
  // gate steward so all current dialogue/story/runtime placement logic stays intact.
  wanxi_npc_gate_steward: {
    src: usherMaidSpriteUrl,
    width: 76,
    offsetY: 2,
  },
};

export function getWanxiNpcSpritePresentation(npcId: string) {
  return WANXI_NPC_SPRITES[npcId] ?? null;
}
