import type { WanxiLampChatRoleKey } from '@shared/contracts/wanxiStory';
import { useCallback, useEffect, useRef, useState } from 'react';
import { streamWanxiNpcChat } from '../wanxiAiApi';
export interface WanxiNpcChatDisplayMessage { id: string; speaker: string; body: string; align: 'start'|'end'; chatRole: 'user'|'assistant'; }
const sessions = new Map<WanxiLampChatRoleKey, WanxiNpcChatDisplayMessage[]>();
export function useWanxiNpcChat(args: { roleKey: WanxiLampChatRoleKey; npcName: string; enabled: boolean }) {
  const [messages, setMessages] = useState<WanxiNpcChatDisplayMessage[]>(() => args.enabled ? [...(sessions.get(args.roleKey) ?? [])] : []);
  const [draft, setDraft] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState<string>();
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => { controllerRef.current?.abort(); setBusy(false); setError(undefined); setDraft(''); setMessages(args.enabled ? [...(sessions.get(args.roleKey) ?? [])] : []); }, [args.enabled, args.roleKey]);
  useEffect(() => () => controllerRef.current?.abort(), []);
  const update = useCallback((fn: (c: WanxiNpcChatDisplayMessage[]) => WanxiNpcChatDisplayMessage[]) => setMessages((c) => { const n=fn(c); sessions.set(args.roleKey,n); return n; }), [args.roleKey]);
  const send = useCallback(async () => {
    const text=draft.trim(); if (!args.enabled || !text || busy) return;
    const history=messages.slice(-8).map((m)=>({ role:m.chatRole, body:m.body }));
    const controller=new AbortController(); controllerRef.current?.abort(); controllerRef.current=controller; setBusy(true); setError(undefined); let active='';
    try { await streamWanxiNpcChat(args.roleKey,{message:text,history},{
      onStart(id){ active=id; setDraft(''); update((c)=>[...c,{id:`${id}:user`,speaker:'你',body:text,align:'end',chatRole:'user'},{id:`${id}:assistant`,speaker:args.npcName,body:'',align:'start',chatRole:'assistant'}]); },
      onChunk(id,chunk){ update((c)=>c.map((m)=>m.id===`${id}:assistant`?{...m,body:m.body+chunk}:m)); },
      onComplete(id,body){ update((c)=>c.map((m)=>m.id===`${id}:assistant`?{...m,body}:m)); },
      onError(id,fallbackBody){ update((c)=>c.map((m)=>m.id===`${id}:assistant`?{...m,body:fallbackBody}:m)); },
    },controller.signal); }
    catch (reason) { if (!controller.signal.aborted) { setError(reason instanceof Error?reason.message:'这次闲谈没有接上'); if(active) update((c)=>c.filter((m)=>!m.id.startsWith(`${active}:`))); } }
    finally { if(controllerRef.current===controller) controllerRef.current=null; if(!controller.signal.aborted) setBusy(false); }
  },[args.enabled,args.npcName,args.roleKey,busy,draft,messages,update]);
  return {messages,draft,setDraft,busy,error,send};
}
