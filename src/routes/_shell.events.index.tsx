import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Calendar,
  CalendarX,
  Check,
  Clock,
  ExternalLink,
  Flame,
  GraduationCap,
  Key,
  Loader2,
  MapPin,
  Plus,
  Radio,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { z } from "zod";
import { useApp } from "@/lib/store";
import type { EventItem, EventPlatform } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardGridSkeleton, EventCard } from "@/components/cg/cards";
import { EmptyState, PageHeader } from "@/components/cg/primitives";
import { TiltCard } from "@/components/cg/effects";
import { formatEventDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { fetchLiveEventsFromOpenRouter, getPlatformMeta, PLATFORM_REGISTRY, syncEventsToTribe } from "@/lib/openrouter-events";

export const Route = createFileRoute("/_shell/events/")({
  head: () => ({
    meta: [
      { title: "Flagship Competitions & Events — Tribe" },
      { name: "description", content: "Top 3 spotlight challenges from Unstop, Grad Partners, and Wellfound, plus multi-platform explorer and live AI scout." },
      { property: "og:title", content: "Flagship Competitions — Tribe" },
      { property: "og:description", content: "Real-time registered counts, verified eligibility, prize money, and direct applications." },
    ],
  }),
  component: Events,
});

const CATS = ["All", "Hackathons", "Hiring Challenges", "Competitions", "Workshops", "Seminars"] as const;

const PLATFORM_FILTERS = [
  "All Platforms",
  "Unstop",
  "Grad Partners",
  "Wellfound",
  "Naukri Campus",
  "Indeed",
  "Devfolio",
] as const;

const ALL_SCOUT_PLATFORMS: EventPlatform[] = [
  "Unstop",
  "Grad Partners",
  "Wellfound",
  "Naukri Campus",
  "Indeed",
  "Devfolio",
];

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
  const toggleRegister = useApp((s) => s.toggleRegister);

  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [platformFilter, setPlatformFilter] = useState<(typeof PLATFORM_FILTERS)[number]>("All Platforms");
  const [when, setWhen] = useState<"upcoming" | "past" | "going">("upcoming");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // OpenRouter & AI Discovery State
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [customQuery, setCustomQuery] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<EventPlatform[]>(ALL_SCOUT_PLATFORMS);
  const [apiKey, setApiKey] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("tribe_openrouter_api_key") || "" : ""));

  const [f, setF] = useState({ title: "", organizer: "", date: "", time: "", location: "", description: "", category: "Meetups" as EventItem["category"] });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  // Filter out any mock/internal non-platform events: every event must belong to a real verified platform
  const verifiedEvents = events.filter((e) => e.sourcePlatform && e.sourcePlatform !== "Campus");

  // Top 3 Spotlight: pick 3 flagship events from 3 different sources (e.g. Unstop, Grad Partners, Wellfound)
  const top1Unstop = verifiedEvents.find((e) => e.sourcePlatform === "Unstop" && e.isFlagship) || verifiedEvents.find((e) => e.sourcePlatform === "Unstop");
  const top2Grad = verifiedEvents.find((e) => e.sourcePlatform === "Grad Partners" && e.isFlagship) || verifiedEvents.find((e) => e.sourcePlatform === "Grad Partners");
  const top3Wellfound = verifiedEvents.find((e) => e.sourcePlatform === "Wellfound" && e.isFlagship) || verifiedEvents.find((e) => e.sourcePlatform === "Devfolio" || e.sourcePlatform === "Naukri Campus");

  const top3Spotlight = [top1Unstop, top2Grad, top3Wellfound].filter((x): x is EventItem => Boolean(x));

  // Explorer list
  const list = verifiedEvents
    .filter((e) => cat === "All" || e.category === cat)
    .filter((e) => {
      if (platformFilter === "All Platforms") return true;
      return e.sourcePlatform === platformFilter;
    })
    .filter((e) => (when === "upcoming" ? e.date >= today : when === "past" ? e.date < today : e.attendees.includes("me")))
    .filter((e) => !q || [e.title, e.organizer, e.location, e.eligibility, e.sourcePlatform, e.prize, e.tags?.join(" ")].filter(Boolean).join(" ").toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (when === "past" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));

  const create = () => {
    const r = schema.safeParse(f);
    if (!r.success) return setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
    const [h, m] = f.time.split(":").map(Number);
    addEvent({
      id: `e${Date.now().toString(36)}`,
      ...r.data,
      category: f.category,
      time: `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`,
      speakers: [],
      attendees: ["me"],
      capacity: 100,
      relatedProjects: [],
      hue: 220,
      sourcePlatform: "Other",
      mode: "In-person",
    });
    toast.success("Event created successfully.");
    setOpen(false);
    setF({ title: "", organizer: "", date: "", time: "", location: "", description: "", category: "Meetups" });
    setErrors({});
  };

  const togglePlatformSelection = (p: EventPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? (prev.length > 1 ? prev.filter((x) => x !== p) : prev) : [...prev, p]
    );
  };

  const handleDiscoverEvents = async () => {
    setAiLoading(true);
    try {
      if (apiKey.trim()) {
        localStorage.setItem("tribe_openrouter_api_key", apiKey.trim());
      }
      const res = await fetchLiveEventsFromOpenRouter({
        apiKey: apiKey.trim() || undefined,
        platforms: selectedPlatforms,
        query: customQuery.trim() || undefined,
      });

      const added = await syncEventsToTribe(res.events);
      if (added > 0) {
        toast.success(`Synced ${added} new flagship challenges from ${res.source === "openrouter" ? "OpenRouter AI Scout" : "verified platform pool"}!`);
      } else {
        toast.info("All flagship challenges are already synchronized to your calendar.");
      }
      setAiOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to scout events");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Flagship Opportunities & Competitions"
        title="Live Competitions & Hiring Leagues."
        description="Top 3 flagship spotlights from Unstop, Grad Partners, and Wellfound with verified real-time registered counts, eligibility, prizes, and external application links."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="gap-1.5 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-medium"
              onClick={() => setAiOpen(true)}
            >
              <Sparkles className="size-4" /> Discover with OpenRouter AI
            </Button>
            <Button onClick={() => setOpen(true)} variant="secondary" className="gap-1.5">
              <Plus className="size-4" /> Host an Event
            </Button>
          </div>
        }
      />

      {/* Sourcing Bar with Real-Time Data Guarantee */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/60 p-3.5 text-xs text-muted-foreground backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">Verified Sources:</span>
          {ALL_SCOUT_PLATFORMS.map((p) => {
            const meta = getPlatformMeta(p);
            return (
              <a
                key={p}
                href={meta.url}
                target="_blank"
                rel="noreferrer"
                className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium transition-colors hover:opacity-80", meta.badgeClass)}
              >
                {meta.displayName}
                <ExternalLink className="size-2.5 opacity-60" />
              </a>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
          <Radio className="size-3 animate-pulse" />
          <span>Real-time platform registrations & verified criteria</span>
        </div>
      </div>

      {/* SECTION 1: TOP 3 FLAGSHIP SPOTLIGHT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs">
                ★
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Top 3 Flagship Highlights
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Hand-picked, high-reward collegiate challenges from 3 distinct platforms with active registrations.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Registrations Active
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {top3Spotlight.map((event, idx) => {
            const meta = getPlatformMeta(event.sourcePlatform);
            const d = formatEventDate(event.date);
            const isGoing = event.attendees.includes("me");

            return (
              <TiltCard
                key={event.id}
                className="relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg"
                style={{
                  background: `linear-gradient(145deg, oklch(0.98 0.015 ${event.hue}), oklch(0.95 0.035 ${event.hue}))`,
                }}
              >
                {/* Ranking badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1 font-mono text-xs font-bold text-muted-foreground">
                  <span className="rounded-full bg-background/80 px-2 py-0.5 border shadow-xs">
                    #{idx + 1} SPOTLIGHT
                  </span>
                </div>

                <div>
                  {/* Source platform tag */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-background/90", meta.badgeClass)}>
                      via {meta.displayName}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {event.category}
                    </span>
                  </div>

                  <Link to="/events/$id" params={{ id: event.id }}>
                    <h3 className="text-lg font-bold tracking-tight text-foreground hover:underline line-clamp-2">
                      {event.title}
                    </h3>
                  </Link>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Organized by <span className="font-semibold text-foreground">{event.organizer}</span>
                  </p>

                  {/* Real-time telemetry pills */}
                  <div className="mt-4 space-y-2">
                    {event.externalRegistrations && (
                      <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <Flame className="size-3.5 shrink-0 text-emerald-600" />
                        <span className="truncate">{event.externalRegistrations}</span>
                      </div>
                    )}

                    {event.prize && (
                      <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
                        <Trophy className="size-3.5 shrink-0 text-amber-600" />
                        <span className="truncate">{event.prize}</span>
                      </div>
                    )}
                  </div>

                  {/* Eligibility and Date */}
                  <div className="mt-4 space-y-1.5 text-xs text-muted-foreground border-t pt-3">
                    {event.eligibility && (
                      <p className="flex items-start gap-1.5 font-medium text-foreground/90">
                        <GraduationCap className="size-3.5 shrink-0 text-primary mt-0.5" />
                        <span className="line-clamp-2">{event.eligibility}</span>
                      </p>
                    )}
                    {event.deadline && (
                      <p className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                        <Clock className="size-3.5 shrink-0" />
                        <span>Deadline: {event.deadline}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 shrink-0" />
                      <span>{d.long} · {event.mode || "Hybrid"}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users className="size-3.5 shrink-0" />
                      <span>{event.attendees.length} campus peers registered</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center gap-2 border-t pt-3">
                  {event.link && (
                    <Button size="sm" asChild className="flex-1 font-semibold text-xs h-9">
                      <a href={event.link} target="_blank" rel="noreferrer">
                        Apply on {meta.displayName} <ExternalLink className="size-3.5 ml-1" />
                      </a>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant={isGoing ? "secondary" : "outline"}
                    className="h-9 text-xs"
                    onClick={() => toast(toggleRegister(event.id) ? "Registered on Tribe calendar." : "Removed from Tribe schedule.")}
                  >
                    {isGoing ? <Check className="size-3.5 mr-1" /> : null}
                    {isGoing ? "Going" : "Attend"}
                  </Button>
                  <Button size="sm" variant="ghost" asChild className="h-9 px-2 text-xs">
                    <Link to="/events/$id" params={{ id: event.id }}>
                      Details
                    </Link>
                  </Button>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: ADDITIONAL EXPLORE FEATURE */}
      <section className="space-y-5 border-t pt-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Explore All Flagship Opportunities
            </h2>
            <p className="text-xs text-muted-foreground">
              Filter by source platform, category, domain, or explore with AI discovery.
            </p>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Showing <strong className="text-foreground">{list.length}</strong> active challenges
          </span>
        </div>

        {/* Search & Temporal Filter */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by challenge name, company, eligibility, or prize money…"
            className="h-10 flex-1"
            aria-label="Search events"
          />
          <div className="flex rounded-lg border bg-card p-0.5 shrink-0" role="tablist">
            {(["upcoming", "going", "past"] as const).map((w) => (
              <button
                key={w}
                role="tab"
                aria-selected={when === w}
                onClick={() => setWhen(w)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm capitalize transition-colors",
                  when === w ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {w === "going" ? "I'm going" : w}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b scrollbar-none" role="tablist">
          {CATS.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={cn(
                "-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm transition-colors",
                cat === c ? "border-foreground font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Platform Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-muted-foreground font-medium shrink-0 mr-1">Platform Source:</span>
          {PLATFORM_FILTERS.map((p) => {
            const isSelected = platformFilter === p;
            return (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-all shrink-0 border",
                  isSelected
                    ? "bg-foreground text-background border-foreground shadow-sm"
                    : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/70 hover:text-foreground"
                )}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Grid of All Verified Events */}
        <div>
          {loading ? (
            <CardGridSkeleton />
          ) : list.length === 0 ? (
            <EmptyState
              icon={<CalendarX className="size-8" />}
              title="No events matching criteria"
              description="Try adjusting your platform filter, searching for different keywords, or discover new live events via AI."
              action={
                <Button variant="outline" onClick={() => setAiOpen(true)}>
                  <Sparkles className="size-4 mr-1.5" /> Scout with OpenRouter AI
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {list.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Discovery & OpenRouter Dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> Scout Flagship Events with AI
            </DialogTitle>
            <DialogDescription>
              Query OpenRouter LLMs to fetch genuine active challenges from Unstop, Grad Partners, Wellfound, Naukri, Indeed, and Devfolio.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Target Platforms</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {ALL_SCOUT_PLATFORMS.map((p) => {
                  const active = selectedPlatforms.includes(p);
                  const meta = getPlatformMeta(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatformSelection(p)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
                        active
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {active && <Check className="size-3 text-primary" />}
                      <span>{meta.displayName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="custom-query">Focus Area / Query (Optional)</Label>
              <Input
                id="custom-query"
                placeholder="e.g. AI & Robotics Hackathons, Case Competitions 2026, Graduate SWE"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Leave blank to discover all upcoming flagship challenges across tech and business tracks.
              </p>
            </div>

            <div className="space-y-1.5 rounded-lg border bg-muted/20 p-3">
              <Label htmlFor="openrouter-key" className="flex items-center gap-1.5 text-xs font-medium">
                <Key className="size-3.5 text-primary" /> OpenRouter API Key (Optional)
              </Label>
              <Input
                id="openrouter-key"
                type="password"
                placeholder="sk-or-v1-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                If omitted, Tribe will automatically sync from our curated real-time platform index. With a key, it executes live LLM-based web exploration.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="ghost" onClick={() => setAiOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDiscoverEvents} disabled={aiLoading} className="gap-2">
              {aiLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Scouting Live Events…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Fetch & Sync Events
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Host Campus Event Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Host an event</DialogTitle>
            <DialogDescription>It'll appear in Events for everyone on campus.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {([["title", "Title", "sm:col-span-2"], ["organizer", "Organiser", ""], ["location", "Location", ""], ["date", "Date", ""], ["time", "Time", ""]] as const).map(([k, l, c]) => (
              <div key={k} className={cn("space-y-1.5", c)}>
                <Label htmlFor={`ev-${k}`}>{l}</Label>
                <Input
                  id={`ev-${k}`}
                  type={k === "date" ? "date" : k === "time" ? "time" : "text"}
                  value={(f as any)[k]}
                  onChange={(e) => setF({ ...f, [k]: e.target.value })}
                  aria-invalid={!!errors[k]}
                />
                {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
              </div>
            ))}
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Category</Label>
              <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v as EventItem["category"] })}>
                <SelectTrigger aria-label="Category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATS.slice(1).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ev-desc">Description</Label>
              <Textarea
                id="ev-desc"
                rows={3}
                value={f.description}
                onChange={(e) => setF({ ...f, description: e.target.value })}
                aria-invalid={!!errors.description}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={create}>Create event</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
