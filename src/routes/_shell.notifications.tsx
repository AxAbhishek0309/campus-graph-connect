import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Bell, Calendar, CheckCheck, FolderGit2, MessageSquare, Sparkle, User, UserPlus, Users } from "lucide-react";
import { useApp } from "@/lib/store";
import { timeAgo } from "@/lib/helpers";
import type { NotificationType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EmptyState, HrefLink, PageHeader, UserAvatar } from "@/components/cg/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Tribe" },
      { name: "description", content: "Connection requests, messages, project and event updates." },
      { property: "og:title", content: "Notifications — Tribe" },
      { property: "og:description", content: "Stay on top of your network." },
    ],
  }),
  component: Notifications,
});

const ICONS: Record<NotificationType, typeof Bell> = { connection: UserPlus, message: MessageSquare, project: FolderGit2, team: Users, event: Calendar, profile: User, recommendation: Sparkle };
const FILTERS: ("all" | "unread" | NotificationType)[] = ["all", "unread", "connection", "message", "project", "team", "event", "profile", "recommendation"];

function Notifications() {
  const s = useApp();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const unread = s.notifications.filter((n) => !n.read).length;
  const list = s.notifications.filter((n) => (filter === "all" ? true : filter === "unread" ? !n.read : n.type === filter));

  return (
    <>
      <PageHeader title="Notifications" description={unread ? `${unread} unread` : "You're all caught up."} actions={<Button variant="outline" disabled={!unread} onClick={() => { s.markAllNotifications(); toast("All notifications marked as read."); }}><CheckCheck className="size-4" /> Mark all read</Button>} />
      <div className="mb-6 flex gap-1.5 overflow-x-auto scrollbar-none">
        {FILTERS.map((f) => <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} className={cn("shrink-0 rounded-md border px-2.5 py-1 text-sm capitalize", filter === f ? "border-foreground bg-foreground text-background" : "bg-card hover:bg-accent")}>{f === "recommendation" ? "Suggestions" : f}</button>)}
      </div>
      {list.length === 0 ? <EmptyState icon={<Bell className="size-8" />} title="Nothing here" description="New activity will show up here." /> : (
        <ul className="divide-y rounded-xl border bg-card">
          {list.map((n) => {
            const Icon = ICONS[n.type];
            const actor = s.students.find((x) => x.id === n.actorId);
            return (
              <li key={n.id} className={cn("group relative flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-accent/40", !n.read && "bg-brand-soft/40")}>
                <div className="relative">
                  {actor ? <UserAvatar name={actor.name} hue={actor.hue} size={40} /> : <span className="flex size-10 items-center justify-center rounded-full bg-secondary"><Icon className="size-4" /></span>}
                  <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border bg-card"><Icon className="size-3" /></span>
                </div>
                <HrefLink href={n.href} onClick={() => s.markNotification(n.id)} className="min-w-0 flex-1 after:absolute after:inset-0">
                  <p className={cn("text-sm", !n.read && "font-medium")}>{n.text}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(n.ts)}</p>
                </HrefLink>
                <button className="relative z-10 rounded-md px-2 py-1 text-xs text-muted-foreground opacity-100 hover:bg-accent hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100" onClick={() => s.markNotification(n.id, !n.read)}>
                  {n.read ? "Mark unread" : "Mark read"}
                </button>
                {!n.read && <span className="size-2 rounded-full bg-brand" aria-label="Unread" />}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
