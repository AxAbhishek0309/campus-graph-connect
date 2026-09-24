import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, Bookmark, Calendar, Check, GitBranch, MapPin, MessageSquare, Search, UserPlus, Users } from "lucide-react";
import { useApp } from "@/lib/store";
import { reasonToConnect, yearLabel } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Logo, Tag, UserAvatar } from "@/components/cg/primitives";
import { cn } from "@/lib/utils";
import { HeroBackdrop, Magnetic, TiltCard } from "@/components/cg/effects";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CampusGraph — Your college is full of people you should know" },
      { name: "description", content: "Find coding partners, hackathon teammates, research partners and mentors at your university. Build projects and join campus events together." },
      { property: "og:title", content: "CampusGraph — Find your people on campus" },
      { property: "og:description", content: "Discover the right students for coding, projects, research, hackathons and placements." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const CATS = ["For You", "Coding", "Hackathons", "Research", "Mentors"];

function ProductPreview() {
  const students = useApp((s) => s.students);
  const me = useApp((s) => s.me);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("For You");
  const [pending, setPending] = useState<string[]>([]);
  const list = useMemo(() => {
    const t = q.toLowerCase();
    return students
      .filter((s) => s.bio && s.skills.length >= 3)
      .filter((s) => !t || s.name.toLowerCase().includes(t) || s.skills.some((k) => k.toLowerCase().includes(t)))
      .filter((s) =>
        cat === "For You" ? true :
        cat === "Coding" ? s.lookingFor.includes("Coding Partner") :
        cat === "Hackathons" ? s.lookingFor.includes("Hackathon Partner") :
        cat === "Research" ? s.lookingFor.includes("Research Partner") || s.interests.includes("Research") :
        !!s.mentor,
      )
      .slice(0, 6);
  }, [students, q, cat]);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-window">
      <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="mx-auto rounded-md border bg-card px-3 py-0.5 font-mono text-[11px] text-muted-foreground">campusgraph.app/people</span>
      </div>
      <div className="flex">
        <div className="hidden w-44 shrink-0 border-r p-4 md:block">
          <Logo className="mb-6 scale-90 origin-left" />
          {["Home", "People", "Projects", "Teams", "Events", "Messages"].map((n) => (
            <div key={n} className={cn("rounded-md px-2 py-1.5 text-[13px]", n === "People" ? "bg-accent font-medium" : "text-muted-foreground")}>{n}</div>
          ))}
        </div>
        <div className="min-w-0 flex-1 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-semibold tracking-tight">Find your people.</h3>
            <label className="flex h-9 items-center gap-2 rounded-lg border px-3 text-sm sm:w-64">
              <Search className="size-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “React” or “Python”" className="w-full bg-transparent outline-none placeholder:text-muted-foreground" aria-label="Search preview" />
            </label>
          </div>
          <div className="mt-4 flex gap-1.5 overflow-x-auto scrollbar-none">
            {CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={cn("shrink-0 rounded-md border px-2.5 py-1 text-xs transition-colors", cat === c ? "border-foreground bg-foreground text-background" : "hover:bg-accent")}>
                {c}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((s, i) => (
              <div key={s.id} className="animate-rise rounded-xl border p-4" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center gap-2.5">
                  <UserAvatar name={s.name} hue={s.hue} size={36} online={s.lastActiveMins < 10} />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 truncate text-sm font-semibold">{s.name}{s.verified && <BadgeCheck className="size-3.5 text-brand" />}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.branch} · {yearLabel(s.year)}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 border-l-2 border-brand pl-2 text-xs">{reasonToConnect(me, s)}</p>
                <div className="mt-3 flex flex-wrap gap-1">{s.skills.slice(0, 3).map((k) => <Tag key={k} className="text-[10px]">{k}</Tag>)}</div>
                <div className="mt-3 flex gap-1.5">
                  <button
                    onClick={() => setPending((p) => (p.includes(s.id) ? p.filter((x) => x !== s.id) : [...p, s.id]))}
                    className={cn("flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-all active:scale-95", pending.includes(s.id) ? "border text-muted-foreground" : "bg-foreground text-background")}
                  >
                    {pending.includes(s.id) ? <><Check className="size-3" /> Pending</> : <><UserPlus className="size-3" /> Connect</>}
                  </button>
                  <span className="flex items-center rounded-md border px-2"><MessageSquare className="size-3" /></span>
                </div>
              </div>
            ))}
            {list.length === 0 && <p className="col-span-full py-10 text-center text-sm text-muted-foreground">Nobody matches “{q}” yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ n, title, text, children, flip }: { n: string; title: string; text: string; children: React.ReactNode; flip?: boolean }) {
  return (
    <section className="grid items-center gap-10 border-t py-20 lg:grid-cols-5 lg:gap-16">
      <div className={cn("lg:col-span-2", flip && "lg:order-2")}>
        <p className="font-mono text-xs text-muted-foreground">{n}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{title}</h2>
        <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">{text}</p>
      </div>
      <div className="lg:col-span-3">{children}</div>
    </section>
  );
}

function Landing() {
  const s = useApp();
  const people = s.students.filter((x) => x.bio && x.skills.length >= 3);
  const projects = s.projects.slice(1, 4);
  const events = s.events.slice(2, 5);
  const team = s.teams[0];
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-transparent bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label="CampusGraph"><Logo /></Link>
          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild><Link to="/login">Sign in</Link></Button>
            <Button size="sm" asChild><Link to="/signup">Get Started</Link></Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        <section className="relative isolate pt-16 pb-16 text-center sm:pt-24"><HeroBackdrop />
          <p className="animate-rise font-mono text-[11px] tracking-[0.18em] text-muted-foreground">YOUR COLLEGE IS FULL OF PEOPLE YOU SHOULD KNOW.</p>
          <h1 className="mx-auto mt-6 max-w-4xl animate-rise text-5xl font-semibold leading-[1.02] tracking-[-0.045em] [animation-delay:80ms] sm:text-7xl">
            Find your people<br />to build, learn<br /><span className="text-muted-foreground">and grow together.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl animate-rise text-lg text-muted-foreground [animation-delay:160ms]">
            CampusGraph helps students discover the right people for coding, projects, research, hackathons, placements and meaningful conversations.
          </p>
          <div className="mt-8 flex animate-rise justify-center gap-3 [animation-delay:240ms]">
            <Magnetic><Button size="lg" asChild><Link to="/signup">Get Started <ArrowRight className="size-4" /></Link></Button></Magnetic>
            <Button size="lg" variant="outline" asChild><Link to="/people">Explore People</Link></Button>
          </div>
        </section>

        <div className="animate-rise [animation-delay:350ms]"><TiltCard intensity={4} className="rounded-2xl"><ProductPreview /></TiltCard></div>

        <div className="mt-24">
          <Section n="01" title="Discover people" text="Not a feed of strangers. Every recommendation comes with a plain reason — shared skills, shared goals, same campus — so you know why you should say hi.">
            <div className="divide-y rounded-xl border bg-card">
              {people.slice(6, 10).map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-4">
                  <UserAvatar name={p.name} hue={p.hue} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{p.name} <span className="font-normal text-muted-foreground">· {p.college}</span></p>
                    <p className="truncate text-sm text-muted-foreground">{reasonToConnect(s.me, p)}</p>
                  </div>
                  <span className="hidden rounded-md border px-2.5 py-1 text-xs sm:inline">Connect</span>
                </div>
              ))}
            </div>
          </Section>

          <Section flip n="02" title="Build projects" text="Post what you're building, list the roles you need, and let the right people find you. Or join something that's already moving.">
            <div className="grid gap-3 sm:grid-cols-3">
              {projects.map((p) => (
                <div key={p.id} className="rounded-xl border bg-card p-4">
                  <Tag tone="brand">{p.stage}</Tag>
                  <p className="mt-3 font-semibold tracking-tight">{p.name}</p>
                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
                  <p className="mt-3 font-mono text-[11px] text-muted-foreground">{p.tech.join(" · ")}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section n="03" title="Find teammates" text="Tell us the hackathon and the roles you're missing. The team builder suggests students who fill the gaps — and tells you why they fit.">
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{team.name}</p>
                <span className="text-xs text-muted-foreground">{team.purpose}</span>
              </div>
              <div className="mt-4 space-y-2">
                {["Frontend", "Backend", "ML", "Pitching"].map((role, i) => {
                  const p = people[i * 3 + 1];
                  return (
                    <div key={role} className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
                      <span className="w-20 font-mono text-[11px] text-muted-foreground uppercase">{role}</span>
                      <UserAvatar name={p.name} hue={p.hue} size={28} />
                      <span className="flex-1 truncate text-sm">{p.name}</span>
                      <span className="hidden text-xs text-muted-foreground sm:inline">{p.skills[0]}, {p.skills[1]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Section>

          <Section flip n="04" title="Join campus events" text="Hackathons, workshops, meetups and study sessions from every club, in one calendar. See who's going before you go.">
            <div className="divide-y rounded-xl border bg-card">
              {events.map((e) => (
                <div key={e.id} className="flex items-center gap-4 p-4">
                  <div className="flex w-12 flex-col items-center rounded-md border py-1">
                    <span className="font-mono text-[9px] text-muted-foreground">{new Date(e.date).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</span>
                    <span className="font-semibold">{new Date(e.date).getUTCDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.title}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{e.location}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="size-3" />{e.attendees.length}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section n="05" title="Build your student profile" text="Skills, projects, experience and what you're looking for — a profile that reads like a person, not a résumé.">
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-4">
                <UserAvatar name={s.me.name} hue={s.me.hue} size={64} />
                <div>
                  <p className="flex items-center gap-1 text-lg font-semibold">{s.me.name} <BadgeCheck className="size-4 text-brand" /></p>
                  <p className="text-sm text-muted-foreground">{s.me.branch} · {yearLabel(s.me.year)} · {s.me.college}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed">{s.me.bio}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">{s.me.lookingFor.map((l) => <Tag key={l} tone="brand">{l}</Tag>)}</div>
            </div>
          </Section>

          <Section flip n="06" title="Connect your coding platforms" text="Link GitHub, LeetCode, Codeforces, CodeChef, Kaggle and LinkedIn. Your real work shows up on your profile — no inflated numbers.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[["GitHub", "23 repositories"], ["LeetCode", "312 solved"], ["Codeforces", "1412 rating"], ["CodeChef", "Not connected"], ["Kaggle", "Not connected"], ["LinkedIn", "Connected"]].map(([n, v]) => (
                <div key={n} className="rounded-xl border bg-card p-4">
                  <p className="text-sm font-medium">{n}</p>
                  <p className={cn("mt-1 text-sm", v === "Not connected" ? "text-muted-foreground" : "")}>{v}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section n="07" title="Campus activity" text="A quiet pulse of what's happening around you — who joined which team, which projects shipped, what's on this week.">
            <ul className="space-y-4 rounded-xl border bg-card p-5">
              {[
                [people[0], "joined Null Pointers for Smart India Hackathon", Users],
                [people[3], "shipped v2 of CropScan", GitBranch],
                [people[5], "registered for HackJaipur 2026", Calendar],
                [people[8], "saved your project CourseLens", Bookmark],
              ].map(([p, t, Icon], i) => {
                const person = p as (typeof people)[number];
                const I = Icon as typeof Users;
                return (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <UserAvatar name={person.name} hue={person.hue} size={28} />
                    <p className="flex-1"><span className="font-medium">{person.name}</span> <span className="text-muted-foreground">{t as string}</span></p>
                    <I className="size-4 text-muted-foreground" />
                  </li>
                );
              })}
            </ul>
          </Section>
        </div>

        <section className="my-20 rounded-2xl bg-foreground px-6 py-16 text-center text-background sm:py-20">
          <h2 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Someone on your campus<br />is building what you're thinking about.</h2>
          <p className="mx-auto mt-4 max-w-md text-background/70">Join with your college email. It takes two minutes.</p>
          <Button size="lg" variant="secondary" className="mt-8" asChild><Link to="/signup">Get Started <ArrowRight className="size-4" /></Link></Button>
        </section>
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p>Made for students, by students. © 2026 CampusGraph</p>
        </div>
      </footer>
    </div>
  );
}
