import { createFileRoute, Link, useBlocker, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { useApp } from "@/lib/store";
import { BRANCHES, COLLEGES, INTERESTS, LOOKING_FOR, SKILLS } from "@/lib/data";
import type { Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chip, PageHeader, UserAvatar } from "@/components/cg/primitives";

export const Route = createFileRoute("/_shell/profile/edit")({
  head: () => ({
    meta: [
      { title: "Edit profile — CampusGraph" },
      { name: "description", content: "Update your skills, interests, links and privacy." },
      { property: "og:title", content: "Edit profile — CampusGraph" },
      { property: "og:description", content: "Keep your student profile up to date." },
    ],
  }),
  component: EditProfile,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  bio: z.string().max(400, "Keep your bio under 400 characters"),
  github: z.string().max(60).regex(/^[A-Za-z0-9-]*$/, "Only letters, numbers and dashes").optional().or(z.literal("")),
  linkedin: z.string().max(80).optional().or(z.literal("")),
  leetcode: z.string().max(60).optional().or(z.literal("")),
});

function toggle<T>(a: T[], v: T) { return a.includes(v) ? a.filter((x) => x !== v) : [...a, v]; }

function Block({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t py-8 md:grid-cols-3">
      <div><h2 className="font-medium">{title}</h2>{desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}</div>
      <div className="space-y-4 md:col-span-2">{children}</div>
    </section>
  );
}

function EditProfile() {
  const me = useApp((s) => s.me);
  const update = useApp((s) => s.updateMe);
  const privacy = useApp((s) => s.privacy);
  const setPrivacy = useApp((s) => s.setPrivacy);
  const myProjects = useApp((s) => s.projects.filter((p) => p.ownerId === "me"));
  const navigate = useNavigate();
  const [d, setD] = useState<Student>(me);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(d) !== JSON.stringify(me);
  useBlocker({ shouldBlockFn: () => dirty && !saving && !window.confirm("You have unsaved changes. Leave anyway?"), enableBeforeUnload: dirty });

  const save = () => {
    const r = schema.safeParse({ name: d.name, bio: d.bio, github: d.github ?? "", linkedin: d.linkedin ?? "", leetcode: d.leetcode ?? "" });
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    setSaving(true);
    setTimeout(() => {
      update({ ...d, name: d.name.trim() });
      toast.success("Profile updated.");
      navigate({ to: "/profile" });
    }, 400);
  };

  return (
    <div className="pb-24">
      <PageHeader title="Edit profile" description="Changes appear everywhere on CampusGraph as soon as you save." actions={<><Button variant="ghost" asChild><Link to="/profile">Cancel</Link></Button><Button onClick={save} disabled={!dirty || saving}>{saving ? "Saving…" : "Save changes"}</Button></>} />

      <Block title="Basic information">
        <div className="flex items-center gap-4">
          <UserAvatar name={d.name || "?"} hue={d.hue} size={64} />
          <div className="flex gap-1.5" role="radiogroup" aria-label="Avatar colour">
            {[222, 12, 150, 280, 45, 190].map((h) => (
              <button key={h} role="radio" aria-checked={d.hue === h} aria-label={`Colour ${h}`} onClick={() => setD({ ...d, hue: h })} className="flex size-7 items-center justify-center rounded-full ring-offset-2 aria-checked:ring-2 aria-checked:ring-foreground" style={{ background: `oklch(0.85 0.08 ${h})` }}>
                {d.hue === h && <Check className="size-3.5" />}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5"><Label htmlFor="name">Name</Label><Input id="name" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} aria-invalid={!!errors.name} />{errors.name && <p className="text-xs text-destructive">{errors.name}</p>}</div>
      </Block>

      <Block title="Bio" desc="A few lines about what you do and what you want to build.">
        <Textarea rows={5} value={d.bio} onChange={(e) => setD({ ...d, bio: e.target.value })} aria-label="Bio" aria-invalid={!!errors.bio} />
        <p className="text-right text-xs text-muted-foreground">{d.bio.length}/400</p>
        {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
      </Block>

      <Block title="Skills"><div className="flex flex-wrap gap-2">{[...new Set([...SKILLS, ...d.skills])].map((s) => <Chip key={s} active={d.skills.includes(s)} onClick={() => setD({ ...d, skills: toggle(d.skills, s) })}>{s}</Chip>)}</div></Block>
      <Block title="Interests"><div className="flex flex-wrap gap-2">{[...new Set([...INTERESTS, ...d.interests])].map((s) => <Chip key={s} active={d.interests.includes(s)} onClick={() => setD({ ...d, interests: toggle(d.interests, s) })}>{s}</Chip>)}</div></Block>
      <Block title="Looking for"><div className="flex flex-wrap gap-2">{LOOKING_FOR.map((s) => <Chip key={s} active={d.lookingFor.includes(s)} onClick={() => setD({ ...d, lookingFor: toggle(d.lookingFor, s) })}>{s}</Chip>)}</div></Block>

      <Block title="Education">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2"><Label>College</Label><Select value={d.college} onValueChange={(v) => setD({ ...d, college: v })}><SelectTrigger aria-label="College"><SelectValue /></SelectTrigger><SelectContent>{COLLEGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Branch</Label><Select value={d.branch} onValueChange={(v) => setD({ ...d, branch: v })}><SelectTrigger aria-label="Branch"><SelectValue /></SelectTrigger><SelectContent>{BRANCHES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Year</Label><Select value={String(d.year)} onValueChange={(v) => setD({ ...d, year: Number(v) })}><SelectTrigger aria-label="Year"><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4, 5].map((c) => <SelectItem key={c} value={String(c)}>Year {c}</SelectItem>)}</SelectContent></Select></div>
        </div>
      </Block>

      <Block title="Projects" desc="Projects you own. Manage them from the project page.">
        {myProjects.length ? <ul className="divide-y rounded-lg border bg-card">{myProjects.map((p) => <li key={p.id} className="flex items-center justify-between p-3 text-sm"><span>{p.name}</span><Link to="/projects/$id" params={{ id: p.id }} className="text-muted-foreground hover:text-foreground">Manage</Link></li>)}</ul> : <p className="text-sm text-muted-foreground">No projects yet.</p>}
        <Button variant="outline" size="sm" asChild><Link to="/projects" search={{ new: true }}><Plus className="size-4" /> New project</Link></Button>
      </Block>

      <Block title="Experience">
        {d.experience.map((e, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <Input value={e.title} placeholder="Title" aria-label="Title" onChange={(ev) => setD({ ...d, experience: d.experience.map((x, j) => (j === i ? { ...x, title: ev.target.value } : x)) })} />
            <Input value={e.org} placeholder="Organisation" aria-label="Organisation" onChange={(ev) => setD({ ...d, experience: d.experience.map((x, j) => (j === i ? { ...x, org: ev.target.value } : x)) })} />
            <Input value={e.period} placeholder="Period" aria-label="Period" onChange={(ev) => setD({ ...d, experience: d.experience.map((x, j) => (j === i ? { ...x, period: ev.target.value } : x)) })} />
            <Button variant="ghost" size="icon" aria-label="Remove experience" onClick={() => setD({ ...d, experience: d.experience.filter((_, j) => j !== i) })}><Trash2 className="size-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setD({ ...d, experience: [...d.experience, { title: "", org: "", period: "" }] })}><Plus className="size-4" /> Add experience</Button>
      </Block>

      <Block title="Social links">
        {(["github", "linkedin", "leetcode"] as const).map((k) => (
          <div key={k} className="space-y-1.5">
            <Label htmlFor={k} className="capitalize">{k === "github" ? "GitHub username" : k === "linkedin" ? "LinkedIn handle" : "LeetCode username"}</Label>
            <Input id={k} value={d[k] ?? ""} onChange={(e) => setD({ ...d, [k]: e.target.value })} aria-invalid={!!errors[k]} />
            {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
          </div>
        ))}
      </Block>

      <Block title="Privacy" desc="Saved instantly.">
        <div className="flex items-center justify-between"><Label htmlFor="pstats">Show coding stats</Label><Switch id="pstats" checked={privacy.codingStats} onCheckedChange={(v) => setPrivacy({ codingStats: v })} /></div>
        <div className="flex items-center justify-between"><Label htmlFor="pgh">Show GitHub activity</Label><Switch id="pgh" checked={privacy.github} onCheckedChange={(v) => setPrivacy({ github: v })} /></div>
        <Link to="/settings/privacy" className="text-sm text-muted-foreground hover:text-foreground">More privacy settings →</Link>
      </Block>

      <div className="fixed inset-x-0 bottom-16 z-20 border-t bg-background/95 p-3 backdrop-blur lg:bottom-0 lg:left-60" hidden={!dirty}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
          <p className="text-sm text-muted-foreground">You have unsaved changes.</p>
          <div className="flex gap-2"><Button variant="ghost" onClick={() => setD(me)}>Discard</Button><Button onClick={save} disabled={saving}>Save changes</Button></div>
        </div>
      </div>
    </div>
  );
}
