import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarX, Plus } from "lucide-react";
import { z } from "zod";
import { useApp } from "@/lib/store";
import type { EventItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardGridSkeleton, EventCard } from "@/components/cg/cards";
import { EmptyState, PageHeader } from "@/components/cg/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/events/")({
  head: () => ({
    meta: [
      { title: "Events — CampusGraph" },
      { name: "description", content: "Hackathons, workshops, meetups, competitions and study sessions on campus." },
      { property: "og:title", content: "Campus events — CampusGraph" },
      { property: "og:description", content: "See what's happening and who's going." },
    ],
  }),
  component: Events,
});

const CATS = ["All", "Hackathons", "Workshops", "Meetups", "Competitions", "Seminars", "Networking", "Study"] as const;
const schema = z.object({
  title: z.string().trim().min(4, "Title is too short").max(80),
  organizer: z.string().trim().min(2, "Who's organising?").max(60),
  date: z.string().min(1, "Pick a date"),
  time: z.string().min(1, "Pick a time"),
  location: z.string().trim().min(2, "Where is it?").max(80),
  description: z.string().trim().min(10, "Add a short description").max(600),
});

function Events() {
  const events = useApp((s) => s.events);
  const addEvent = useApp((s) => s.addEvent);
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [when, setWhen] = useState<"upcoming" | "past" | "going">("upcoming");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ title: "", organizer: "", date: "", time: "", location: "", description: "", category: "Meetups" as EventItem["category"] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => { const t = setTimeout(() => setLoading(false), 250); return () => clearTimeout(t); }, []);

  const today = new Date().toISOString().slice(0, 10);
  const list = events
    .filter((e) => cat === "All" || e.category === cat)
    .filter((e) => (when === "upcoming" ? e.date >= today : when === "past" ? e.date < today : e.attendees.includes("me")))
    .filter((e) => !q || [e.title, e.organizer, e.location].join(" ").toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (when === "past" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));

  const create = () => {
    const r = schema.safeParse(f);
    if (!r.success) return setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
    const [h, m] = f.time.split(":").map(Number);
    addEvent({
      id: `e${Date.now().toString(36)}`, ...r.data, category: f.category,
      time: `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`,
      speakers: [], attendees: ["me"], capacity: 100, relatedProjects: [], hue: 220,
    });
    toast.success("Event created. You're registered as the host.");
    setOpen(false);
    setF({ title: "", organizer: "", date: "", time: "", location: "", description: "", category: "Meetups" });
    setErrors({});
  };

  return (
    <>
      <PageHeader eyebrow="Events" title="What's on around campus." description="Every club, one calendar. See who's going before you go." actions={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> Host an event</Button>} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events, organisers, places…" className="h-10 flex-1" aria-label="Search events" />
        <div className="flex rounded-lg border bg-card p-0.5" role="tablist">
          {(["upcoming", "going", "past"] as const).map((w) => <button key={w} role="tab" aria-selected={when === w} onClick={() => setWhen(w)} className={cn("rounded-md px-3 py-1.5 text-sm capitalize", when === w ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>{w === "going" ? "I'm going" : w}</button>)}
        </div>
      </div>
      <div className="mt-5 flex gap-1 overflow-x-auto border-b scrollbar-none" role="tablist">
        {CATS.map((c) => <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={cn("-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm", cat === c ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground")}>{c}</button>)}
      </div>
      <div className="mt-6">
        {loading ? <CardGridSkeleton /> : list.length === 0 ? <EmptyState icon={<CalendarX className="size-8" />} title="No events here" description={when === "going" ? "Register for an event and it'll show up here." : "Try another category."} /> : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map((e) => <EventCard key={e.id} event={e} />)}</div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>Host an event</DialogTitle><DialogDescription>It'll appear in Events for everyone on campus.</DialogDescription></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {([["title", "Title", "sm:col-span-2"], ["organizer", "Organiser", ""], ["location", "Location", ""], ["date", "Date", ""], ["time", "Time", ""]] as const).map(([k, l, c]) => (
              <div key={k} className={cn("space-y-1.5", c)}><Label htmlFor={`ev-${k}`}>{l}</Label><Input id={`ev-${k}`} type={k === "date" ? "date" : k === "time" ? "time" : "text"} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!errors[k]} />{errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}</div>
            ))}
            <div className="space-y-1.5 sm:col-span-2"><Label>Category</Label><Select value={f.category} onValueChange={(v) => setF({ ...f, category: v as EventItem["category"] })}><SelectTrigger aria-label="Category"><SelectValue /></SelectTrigger><SelectContent>{CATS.slice(1).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="ev-desc">Description</Label><Textarea id="ev-desc" rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} aria-invalid={!!errors.description} />{errors.description && <p className="text-xs text-destructive">{errors.description}</p>}</div>
          </div>
          <div className="flex justify-end gap-2 border-t pt-4"><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create}>Create event</Button></div>
        </DialogContent>
      </Dialog>
    </>
  );
}
