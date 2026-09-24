import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FolderGit2, SlidersHorizontal, Users, X } from "lucide-react";
import { useApp } from "@/lib/store";
import { matchScore } from "@/lib/helpers";
import { BRANCHES, COLLEGES, INTERESTS, LOOKING_FOR, SKILLS } from "@/lib/data";
import type { LookingFor, Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CardGridSkeleton, PersonCard } from "./cards";
import { EmptyState, Tag } from "./primitives";
import { cn } from "@/lib/utils";

export const CATEGORIES: { key: string; label: string; test: (s: Student) => boolean }[] = [
  { key: "for-you", label: "For You", test: () => true },
  { key: "coding", label: "Coding", test: (s) => s.lookingFor.includes("Coding Partner") },
  { key: "hackathons", label: "Hackathons", test: (s) => s.lookingFor.includes("Hackathon Partner") || s.interests.includes("Hackathons") },
  { key: "research", label: "Research", test: (s) => s.lookingFor.includes("Research Partner") || s.interests.includes("Research") },
  { key: "study", label: "Study", test: (s) => s.lookingFor.includes("Study Partner") },
  { key: "mentors", label: "Mentors", test: (s) => !!s.mentor || s.year >= 4 },
  { key: "career", label: "Career", test: (s) => s.lookingFor.includes("Career Peer") || s.experience.length > 0 },
  { key: "friends", label: "Friends", test: (s) => s.lookingFor.includes("Friends") },
];

type Filters = { college: string; branch: string; year: string; skill: string; interest: string; looking: string; activity: string; availability: string };
const EMPTY: Filters = { college: "", branch: "", year: "", skill: "", interest: "", looking: "", activity: "", availability: "" };

