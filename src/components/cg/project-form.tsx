import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { SKILLS } from "@/lib/data";
import type { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chip } from "./primitives";

const CATEGORIES = ["Web", "Mobile", "AI/ML", "Research", "Hardware", "Security", "Fintech", "Tools", "Education", "Blockchain", "Open Source"];
const ROLES = ["Frontend", "Backend", "ML", "UI/UX", "Product", "Pitching", "DevOps", "Mobile", "Research"];

const schema = z.object({
  name: z.string().trim().min(3, "Name needs at least 3 characters").max(60),
  description: z.string().trim().min(20, "Describe the project in at least 20 characters").max(500),
  category: z.string().min(1, "Pick a category"),
  tech: z.array(z.string()).min(1, "Add at least one technology"),
  github: z.string().trim().max(120).regex(/^$|^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+(\/[\w.-]+)?\/?$/, "Enter a GitHub URL like github.com/user/repo"),
  teamSize: z.number().min(1).max(12),
  deadline: z.string().optional(),
});

function blank(): Project {
  return {
    id: "", name: "", description: "", category: "", stage: "Idea", tech: [], ownerId: "me", members: ["me"], teamSize: 4,
    roles: [], github: "", deadline: "", visibility: "Public", status: "published", createdDaysAgo: 0, college: "",
    timeline: [{ label: "Project created", date: "Sep 2026", done: true }, { label: "First prototype", date: "TBD", done: false }],
  };
}

export function ProjectFormDialog({ open, onOpenChange, initial }: { open: boolean; onOpenChange: (v: boolean) => void; initial?: Project }) {
  const upsert = useApp((s) => s.upsertProject);
  const college = useApp((s) => s.me.college);
  const navigate = useNavigate();
  const [p, setP] = useState<Project>(initial ?? blank());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Project | null>(null);

  useEffect(() => {
    if (open) { setP(initial ?? blank()); setErrors({}); setDone(null); }
  }, [open, initial]);

  const submit = (status: "draft" | "published") => {
    const r = schema.safeParse({ ...p, github: p.github ?? "" });
    if (status === "published" && !r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    if (status === "draft" && p.name.trim().length < 3) {
      setErrors({ name: "Give your draft a name" });
      return;
    }
    const saved: Project = { ...p, id: p.id || `p${Date.now().toString(36)}`, status, college: p.college || college, name: p.name.trim(), description: p.description.trim() };
    upsert(saved);
    if (initial) {
      toast.success(status === "draft" ? "Draft saved." : "Project updated.");
      onOpenChange(false);
    } else {
      setDone(saved);
      toast.success(status === "draft" ? "Draft saved." : "Project published.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {done ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto size-10 text-success" />
            <DialogTitle className="mt-4 text-xl">{done.status === "draft" ? "Draft saved" : `${done.name} is live`}</DialogTitle>
            <DialogDescription className="mt-2">{done.status === "draft" ? "Only you can see it. Publish when you're ready." : "It now appears in Projects for everyone on campus."}</DialogDescription>
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              <Button onClick={() => { onOpenChange(false); navigate({ to: "/projects/$id", params: { id: done.id } }); }}>View project</Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{initial ? "Edit project" : "Create a project"}</DialogTitle>
              <DialogDescription>Tell people what you're building and who you need.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" error={errors.name} className="sm:col-span-2"><Input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} aria-invalid={!!errors.name} /></Field>
              <Field label="Description" error={errors.description} className="sm:col-span-2"><Textarea rows={3} value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} aria-invalid={!!errors.description} /></Field>
              <Field label="Category" error={errors.category}>
                <Select value={p.category} onValueChange={(v) => setP({ ...p, category: v })}><SelectTrigger aria-label="Category"><SelectValue placeholder="Choose" /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
              </Field>
              <Field label="Stage">
                <Select value={p.stage} onValueChange={(v) => setP({ ...p, stage: v as Project["stage"] })}><SelectTrigger aria-label="Stage"><SelectValue /></SelectTrigger><SelectContent>{["Idea", "Prototype", "Building", "Launched"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
              </Field>
              <Field label="Tech stack" error={errors.tech} className="sm:col-span-2">
                <div className="flex flex-wrap gap-1.5">{SKILLS.slice(0, 18).map((t) => <Chip key={t} active={p.tech.includes(t)} onClick={() => setP({ ...p, tech: p.tech.includes(t) ? p.tech.filter((x) => x !== t) : [...p.tech, t] })}>{t}</Chip>)}</div>
              </Field>
              <Field label="GitHub repository" error={errors.github} className="sm:col-span-2"><Input placeholder="github.com/you/project" value={p.github ?? ""} onChange={(e) => setP({ ...p, github: e.target.value })} aria-invalid={!!errors.github} /></Field>
              <Field label="Team size"><Input type="number" min={1} max={12} value={p.teamSize} onChange={(e) => setP({ ...p, teamSize: Math.max(1, Math.min(12, Number(e.target.value) || 1)) })} /></Field>
              <Field label="Deadline"><Input type="date" value={p.deadline ?? ""} onChange={(e) => setP({ ...p, deadline: e.target.value })} /></Field>
              <Field label="Roles needed" className="sm:col-span-2">
                <div className="flex flex-wrap gap-1.5">{ROLES.map((t) => <Chip key={t} active={p.roles.includes(t)} onClick={() => setP({ ...p, roles: p.roles.includes(t) ? p.roles.filter((x) => x !== t) : [...p.roles, t] })}>{t}</Chip>)}</div>
              </Field>
              <Field label="Visibility" className="sm:col-span-2">
                <div className="grid grid-cols-3 gap-2">{(["Public", "Campus", "Private"] as const).map((v) => (
                  <button key={v} type="button" aria-pressed={p.visibility === v} onClick={() => setP({ ...p, visibility: v })} className={`rounded-lg border p-3 text-left text-sm ${p.visibility === v ? "border-foreground" : ""}`}>
                    <span className="font-medium">{v}</span>
                    <span className="block text-xs text-muted-foreground">{v === "Public" ? "All students" : v === "Campus" ? "Your college" : "Invite only"}</span>
                  </button>
                ))}</div>
              </Field>
            </div>
            <div className="mt-2 flex justify-end gap-2 border-t pt-4">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button variant="outline" onClick={() => submit("draft")}>Save Draft</Button>
              <Button onClick={() => submit("published")}>{initial?.status === "published" ? "Save changes" : "Publish"}</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
