import { cn } from '@shared/lib/cn';
import type { WanxiLampStoryMessage } from '@shared/engine/wanxi';
export function WanxiNarrativeLines(props: { messages: readonly WanxiLampStoryMessage[]; onAdvance?(): void }) {
  return <div className="border-ink/10 space-y-3 border-t border-dashed pt-4" onClick={props.onAdvance}>
    {props.messages.map((m) => <div key={m.id} className="text-sm leading-7">{m.gesture ? <p className="text-ink-secondary mb-1 text-xs italic leading-5">{m.gesture}</p> : null}{m.speaker ? <span className="text-ink-secondary mr-2">{m.speaker}：</span> : null}<span className={cn(m.tone === 'attention' ? 'text-crimson' : m.tone === 'muted' ? 'text-ink-secondary' : 'text-ink')}>{m.body || '…'}</span></div>)}
  </div>;
}
