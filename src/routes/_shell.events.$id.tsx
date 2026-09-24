import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Calendar, CalendarPlus, Check, Clock, MapPin, Mic } from "lucide-react";
import { useApp } from "@/lib/store";
import { formatEventDate } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AvatarStack, EmptyState, PersonLink, SaveButton, ShareButton, UserAvatar } from "@/components/cg/primitives";

export const Route = createFileRoute("/_shell/events/$id")({
  head: () => ({
    meta: [
      { title: "Event — CampusGraph" },
      { name: "description", content: "Event details, speakers, attendees and related projects." },
      { property: "og:title", content: "Event — CampusGraph" },
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

  const addToCalendar = () => {
    const start = toIcsDate(event.date, event.time);
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CampusGraph//EN", "BEGIN:VEVENT", `UID:${event.id}@campusgraph`, `DTSTART:${start}`, `SUMMARY:${event.title}`, `LOCATION:${event.location}`, `DESCRIPTION:${event.description.slice(0, 200)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
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
        <p className="font-mono text-[11px] tracking-[0.16em]" style={{ color: `oklch(0.4 0.12 ${event.hue})` }}>{event.category.toUpperCase()} · {event.organizer.toUpperCase()}</p>
        <h1 className="relative mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.035em] text-foreground sm:text-5xl">{event.title}</h1>
        <div className="relative mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/80">
          <span className="flex items-center gap-1.5"><Calendar className="size-4" /> {d.long}</span>
          <span className="flex items-center gap-1.5"><Clock className="size-4" /> {event.time}</span>
          <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {event.location}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button size="lg" variant={registered ? "outline" : "default"} onClick={() => toast(s.toggleRegister(event.id) ? "Event registration confirmed." : "Registration cancelled.")}>
          {registered ? <><Check className="size-4" /> Registered · Cancel</> : "Register"}
        </Button>
        <Button size="lg" variant="outline" onClick={addToCalendar}><CalendarPlus className="size-4" /> Add to Calendar</Button>
        <SaveButton kind="events" id={event.id} label variant="outline" size="default" />
        <ShareButton path={`/events/${event.id}`} title={event.title} label variant="outline" />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section><h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">ABOUT</h2><p className="text-[15px] leading-relaxed">{event.description}</p></section>
          <section>
            <h2 className="mb-3 font-mono text-[11px] tracking-[0.16em] text-muted-foreground">SPEAKERS</h2>
            {event.speakers.length ? <ul className="grid gap-3 sm:grid-cols-2">{event.speakers.map((sp) => (
              <li key={sp.name} className="flex items-center gap-3 rounded-xl border bg-card p-4"><span className="flex size-10 items-center justify-center rounded-full bg-secondary"><Mic className="size-4" /></span><div><p className="font-medium">{sp.name}</p><p className="text-xs text-muted-foreground">{sp.role}</p></div></li>
            ))}</ul> : <p className="text-sm text-muted-foreground">Speakers will be announced soon.</p>}
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
