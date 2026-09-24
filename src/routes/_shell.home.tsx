import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Code2, FolderGit2, GitBranch, Link2 } from "lucide-react";
import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { formatEventDate, greeting, matchScore, profileCompletion, timeAgo, yearLabel } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PersonCard, ProjectCard } from "@/components/cg/cards";
import { PersonLink, Tag, UserAvatar, Verified } from "@/components/cg/primitives";

export const Route = createFileRoute("/_shell/home")({
  head: () => ({
    meta: [
      { title: "Home — CampusGraph" },
      { name: "description", content: "Your personalised CampusGraph dashboard: people to meet, projects and events." },
      { property: "og:title", content: "Home — CampusGraph" },
      { property: "og:description", content: "People you should meet this week." },
    ],
  }),
  component: Home,
});

function Home() {
  const s = useApp();
  const me = s.me;
  const firstName = me.name.split(" ")[0];
  const completion = profileCompletion(me);
  const connected = s.students.filter((x) => s.connections[x.id] === "connected").length;
  const myProjects = s.projects.filter((p) => p.members.includes("me")).length;
  const recs = useMemo(
    () => s.students.filter((x) => !s.connections[x.id]).sort((a, b) => matchScore(me, b) - matchScore(me, a)).slice(0, 6),
    [s.students, s.connections, me],
  );
  const openProjects = s.projects.filter((p) => p.status === "published" && p.roles.length && !p.members.includes("me") && p.tech.some((t) => me.skills.includes(t))).slice(0, 2);
  const upcoming = [...s.events].sort((a, b) => a.date.localeCompare(b.date)).filter((e) => e.date >= "2026-09-24").slice(0, 4);
  const recentNotifs = s.notifications.slice(0, 5);
  const received = s.students.filter((x) => s.connections[x.id] === "received");

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{greeting()}, {firstName}.</h1>
        <p className="mt-2 text-muted-foreground">Your next collaborator might be closer than you think.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="rounded-xl border bg-card p-6 lg:col-span-1" aria-label="Profile snapshot">
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">PROFILE SNAPSHOT</p>
          <div className="mt-5 flex items-center gap-4">
            <UserAvatar name={me.name} hue={me.hue} size={56} />
            <div className="min-w-0">
              <p className="flex items-center gap-1 font-semibold">{me.name} {me.verified && <Verified />}</p>
              <p className="truncate text-sm text-muted-foreground">{me.college}</p>
              <p className="text-sm text-muted-foreground">{yearLabel(me.year)} · {me.branch}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-1.5">{me.skills.slice(0, 4).map((k) => <Tag key={k}>{k}</Tag>)}</div>
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm"><span className="text-muted-foreground">Profile completion</span><span className="font-medium tabular-nums">{completion}%</span></div>
            <Progress value={completion} className="h-1.5" />
            {completion < 100 && <Link to="/profile/edit" className="mt-2 inline-block text-xs text-muted-foreground hover:text-foreground">Finish your profile →</Link>}
          </div>
          <Button variant="outline" className="mt-6 w-full" asChild><Link to="/profile">View Profile</Link></Button>
        </section>

        <section className="lg:col-span-2" aria-label="Activity">
          <p className="mb-4 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">ACTIVITY</p>
          <dl className="grid grid-cols-2 divide-x divide-y rounded-xl border bg-card sm:grid-cols-4 sm:divide-y-0">
            {[
              [GitBranch, "GitHub", s.integrations.GitHub.status === "connected" ? `${me.repos} repos` : "Not linked", "/settings/integrations"],
              [Code2, "LeetCode", s.integrations.LeetCode.status === "connected" ? `${me.lcSolved} solved` : "Not linked", "/settings/integrations"],
              [FolderGit2, "Projects", myProjects, "/projects"],
              [Link2, "Connections", connected, "/connections"],
            ].map(([I, l, v, to]) => {
              const Icon = I as typeof Code2;
              return (
                <Link key={l as string} to={to as "/projects"} className="p-5 transition-colors hover:bg-accent/50">
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="size-3.5" /> {l as string}</dt>
                  <dd className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{v as string}</dd>
                </Link>
              );
            })}
          </dl>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center justify-between"><p className="text-sm font-medium">Upcoming events</p><Link to="/events" className="text-xs text-muted-foreground hover:text-foreground">All events</Link></div>
              <ul className="divide-y rounded-xl border bg-card">
                {upcoming.map((e) => {
                  const d = formatEventDate(e.date);
                  return (
                    <li key={e.id}>
                      <Link to="/events/$id" params={{ id: e.id }} className="flex items-center gap-3 p-3 hover:bg-accent/50">
                        <span className="w-10 text-center"><span className="block font-mono text-[9px] text-muted-foreground">{d.month}</span><span className="font-semibold">{d.day}</span></span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{e.title}</span><span className="text-xs text-muted-foreground">{e.time}</span></span>
                        {e.attendees.includes("me") && <Tag tone="success">Going</Tag>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between"><p className="text-sm font-medium">Recent</p><Link to="/notifications" className="text-xs text-muted-foreground hover:text-foreground">All notifications</Link></div>
              <ul className="space-y-3 rounded-xl border bg-card p-4">
                {received.length > 0 && (
                  <li className="text-sm"><Link to="/connections" search={{ tab: "received" }} className="flex items-center justify-between font-medium hover:underline">{received.length} connection request{received.length > 1 ? "s" : ""} waiting <ArrowRight className="size-4" /></Link></li>
                )}
                {recentNotifs.map((n) => (
                  <li key={n.id} className="flex items-start gap-2.5 text-sm">
                    {!n.read ? <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" /> : <span className="mt-1.5 size-1.5 shrink-0" />}
                    <a href={n.href} className="flex-1 leading-snug hover:underline">{n.text}</a>
                    <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(n.ts)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-14">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">People you should meet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Based on your skills, interests and what you're looking for.</p>
          </div>
          <Button variant="ghost" size="sm" asChild><Link to="/people">See all <ArrowRight className="size-4" /></Link></Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{recs.map((p) => <PersonCard key={p.id} person={p} />)}</div>
      </section>

      {openProjects.length > 0 && (
        <section className="mt-14">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">Projects that need your skills</h2>
              <p className="mt-1 text-sm text-muted-foreground">Open roles that match what you know.</p>
            </div>
            <Button variant="ghost" size="sm" asChild><Link to="/projects">All projects <ArrowRight className="size-4" /></Link></Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">{openProjects.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
        </section>
      )}

      <section className="mt-14 flex flex-col items-start justify-between gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-secondary"><Calendar className="size-5" /></span>
          <div><p className="font-medium">Heading to a hackathon?</p><p className="text-sm text-muted-foreground">Build a balanced team in under a minute.</p></div>
        </div>
        <Button asChild><Link to="/hackathon-teams">Open team builder</Link></Button>
      </section>
      <span className="hidden"><PersonLink id="me">me</PersonLink></span>
    </div>
  );
}
