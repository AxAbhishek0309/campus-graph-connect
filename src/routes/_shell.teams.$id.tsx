import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Check, LogOut, MessageSquare, Pencil, Search, UserPlus } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, PersonLink, SaveButton, ShareButton, Tag, UserAvatar } from "@/components/cg/primitives";
import { useMessage } from "@/components/cg/cards";
import { TeamFormDialog } from "@/components/cg/team-form";

export const Route = createFileRoute("/_shell/teams/$id")({
  head: () => ({
    meta: [
      { title: "Team — Tribe" },
      { name: "description", content: "Team members, open roles, skills and recent activity." },
      { property: "og:title", content: "Team — Tribe" },
      { property: "og:description", content: "See who's on the team and what they need." },
    ],
  }),
  component: TeamDetail,
});

function TeamDetail() {
  const { id } = Route.useParams();
  const s = useApp();
  const team = s.teams.find((t) => t.id === id);
  const message = useMessage();
  const [invite, setInvite] = useState(false);
  const [edit, setEdit] = useState(false);
  const [q, setQ] = useState("");
  const [invited, setInvited] = useState<string[]>([]);
  if (!team) return <EmptyState title="Team not found" action={<Button asChild><Link to="/teams">Back to teams</Link></Button>} />;

  const members = team.members.map((m) => (m === "me" ? s.me : s.students.find((x) => x.id === m))).filter(Boolean);
  const joined = team.members.includes("me");
  const full = team.members.length >= team.maxSize;
  const project = s.projects.find((p) => p.id === team.projectId);
  const candidates = s.students.filter((x) => !team.members.includes(x.id) && (!q || x.name.toLowerCase().includes(q.toLowerCase()) || x.skills.some((k) => k.toLowerCase().includes(q.toLowerCase())))).slice(0, 8);

  return (
    <>
      <Link to="/teams" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Teams</Link>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-16 items-center justify-center rounded-xl bg-secondary font-mono text-xl font-semibold">{team.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
          <div className="max-w-xl">
            <h1 className="text-4xl font-semibold tracking-[-0.035em]">{team.name}</h1>
            <p className="mt-1 text-muted-foreground">{team.purpose}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {joined ? (
            <>
              <Button onClick={() => setInvite(true)}><UserPlus className="size-4" /> Invite</Button>
              <Button variant="outline" onClick={() => { const other = team.members.find((m) => m !== "me"); if (other) message(other); else toast("You're the only member so far."); }}><MessageSquare className="size-4" /> Message Team</Button>
              <Button variant="outline" onClick={() => setEdit(true)}><Pencil className="size-4" /> Edit</Button>
              <Button variant="ghost" onClick={() => toast(s.toggleJoinTeam(team.id) ? "Joined." : `You left ${team.name}.`)}><LogOut className="size-4" /> Leave</Button>
            </>
          ) : (
            <Button disabled={full} onClick={() => { s.toggleJoinTeam(team.id); toast.success(`You joined ${team.name}.`); }}>{full ? "Team full" : "Join team"}</Button>
          )}
          <SaveButton kind="teams" id={team.id} variant="outline" />
          <ShareButton path={`/teams/${team.id}`} title={team.name} variant="outline" />
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section><h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">ABOUT</h2><p className="leading-relaxed">{team.description}</p></section>
          <section>
            <h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">MEMBERS · {members.length}/{team.maxSize}</h2>
            <ul className="divide-y rounded-xl border bg-card">
              {members.map((m) => (
                <li key={m!.id} className="flex items-center gap-3 p-4">
                  <UserAvatar name={m!.name} hue={m!.hue} size={36} />
                  <PersonLink id={m!.id} className="min-w-0 flex-1 hover:underline"><p className="text-sm font-medium">{m!.name}{m!.id === "me" && " (you)"}</p><p className="truncate text-xs text-muted-foreground">{m!.skills.slice(0, 3).join(", ")}</p></PersonLink>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">ACTIVITY</h2>
            <ol className="space-y-3 border-l pl-5">
              {team.activity.map((a, i) => <li key={i} className="relative text-sm"><span className="absolute top-1.5 -left-[23px] size-2 rounded-full bg-border" />{a.text} <span className="text-muted-foreground">· {a.when}</span></li>)}
            </ol>
          </section>
        </div>
        <aside className="space-y-8">
          <section><h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">OPEN ROLES</h2>{team.roles.length ? <div className="flex flex-wrap gap-2">{team.roles.map((r) => <Tag key={r} tone="brand">{r}</Tag>)}</div> : <p className="text-sm text-muted-foreground">No open roles.</p>}</section>
          <section><h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">SKILLS</h2><div className="flex flex-wrap gap-2">{team.skills.map((r) => <Tag key={r}>{r}</Tag>)}</div></section>
          <section><h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">PROJECT</h2>{project ? <Link to="/projects/$id" params={{ id: project.id }} className="block rounded-xl border bg-card p-4 hover:bg-accent/50"><p className="font-medium">{project.name}</p><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p></Link> : <p className="text-sm text-muted-foreground">Not linked to a project.</p>}</section>
        </aside>
      </div>

      <Dialog open={invite} onOpenChange={setInvite}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Invite to {team.name}</DialogTitle><DialogDescription>They'll get a notification with your invite.</DialogDescription></DialogHeader>
          <label className="flex items-center gap-2 rounded-md border px-3"><Search className="size-4 text-muted-foreground" /><Input className="border-0 px-0 shadow-none focus-visible:ring-0" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or skill" /></label>
          <ul className="max-h-80 divide-y overflow-y-auto">
            {candidates.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-2.5">
                <UserAvatar name={c.name} hue={c.hue} size={32} />
                <div className="min-w-0 flex-1"><p className="text-sm font-medium">{c.name}</p><p className="truncate text-xs text-muted-foreground">{c.skills.slice(0, 3).join(", ")}</p></div>
                <Button size="sm" variant={invited.includes(c.id) ? "outline" : "default"} disabled={invited.includes(c.id)} onClick={() => { s.inviteToTeam(team.id, c.id); setInvited([...invited, c.id]); toast(`Invite sent to ${c.name}.`); }}>
                  {invited.includes(c.id) ? <><Check className="size-4" /> Invited</> : "Invite"}
                </Button>
              </li>
            ))}
            {candidates.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No one found.</li>}
          </ul>
        </DialogContent>
      </Dialog>
      <TeamFormDialog open={edit} onOpenChange={setEdit} initial={team} />
    </>
  );
}
