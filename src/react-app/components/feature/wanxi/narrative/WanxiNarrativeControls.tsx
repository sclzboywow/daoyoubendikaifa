import { InkButton } from '@app/components/ui/InkButton';
export function WanxiNarrativeControls(props: { playing: boolean; onRevealCurrent(): void; onSkipAll(): void }) {
  if (!props.playing) return null;
  return <div className="border-ink/10 mt-3 flex items-center justify-between gap-3 border-t border-dashed pt-3" onClick={(e) => e.stopPropagation()}>
    <p className="text-ink-secondary text-xs leading-5">剧情正在演出，可立即显示本句或跳过。</p>
    <div className="flex shrink-0 gap-2"><InkButton variant="ghost" onClick={props.onRevealCurrent}>显示本句</InkButton><InkButton variant="ghost" onClick={props.onSkipAll}>跳过</InkButton></div>
  </div>;
}
