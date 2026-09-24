import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, FolderGit2, User, Users } from "lucide-react";
import { useApp } from "@/lib/store";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { UserAvatar } from "./primitives";

export function searchAll(q: string, s: ReturnType<typeof useApp.getState>) {
  const t = q.trim().toLowerCase();
  if (!t) return { people: [], projects: [], teams: [], events: [] };
  const has = (...f: (string | undefined)[]) => f.some((x) => x?.toLowerCase().includes(t));
  return {
    people: s.students.filter((p) =>
      has(p.name, p.college, p.branch, p.bio, ...p.skills, ...p.interests) ||
      s.projects.some((pr) => pr.members.includes(p.id) && has(pr.name)),
    ),
    projects: s.projects.filter((p) => p.status === "published" && has(p.name, p.description, p.category, ...p.tech, ...p.roles)),
    teams: s.teams.filter((p) => has(p.name, p.purpose, ...p.skills, ...p.roles)),
    events: s.events.filter((e) => has(e.title, e.organizer, e.category, e.location)),
  };
}

export function CommandSearch({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const state = useApp();
  const navigate = useNavigate();
  const results = useMemo(() => searchAll(q, state), [q, state]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const go = (fn: () => void) => {
    if (q.trim()) state.addRecentSearch(q.trim());
    setOpen(false);
    setQ("");
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search people, projects, teams, events…" value={q} onValueChange={setQ} />
      <CommandList className="max-h-[420px]">
        {!q && (
          <CommandGroup heading="Recent searches">
            {state.recentSearches.map((r) => (
              <CommandItem key={r} value={`recent ${r}`} onSelect={() => setQ(r)}>
                <Clock className="size-4 text-muted-foreground" /> {r}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {q && <CommandEmpty>No results for “{q}”.</CommandEmpty>}
        {results.people.length > 0 && (
          <CommandGroup heading="People">
            {results.people.slice(0, 5).map((p) => (
              <CommandItem key={p.id} value={`person ${p.id} ${p.name}`} onSelect={() => go(() => navigate({ to: "/people/$id", params: { id: p.id } }))}>
                <UserAvatar name={p.name} hue={p.hue} size={24} />
                <span>{p.name}</span>
                <span className="ml-auto truncate text-xs text-muted-foreground">{p.branch}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {results.projects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Projects">
              {results.projects.slice(0, 4).map((p) => (
                <CommandItem key={p.id} value={`project ${p.id} ${p.name}`} onSelect={() => go(() => navigate({ to: "/projects/$id", params: { id: p.id } }))}>
                  <FolderGit2 className="size-4" /> {p.name}
                  <span className="ml-auto text-xs text-muted-foreground">{p.tech.slice(0, 2).join(", ")}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {results.teams.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Teams">
              {results.teams.slice(0, 4).map((t) => (
                <CommandItem key={t.id} value={`team ${t.id} ${t.name}`} onSelect={() => go(() => navigate({ to: "/teams/$id", params: { id: t.id } }))}>
                  <Users className="size-4" /> {t.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {results.events.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Events">
              {results.events.slice(0, 4).map((e) => (
                <CommandItem key={e.id} value={`event ${e.id} ${e.title}`} onSelect={() => go(() => navigate({ to: "/events/$id", params: { id: e.id } }))}>
                  <Calendar className="size-4" /> {e.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {q && (
          <>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem value={`all results ${q}`} onSelect={() => go(() => navigate({ to: "/people", search: { q } }))}>
                <User className="size-4" /> See all results for “{q}”
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
