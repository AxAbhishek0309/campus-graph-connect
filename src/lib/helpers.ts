import type { Student } from "./types";

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function timeAgo(ts: number, now = Date.now()) {
  const d = Math.max(0, now - ts);
  const m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function activeLabel(mins: number) {
  if (mins < 10) return "Active now";
  if (mins < 60) return `Active ${mins}m ago`;
  if (mins < 1440) return `Active ${Math.floor(mins / 60)}h ago`;
  return `Active ${Math.floor(mins / 1440)}d ago`;
}

export function yearLabel(y: number) {
  return ["1st", "2nd", "3rd", "4th", "5th"][y - 1] + " Year";
}

/** Human-readable reason to connect, based on overlap with the current user. */
export function reasonToConnect(me: Student, s: Student): string {
  const sharedSkills = s.skills.filter((x) => me.skills.includes(x));
  const sharedInterests = s.interests.filter((x) => me.interests.includes(x));
  const sharedGoals = s.lookingFor.filter((x) => me.lookingFor.includes(x));
  const p = s.pronoun === "she" ? "She" : s.pronoun === "he" ? "He" : "They";
  const isAre = s.pronoun === "they" ? "are" : "is";
  if (sharedGoals.includes("Hackathon Partner")) return "You are both looking for hackathon teammates.";
  if (s.lookingFor.includes("Project Collaborator") && me.skills.includes("Node.js") && !s.skills.includes("Node.js"))
    return `${p} ${isAre} looking for someone with your backend experience.`;
  if (sharedInterests.length >= 3) return `You have ${sharedInterests.length} shared interests.`;
  if (sharedSkills.length) return `You both work with ${sharedSkills[0]}.`;
  if (s.mentor) return `${p} mentors juniors in ${s.skills[0] ?? "their field"}.`;
  if (s.college === me.college) return `${p} ${isAre} on your campus, ${s.branch}.`;
  if (sharedInterests.length) return `You're both into ${sharedInterests[0]}.`;
  if (s.activity === "new") return `${p} just joined Tribe — say hi.`;
  return `${p} ${isAre} looking for a ${s.lookingFor[0]?.toLowerCase() ?? "collaborator"}.`;
}

export function matchScore(me: Student, s: Student) {
  const a = s.skills.filter((x) => me.skills.includes(x)).length * 2;
  const b = s.interests.filter((x) => me.interests.includes(x)).length * 2;
  const c = s.lookingFor.filter((x) => me.lookingFor.includes(x)).length * 3;
  const d = s.college === me.college ? 2 : 0;
  const e = s.activity === "high" ? 2 : s.activity === "medium" ? 1 : 0;
  return a + b + c + d + e;
}

export function profileCompletion(s: Student) {
  const checks = [
    !!s.bio, s.skills.length >= 3, s.interests.length >= 2, s.lookingFor.length > 0,
    !!s.github, !!s.linkedin, s.experience.length > 0, !!s.leetcode,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function formatEventDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
    weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
    long: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
  };
}
