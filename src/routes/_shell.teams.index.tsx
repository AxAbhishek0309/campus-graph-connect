import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Swords, UsersRound } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardGridSkeleton, TeamCard } from "@/components/cg/cards";
import { EmptyState, PageHeader } from "@/components/cg/primitives";
import { TeamFormDialog } from "@/components/cg/team-form";

export const Route = createFileRoute("/_shell/teams/")({
  head: () => ({
    meta: [
      { title: "Teams — Tribe" },
      { name: "description", content: "Join student teams for hackathons, research, competitions and projects." },
      { property: "og:title", content: "Teams — Tribe" },
      { property: "og:description", content: "Find a team or start your own." },
    ],
  }),
  component: Teams,
});

function Teams() {
  const teams = useApp((s) => s.teams);
  const me = useApp((s) => s.me);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 250); return () => clearTimeout(t); }, []);

  const t = q.trim().toLowerCase();
  const filtered = teams.filter((x) => !t || [x.name, x.purpose, ...x.skills, ...x.roles].join(" ").toLowerCase().includes(t));
  const mine = filtered.filter((x) => x.members.includes("me"));
  const others = filtered.filter((x) => !x.members.includes("me"));
  const recommended = [...others].sort((a, b) => b.skills.filter((s) => me.skills.includes(s)).length - a.skills.filter((s) => me.skills.includes(s)).length).slice(0, 3);
  const looking = others.filter((x) => x.members.length < x.maxSize && !recommended.includes(x));

  const Group = ({ title, desc, list, empty }: { title: string; desc: string; list: typeof teams; empty: string }) => (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight">{title} <span className="ml-1 text-sm font-normal text-muted-foreground">{list.length}</span></h2>
      <p className="mb-4 text-sm text-muted-foreground">{desc}</p>
      {list.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map((x) => <TeamCard key={x.id} team={x} />)}</div> : <EmptyState title={empty} icon={<UsersRound className="size-7" />} />}
    </section>
  );

  return (
    <>
      <PageHeader eyebrow="Teams" title="Find your team." description="Hackathon squads, study groups, research circles and project teams." actions={<><Button variant="outline" asChild><Link to="/hackathon-teams"><Swords className="size-4" /> Team builder</Link></Button><Button onClick={() => setOpen(true)}><Plus className="size-4" /> Create team</Button></>} />
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search teams by name, purpose or skill…" className="h-10" aria-label="Search teams" />
      {loading ? <div className="mt-10"><CardGridSkeleton count={3} /></div> : (
        <>
          <Group title="Recommended" desc="Teams whose skills overlap with yours." list={recommended} empty="No recommendations match your search." />
          <Group title="Looking for Members" desc="These teams have open spots right now." list={looking} empty="No open teams match your search." />
          <Group title="My Teams" desc="Teams you're part of." list={mine} empty="You haven't joined a team yet." />
        </>
      )}
      <TeamFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
