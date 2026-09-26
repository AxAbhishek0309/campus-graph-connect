import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Calendar, CalendarPlus, Check, Clock, ExternalLink, GraduationCap, MapPin, Mic, Sparkles, Tag as TagIcon, Trophy } from "lucide-react";
import { useApp } from "@/lib/store";
import { formatEventDate } from "@/lib/helpers";
import { getPlatformMeta } from "@/lib/openrouter-events";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AvatarStack, EmptyState, PersonLink, SaveButton, ShareButton, Tag, UserAvatar } from "@/components/cg/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/events/$id")({
  head: () => ({
    meta: [
      { title: "Event — Tribe" },
      { name: "description", content: "Event details, speakers, attendees and related projects." },
      { property: "og:title", content: "Event — Tribe" },
      { property: "og:description", content: "See who's going and register." },
    ],
  }),
  component: EventDetail,
});

function toIcsDate(date: string, time: string) {
  const [t, ap] = time.split(" ");
  let [h, m] = t.split(":").map(Number);
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return `${date.replace(/-/g, "")}T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`;
}

function EventDetail() {
  const { id } = Route.useParams();
  const s = useApp();
  const event = s.events.find((e) => e.id === id);
  if (!event) return <EmptyState title="Event not found" action={<Button asChild><Link to="/events">All events</Link></Button>} />;
  const d = formatEventDate(event.date);
  const registered = event.attendees.includes("me");
  const attendees = event.attendees.map((a) => (a === "me" ? s.me : s.students.find((x) => x.id === a))).filter(Boolean);
  const projects = s.projects.filter((p) => event.relatedProjects.includes(p.id));
  const platformMeta = getPlatformMeta(event.sourcePlatform);
  const applyUrl = event.link || event.sourceUrl;

  const addToCalendar = () => {
    const start = toIcsDate(event.date, event.time);
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tribe//EN", "BEGIN:VEVENT", `UID:${event.id}@tribe`, `DTSTART:${start}`, `SUMMARY:${event.title}`, `LOCATION:${event.location}`, `DESCRIPTION:${event.description.slice(0, 200)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/\W+/g, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Calendar file downloaded.");
  };

  return (
    <>
      <Link to="/events" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Events</Link>
      <div className="relative overflow-hidden rounded-2xl border p-8 sm:p-12" style={{ background: `linear-gradient(135deg, oklch(0.97 0.02 ${event.hue}), oklch(0.93 0.05 ${event.hue}))` }}>
        <svg className="absolute -right-10 -bottom-10 size-72 opacity-30" viewBox="0 0 200 200" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => <circle key={i} cx="100" cy="100" r={20 + i * 16} fill="none" stroke={`oklch(0.5 0.12 ${event.hue})`} strokeWidth="0.8" />)}
        </svg>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-[11px] tracking-[0.16em]" style={{ color: `oklch(0.4 0.12 ${event.hue})` }}>{event.category.toUpperCase()} · {event.organizer.toUpperCase()}</p>
          {event.sourcePlatform && event.sourcePlatform !== "Campus" && (
            <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-background/80", platformMeta.textClass, platformMeta.borderClass)}>
              Sourced via {platformMeta.displayName}
            </span>
          )}
          {event.isFlagship && (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <Sparkles className="size-3" /> Flagship Competition
            </span>
          )}
          {event.mode && <span className="rounded-md border bg-background/50 px-2 py-0.5 text-[11px] font-medium text-foreground">{event.mode}</span>}
        </div>

        <h1 className="relative mt-4 max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{event.title}</h1>

        <div className="relative mt-4 flex flex-wrap items-center gap-3">
          {event.prize && (
            <div className="inline-flex items-center gap-2 rounded-lg bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 text-sm font-bold text-amber-800 dark:text-amber-300">
              <Trophy className="size-4 shrink-0" />
              <span>Prize Pool: {event.prize}</span>
            </div>
          )}
          {event.externalRegistrations && (
            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{event.externalRegistrations}</span>
            </div>
          )}
          {event.deadline && (
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <Clock className="size-3.5" />
              <span>Deadline: {event.deadline}</span>
            </div>
          )}
        </div>

        <div className="relative mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/80">
          <span className="flex items-center gap-1.5"><Calendar className="size-4" /> {d.long}</span>
          <span className="flex items-center gap-1.5"><Clock className="size-4" /> {event.time}</span>
          <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {event.location}</span>
        </div>
      </div>

      {/* Sourced Platform Attribution Banner */}
      {event.sourcePlatform && event.sourcePlatform !== "Campus" && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/60 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className={cn("flex size-9 items-center justify-center rounded-lg font-bold text-xs uppercase", platformMeta.badgeClass)}>
              {event.sourcePlatform.slice(0, 2)}
            </span>
            <div>
              <p className="text-sm font-semibold">
                Event hosted on <a href={platformMeta.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-primary">{platformMeta.displayName}</a>
              </p>
              <p className="text-xs text-muted-foreground">
                All intellectual property, registration telemetry, and prize distributions are handled by {platformMeta.displayName}.
              </p>
            </div>
          </div>
          {applyUrl && (
            <Button size="sm" asChild className="gap-1.5">
              <a href={applyUrl} target="_blank" rel="noreferrer">
                Open on {platformMeta.displayName} <ExternalLink className="size-3.5" />
              </a>
            </Button>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {applyUrl && (
          <Button size="lg" asChild className="font-semibold">
            <a href={applyUrl} target="_blank" rel="noreferrer">
              Apply on {platformMeta.displayName} <ExternalLink className="size-4 ml-1.5" />
            </a>
          </Button>
        )}
        <Button size="lg" variant={registered ? "outline" : "secondary"} onClick={() => toast(s.toggleRegister(event.id) ? "Event registration confirmed on Tribe." : "Registration cancelled.")}>
          {registered ? <><Check className="size-4 mr-1.5" /> Registered on Tribe</> : "Attend with Peers"}
        </Button>
        <Button size="lg" variant="outline" onClick={addToCalendar}><CalendarPlus className="size-4" /> Add to Calendar</Button>
        <SaveButton kind="events" id={event.id} label variant="outline" size="default" />
        <ShareButton path={`/events/${event.id}`} title={event.title} label variant="outline" />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Eligibility Card */}
          {event.eligibility && (
            <section className="rounded-xl border bg-card p-5">
              <h2 className="mb-2 flex items-center gap-2 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                <GraduationCap className="size-4 text-primary" /> Real-World Eligibility
              </h2>
              <p className="text-sm font-medium text-foreground">{event.eligibility}</p>
            </section>
          )}

          <section>
            <h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">About this challenge</h2>
            <p className="text-[15px] leading-relaxed text-foreground/90">{event.description}</p>
          </section>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <section>
              <h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Tracks & Focus Areas</h2>
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">SPEAKERS & JUDGES</h2>
            {event.speakers.length ? <ul className="grid gap-3 sm:grid-cols-2">{event.speakers.map((sp) => (
              <li key={sp.name} className="flex items-center gap-3 rounded-xl border bg-card p-4"><span className="flex size-10 items-center justify-center rounded-full bg-secondary"><Mic className="size-4" /></span><div><p className="font-medium">{sp.name}</p><p className="text-xs text-muted-foreground">{sp.role}</p></div></li>
            ))}</ul> : <p className="text-sm text-muted-foreground">Speakers and judges will be announced soon.</p>}
          </section>
          <section>
            <h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">RELATED PROJECTS</h2>
            {projects.length ? <ul className="divide-y rounded-xl border bg-card">{projects.map((p) => <li key={p.id}><Link to="/projects/$id" params={{ id: p.id }} className="block p-4 hover:bg-accent/50"><p className="font-medium">{p.name}</p><p className="truncate text-sm text-muted-foreground">{p.description}</p></Link></li>)}</ul> : <p className="text-sm text-muted-foreground">No related projects.</p>}
          </section>
        </div>
        <aside>
          <h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">ATTENDEES · {attendees.length}</h2>
          <div className="rounded-xl border bg-card p-4">
            <AvatarStack ids={event.attendees} max={7} size={30} />
            <Progress value={(attendees.length / event.capacity) * 100} className="mt-4 h-1.5" />
            <p className="mt-2 text-xs text-muted-foreground">{event.capacity - attendees.length} of {event.capacity} spots left</p>
            <ul className="mt-4 space-y-2.5 border-t pt-4">
              {attendees.slice(0, 10).map((a) => <li key={a!.id}><PersonLink id={a!.id} className="flex items-center gap-2 text-sm hover:underline"><UserAvatar name={a!.name} hue={a!.hue} size={24} />{a!.name}{a!.id === "me" && " (you)"}</PersonLink></li>)}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