export function PeopleBrowser({ initialCategory = "for-you", initialQuery = "", lockCategory = false }: { initialCategory?: string; initialQuery?: string; lockCategory?: boolean }) {
  const students = useApp((s) => s.students);
  const projects = useApp((s) => s.projects);
  const teams = useApp((s) => s.teams);
  const me = useApp((s) => s.me);
  const [cat, setCat] = useState(initialCategory);
  const [q, setQ] = useState(initialQuery);
  const [sort, setSort] = useState("recommended");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [sheet, setSheet] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setQ(initialQuery); }, [initialQuery]);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 280);
    return () => clearTimeout(t);
  }, [cat]);

  const term = q.trim().toLowerCase();
  const results = useMemo(() => {
    const category = CATEGORIES.find((c) => c.key === cat) ?? CATEGORIES[0];
    const list = students.filter((s) => {
      if (!category.test(s)) return false;
      if (term) {
        const projectHit = projects.some((p) => p.members.includes(s.id) && p.name.toLowerCase().includes(term));
        const hay = [s.name, s.college, s.branch, s.bio, ...s.skills, ...s.interests].join(" ").toLowerCase();
        if (!hay.includes(term) && !projectHit) return false;
      }
      if (filters.college && s.college !== filters.college) return false;
      if (filters.branch && s.branch !== filters.branch) return false;
      if (filters.year && String(s.year) !== filters.year) return false;
      if (filters.skill && !s.skills.includes(filters.skill)) return false;
      if (filters.interest && !s.interests.includes(filters.interest)) return false;
      if (filters.looking && !s.lookingFor.includes(filters.looking as LookingFor)) return false;
      if (filters.activity && s.activity !== filters.activity) return false;
      if (filters.availability && s.availability !== filters.availability) return false;
      return true;
    });
    const sorters: Record<string, (a: Student, b: Student) => number> = {
      recommended: (a, b) => matchScore(me, b) - matchScore(me, a),
      recent: (a, b) => a.lastActiveMins - b.lastActiveMins,
      newest: (a, b) => a.joinedDaysAgo - b.joinedDaysAgo,
      connections: (a, b) => b.connections - a.connections,
    };
    return [...list].sort(sorters[sort]);
  }, [students, projects, cat, term, filters, sort, me]);

  const relatedProjects = term ? projects.filter((p) => p.status === "published" && [p.name, p.description, ...p.tech, ...p.roles].join(" ").toLowerCase().includes(term)) : [];
  const relatedTeams = term ? teams.filter((t) => [t.name, t.purpose, ...t.skills, ...t.roles].join(" ").toLowerCase().includes(term)) : [];
  const activeFilters = Object.entries(filters).filter(([, v]) => v);

  const FilterFields = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <FilterSelect label="College" value={filters.college} options={COLLEGES} onChange={(v) => setFilters({ ...filters, college: v })} />
      <FilterSelect label="Branch" value={filters.branch} options={BRANCHES} onChange={(v) => setFilters({ ...filters, branch: v })} />
      <FilterSelect label="Year" value={filters.year} options={["1", "2", "3", "4"]} render={(v) => `Year ${v}`} onChange={(v) => setFilters({ ...filters, year: v })} />
      <FilterSelect label="Skills" value={filters.skill} options={SKILLS} onChange={(v) => setFilters({ ...filters, skill: v })} />
      <FilterSelect label="Interests" value={filters.interest} options={INTERESTS} onChange={(v) => setFilters({ ...filters, interest: v })} />
      <FilterSelect label="Looking for" value={filters.looking} options={LOOKING_FOR} onChange={(v) => setFilters({ ...filters, looking: v })} />
      <FilterSelect label="Activity" value={filters.activity} options={["high", "medium", "low", "new"]} render={(v) => ({ high: "Very active", medium: "Active", low: "Occasional", new: "New here" })[v] ?? v} onChange={(v) => setFilters({ ...filters, activity: v })} />
      <FilterSelect label="Availability" value={filters.availability} options={["Available", "Open to chat", "Busy"]} onChange={(v) => setFilters({ ...filters, availability: v })} />
    </div>
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, skill, college, project, interest…" className="h-10 flex-1" aria-label="Search people" />
        <div className="flex gap-2">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-10 w-full sm:w-48" aria-label="Sort"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="recent">Recently Active</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="connections">Most Connections</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-10" onClick={() => setSheet(true)}>
            <SlidersHorizontal className="size-4" /> Filters{activeFilters.length > 0 && <span className="rounded bg-foreground px-1.5 text-[11px] text-background">{activeFilters.length}</span>}
          </Button>
        </div>
      </div>

      {!lockCategory && (
        <div className="mt-5 flex gap-1 overflow-x-auto border-b scrollbar-none" role="tablist">
          {CATEGORIES.map((c) => (
            <button key={c.key} role="tab" aria-selected={cat === c.key} onClick={() => setCat(c.key)}
              className={cn("-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm transition-colors", cat === c.key ? "border-foreground font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {c.label}
            </button>
          ))}
        </div>
      )}

      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeFilters.map(([k, v]) => (
            <button key={k} onClick={() => setFilters({ ...filters, [k]: "" })} className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-1 text-xs hover:bg-accent">
              {v} <X className="size-3" />
            </button>
          ))}
          <button className="text-xs text-muted-foreground underline-offset-2 hover:underline" onClick={() => setFilters(EMPTY)}>Clear all</button>
        </div>
      )}

      {term && (relatedProjects.length > 0 || relatedTeams.length > 0) && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {relatedProjects.length > 0 && (
            <div className="rounded-xl border bg-card p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium"><FolderGit2 className="size-4" /> Projects needing “{q}” <span className="text-muted-foreground">{relatedProjects.length}</span></p>
              <ul className="space-y-2">{relatedProjects.slice(0, 3).map((p) => (
                <li key={p.id}><Link to="/projects/$id" params={{ id: p.id }} className="flex items-center justify-between text-sm hover:underline"><span>{p.name}</span><span className="text-xs text-muted-foreground">{p.tech.slice(0, 2).join(", ")}</span></Link></li>
              ))}</ul>
            </div>
          )}
          {relatedTeams.length > 0 && (
            <div className="rounded-xl border bg-card p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium"><Users className="size-4" /> Teams with “{q}” <span className="text-muted-foreground">{relatedTeams.length}</span></p>
              <ul className="space-y-2">{relatedTeams.slice(0, 3).map((t) => (
                <li key={t.id}><Link to="/teams/$id" params={{ id: t.id }} className="flex items-center justify-between text-sm hover:underline"><span>{t.name}</span><span className="text-xs text-muted-foreground">{t.purpose}</span></Link></li>
              ))}</ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <p><span className="font-medium text-foreground tabular-nums">{results.length}</span> {results.length === 1 ? "person" : "people"}{term && <> matching “{q}”</>}</p>
      </div>

      {loading ? (
        <CardGridSkeleton />
      ) : results.length === 0 ? (
        <EmptyState icon={<Users className="size-8" />} title="No one matches yet" description="Try removing a filter or searching for a broader skill." action={<Button variant="outline" onClick={() => { setFilters(EMPTY); setQ(""); }}>Reset search</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((s) => <PersonCard key={s.id} person={s} />)}
        </div>
      )}

      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
          <div className="px-4 [&_.grid]:grid-cols-1">{FilterFields}</div>
          <div className="mt-6 flex gap-2 px-4 pb-6">
            <Button variant="outline" className="flex-1" onClick={() => setFilters(EMPTY)}>Clear</Button>
            <Button className="flex-1" onClick={() => setSheet(false)}>Show {results.length} people</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange, render }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void; render?: (v: string) => string }) {
  return (
    <label className="space-y-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Select value={value || "__any"} onValueChange={(v) => onChange(v === "__any" ? "" : v)}>
        <SelectTrigger aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__any">Any</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{render ? render(o) : o}</SelectItem>)}
        </SelectContent>
      </Select>
    </label>
  );
}

export { Tag };
