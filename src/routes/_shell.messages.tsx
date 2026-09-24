import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/lib/store";
import { timeAgo } from "@/lib/helpers";
import { UserAvatar } from "@/components/cg/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/messages")({
  head: () => ({
    meta: [
      { title: "Messages — CampusGraph" },
      { name: "description", content: "Your conversations with students on CampusGraph." },
      { property: "og:title", content: "Messages — CampusGraph" },
      { property: "og:description", content: "Chat with collaborators and teammates." },
    ],
  }),
  component: MessagesLayout,
});

function MessagesLayout() {
  const conversations = useApp((s) => s.conversations);
  const students = useApp((s) => s.students);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const activeId = path.split("/")[2];
  const list = conversations
    .map((c) => ({ c, p: students.find((s) => s.id === c.participantId)! }))
    .filter(({ p }) => p)
    .filter(({ c, p }) => (filter === "unread" ? c.unread > 0 : true) && (!q || p.name.toLowerCase().includes(q.toLowerCase()) || c.messages.some((m) => m.text.toLowerCase().includes(q.toLowerCase()))))
    .sort((a, b) => (b.c.messages.at(-1)?.ts ?? Infinity) - (a.c.messages.at(-1)?.ts ?? Infinity));

  return (
    <div className="-mx-4 -mt-8 -mb-28 flex h-[calc(100dvh-3.5rem-4rem)] border-b sm:-mx-6 lg:-mx-10 lg:-mb-16 lg:h-[calc(100dvh-3.5rem)] lg:rounded-none">
      <aside className={cn("flex w-full flex-col border-r bg-card md:w-80 md:shrink-0", activeId && "hidden md:flex")}>
        <div className="border-b p-4">
          <h1 className="text-xl font-semibold tracking-tight">Messages</h1>
          <label className="mt-3 flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm"><Search className="size-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations" className="w-full bg-transparent outline-none" aria-label="Search conversations" /></label>
          <div className="mt-3 flex gap-1 text-sm">{(["all", "unread"] as const).map((f) => <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} className={cn("rounded-md px-2.5 py-1 capitalize", filter === f ? "bg-secondary font-medium" : "text-muted-foreground")}>{f}</button>)}</div>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {list.map(({ c, p }) => {
            const last = c.messages.at(-1);
            return (
              <li key={c.id}>
                <Link to="/messages/$id" params={{ id: c.id }} className={cn("flex gap-3 border-b px-4 py-3 transition-colors hover:bg-accent/60", activeId === c.id && "bg-accent")}>
                  <UserAvatar name={p.name} hue={p.hue} size={40} online={p.lastActiveMins < 10} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2"><p className={cn("truncate text-sm", c.unread ? "font-semibold" : "font-medium")}>{p.name}</p><span className="shrink-0 text-[11px] text-muted-foreground">{last ? timeAgo(last.ts) : "New"}</span></div>
                    <div className="flex items-center gap-2"><p className={cn("flex-1 truncate text-sm", c.unread ? "text-foreground" : "text-muted-foreground")}>{last ? `${last.from === "me" ? "You: " : ""}${last.attachment ? "📎 " + last.attachment : last.text}` : "Say hello 👋"}</p>{c.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-medium text-brand-foreground">{c.unread}</span>}</div>
                  </div>
                </Link>
              </li>
            );
          })}
          {list.length === 0 && <li className="p-8 text-center text-sm text-muted-foreground">No conversations found.</li>}
        </ul>
      </aside>
      <section className={cn("min-w-0 flex-1", !activeId && "hidden md:flex")}><Outlet /></section>
    </div>
  );
}
