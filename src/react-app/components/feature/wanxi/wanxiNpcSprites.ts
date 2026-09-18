import fangMasterSpriteUrl from '@app/assets/wanxi/npc/wanxi-fang-master.webp';
import gateStewardSpriteUrl from '@app/assets/wanxi/npc/wanxi-gate-steward.webp';
import stageDirectorSpriteUrl from '@app/assets/wanxi/npc/wanxi-stage-director.webp';
import watersideGuestSpriteUrl from '@app/assets/wanxi/npc/wanxi-waterside-guest.webp';
import alleyShopkeeperSpriteUrl from '@app/assets/wanxi/npc/wanxi-alley-shopkeeper.webp';
import bambooGuestSpriteUrl from '@app/assets/wanxi/npc/wanxi-bamboo-guest.webp';
import travelMerchantSpriteUrl from '@app/assets/wanxi/npc/wanxi-travel-merchant.webp';
import storytellerSpriteUrl from '@app/assets/wanxi/npc/wanxi-storyteller.webp';
import scriptMasterSpriteUrl from '@app/assets/wanxi/npc/wanxi-script-master.webp';
import goPlayerSpriteUrl from '@app/assets/wanxi/npc/wanxi-go-player.webp';
import maskPerformerSpriteUrl from '@app/assets/wanxi/npc/wanxi-mask-performer.webp';
import lanternGuideSpriteUrl from '@app/assets/wanxi/npc/wanxi-lantern-guide.webp';
import pipaMusicianSpriteUrl from '@app/assets/wanxi/npc/wanxi-pipa-musician.webp';
import teaAttendantSpriteUrl from '@app/assets/wanxi/npc/wanxi-tea-attendant.webp';
import puppetArtisanSpriteUrl from '@app/assets/wanxi/npc/wanxi-puppet-artisan.webp';
import flowerSellerSpriteUrl from '@app/assets/wanxi/npc/wanxi-flower-seller.webp';
import sugarCraftsmanSpriteUrl from '@app/assets/wanxi/npc/wanxi-sugar-craftsman.webp';
import boatmanSpriteUrl from '@app/assets/wanxi/npc/wanxi-boatman.webp';
import divinerElderSpriteUrl from '@app/assets/wanxi/npc/wanxi-diviner-elder.webp';
import literateYoungMasterSpriteUrl from '@app/assets/wanxi/npc/wanxi-literate-young-master.webp';

export interface WanxiNpcLike {
  id: string;
  name?: string | null;
  identity?: string | null;
}

export interface WanxiNpcSpritePresentation {
  src: string;
  /** Width in logical map pixels. Height follows the asset aspect ratio. */
  width: number;
  /** Fine-tune the anchored sprite without changing calibrated map data. */
  offsetX?: number;
  offsetY?: number;
}

const PRESENTATIONS = {
  fangMaster: { src: fangMasterSpriteUrl, width: 80 },
  gateSteward: { src: gateStewardSpriteUrl, width: 76, offsetY: 2 },
  stageDirector: { src: stageDirectorSpriteUrl, width: 82 },
  watersideGuest: { src: watersideGuestSpriteUrl, width: 78 },
  alleyShopkeeper: { src: alleyShopkeeperSpriteUrl, width: 76 },
  bambooGuest: { src: bambooGuestSpriteUrl, width: 78 },
  travelMerchant: { src: travelMerchantSpriteUrl, width: 78 },
  storyteller: { src: storytellerSpriteUrl, width: 82 },
  scriptMaster: { src: scriptMasterSpriteUrl, width: 78 },
  goPlayer: { src: goPlayerSpriteUrl, width: 78 },
  maskPerformer: { src: maskPerformerSpriteUrl, width: 82 },
  lanternGuide: { src: lanternGuideSpriteUrl, width: 80 },
  pipaMusician: { src: pipaMusicianSpriteUrl, width: 82 },
  teaAttendant: { src: teaAttendantSpriteUrl, width: 80 },
  puppetArtisan: { src: puppetArtisanSpriteUrl, width: 82 },
  flowerSeller: { src: flowerSellerSpriteUrl, width: 80 },
  sugarCraftsman: { src: sugarCraftsmanSpriteUrl, width: 84 },
  boatman: { src: boatmanSpriteUrl, width: 86, offsetX: -8 },
  divinerElder: { src: divinerElderSpriteUrl, width: 80 },
  literateYoungMaster: { src: literateYoungMasterSpriteUrl, width: 80 },
} satisfies Record<string, WanxiNpcSpritePresentation>;

/** Bind art to this repo's NPC ids. Second-batch titles are archetypes, not roster names. */
const SPRITES_BY_NPC_ID: Readonly<Record<string, WanxiNpcSpritePresentation>> = {
  wanxi_npc_master: PRESENTATIONS.fangMaster,
  wanxi_npc_gate_steward: PRESENTATIONS.gateSteward,
  wanxi_npc_stage_curator: PRESENTATIONS.stageDirector,
  wanxi_npc_lakeside_guest: PRESENTATIONS.watersideGuest,
  wanxi_npc_west_host: PRESENTATIONS.alleyShopkeeper,
  wanxi_npc_bamboo_stranger: PRESENTATIONS.bambooGuest,
  wanxi_npc_roaming_merchant: PRESENTATIONS.travelMerchant,
  wanxi_npc_storyteller: PRESENTATIONS.storyteller,
  wanxi_npc_script_scholar: PRESENTATIONS.scriptMaster,
  wanxi_npc_chess_keeper: PRESENTATIONS.goPlayer,
  wanxi_npc_mask_artisan: PRESENTATIONS.maskPerformer,
  wanxi_npc_lantern_maker: PRESENTATIONS.lanternGuide,
  wanxi_npc_stage_musician: PRESENTATIONS.pipaMusician,
  wanxi_npc_tea_physician: PRESENTATIONS.teaAttendant,
  wanxi_npc_mechanist: PRESENTATIONS.puppetArtisan,
  wanxi_npc_mysterious_girl: PRESENTATIONS.flowerSeller,
  wanxi_npc_curio_dealer: PRESENTATIONS.sugarCraftsman,
  wanxi_npc_former_challenger: PRESENTATIONS.boatman,
  wanxi_npc_night_watchman: PRESENTATIONS.divinerElder,
  wanxi_npc_chief_musician: PRESENTATIONS.literateYoungMaster,
};

export function getWanxiNpcSpritePresentation(
  npc: WanxiNpcLike | string,
): WanxiNpcSpritePresentation | null {
  const id = typeof npc === 'string' ? npc : npc.id;
  return SPRITES_BY_NPC_ID[id] ?? null;
}
