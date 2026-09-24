import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, RefreshCw, UserPlus } from "lucide-react";
import { useApp } from "@/lib/store";
import type { Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chip, PageHeader, PersonLink, Tag, UserAvatar } from "@/components/cg/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/hackathon-teams")({
  head: () => ({
    meta: [
      { title: "Hackathon team builder — CampusGraph" },
      { name: "description", content: "Pick a hackathon and the roles you need. Get a balanced team of students who fill the gaps." },
      { property: "og:title", content: "Build your hackathon team — CampusGraph" },
      { property: "og:description", content: "Frontend, backend, ML, design, pitching — find the missing pieces." },
    ],
  }),
  component: Builder,
});

const ROLE_SKILLS: Record<string, string[]> = {
  Frontend: ["React", "JavaScript", "TypeScript", "UI/UX", "Flutter"],
  Backend: ["Node.js", "Go", "Java", "SQL", "Python"],
  ML: ["ML", "PyTorch", "NLP", "Computer Vision", "Data Analysis"],
  "UI/UX": ["UI/UX", "Figma"],
  Product: ["Product", "Startups"],
  Pitching: ["Public Speaking", "Startups", "Finance"],
  DevOps: ["Docker", "Cloud", "Go"],
};

function fitScore(s: Student, role: string) {
  const skills = ROLE_SKILLS[role];
  const hits = [...s.skills, ...s.interests].filter((x) => skills.includes(x));
  return hits.length * 3 + (s.lookingFor.includes("Hackathon Partner") ? 3 : 0) + (s.activity === "high" ? 2 : s.activity === "medium" ? 1 : 0) + (s.interests.includes("Hackathons") ? 1 : 0);
}

function whyFit(s: Student, role: string) {
  const hits = [...s.skills, ...s.interests].filter((x) => ROLE_SKILLS[role].includes(x));
  const first = s.name.split(" ")[0];
  const parts = [];
  if (hits.length) parts.push(`${first} works with ${hits.slice(0, 2).join(" and ")}`);
  if (s.lookingFor.includes("Hackathon Partner")) parts.push("is actively looking for a hackathon team");
  if (s.interests.includes("Hackathons") && !s.lookingFor.includes("Hackathon Partner")) parts.push("enjoys hackathons");
  if (!parts.length) parts.push(`${first} has related experience and is ${s.availability.toLowerCase()}`);
  return parts.join(" and ") + ".";
}

