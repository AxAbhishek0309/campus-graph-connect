import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { EventCard, PersonCard, ProjectCard, TeamCard } from "@/components/cg/cards";
import { EmptyState, PageHeader } from "@/components/cg/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/saved")({
  head: () => ({
    meta: [
      { title: "Saved — Tribe" },
      { name: "description", content: "People, projects, teams and events you've saved." },
      { property: "og:title", content: "Saved — Tribe" },
      { property: "og:description", content: "Everything you bookmarked in one place." },
    ],
  }),
  component: Saved,
});

const TABS = [["people", "People", "/people"], ["projects", "Projects", "/projects"], ["teams", "Teams", "/teams"], ["events", "Events", "/events"]] as const;

function Saved() {
  const s = useApp();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("people");
  const ids = s.saved[tab];
  const current = TABS.find((t) => t[0] === tab)!;
  return (
    <>
      <PageHeader title="Saved" description="Things you want to come back to." />
      <div className="mb-6 flex gap-1 border-b" role="tablist">
        {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("-mb-px border-b-2 px-3 py-2.5 text-sm", tab === k ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground")}>{l} <span className="ml-1 text-xs text-muted-foreground">{s.saved[k].length}</span></button>)}
      </div>
      {ids.length === 0 ? (
        <EmptyState icon={<Bookmark className="size-8" />} title={`No saved ${current[1].toLowerCase()} yet`} description="Tap the bookmark icon on any card to save it here." action={<Button variant="outline" asChild><Link to={current[2]}>Browse {current[1].toLowerCase()}</Link></Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tab === "people" && ids.map((id) => s.students.find((x) => x.id === id)).filter(Boolean).map((p) => <PersonCard key={p!.id} person={p!} />)}
          {tab === "projects" && ids.map((id) => s.projects.find((x) => x.id === id)).filter(Boolean).map((p) => <ProjectCard key={p!.id} project={p!} />)}
          {tab === "teams" && ids.map((id) => s.teams.find((x) => x.id === id)).filter(Boolean).map((p) => <TeamCard key={p!.id} team={p!} />)}
          {tab === "events" && ids.map((id) => s.events.find((x) => x.id === id)).filter(Boolean).map((p) => <EventCard key={p!.id} event={p!} />)}
        </div>
      )}
    </>
  );
}
