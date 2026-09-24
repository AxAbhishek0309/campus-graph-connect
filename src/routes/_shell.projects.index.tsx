import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FolderGit2, Plus } from "lucide-react";
import { z } from "zod";
import { useApp } from "@/lib/store";
import { COLLEGES } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardGridSkeleton, ProjectCard } from "@/components/cg/cards";
import { EmptyState, PageHeader } from "@/components/cg/primitives";
import { ProjectFormDialog } from "@/components/cg/project-form";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/projects/")({
  validateSearch: (s) => z.object({ new: z.boolean().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Projects — CampusGraph" },
      { name: "description", content: "Discover student projects looking for collaborators, or post your own." },
      { property: "og:title", content: "Build something together — CampusGraph" },
      { property: "og:description", content: "Student projects with open roles." },
    ],
  }),
  component: Projects,
});

function Projects() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const projects = useApp((s) => s.projects);
  const [tab, setTab] = useState<"all" | "mine" | "drafts">("all");
  const [q, setQ] = useState("");
  const [f, setF] = useState({ tech: "", domain: "", stage: "", size: "", open: "", college: "" });
  const [open, setOpen] = useState(!!search.new);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 250); return () => clearTimeout(t); }, []);
  useEffect(() => { if (search.new) setOpen(true); }, [search.new]);

  const allTech = useMemo(() => [...new Set(projects.flatMap((p) => p.tech))].sort(), [projects]);
  const domains = useMemo(() => [...new Set(projects.map((p) => p.category))].sort(), [projects]);

  const list = projects.filter((p) => {
    if (tab === "all" && p.status !== "published") return false;
    if (tab === "mine" && !p.members.includes("me")) return false;
    if (tab === "drafts" && !(p.status === "draft" && p.ownerId === "me")) return false;
    const t = q.trim().toLowerCase();
    if (t && ![p.name, p.description, p.category, ...p.tech, ...p.roles].join(" ").toLowerCase().includes(t)) return false;
    if (f.tech && !p.tech.includes(f.tech)) return false;
    if (f.domain && p.category !== f.domain) return false;
    if (f.stage && p.stage !== f.stage) return false;
    if (f.size === "small" && p.teamSize > 3) return false;
    if (f.size === "medium" && (p.teamSize < 4 || p.teamSize > 5)) return false;
    if (f.size === "large" && p.teamSize < 6) return false;
    if (f.open === "yes" && p.roles.length === 0) return false;
    if (f.open && f.open !== "yes" && !p.roles.includes(f.open)) return false;
    if (f.college && p.college !== f.college) return false;
    return true;
  });

  const drafts = projects.filter((p) => p.status === "draft" && p.ownerId === "me").length;
  const sel = (key: keyof typeof f, label: string, opts: [string, string][]) => (
    <Select value={f[key] || "__any"} onValueChange={(v) => setF({ ...f, [key]: v === "__any" ? "" : v })}>
      <SelectTrigger className="h-9 w-auto min-w-32" aria-label={label}><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="__any">{label}: Any</SelectItem>{opts.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
    </Select>
  );

  return (
    <>
      <PageHeader eyebrow="Projects" title="Build something together." description="Student projects looking for collaborators. Join one, or start your own." actions={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> New project</Button>} />
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects, tech, roles…" className="h-10" aria-label="Search projects" />
      <div className="mt-3 flex flex-wrap gap-2">
        {sel("tech", "Technology", allTech.map((t) => [t, t]))}
        {sel("domain", "Domain", domains.map((t) => [t, t]))}
        {sel("stage", "Stage", ["Idea", "Prototype", "Building", "Launched"].map((t) => [t, t]))}
        {sel("size", "Team size", [["small", "1–3"], ["medium", "4–5"], ["large", "6+"]])}
        {sel("open", "Open roles", [["yes", "Any open role"], ...["Frontend", "Backend", "ML", "UI/UX", "Product", "DevOps", "Mobile"].map((r) => [r, r] as [string, string])])}
        {sel("college", "College", COLLEGES.map((t) => [t, t]))}
      </div>
      <div className="mt-6 flex gap-1 border-b" role="tablist">
        {([["all", "All projects"], ["mine", "My projects"], ["drafts", `Drafts${drafts ? ` (${drafts})` : ""}`]] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("-mb-px border-b-2 px-3 py-2.5 text-sm", tab === k ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground")}>{l}</button>
        ))}
      </div>
      <p className="mt-5 mb-4 text-sm text-muted-foreground"><span className="font-medium text-foreground">{list.length}</span> projects</p>
      {loading ? <CardGridSkeleton /> : list.length === 0 ? (
        <EmptyState icon={<FolderGit2 className="size-8" />} title={tab === "drafts" ? "No drafts" : "No projects found"} description={tab === "mine" ? "Join a project or start one of your own." : "Try a different filter or search."} action={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> Create project</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
      )}
      <ProjectFormDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v && search.new) navigate({ to: "/projects", search: {}, replace: true }); }} />
    </>
  );
}
