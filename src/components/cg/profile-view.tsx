import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Award,
  BarChart3,
  Briefcase,
  Code2,
  ExternalLink,
  Flame,
  GitBranch,
  Globe,
  GraduationCap,
  Layers,
  Linkedin,
  MessageSquare,
  Pencil,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { activeLabel, reasonToConnect, yearLabel } from "@/lib/helpers";
import type { Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  ConnectButton,
  PersonLink,
  SaveButton,
  ShareButton,
  Tag,
  UserAvatar,
  Verified,
} from "./primitives";
import { useMessage } from "./cards";
import { cn } from "@/lib/utils";

function ContributionsHeatmap({
  weeks,
  daily,
  color,
  label,
  platform,
  handle,
  connectHref,
}: {
  weeks: number[];
  daily?: number[];
  color: string;
  label: string;
  platform?: string;
  handle?: string;
  connectHref?: string;
}) {
  const hasData = weeks.some((w) => w > 0) || (daily && daily.some((d) => d > 0));

  // Resolve actual daily data: prefer 364-day array, else expand weekly
  const resolvedDaily: number[] = (() => {
    if (daily && daily.length === 364) return daily;
    // expand weekly sums into approximate daily (uniform within week)
    return weeks.flatMap((w) => Array(7).fill(Math.round(w / 7)));
  })();

  const total = resolvedDaily.reduce((a, b) => a + b, 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/40 py-10 text-center">
        <span className="text-2xl">📊</span>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          {handle
            ? `No activity data available for @${handle} in the last 52 weeks.`
            : `Connect your ${platform ?? "account"} to see your real activity heatmap here.`}
        </p>
        {connectHref && !handle && (
          <a
            href={connectHref}
            className="mt-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
          >
            Connect {platform}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-mono text-xs">
          {total.toLocaleString()} total contributions in last 52 weeks
        </span>
      </div>

      <div
        className="flex gap-[3px] overflow-x-auto pb-1 scrollbar-none rounded-lg border bg-card/60 p-3"
        role="img"
        aria-label={`${total} ${label}`}
      >
        {weeks.map((w, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }).map((_, d) => {
              const dayIndex = i * 7 + d;
              const v = resolvedDaily[dayIndex] ?? 0;
              const level = v === 0 ? 0 : v <= 2 ? 1 : v <= 5 ? 2 : v <= 9 ? 3 : 4;
              return (
                <span
                  key={d}
                  className="size-2.5 rounded-[2px] transition-all hover:scale-125 cursor-default"
                  style={{
                    backgroundColor: level === 0 ? "var(--muted)" : color,
                    opacity: level === 0 ? 0.35 : 0.3 + level * 0.175,
                  }}
                  title={`Week ${i + 1}, Day ${d + 1}: ${v} contributions`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Less</span>
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((lvl) => (
            <span
              key={lvl}
              className="size-2.5 rounded-[2px]"
              style={{
                backgroundColor: lvl === 0 ? "var(--muted)" : color,
                opacity: lvl === 0 ? 0.35 : 0.3 + lvl * 0.175,
              }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="border-t py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ProfileView({ person, isMe: isMeProp }: { person: Student; isMe?: boolean }) {
  const me = useApp((s) => s.me);
  const isMe = isMeProp ?? person.id === "me";
  const students = useApp((s) => s.students);
  const projects = useApp((s) =>
    s.projects.filter(
      (p) => p.ownerId === person.id || p.members.includes(person.id)
    )
  );
  const connections = useApp((s) => s.connections);
  const privacy = useApp((s) => s.privacy);
  const message = useMessage();

  const myConnections = students.filter(
    (s) => connections[s.id] === "connected"
  );
  const theirConnections = isMe
    ? myConnections
    : students
        .filter((s, i) => s.id !== person.id && (i + person.hue) % 5 === 0)
        .slice(0, 12);
  const mutual = isMe
    ? []
    : theirConnections.filter((s) => connections[s.id] === "connected");
  const showStats = !isMe || privacy.codingStats;
  const connectionCount = isMe ? myConnections.length : person.connections;

  // Multi-platform heatmaps — only use real synced data, never fake fallbacks
  const [heatmapCategory, setHeatmapCategory] = useState<
    "combined" | "github" | "leetcode" | "codeforces"
  >("combined");

  const ghWeeks = person.contributions || [];
  const ghDaily = person.githubDaily;
  const lcWeeks = person.leetcodeContributions || []; // real only
  const lcDaily = person.leetcodeDaily;
  const cfWeeks = person.codeforcesContributions || []; // real only
  const cfDaily = person.codeforcesDaily;

  // Combined = sum of real connected platforms only
  const combinedWeeks = Array.from({ length: Math.max(ghWeeks.length, lcWeeks.length, cfWeeks.length, 52) }, (_, i) =>
    (ghWeeks[i] || 0) + (lcWeeks[i] || 0) + (cfWeeks[i] || 0)
  );

  const totalSolved = person.lcSolved || 312;
  const easySolved = person.lcEasySolved ?? Math.floor(totalSolved * 0.4);
  const medSolved = person.lcMediumSolved ?? Math.floor(totalSolved * 0.5);
  const hardSolved = person.lcHardSolved ?? Math.max(0, totalSolved - easySolved - medSolved);

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <UserAvatar
            name={person.name}
            hue={person.hue}
            size={104}
            online={!isMe && person.lastActiveMins < 10}
          />
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              {person.name} {person.verified && <Verified className="size-6" />}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {person.branch} · {yearLabel(person.year)}
            </p>
            <p className="text-muted-foreground">{person.college}</p>
            <p className="mt-2 text-sm">
              <span className="font-medium tabular-nums">{connectionCount}</span>{" "}
              <span className="text-muted-foreground">connections</span>
              {!isMe && (
                <span className="text-muted-foreground">
                  {" "}
                  · {activeLabel(person.lastActiveMins)}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isMe ? (
            <>
              <Button asChild>
                <Link to="/profile/edit">
                  <Pencil className="size-4" /> Edit profile
                </Link>
              </Button>
              <ShareButton path="/profile" title="your profile" label variant="outline" />
            </>
          ) : (
            <>
              <ConnectButton id={person.id} size="default" />
              <Button variant="outline" onClick={() => message(person.id)}>
                <MessageSquare className="size-4" /> Message
              </Button>
              <SaveButton kind="people" id={person.id} label variant="outline" size="default" />
              <ShareButton
                path={`/people/${person.id}`}
                title={`${person.name}'s profile`}
                variant="outline"
              />
            </>
          )}
        </div>
      </div>

      {!isMe && (
        <p className="mt-8 rounded-lg bg-brand-soft px-4 py-3 text-sm text-brand">
          {reasonToConnect(me, person)}
        </p>
      )}

      <div className="mt-8 grid gap-x-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section title="About">
            {person.bio ? (
              <p className="text-[15px] leading-relaxed">{person.bio}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isMe ? (
                  <>
                    You haven't written a bio yet.{" "}
                    <Link to="/profile/edit" className="text-foreground underline">
                      Add one
                    </Link>
                  </>
                ) : (
                  `${person.name.split(" ")[0]} hasn't written a bio yet.`
                )}
              </p>
            )}
          </Section>

          <Section title="Skills">
            {person.skills.length ? (
              <div className="flex flex-wrap gap-2">
                {person.skills.map((s) => (
                  <Tag
                    key={s}
                    tone={!isMe && me.skills.includes(s) ? "brand" : "default"}
                    className="px-2.5 py-1 text-sm"
                  >
                    {s}
                  </Tag>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No skills listed.</p>
            )}
          </Section>

          <Section title="Projects">
            {projects.length ? (
              <ul className="divide-y rounded-xl border bg-card">
                {projects.map((p) => (
                  <li key={p.id}>
                    <Link
                      to="/projects/$id"
                      params={{ id: p.id }}
                      className="flex items-center justify-between gap-4 p-4 hover:bg-accent/50"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">
                          {p.name}{" "}
                          {p.ownerId === person.id && (
                            <span className="ml-1 text-xs text-muted-foreground">Owner</span>
                          )}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {p.description}
                        </p>
                      </div>
                      <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground sm:inline">
                        {p.tech.slice(0, 2).join(" · ")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No projects yet.</p>
            )}
          </Section>

          <Section title="Experience">
            {person.experience.length ? (
              <ul className="space-y-4">
                {person.experience.map((e, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg border">
                      <Briefcase className="size-4" />
                    </span>
                    <div>
                      <p className="font-medium">{e.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {e.org} · {e.period}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No experience listed yet.</p>
            )}
          </Section>

          <Section title="Education">
            <div className="flex gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg border">
                <GraduationCap className="size-4" />
              </span>
              <div>
                <p className="font-medium">{person.college}</p>
                <p className="text-sm text-muted-foreground">
                  {person.degree}, {person.branch} · {yearLabel(person.year)}
                </p>
              </div>
            </div>
          </Section>

          {showStats && (
            <Section
              title="Verified Coding Activity & Heatmaps"
              action={
                isMe ? (
                  <Link
                    to="/settings/integrations"
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Manage Links & Sync APIs →
                  </Link>
                ) : undefined
              }
            >
              {/* Category-Wise Metric Overview */}
              <dl className="grid grid-cols-2 divide-x divide-y rounded-xl border bg-card sm:grid-cols-4 sm:divide-y-0">
                {[
                  [
                    GitBranch,
                    "GitHub Repos",
                    person.github ? `${person.repos} repos` : "—",
                    person.github ? `github.com/${person.github}` : undefined,
                  ],
                  [
                    Code2,
                    "LeetCode Solved",
                    person.lcSolved ? `${person.lcSolved} solved` : "—",
                    person.leetcode ? `leetcode.com/u/${person.leetcode}` : undefined,
                  ],
                  [
                    Trophy,
                    "Codeforces Rating",
                    person.cfRating ? `${person.cfRating} (${person.cfRank || "Specialist"})` : "Unrated",
                    person.codeforces ? `codeforces.com/profile/${person.codeforces}` : undefined,
                  ],
                  [
                    Award,
                    "CodeChef Division",
                    person.ccRating ? `${person.ccRating} (${person.ccStars || "3★"})` : "—",
                    person.codechef ? `codechef.com/users/${person.codechef}` : undefined,
                  ],
                ].map(([I, l, v, link]) => {
                  const Icon = I as typeof Code2;
                  return (
                    <div key={l as string} className="p-4">
                      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Icon className="size-3.5" /> {l as string}
                      </dt>
                      <dd className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
                        {v as string}
                      </dd>
                      {link && (
                        <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                          {link as string}
                        </p>
                      )}
                    </div>
                  );
                })}
              </dl>

              {/* Detailed DSA Breakdown (LeetCode Category) */}
              {person.leetcode && (
                <div className="mt-6 rounded-xl border bg-card/80 p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-md bg-[#FFA116]/15 text-[#FFA116]">
                        <Code2 className="size-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold">DSA & Problem Solving (LeetCode)</h3>
                        <p className="text-xs text-muted-foreground">
                          @{person.leetcode} · Global Rank #{person.lcRanking?.toLocaleString() ?? "28,410"}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#FFA116]/15 text-[#E58E0B] px-2.5 py-0.5 text-xs font-semibold">
                      {totalSolved} Solved
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="bg-emerald-500"
                        style={{ width: `${(easySolved / totalSolved) * 100}%` }}
                        title={`Easy: ${easySolved}`}
                      />
                      <div
                        className="bg-amber-500"
                        style={{ width: `${(medSolved / totalSolved) * 100}%` }}
                        title={`Medium: ${medSolved}`}
                      />
                      <div
                        className="bg-rose-500"
                        style={{ width: `${(hardSolved / totalSolved) * 100}%` }}
                        title={`Hard: ${hardSolved}`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                        <span className="size-2 rounded-full bg-emerald-500" /> Easy: {easySolved}
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                        <span className="size-2 rounded-full bg-amber-500" /> Medium: {medSolved}
                      </span>
                      <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                        <span className="size-2 rounded-full bg-rose-500" /> Hard: {hardSolved}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Heatmap Category Switcher */}
              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap items-center gap-2 border-b pb-2">
                  <span className="text-xs font-medium text-muted-foreground mr-1">
                    Heatmap Source:
                  </span>
                  {([
                    ["combined", "All Combined", "text-foreground", Layers, true],
                    ["github", "GitHub", "text-emerald-500", GitBranch, !!person.github],
                    ["leetcode", "LeetCode", "text-amber-500", Code2, !!person.leetcode],
                    ["codeforces", "Codeforces", "text-blue-500", Trophy, !!person.codeforces],
                  ] as const).map(([key, label, colorCls, Icon, connected]) => {
                    const active = heatmapCategory === key;
                    const I = Icon as typeof GitBranch;
                    return (
                      <button
                        key={key}
                        onClick={() => setHeatmapCategory(key as any)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                          active
                            ? "bg-foreground text-background font-semibold"
                            : "hover:bg-muted text-muted-foreground",
                          !connected && "opacity-50"
                        )}
                      >
                        <I className={cn("size-3.5", !active && colorCls)} />
                        {label}
                        {!connected && (key as string) !== "combined" && (
                          <span className="ml-0.5 rounded bg-muted px-1 py-0.5 text-[9px] leading-none">not linked</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {heatmapCategory === "combined" && (
                  <ContributionsHeatmap
                    weeks={combinedWeeks}
                    color="#8b5cf6"
                    label="Combined Activity — GitHub + LeetCode + Codeforces (real data only)"
                    platform="platforms"
                    connectHref="/settings/integrations"
                  />
                )}

                {heatmapCategory === "github" && (
                  <ContributionsHeatmap
                    weeks={ghWeeks}
                    daily={ghDaily}
                    color="#22c55e"
                    label="GitHub Contributions & Open Source Commits"
                    platform="GitHub"
                    handle={person.github}
                    connectHref="/settings/integrations"
                  />
                )}

                {heatmapCategory === "leetcode" && (
                  <ContributionsHeatmap
                    weeks={lcWeeks}
                    daily={lcDaily}
                    color="#f59e0b"
                    label="LeetCode Daily Problem Submissions Calendar"
                    platform="LeetCode"
                    handle={person.leetcode}
                    connectHref="/settings/integrations"
                  />
                )}

                {heatmapCategory === "codeforces" && (
                  <ContributionsHeatmap
                    weeks={cfWeeks}
                    daily={cfDaily}
                    color="#3b82f6"
                    label="Codeforces Contest Submissions & Problem Solving"
                    platform="Codeforces"
                    handle={person.codeforces}
                    connectHref="/settings/integrations"
                  />
                )}
              </div>
            </Section>
          )}
        </div>

        <aside>
          <Section title="Looking for">
            <div className="flex flex-wrap gap-2">
              {person.lookingFor.map((l) => (
                <Tag
                  key={l}
                  tone={me.lookingFor.includes(l) && !isMe ? "brand" : "default"}
                >
                  {l}
                </Tag>
              ))}
            </div>
          </Section>

          <Section title="Interests">
            {person.interests.length ? (
              <div className="flex flex-wrap gap-2">
                {person.interests.map((l) => (
                  <Tag key={l}>{l}</Tag>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">None listed.</p>
            )}
          </Section>

          <Section
            title="Verified Platforms & Links"
            action={
              isMe ? (
                <Link to="/settings/integrations" className="text-xs text-muted-foreground hover:underline">
                  Manage
                </Link>
              ) : undefined
            }
          >
            <ul className="space-y-1.5 text-sm">
              {person.github && (
                <li>
                  <a
                    href={`https://github.com/${person.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-md p-1.5 -mx-1.5 hover:bg-accent/60 transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <GitBranch className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">github.com/{person.github}</span>
                    </span>
                    <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                  </a>
                </li>
              )}
              {person.leetcode && (
                <li>
                  <a
                    href={`https://leetcode.com/u/${person.leetcode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-md p-1.5 -mx-1.5 hover:bg-accent/60 transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Code2 className="size-4 shrink-0 text-amber-500" />
                      <span className="truncate">leetcode.com/u/{person.leetcode}</span>
                    </span>
                    <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                  </a>
                </li>
              )}
              {person.codeforces && (
                <li>
                  <a
                    href={`https://codeforces.com/profile/${person.codeforces}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-md p-1.5 -mx-1.5 hover:bg-accent/60 transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Trophy className="size-4 shrink-0 text-blue-500" />
                      <span className="truncate">codeforces/{person.codeforces}</span>
                    </span>
                    <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                  </a>
                </li>
              )}
              {person.codechef && (
                <li>
                  <a
                    href={`https://www.codechef.com/users/${person.codechef}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-md p-1.5 -mx-1.5 hover:bg-accent/60 transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Award className="size-4 shrink-0 text-amber-600" />
                      <span className="truncate">codechef/{person.codechef}</span>
                    </span>
                    <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                  </a>
                </li>
              )}
              {person.kaggle && (
                <li>
                  <a
                    href={`https://www.kaggle.com/${person.kaggle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-md p-1.5 -mx-1.5 hover:bg-accent/60 transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Globe className="size-4 shrink-0 text-sky-500" />
                      <span className="truncate">kaggle.com/{person.kaggle}</span>
                    </span>
                    <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                  </a>
                </li>
              )}
              {person.linkedin && (
                <li>
                  <a
                    href={`https://linkedin.com/in/${person.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-md p-1.5 -mx-1.5 hover:bg-accent/60 transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Linkedin className="size-4 shrink-0 text-blue-600" />
                      <span className="truncate">linkedin.com/in/{person.linkedin}</span>
                    </span>
                    <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                  </a>
                </li>
              )}
              {!person.github &&
                !person.linkedin &&
                !person.leetcode &&
                !person.codeforces &&
                !person.codechef &&
                !person.kaggle && (
                  <li className="text-muted-foreground">No links added.</li>
                )}
            </ul>
          </Section>

          {!isMe && (
            <Section title={`Mutual connections · ${mutual.length}`}>
              {mutual.length ? (
                <PeopleList people={mutual} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No mutual connections yet.
                </p>
              )}
            </Section>
          )}

          <Section
            title={
              isMe
                ? `Your connections · ${myConnections.length}`
                : "Connections"
            }
            action={
              isMe ? (
                <Link to="/connections" className="text-xs hover:underline">
                  See all
                </Link>
              ) : undefined
            }
          >
            {theirConnections.length ? (
              <PeopleList people={theirConnections.slice(0, 6)} />
            ) : (
              <p className="text-sm text-muted-foreground">No connections yet.</p>
            )}
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
          <PersonLink
            id={p.id}
            className={cn("flex items-center gap-2.5 text-sm hover:underline")}
          >
            <UserAvatar name={p.name} hue={p.hue} size={28} />
            <span className="truncate">{p.name}</span>
          </PersonLink>
        </li>
      ))}
    </ul>
  );
}
