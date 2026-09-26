import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Check, CheckCircle2, Circle, GitBranch, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EmptyState, PersonLink, SaveButton, ShareButton, Tag, UserAvatar } from "@/components/cg/primitives";
import { useMessage } from "@/components/cg/cards";
import { ProjectFormDialog } from "@/components/cg/project-form";

export const Route = createFileRoute("/_shell/projects/$id")({
  head: () => ({
    meta: [
      { title: "Project — Tribe" },
      { name: "description", content: "Project overview, team, tech stack, timeline and open roles." },
      { property: "og:title", content: "Project — Tribe" },
      { property: "og:description", content: "See who's building it and which roles are open." },
    ],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = Route.useParams();
  const s = useApp();
  const project = s.projects.find((p) => p.id === id);
  const navigate = useNavigate();
  const message = useMessage();
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  if (!project) return <EmptyState title="Project not found" description="It may have been deleted by its owner." action={<Button asChild><Link to="/projects">Back to projects</Link></Button>} />;

  const owner = project.ownerId === "me" ? s.me : s.students.find((x) => x.id === project.ownerId);
  const members = project.members.map((m) => (m === "me" ? s.me : s.students.find((x) => x.id === m))).filter(Boolean);
  const isOwner = project.ownerId === "me";
  const joined = project.members.includes("me");
  const full = members.length >= project.teamSize;

  return (
    <>
      <Link to="/projects" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Projects</Link>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2"><Tag tone="brand">{project.stage}</Tag><span className="text-sm text-muted-foreground">{project.category} · {project.visibility}</span>{project.status === "draft" && <Tag tone="warning">Draft</Tag>}</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em]">{project.name}</h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isOwner ? (
            <>
              {project.status === "draft" && <Button onClick={() => { s.upsertProject({ ...project, status: "published" }); toast.success("Project published."); }}>Publish</Button>}
              <Button variant="outline" onClick={() => setEdit(true)}><Pencil className="size-4" /> Edit</Button>
              <Button variant="outline" onClick={() => setDel(true)} className="text-destructive"><Trash2 className="size-4" /> Delete</Button>
            </>
          ) : (
            <>
              <Button disabled={!joined && full} variant={joined ? "outline" : "default"} onClick={() => {
                const now = s.toggleJoinProject(project.id);
                toast(now ? "Project joined." : "You left the project.");
                if (now && owner && owner.id !== "me") s.pushNotification({ type: "project", text: `You joined ${project.name}. Say hi to ${owner.name.split(" ")[0]}!`, actorId: owner.id, href: `/projects/${project.id}` });
              }}>
                {joined ? <><Check className="size-4" /> Joined · Leave</> : full ? "Team full" : "Join Project"}
              </Button>
              {owner && <Button variant="outline" onClick={() => message(owner.id)}><MessageSquare className="size-4" /> Message Owner</Button>}
            </>
          )}
          <SaveButton kind="projects" id={project.id} label variant="outline" size="default" />
          <ShareButton path={`/projects/${project.id}`} title={project.name} variant="outline" />
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section>
            <h2 className="mb-4 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">TEAM · {members.length}/{project.teamSize}</h2>
            <ul className="divide-y rounded-xl border bg-card">
              {members.map((m) => (
                <li key={m!.id} className="flex items-center gap-3 p-4">
                  <UserAvatar name={m!.name} hue={m!.hue} size={36} />
                  <PersonLink id={m!.id} className="min-w-0 flex-1 hover:underline"><p className="text-sm font-medium">{m!.name}{m!.id === "me" && " (you)"}</p><p className="truncate text-xs text-muted-foreground">{m!.branch} · {m!.college}</p></PersonLink>
                  {m!.id === project.ownerId && <Tag>Owner</Tag>}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-4 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">TIMELINE</h2>
            <ol className="space-y-4">
              {project.timeline.map((t, i) => (
                <li key={i} className="flex items-center gap-3">
                  {t.done ? <CheckCircle2 className="size-5 text-success" /> : <Circle className="size-5 text-muted-foreground" />}
                  <span className={t.done ? "" : "text-muted-foreground"}>{t.label}</span>
                  <span className="ml-auto text-sm text-muted-foreground">{t.date}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="space-y-8">
          <section><h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">OPEN ROLES</h2>
            {project.roles.length ? <div className="flex flex-wrap gap-2">{project.roles.map((r) => <Tag key={r} tone="brand" className="px-2.5 py-1 text-sm">{r}</Tag>)}</div> : <p className="text-sm text-muted-foreground">No open roles right now.</p>}
          </section>
          <section><h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">TECH STACK</h2><div className="flex flex-wrap gap-2">{project.tech.map((t) => <Tag key={t}>{t}</Tag>)}</div></section>
          <section><h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">REPOSITORY</h2>
            {project.github ? <a href={`https://${project.github.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:underline"><GitBranch className="size-4" /> {project.github.replace(/^https?:\/\//, "")}</a> : <p className="text-sm text-muted-foreground">Not public yet.</p>}
          </section>
          {project.deadline && <section><h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">DEADLINE</h2><p className="flex items-center gap-2 text-sm"><Calendar className="size-4" /> {new Date(project.deadline + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p></section>}
          {owner && (
            <section className="rounded-xl border bg-card p-4"><h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">CREATOR</h2>
              <PersonLink id={owner.id} className="flex items-center gap-3 hover:underline"><UserAvatar name={owner.name} hue={owner.hue} size={40} /><div><p className="font-medium">{owner.name}</p><p className="text-xs text-muted-foreground">{owner.college}</p></div></PersonLink>
            </section>
          )}
        </aside>
      </div>

      <ProjectFormDialog open={edit} onOpenChange={setEdit} initial={project} />
      <AlertDialog open={del} onOpenChange={setDel}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete {project.name}?</AlertDialogTitle><AlertDialogDescription>This removes the project for all {members.length} members. This can't be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { s.deleteProject(project.id); toast("Project deleted."); navigate({ to: "/projects" }); }}>Delete project</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
