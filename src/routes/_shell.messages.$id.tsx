import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Info, Paperclip, Send, Smile, X } from "lucide-react";
import { useApp } from "@/lib/store";
import { activeLabel, yearLabel } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ConnectButton, EmptyState, Tag, UserAvatar, Verified } from "@/components/cg/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/messages/$id")({
  component: Conversation,
});

const EMOJIS = ["😀", "😂", "🙌", "👍", "🔥", "❤️", "🎉", "🤔", "😅", "🚀", "👀", "✅"];
const REACTIONS = ["👍", "❤️", "😂", "🔥"];
const REPLIES = ["Sounds good!", "Haha yes, totally.", "Let me check and get back to you.", "Sure, send it over.", "That works for me 👍", "Nice, I'm in."];

function Conversation() {
  const { id } = Route.useParams();
  const conv = useApp((s) => s.conversations.find((c) => c.id === id));
  const person = useApp((s) => s.students.find((x) => x.id === conv?.participantId));
  const s = useApp();
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (conv?.unread) s.markConversationRead(id); }, [id, conv?.unread]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conv?.messages.length, typing]);

  if (!conv || !person) return <div className="p-8"><EmptyState title="Conversation not found" action={<Button asChild variant="outline"><Link to="/messages">Back to messages</Link></Button>} /></div>;

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = text.trim().slice(0, 2000);
    if (!t && !attachment) return;
    s.sendMessage(id, t, attachment ?? undefined);
    setText("");
    setAttachment(null);
    toast("Message sent.", { duration: 1200 });
    if (person.activity !== "new") {
      setTimeout(() => setTyping(true), 800);
      setTimeout(() => {
        setTyping(false);
        useApp.getState().receiveMessage(id, REPLIES[(conv.messages.length + t.length) % REPLIES.length]);
      }, 2600);
    }
  };

  let lastDay = "";
  return (
    <div className="flex size-full">
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <header className="flex items-center gap-3 border-b bg-card px-4 py-3">
          <Link to="/messages" className="md:hidden" aria-label="Back"><ArrowLeft className="size-5" /></Link>
          <Link to="/people/$id" params={{ id: person.id }} className="flex min-w-0 flex-1 items-center gap-3">
            <UserAvatar name={person.name} hue={person.hue} size={36} online={person.lastActiveMins < 10} />
            <div className="min-w-0"><p className="flex items-center gap-1 truncate text-sm font-semibold">{person.name}{person.verified && <Verified className="size-3.5" />}</p><p className="text-xs text-muted-foreground">{typing ? "typing…" : activeLabel(person.lastActiveMins)}</p></div>
          </Link>
          <Button variant="ghost" size="icon" aria-label="Profile preview" aria-pressed={showProfile} onClick={() => setShowProfile(!showProfile)}><Info className="size-4" /></Button>
        </header>

        <div className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {conv.messages.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">This is the start of your conversation with {person.name.split(" ")[0]}.</p>}
          {conv.messages.map((m) => {
            const mine = m.from === "me";
            const day = new Date(m.ts).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
            const showDay = day !== lastDay;
            lastDay = day;
            return (
              <div key={m.id}>
                {showDay && <p className="my-4 text-center font-mono text-[10px] tracking-widest text-muted-foreground uppercase">{day}</p>}
                <div className={cn("group flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[78%]")}>
                    <div className={cn("rounded-2xl px-3.5 py-2 text-[14px] leading-snug", mine ? "rounded-br-md bg-foreground text-background" : "rounded-bl-md border bg-card")}>
                      {m.attachment && <p className={cn("mb-1 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs", mine ? "bg-background/15" : "bg-muted")}><Paperclip className="size-3" /> {m.attachment}</p>}
                      {m.text}
                    </div>
                    <div className={cn("mt-0.5 flex items-center gap-1.5", mine ? "justify-end" : "")}>
                      {m.reactions.length > 0 && <span className="rounded-full border bg-card px-1.5 text-xs">{m.reactions.join("")}</span>}
                      <span className="text-[10px] text-muted-foreground">{new Date(m.ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                      <span className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        {REACTIONS.map((r) => <button key={r} onClick={() => s.toggleReaction(id, m.id, r)} className="rounded px-0.5 text-xs hover:bg-accent" aria-label={`React ${r}`}>{r}</button>)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {typing && <div className="flex gap-1 px-1 py-2" aria-label="typing"><span className="size-2 animate-bounce rounded-full bg-muted-foreground/50" /><span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" /><span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" /></div>}
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="border-t bg-card p-3">
          {attachment && <div className="mb-2 inline-flex items-center gap-2 rounded-md border bg-background px-2 py-1 text-xs"><Paperclip className="size-3" />{attachment}<button type="button" onClick={() => setAttachment(null)} aria-label="Remove attachment"><X className="size-3" /></button></div>}
          <div className="flex items-end gap-1">
            <input ref={fileRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { if (f.size > 10 * 1024 * 1024) toast.error("Files must be under 10 MB."); else setAttachment(f.name.slice(0, 60)); } e.target.value = ""; }} />
            <Button type="button" variant="ghost" size="icon" aria-label="Attach file" onClick={() => fileRef.current?.click()}><Paperclip className="size-4" /></Button>
            <Popover>
              <PopoverTrigger asChild><Button type="button" variant="ghost" size="icon" aria-label="Emoji"><Smile className="size-4" /></Button></PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start"><div className="grid grid-cols-6 gap-1">{EMOJIS.map((e) => <button key={e} type="button" className="rounded p-1 text-lg hover:bg-accent" onClick={() => setText((t) => t + e)}>{e}</button>)}</div></PopoverContent>
            </Popover>
            <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} maxLength={2000} placeholder={`Message ${person.name.split(" ")[0]}…`} className="max-h-32 min-h-9 flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30" aria-label="Message" />
            <Button type="submit" size="icon" disabled={!text.trim() && !attachment} aria-label="Send"><Send className="size-4" /></Button>
          </div>
        </form>
      </div>

      {showProfile && (
        <aside className="hidden w-72 shrink-0 overflow-y-auto border-l bg-card p-5 xl:block">
          <UserAvatar name={person.name} hue={person.hue} size={64} />
          <p className="mt-3 font-semibold">{person.name}</p>
          <p className="text-sm text-muted-foreground">{person.branch} · {yearLabel(person.year)}</p>
          <p className="text-sm text-muted-foreground">{person.college}</p>
          {person.bio && <p className="mt-4 text-sm leading-relaxed">{person.bio}</p>}
          <div className="mt-4 flex flex-wrap gap-1.5">{person.skills.map((k) => <Tag key={k}>{k}</Tag>)}</div>
          <div className="mt-5 flex gap-2"><ConnectButton id={person.id} className="flex-1" /><Button size="sm" variant="outline" asChild><Link to="/people/$id" params={{ id: person.id }}>Profile</Link></Button></div>
        </aside>
      )}
    </div>
  );
}
