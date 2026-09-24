import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { SKILLS } from "@/lib/data";
import type { Team } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Chip } from "./primitives";

const ROLES = ["Frontend", "Backend", "ML", "UI/UX", "Product", "Pitching", "DevOps", "Mobile", "Research"];
const schema = z.object({
  name: z.string().trim().min(3, "Name needs at least 3 characters").max(40),
  purpose: z.string().trim().min(3, "What's the team for?").max(80),
  description: z.string().trim().max(500),
});

export function TeamFormDialog({ open, onOpenChange, initial, preset }: { open: boolean; onOpenChange: (v: boolean) => void; initial?: Team; preset?: Partial<Team> }) {
  const upsert = useApp((s) => s.upsertTeam);
  const navigate = useNavigate();
  const blank = (): Team => ({ id: "", name: "", purpose: "", description: "", members: ["me"], roles: [], skills: [], maxSize: 4, lookingForMembers: true, activity: [{ text: "Team created", when: "just now" }], ...preset });
  const [t, setT] = useState<Team>(initial ?? blank());
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => { if (open) { setT(initial ?? blank()); setErrors({}); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = () => {
    const r = schema.safeParse(t);
    if (!r.success) return setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
    const id = t.id || `t${Date.now().toString(36)}`;
    upsert({ ...t, id, name: t.name.trim(), purpose: t.purpose.trim(), description: t.description.trim() || t.purpose.trim(), lookingForMembers: t.members.length < t.maxSize });
    toast.success(initial ? "Team updated." : `${t.name.trim()} created.`);
    onOpenChange(false);
    if (!initial) navigate({ to: "/teams/$id", params: { id } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>{initial ? "Edit team" : "Create a team"}</DialogTitle><DialogDescription>Teams can work on a project, a hackathon or just meet regularly.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="tn">Name</Label><Input id="tn" value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} aria-invalid={!!errors.name} />{errors.name && <p className="text-xs text-destructive">{errors.name}</p>}</div>
          <div className="space-y-1.5"><Label htmlFor="tp">Purpose</Label><Input id="tp" placeholder="e.g. Smart India Hackathon 2026" value={t.purpose} onChange={(e) => setT({ ...t, purpose: e.target.value })} aria-invalid={!!errors.purpose} />{errors.purpose && <p className="text-xs text-destructive">{errors.purpose}</p>}</div>
          <div className="space-y-1.5"><Label htmlFor="td">Description</Label><Textarea id="td" rows={3} value={t.description} onChange={(e) => setT({ ...t, description: e.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="ts">Max members</Label><Input id="ts" type="number" min={2} max={10} value={t.maxSize} onChange={(e) => setT({ ...t, maxSize: Math.max(2, Math.min(10, Number(e.target.value) || 2)) })} /></div>
          <div className="space-y-1.5"><Label>Roles needed</Label><div className="flex flex-wrap gap-1.5">{ROLES.map((r) => <Chip key={r} active={t.roles.includes(r)} onClick={() => setT({ ...t, roles: t.roles.includes(r) ? t.roles.filter((x) => x !== r) : [...t.roles, r] })}>{r}</Chip>)}</div></div>
          <div className="space-y-1.5"><Label>Skills</Label><div className="flex flex-wrap gap-1.5">{SKILLS.slice(0, 14).map((r) => <Chip key={r} active={t.skills.includes(r)} onClick={() => setT({ ...t, skills: t.skills.includes(r) ? t.skills.filter((x) => x !== r) : [...t.skills, r] })}>{r}</Chip>)}</div></div>
        </div>
        <div className="flex justify-end gap-2 border-t pt-4"><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={save}>{initial ? "Save changes" : "Create team"}</Button></div>
      </DialogContent>
    </Dialog>
  );
}
