import { Link } from "@tanstack/react-router";
import { Briefcase, Code2, GitBranch, GraduationCap, Linkedin, MessageSquare, Pencil, Trophy } from "lucide-react";
import { useApp } from "@/lib/store";
import { activeLabel, reasonToConnect, yearLabel } from "@/lib/helpers";
import type { Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ConnectButton, PersonLink, SaveButton, ShareButton, Tag, UserAvatar, Verified } from "./primitives";
import { useMessage } from "./cards";
import { cn } from "@/lib/utils";

function Contributions({ weeks }: { weeks: number[] }) {
  const total = weeks.reduce((a, b) => a + b, 0) * 3;
  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-1 scrollbar-none" role="img" aria-label={`${total} contributions in the last year`}>
        {weeks.map((w, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }).map((_, d) => {
              const v = Math.max(0, w - ((d * 7 + i) % 5));
              const level = v === 0 ? 0 : v < 3 ? 1 : v < 6 ? 2 : v < 10 ? 3 : 4;
              return <span key={d} className="size-2.5 rounded-[2px]" style={{ background: level === 0 ? "var(--muted)" : `color-mix(in oklab, var(--success) ${level * 25}%, var(--muted))` }} />;
            })}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{total} contributions in the last year</p>
    </div>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="border-t py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ProfileView({ person, isMe }: { person: Student; isMe?: boolean }) {
  const me = useApp((s) => s.me);
  const privacy = useApp((s) => s.privacy);
  const connections = useApp((s) => s.connections);
  const students = useApp((s) => s.students);
  const projects = useApp((s) => s.projects.filter((p) => p.members.includes(person.id) && p.status === "published"));
  const message = useMessage();

  const myConnections = students.filter((s) => connections[s.id] === "connected");
  const theirConnections = isMe ? myConnections : students.filter((s, i) => s.id !== person.id && (i + person.hue) % 5 === 0).slice(0, 12);
  const mutual = isMe ? [] : theirConnections.filter((s) => connections[s.id] === "connected");
  const showStats = !isMe || privacy.codingStats;
  const connectionCount = isMe ? myConnections.length : person.connections;

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <UserAvatar name={person.name} hue={person.hue} size={104} online={!isMe && person.lastActiveMins < 10} />
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              {person.name} {person.verified && <Verified className="size-6" />}
            </h1>
            <p className="mt-1 text-muted-foreground">{person.branch} · {yearLabel(person.year)}</p>
            <p className="text-muted-foreground">{person.college}</p>
            <p className="mt-2 text-sm"><span className="font-medium tabular-nums">{connectionCount}</span> <span className="text-muted-foreground">connections</span>{!isMe && <span className="text-muted-foreground"> · {activeLabel(person.lastActiveMins)}</span>}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isMe ? (
            <>
              <Button asChild><Link to="/profile/edit"><Pencil className="size-4" /> Edit profile</Link></Button>
              <ShareButton path="/profile" title="your profile" label variant="outline" />
            </>
          ) : (
            <>
              <ConnectButton id={person.id} size="default" />
              <Button variant="outline" onClick={() => message(person.id)}><MessageSquare className="size-4" /> Message</Button>
              <SaveButton kind="people" id={person.id} label variant="outline" size="default" />
              <ShareButton path={`/people/${person.id}`} title={`${person.name}'s profile`} variant="outline" />
            </>
          )}
        </div>
      </div>

      {!isMe && (
        <p className="mt-8 rounded-lg bg-brand-soft px-4 py-3 text-sm text-brand">{reasonToConnect(me, person)}</p>
      )}

      <div className="mt-8 grid gap-x-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section title="About">
            {person.bio ? <p className="text-[15px] leading-relaxed">{person.bio}</p> : <p className="text-sm text-muted-foreground">{isMe ? <>You haven't written a bio yet. <Link to="/profile/edit" className="text-foreground underline">Add one</Link></> : `${person.name.split(" ")[0]} hasn't written a bio yet.`}</p>}
          </Section>

          <Section title="Skills">
            {person.skills.length ? <div className="flex flex-wrap gap-2">{person.skills.map((s) => <Tag key={s} tone={!isMe && me.skills.includes(s) ? "brand" : "default"} className="px-2.5 py-1 text-sm">{s}</Tag>)}</div> : <p className="text-sm text-muted-foreground">No skills listed.</p>}
          </Section>

          <Section title="Projects">
            {projects.length ? (
              <ul className="divide-y rounded-xl border bg-card">
                {projects.map((p) => (
                  <li key={p.id}>
                    <Link to="/projects/$id" params={{ id: p.id }} className="flex items-center justify-between gap-4 p-4 hover:bg-accent/50">
                      <div className="min-w-0">
                        <p className="font-medium">{p.name} {p.ownerId === person.id && <span className="ml-1 text-xs text-muted-foreground">Owner</span>}</p>
                        <p className="truncate text-sm text-muted-foreground">{p.description}</p>
                      </div>
                      <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground sm:inline">{p.tech.slice(0, 2).join(" · ")}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">No projects yet.</p>}
          </Section>

          <Section title="Experience">
            {person.experience.length ? (
              <ul className="space-y-4">{person.experience.map((e, i) => (
                <li key={i} className="flex gap-3"><span className="flex size-9 items-center justify-center rounded-lg border"><Briefcase className="size-4" /></span><div><p className="font-medium">{e.title}</p><p className="text-sm text-muted-foreground">{e.org} · {e.period}</p></div></li>
              ))}</ul>
            ) : <p className="text-sm text-muted-foreground">No experience listed yet.</p>}
          </Section>

          <Section title="Education">
            <div className="flex gap-3"><span className="flex size-9 items-center justify-center rounded-lg border"><GraduationCap className="size-4" /></span><div><p className="font-medium">{person.college}</p><p className="text-sm text-muted-foreground">{person.degree}, {person.branch} · {yearLabel(person.year)}</p></div></div>
          </Section>

          {showStats && (
            <Section title="Coding activity">
              {person.github && (!isMe || privacy.github) ? <Contributions weeks={person.contributions} /> : <p className="text-sm text-muted-foreground">GitHub not connected.</p>}
              <dl className="mt-6 grid grid-cols-3 divide-x rounded-xl border bg-card">
                {[
                  [GitBranch, "Repositories", person.github ? person.repos : "—"],
                  [Code2, "LeetCode solved", person.lcSolved || "—"],
                  [Trophy, "Codeforces", person.cfRating || "Unrated"],
                ].map(([I, l, v]) => {
                  const Icon = I as typeof Code2;
                  return (
                    <div key={l as string} className="p-4">
                      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="size-3.5" /> {l as string}</dt>
                      <dd className="mt-1 text-xl font-semibold tabular-nums tracking-tight">{v as string}</dd>
                    </div>
                  );
                })}
              </dl>
            </Section>
          )}
        </div>

        <aside>
          <Section title="Looking for">
            <div className="flex flex-wrap gap-2">{person.lookingFor.map((l) => <Tag key={l} tone={me.lookingFor.includes(l) && !isMe ? "brand" : "default"}>{l}</Tag>)}</div>
          </Section>
          <Section title="Interests">
            {person.interests.length ? <div className="flex flex-wrap gap-2">{person.interests.map((l) => <Tag key={l}>{l}</Tag>)}</div> : <p className="text-sm text-muted-foreground">None listed.</p>}
          </Section>
          <Section title="Links">
            <ul className="space-y-2 text-sm">
              {person.github && <li className="flex items-center gap-2"><GitBranch className="size-4 text-muted-foreground" /> github.com/{person.github}</li>}
              {person.linkedin && <li className="flex items-center gap-2"><Linkedin className="size-4 text-muted-foreground" /> in/{person.linkedin}</li>}
              {person.leetcode && <li className="flex items-center gap-2"><Code2 className="size-4 text-muted-foreground" /> leetcode/{person.leetcode}</li>}
              {!person.github && !person.linkedin && !person.leetcode && <li className="text-muted-foreground">No links added.</li>}
            </ul>
          </Section>
          {!isMe && (
            <Section title={`Mutual connections · ${mutual.length}`}>
              {mutual.length ? <PeopleList people={mutual} /> : <p className="text-sm text-muted-foreground">No mutual connections yet.</p>}
            </Section>
          )}
          <Section title={isMe ? `Your connections · ${myConnections.length}` : "Connections"} action={isMe ? <Link to="/connections" className="text-xs hover:underline">See all</Link> : undefined}>
            {theirConnections.length ? <PeopleList people={theirConnections.slice(0, 6)} /> : <p className="text-sm text-muted-foreground">No connections yet.</p>}
          </Section>
        </aside>
      </div>
    </div>
  );
}

function PeopleList({ people }: { people: Student[] }) {
  return (
    <ul className="space-y-3">
      {people.map((p) => (
        <li key={p.id}>
          <PersonLink id={p.id} className={cn("flex items-center gap-2.5 text-sm hover:underline")}>
            <UserAvatar name={p.name} hue={p.hue} size={28} />
            <span className="truncate">{p.name}</span>
          </PersonLink>
        </li>
      ))}
    </ul>
  );
}
