import { Link, useNavigate } from "@tanstack/react-router";
import { TiltCard } from "./effects";
import { toast } from "sonner";
import { Calendar, Check, Clock, ExternalLink, GraduationCap, MapPin, MessageSquare, Sparkles, Trophy, Users } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useApp } from "@/lib/store";
import { formatEventDate, reasonToConnect, yearLabel } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { getPlatformMeta } from "@/lib/openrouter-events";
import type { EventItem, Project, Student, Team } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AvatarStack, ConnectButton, SaveButton, Tag, UserAvatar, Verified } from "./primitives";

export function useMessage() {
  const open = useApp((s) => s.openConversation);
  const navigate = useNavigate();
  return (studentId: string) => {
    const id = open(studentId);
    navigate({ to: "/messages/$id", params: { id } });
  };
}

export function PersonCard({ person, reason }: { person: Student; reason?: string }) {
  const me = useApp((s) => s.me);
  const message = useMessage();
  return (
    <TiltCard className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <Link to="/people/$id" params={{ id: person.id }} className="flex min-w-0 items-center gap-3">
          <UserAvatar name={person.name} hue={person.hue} size={48} online={person.lastActiveMins < 10} />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="truncate font-semibold tracking-tight group-hover:underline">{person.name}</h3>
              {person.verified && <Verified />}
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {person.branch} · {yearLabel(person.year)}
            </p>
            <p className="truncate text-xs text-muted-foreground">{person.college}</p>
          </div>
        </Link>
        <SaveButton kind="people" id={person.id} />
      </div>

      <p className="mt-4 border-l-2 border-brand pl-3 text-sm leading-snug">{reason ?? reasonToConnect(me, person)}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {person.skills.slice(0, 4).map((s) => (
          <Tag key={s} tone={me.skills.includes(s) ? "brand" : "default"}>{s}</Tag>
        ))}
        {person.skills.length > 4 && <Tag>+{person.skills.length - 4}</Tag>}
      </div>
      {person.interests.length > 0 && (
        <p className="mt-3 truncate text-xs text-muted-foreground">Into {person.interests.slice(0, 3).join(", ")}</p>
      )}

      <div className="mt-auto flex gap-2 pt-5">
        <ConnectButton id={person.id} className="flex-1" />
        <Button size="sm" variant="outline" onClick={() => message(person.id)} aria-label={`Message ${person.name}`}>
          <MessageSquare className="size-4" />
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link to="/people/$id" params={{ id: person.id }}>View</Link>
        </Button>
      </div>
    </TiltCard>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const owner = useApp((s) => (project.ownerId === "me" ? s.me : s.students.find((x) => x.id === project.ownerId)));
  const toggleJoin = useApp((s) => s.toggleJoinProject);
  const message = useMessage();
  const joined = project.members.includes("me");
  const isOwner = project.ownerId === "me";
  const stageTone = { Idea: "violet", Prototype: "warning", Building: "brand", Launched: "success" } as const;
  return (
    <TiltCard className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <Tag tone={stageTone[project.stage]}>{project.stage}</Tag>
            <span className="text-xs text-muted-foreground">{project.category}</span>
            {project.status === "draft" && <Tag tone="warning">Draft</Tag>}
          </div>
          <Link to="/projects/$id" params={{ id: project.id }}>
            <h3 className="text-lg font-semibold tracking-tight group-hover:underline">{project.name}</h3>
          </Link>
        </div>
        <SaveButton kind="projects" id={project.id} />
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tech.map((t) => <Tag key={t}>{t}</Tag>)}
      </div>
      {project.roles.length > 0 && (
        <p className="mt-3 text-xs">
          <span className="text-muted-foreground">Looking for </span>
          <span className="font-medium">{project.roles.join(", ")}</span>
        </p>
      )}
      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {owner && <UserAvatar name={owner.name} hue={owner.hue} size={22} />}
          <span className="truncate">{owner?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <AvatarStack ids={project.members} max={3} size={22} />
          <span className="text-xs text-muted-foreground">{project.members.length}/{project.teamSize}</span>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" asChild>
          <Link to="/projects/$id" params={{ id: project.id }}>View Project</Link>
        </Button>
        {!isOwner && (
          <Button
            size="sm"
            variant={joined ? "outline" : "default"}
            className="flex-1"
            disabled={!joined && project.members.length >= project.teamSize}
            onClick={() => toast(toggleJoin(project.id) ? "Project joined." : "You left the project.")}
          >
            {joined ? <><Check className="size-4" /> Joined</> : project.members.length >= project.teamSize ? "Team full" : "Join"}
          </Button>
        )}
        {!isOwner && owner && (
          <Button size="sm" variant="ghost" aria-label="Message owner" onClick={() => message(owner.id)}>
            <MessageSquare className="size-4" />
          </Button>
        )}
      </div>
    </TiltCard>
  );
}

export function TeamCard({ team }: { team: Team }) {
  const toggle = useApp((s) => s.toggleJoinTeam);
  const project = useApp((s) => s.projects.find((p) => p.id === team.projectId));
  const joined = team.members.includes("me");
  const full = team.members.length >= team.maxSize;
  return (
    <TiltCard className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-secondary font-mono text-sm font-semibold">
            {team.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </span>
          <div>
            <Link to="/teams/$id" params={{ id: team.id }}>
              <h3 className="font-semibold tracking-tight group-hover:underline">{team.name}</h3>
            </Link>
            <p className="text-sm text-muted-foreground">{team.purpose}</p>
          </div>
        </div>
        <SaveButton kind="teams" id={team.id} />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <AvatarStack ids={team.members} max={5} />
        <span className="text-xs text-muted-foreground">{team.members.length} of {team.maxSize}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {team.skills.slice(0, 4).map((s) => <Tag key={s}>{s}</Tag>)}
      </div>
      {team.roles.length > 0 && (
        <p className="mt-3 text-xs"><span className="text-muted-foreground">Open roles </span><span className="font-medium">{team.roles.join(", ")}</span></p>
      )}
      {project && <p className="mt-1 text-xs text-muted-foreground">Working on <Link to="/projects/$id" params={{ id: project.id }} className="text-foreground underline-offset-2 hover:underline">{project.name}</Link></p>}
      <div className="mt-auto flex gap-2 pt-5">
        <Button size="sm" variant="outline" className="flex-1" asChild>
          <Link to="/teams/$id" params={{ id: team.id }}>View Team</Link>
        </Button>
        <Button
          size="sm"
          className="flex-1"
          variant={joined ? "outline" : "default"}
          disabled={!joined && full}
          onClick={() => toast(toggle(team.id) ? `You joined ${team.name}.` : `You left ${team.name}.`)}
        >
          {joined ? <><Check className="size-4" /> Member</> : full ? "Full" : "Join"}
        </Button>
      </div>
    </TiltCard>
  );
}

export function EventCard({ event }: { event: EventItem }) {
  const toggle = useApp((s) => s.toggleRegister);
  const registered = event.attendees.includes("me");
  const d = formatEventDate(event.date);
  const platformMeta = getPlatformMeta(event.sourcePlatform);
  const externalApplyUrl = event.link || event.sourceUrl;

  return (
    <TiltCard className="flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md">
      <div className="flex gap-4 p-5">
        <div className="flex w-14 shrink-0 flex-col items-center rounded-lg border py-2 bg-muted/20">
          <span className="font-mono text-[10px] tracking-widest uppercase font-semibold" style={{ color: `oklch(0.5 0.15 ${event.hue})` }}>{d.month}</span>
          <span className="text-2xl font-bold tracking-tight">{d.day}</span>
        </div>
        <div className="min-w-0 flex-1">
          {/* Platform and category badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {event.sourcePlatform && event.sourcePlatform !== "Campus" && (
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border", platformMeta.badgeClass)}>
                <span>via {platformMeta.displayName}</span>
              </span>
            )}
            {event.isFlagship && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Sparkles className="size-2.5" /> Flagship
              </span>
            )}
            {event.mode && (
              <span className="text-[10px] px-1.5 py-0.5 rounded border text-muted-foreground bg-background">
                {event.mode}
              </span>
            )}
            <div className="ml-auto">
              <SaveButton kind="events" id={event.id} />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">{event.category} · {event.organizer}</p>
          <Link to="/events/$id" params={{ id: event.id }}>
            <h3 className="mt-1 font-semibold tracking-tight text-foreground group-hover:underline line-clamp-1">{event.title}</h3>
          </Link>

          <div className="mt-2.5 space-y-1 text-sm text-muted-foreground">
            {event.prize && (
              <p className="flex items-center gap-1.5 font-semibold text-xs text-amber-600 dark:text-amber-400">
                <Trophy className="size-3.5 shrink-0" />
                <span className="truncate">{event.prize}</span>
              </p>
            )}
            {event.eligibility && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground/90">
                <GraduationCap className="size-3.5 shrink-0 text-primary" />
                <span className="truncate" title={event.eligibility}>{event.eligibility}</span>
              </p>
            )}
            {event.deadline && (
              <p className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                <Clock className="size-3.5 shrink-0" />
                <span className="truncate">{event.deadline}</span>
              </p>
            )}
            {event.externalRegistrations && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">{event.externalRegistrations}</span>
              </p>
            )}
            <p className="flex items-center gap-1.5 text-xs"><Calendar className="size-3.5 shrink-0" />{d.weekday}, {event.time}</p>
            <p className="flex items-center gap-1.5 text-xs"><MapPin className="size-3.5 shrink-0" /><span className="truncate">{event.location}</span></p>
            <p className="flex items-center gap-1.5 text-xs"><Users className="size-3.5 shrink-0" />{event.attendees.length} campus peers going</p>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t bg-muted/10 px-4 py-2.5">
        <Button size="sm" variant="ghost" className="h-8 text-xs flex-1" asChild>
          <Link to="/events/$id" params={{ id: event.id }}>Details</Link>
        </Button>
        {externalApplyUrl && (
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-primary/20 hover:border-primary" asChild>
            <a href={externalApplyUrl} target="_blank" rel="noreferrer">
              Apply <ExternalLink className="size-3" />
            </a>
          </Button>
        )}
        <Button
          size="sm"
          variant={registered ? "secondary" : "default"}
          className="h-8 text-xs flex-1"
          onClick={() => toast(toggle(event.id) ? "Event registration confirmed." : "Registration cancelled.")}
        >
          {registered ? <><Check className="size-3.5 mr-1" /> Going</> : "Attend"}
        </Button>
      </div>
    </TiltCard>
  );
}

export function useSortedPeople() {
  return useApp(useShallow((s) => s.students));
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-56 animate-pulse rounded-xl border bg-card p-5">
          <div className="flex gap-3">
            <div className="size-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
          <div className="mt-6 h-3 w-full rounded bg-muted" />
          <div className="mt-2 h-3 w-4/5 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
