import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Link2, MessageSquare } from "lucide-react";
import { z } from "zod";
import { useApp } from "@/lib/store";
import { yearLabel } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useMessage } from "@/components/cg/cards";
import { EmptyState, PageHeader, UserAvatar, Verified } from "@/components/cg/primitives";
import { cn } from "@/lib/utils";

const TABS = ["all", "pending", "received", "sent"] as const;

export const Route = createFileRoute("/_shell/connections")({
  validateSearch: (s) => z.object({ tab: z.enum(TABS).optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Connections — Tribe" },
      { name: "description", content: "Manage your connections and pending requests." },
      { property: "og:title", content: "Connections — Tribe" },
      { property: "og:description", content: "Your university network." },
    ],
  }),
  component: Connections,
});

function Connections() {
  const { tab = "all" } = Route.useSearch();
  const navigate = useNavigate({ from: "/connections" });
  const s = useApp();
  const message = useMessage();
  const [q, setQ] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);

  const withState = s.students.filter((x) => s.connections[x.id]).map((p) => ({ p, st: s.connections[p.id] }));
  const counts = {
    all: withState.filter((x) => x.st === "connected").length,
    pending: withState.filter((x) => x.st !== "connected").length,
    received: withState.filter((x) => x.st === "received").length,
    sent: withState.filter((x) => x.st === "sent").length,
  };
  const list = withState
    .filter(({ st }) => (tab === "all" ? st === "connected" : tab === "pending" ? st !== "connected" : st === tab))
    .filter(({ p }) => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  const removingPerson = s.students.find((x) => x.id === removing);

  return (
    <>
      <PageHeader title="Connections" description="The people you know on Tribe." />
      <div className="mb-4 flex gap-1 border-b" role="tablist">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => navigate({ search: { tab: t } })} className={cn("-mb-px border-b-2 px-3 py-2.5 text-sm capitalize", tab === t ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground")}>{t} <span className="ml-1 text-xs text-muted-foreground">{counts[t]}</span></button>)}
      </div>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name" className="mb-6 max-w-sm" aria-label="Filter connections" />
      {list.length === 0 ? (
        <EmptyState icon={<Link2 className="size-8" />} title={tab === "all" ? "No connections yet" : `No ${tab} requests`} description="Find people who share your interests and send a request." action={<Button variant="outline" asChild><Link to="/people">Find people</Link></Button>} />
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {list.map(({ p, st }) => (
            <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <Link to="/people/$id" params={{ id: p.id }} className="flex min-w-0 flex-1 items-center gap-3">
                <UserAvatar name={p.name} hue={p.hue} size={44} />
                <div className="min-w-0"><p className="flex items-center gap-1 font-medium hover:underline">{p.name}{p.verified && <Verified />}</p><p className="truncate text-sm text-muted-foreground">{p.branch} · {yearLabel(p.year)} · {p.college}</p></div>
              </Link>
              <div className="flex gap-2">
                {st === "received" && <><Button size="sm" onClick={() => { s.accept(p.id); toast.success(`You're now connected with ${p.name}.`); }}>Accept</Button><Button size="sm" variant="outline" onClick={() => { s.removeConnection(p.id); toast("Request declined."); }}>Decline</Button></>}
                {st === "sent" && <Button size="sm" variant="outline" onClick={() => { s.removeConnection(p.id); toast("Request cancelled."); }}>Cancel request</Button>}
                {st === "connected" && <><Button size="sm" variant="outline" onClick={() => message(p.id)}><MessageSquare className="size-4" /> Message</Button><Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setRemoving(p.id)}>Remove</Button></>}
              </div>
            </li>
          ))}
        </ul>
      )}
      <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove {removingPerson?.name}?</AlertDialogTitle><AlertDialogDescription>They won't be notified. You can send a new request later.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (removing) s.removeConnection(removing); toast("Connection removed."); setRemoving(null); }}>Remove</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
