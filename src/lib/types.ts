export type Activity = "high" | "medium" | "low" | "new";
export type LookingFor =
  | "Coding Partner"
  | "Hackathon Partner"
  | "Project Collaborator"
  | "Research Partner"
  | "Study Partner"
  | "Mentor"
  | "Career Peer"
  | "Friends";

export interface Experience {
  title: string;
  org: string;
  period: string;
}

export interface Student {
  id: string;
  name: string;
  pronoun: "she" | "he" | "they";
  hue: number;
  college: string;
  degree: string;
  branch: string;
  year: number;
  bio: string;
  skills: string[];
  interests: string[];
  lookingFor: LookingFor[];
  verified: boolean;
  activity: Activity;
  availability: "Available" | "Busy" | "Open to chat";
  connections: number;
  joinedDaysAgo: number;
  lastActiveMins: number;
  github?: string;
  leetcode?: string;
  linkedin?: string;
  codeforces?: string;
  codechef?: string;
  kaggle?: string;
  repos: number;
  lcSolved: number;
  cfRating: number;
  ccRating?: number;
  ccStars?: string;
  kaggleTier?: string;
  lcEasySolved?: number;
  lcMediumSolved?: number;
  lcHardSolved?: number;
  lcRanking?: number;
  cfRank?: string;
  cfMaxRating?: number;
  ccGlobalRank?: number;
  kaggleNotebooks?: number;
  avatarUrl?: string;
  githubAvatar?: string;
  leetcodeAvatar?: string;
  codeforcesAvatar?: string;
  contributions: number[]; // 52 weeks GitHub
  githubDaily?: number[]; // 364 days actual daily counts
  leetcodeContributions?: number[]; // 52 weeks LeetCode
  leetcodeDaily?: number[]; // 364 days actual daily counts
  codeforcesContributions?: number[]; // 52 weeks Codeforces
  codeforcesDaily?: number[]; // 364 days actual daily counts
  experience: Experience[];
  mentor?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  stage: "Idea" | "Prototype" | "Building" | "Launched";
  tech: string[];
  ownerId: string;
  members: string[];
  teamSize: number;
  roles: string[];
  github?: string;
  deadline?: string;
  visibility: "Public" | "Campus" | "Private";
  status: "published" | "draft";
  createdDaysAgo: number;
  college: string;
  timeline: { label: string; date: string; done: boolean }[];
}

export interface Team {
  id: string;
  name: string;
  purpose: string;
  description: string;
  members: string[];
  roles: string[];
  skills: string[];
  projectId?: string;
  maxSize: number;
  lookingForMembers: boolean;
  activity: { text: string; when: string }[];
}

export type EventPlatform =
  | "Unstop"
  | "Grad Partners"
  | "Wellfound"
  | "Naukri Campus"
  | "Indeed"
  | "Devfolio"
  | "HackerEarth"
  | "Campus"
  | "Other";

export interface EventItem {
  id: string;
  title: string;
  category: "Hackathons" | "Workshops" | "Meetups" | "Competitions" | "Seminars" | "Networking" | "Study" | "Hiring Challenges";
  organizer: string;
  date: string; // ISO date
  time: string;
  location: string;
  description: string;
  speakers: { name: string; role: string }[];
  attendees: string[];
  capacity: number;
  relatedProjects: string[];
  hue: number;
  prize?: string;
  link?: string;
  mode?: "Online" | "In-person" | "Hybrid";
  sourcePlatform?: EventPlatform;
  sourceUrl?: string;
  eligibility?: string;
  deadline?: string;
  tags?: string[];
  isFlagship?: boolean;
  isAiFetched?: boolean;
  registeredCount?: string | number;
  externalRegistrations?: string | number;
}

export interface Message {
  id: string;
  from: string; // student id or "me"
  text: string;
  ts: number;
  reactions: string[];
  attachment?: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  messages: Message[];
  unread: number;
}

export type NotificationType =
  | "connection"
  | "message"
  | "project"
  | "team"
  | "event"
  | "profile"
  | "recommendation";

export interface Notification {
  id: string;
  type: NotificationType;
  text: string;
  actorId?: string;
  href: string;
  ts: number;
  read: boolean;
}

export type ConnectionState = "connected" | "sent" | "received";

export type Platform = "GitHub" | "LeetCode" | "Codeforces" | "CodeChef" | "Kaggle" | "LinkedIn";

export interface IntegrationStats {
  primary: string;
  secondary?: string;
  badge?: string;
  avatarUrl?: string;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  ranking?: string | number;
  acceptanceRate?: string | number;
  rating?: number;
  maxRating?: number;
  rank?: string;
  globalRank?: number | string;
  stars?: string;
  notebooks?: number;
  medals?: number;
  followers?: number;
  repos?: number;
  contributions?: number[]; // 52 weeks heatmap values
  dailyContributions?: number[]; // 364 days exact daily heatmap values
}

export interface Integration {
  status: "disconnected" | "connected" | "syncing";
  handle?: string;
  lastSync?: number;
  stats?: IntegrationStats;
}

