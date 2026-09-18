import type { WanxiLampStoryActionPresentation } from '@shared/engine/wanxi';
import { useEffect } from 'react';
export function WanxiStoryEffectNotice(props:{presentation:WanxiLampStoryActionPresentation;noticeKey:number;onDone():void}){
 useEffect(()=>{const t=window.setTimeout(props.onDone,3200);return()=>window.clearTimeout(t)},[props.noticeKey,props.onDone]);
 return <div className="pointer-events-none absolute bottom-[max(env(safe-area-inset-bottom),5.5rem)] left-1/2 z-[70] w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2"><div className="border-crimson/25 bg-bgpaper/96 shadow-[0_12px_40px_rgba(44,24,16,0.16)] border border-dashed px-5 py-4 text-center backdrop-blur-sm"><p className="text-crimson text-[11px] tracking-[0.18em]">{props.presentation.kicker}</p><p className="text-ink mt-1 font-medium">{props.presentation.title}</p>{props.presentation.body?<p className="text-ink-secondary mt-1 text-xs leading-5">{props.presentation.body}</p>:null}</div></div>;
}