function Builder() {
  const s = useApp();
  const navigate = useNavigate();
  const hackathons = s.events.filter((e) => e.category === "Hackathons" || e.category === "Competitions");
  const [hackathon, setHackathon] = useState(hackathons[0]?.id ?? "");
  const [size, setSize] = useState(4);
  const [roles, setRoles] = useState<string[]>(["Frontend", "Backend", "ML"]);
  const [building, setBuilding] = useState(false);
  const [team, setTeam] = useState<{ role: string; id: string }[] | null>(null);
  const [skip, setSkip] = useState<string[]>([]);
  const [invited, setInvited] = useState<string[]>([]);

  const slots = useMemo(() => roles.slice(0, size - 1), [roles, size]);

  const pickFor = (role: string, exclude: string[]) =>
    s.students.filter((x) => !exclude.includes(x.id)).sort((a, b) => fitScore(b, role) - fitScore(a, role))[0];

  const build = () => {
    if (!slots.length) return toast.error("Pick at least one role you need.");
    setBuilding(true);
    setTeam(null);
    setInvited([]);
    setTimeout(() => {
      const used: string[] = [...skip];
      const result = slots.map((role) => {
        const p = pickFor(role, used);
        used.push(p.id);
        return { role, id: p.id };
      });
      setTeam(result);
      setBuilding(false);
    }, 900);
  };

  const replace = (i: number) => {
    if (!team) return;
    const current = team[i].id;
    const nextSkip = [...skip, current];
    setSkip(nextSkip);
    const p = pickFor(team[i].role, [...nextSkip, ...team.map((t) => t.id)]);
    if (!p) return toast("No one else fits this role right now.");
    setTeam(team.map((t, j) => (j === i ? { ...t, id: p.id } : t)));
    setInvited(invited.filter((x) => x !== current));
  };

  const create = () => {
    if (!team) return;
    const ev = s.events.find((e) => e.id === hackathon);
    const id = `t${Date.now().toString(36)}`;
    s.upsertTeam({
      id, name: `${ev?.title.split(" ")[0] ?? "Hack"} Squad`, purpose: ev?.title ?? "Hackathon", description: `Team formed for ${ev?.title}. Roles: ${slots.join(", ")}.`,
      members: ["me", ...team.filter((t) => invited.includes(t.id)).map((t) => t.id)], roles: team.filter((t) => !invited.includes(t.id)).map((t) => t.role),
      skills: [...new Set(team.flatMap((t) => s.students.find((x) => x.id === t.id)?.skills.slice(0, 2) ?? []))].slice(0, 6),
      maxSize: size, lookingForMembers: true, activity: [{ text: "Team created with the team builder", when: "just now" }],
    });
    toast.success("Team created. Invites are on their way.");
    navigate({ to: "/teams/$id", params: { id } });
  };

  return (
    <>
      <PageHeader eyebrow="Hackathon Teams" title="Build your team." description="Pick the hackathon and what you're missing. We'll suggest students who fill the gaps — and tell you why." />
      <div className="grid gap-8 lg:grid-cols-5">
        <section className="space-y-6 rounded-xl border bg-card p-6 lg:col-span-2 lg:self-start lg:sticky lg:top-20">
          <div className="space-y-2">
            <p className="text-sm font-medium">Hackathon</p>
            <Select value={hackathon} onValueChange={setHackathon}><SelectTrigger aria-label="Hackathon"><SelectValue /></SelectTrigger><SelectContent>{hackathons.map((h) => <SelectItem key={h.id} value={h.id}>{h.title}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Team size <span className="text-muted-foreground">(including you)</span></p>
            <div className="grid grid-cols-4 gap-2">{[2, 3, 4, 5].map((n) => <button key={n} aria-pressed={size === n} onClick={() => setSize(n)} className={cn("rounded-lg border py-2 font-mono text-sm transition-all", size === n ? "border-foreground bg-foreground text-background" : "hover:border-foreground/30")}>{n}</button>)}</div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Needed roles <span className="text-muted-foreground">({Math.min(roles.length, size - 1)}/{size - 1})</span></p>
            <div className="flex flex-wrap gap-2">{Object.keys(ROLE_SKILLS).map((r) => <Chip key={r} active={roles.includes(r)} onClick={() => setRoles(roles.includes(r) ? roles.filter((x) => x !== r) : [...roles, r])}>{r}</Chip>)}</div>
            {roles.length > size - 1 && <p className="text-xs text-muted-foreground">Only the first {size - 1} roles fit your team size.</p>}
          </div>
          <Button size="lg" className="w-full" onClick={build} disabled={building}>{building ? <><Loader2 className="size-4 animate-spin" /> Finding people…</> : team ? "Rebuild team" : "Build My Team"}</Button>
        </section>

        <section className="lg:col-span-3" aria-live="polite">
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-dashed p-4">
            <UserAvatar name={s.me.name} hue={s.me.hue} size={40} />
            <div className="flex-1"><p className="text-sm font-medium">{s.me.name} (you)</p><p className="text-xs text-muted-foreground">{s.me.skills.slice(0, 3).join(", ")}</p></div>
            <Tag>Captain</Tag>
          </div>
          {building && slots.map((r) => <div key={r} className="mb-3 h-32 animate-pulse rounded-xl border bg-card" />)}
          {!building && !team && (
            <div className="grid gap-3">{slots.map((r) => (
              <div key={r} className="flex items-center gap-4 rounded-xl border border-dashed p-5 text-muted-foreground"><span className="flex size-10 items-center justify-center rounded-full border border-dashed">?</span><span className="font-mono text-xs uppercase">{r}</span><span className="text-sm">Waiting for you to build</span></div>
            ))}</div>
          )}
          {!building && team && (
            <div className="space-y-3">
              {team.map((t, i) => {
                const p = s.students.find((x) => x.id === t.id)!;
                const inv = invited.includes(p.id);
                return (
                  <article key={t.role} className="animate-rise rounded-xl border bg-card p-5" style={{ animationDelay: `${i * 90}ms` }}>
                    <div className="flex items-start gap-4">
                      <UserAvatar name={p.name} hue={p.hue} size={48} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[11px] tracking-wider text-brand uppercase">{t.role}</span></div>
                        <PersonLink id={p.id} className="font-semibold hover:underline">{p.name}</PersonLink>
                        <p className="text-xs text-muted-foreground">{p.branch} · {p.college}</p>
                        <p className="mt-2 text-sm">{whyFit(p, t.role)}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">{p.skills.slice(0, 4).map((k) => <Tag key={k} tone={ROLE_SKILLS[t.role].includes(k) ? "brand" : "default"}>{k}</Tag>)}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2 border-t pt-4">
                      <Button size="sm" variant={inv ? "outline" : "default"} disabled={inv} onClick={() => { setInvited([...invited, p.id]); s.inviteToTeam("", p.id); toast(`Invite sent to ${p.name}.`); }}>{inv ? <><Check className="size-4" /> Invited</> : <><UserPlus className="size-4" /> Invite</>}</Button>
                      <Button size="sm" variant="ghost" onClick={() => replace(i)}><RefreshCw className="size-4" /> Replace</Button>
                    </div>
                  </article>
                );
              })}
              <div className="flex items-center justify-between rounded-xl bg-foreground p-5 text-background">
                <div><p className="font-medium">{invited.length} of {team.length} invited</p><p className="text-sm text-background/70">Create the team now — uninvited roles stay open.</p></div>
                <Button variant="secondary" onClick={create}>Create Team</Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
