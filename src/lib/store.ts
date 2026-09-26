import { createWithEqualityFn as create } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { persist } from "zustand/middleware";
import {
  makeConversations,
  makeEvents,
  makeMe,
  makeNotifications,
  makeProjects,
  makeStudents,
  makeTeams,
} from "./data";
import { fetchPlatformStats, getDefaultConnectedIntegrations } from "./integrations";
import {
  firestoreUpdateMe,
  firestoreSendConnection,
  firestoreAcceptConnection,
  firestoreRemoveConnection,
  firestoreOpenConversation,
  firestoreSendMessage,
  firestoreToggleReaction,
  firestoreToggleRegister,
  firestoreAddEvent,
  firestoreUpsertProject,
  firestoreDeleteProject,
  firestoreUpsertTeam,
} from "./firestore-sync";
import type {
  ConnectionState,
  Conversation,
  EventItem,
  Integration,
  Notification,
  Platform,
  Project,
  Student,
  Team,
} from "./types";

type SavedKind = "people" | "projects" | "teams" | "events";

export interface AppState {
  auth: { loggedIn: boolean; email: string; collegeEmail: string; verified: boolean };
  onboarding: { step: number; done: boolean };
  me: Student;
  students: Student[];
  projects: Project[];
  teams: Team[];
  events: EventItem[];
  conversations: Conversation[];
  notifications: Notification[];
  connections: Record<string, ConnectionState>;
  saved: Record<SavedKind, string[]>;
  integrations: Record<Platform, Integration>;
  privacy: { visibility: "Everyone" | "Campus only" | "Connections"; codingStats: boolean; github: boolean; allowMessages: boolean; online: boolean };
  notifPrefs: { messages: boolean; connections: boolean; projects: boolean; events: boolean; recommendations: boolean };
  recentSearches: string[];

  login: (email: string) => void;
  signup: (name: string, email: string, college: string) => void;
  logout: () => void;
  verifyCollege: (email: string) => void;
  setOnboarding: (o: Partial<AppState["onboarding"]>) => void;
  updateMe: (p: Partial<Student>) => void;

  connect: (id: string) => void;
  accept: (id: string) => void;
  removeConnection: (id: string) => void;
  toggleSave: (kind: SavedKind, id: string) => boolean;

  upsertProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  toggleJoinProject: (id: string) => boolean;

  upsertTeam: (t: Team) => void;
  toggleJoinTeam: (id: string) => boolean;
  inviteToTeam: (teamId: string, studentId: string) => void;

  toggleRegister: (id: string) => boolean;
  addEvent: (e: EventItem) => void;

  openConversation: (studentId: string) => string;
  sendMessage: (convId: string, text: string, attachment?: string) => void;
  receiveMessage: (convId: string, text: string) => void;
  markConversationRead: (convId: string) => void;
  toggleReaction: (convId: string, msgId: string, emoji: string) => void;

  markNotification: (id: string, read?: boolean) => void;
  markAllNotifications: () => void;
  pushNotification: (n: Omit<Notification, "id" | "ts" | "read">) => void;

  setIntegration: (p: Platform, i: Integration) => void;
  connectAllIntegrations: () => void;
  syncAllIntegrations: () => Promise<void>;
  setPrivacy: (p: Partial<AppState["privacy"]>) => void;
  setNotifPrefs: (p: Partial<AppState["notifPrefs"]>) => void;
  addRecentSearch: (q: string) => void;
  resetDemo: () => void;
}

function seed() {
  const students = makeStudents();
  const projects = makeProjects(students);
  const teams = makeTeams(students, projects);
  const events = makeEvents(students, projects);
  events[0].attendees.push("me");
  const connections: Record<string, ConnectionState> = {};
  students.forEach((s, i) => {
    if (i % 4 === 1) connections[s.id] = "connected";
    else if (i === 2 || i === 9 || i === 15) connections[s.id] = "received";
    else if (i === 6 || i === 18) connections[s.id] = "sent";
  });
  return {
    auth: { loggedIn: true, email: "abhishek.tiwari@gmail.com", collegeEmail: "abhishek.229301@muj.manipal.edu", verified: true },
    onboarding: { step: 0, done: true },
    me: makeMe(),
    students,
    projects,
    teams,
    events,
    conversations: makeConversations(students),
    notifications: makeNotifications(students),
    connections,
    saved: { people: ["s4", "s12"], projects: ["p2", "p5"], teams: ["t1"], events: ["e2"] },
    integrations: getDefaultConnectedIntegrations(),
    privacy: { visibility: "Everyone" as const, codingStats: true, github: true, allowMessages: true, online: true },
    notifPrefs: { messages: true, connections: true, projects: true, events: true, recommendations: false },
    recentSearches: ["React", "hackathon", "Sneha"],
  };
}

let uid = 0;
const newId = (p: string) => `${p}${Date.now().toString(36)}${(uid++).toString(36)}`;

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ...seed(),

      login: (email) => set((s) => ({ auth: { ...s.auth, loggedIn: true, email } })),
      signup: (name, email, college) =>
        set((s) => ({
          auth: { loggedIn: true, email, collegeEmail: "", verified: false },
          onboarding: { step: 0, done: false },
          me: { ...s.me, name, college },
        })),
      logout: () => set((s) => ({ auth: { ...s.auth, loggedIn: false } })),
      verifyCollege: (collegeEmail) => set((s) => ({ auth: { ...s.auth, collegeEmail, verified: true } })),
      setOnboarding: (o) => set((s) => ({ onboarding: { ...s.onboarding, ...o } })),
      updateMe: (p) =>
        set((s) => {
          const nextMe = { ...s.me, ...p };
          if (!nextMe.codechef || !nextMe.codechef.trim()) {
            nextMe.codechef = undefined;
            nextMe.ccRating = undefined;
            nextMe.ccStars = undefined;
            nextMe.ccGlobalRank = undefined;
          }
          if (!nextMe.leetcode || !nextMe.leetcode.trim()) {
            nextMe.leetcode = undefined;
            nextMe.lcSolved = 0;
            nextMe.lcEasySolved = undefined;
            nextMe.lcMediumSolved = undefined;
            nextMe.lcHardSolved = undefined;
            nextMe.lcRanking = undefined;
            nextMe.leetcodeContributions = undefined;
            nextMe.leetcodeDaily = undefined;
          }
          if (!nextMe.codeforces || !nextMe.codeforces.trim()) {
            nextMe.codeforces = undefined;
            nextMe.cfRating = 0;
            nextMe.cfMaxRating = undefined;
            nextMe.cfRank = undefined;
            nextMe.codeforcesContributions = undefined;
            nextMe.codeforcesDaily = undefined;
          }
          if (!nextMe.github || !nextMe.github.trim()) {
            nextMe.github = undefined;
            nextMe.repos = 0;
            nextMe.contributions = [];
            nextMe.githubDaily = [];
            nextMe.githubAvatar = undefined;
          }
          if (!nextMe.kaggle || !nextMe.kaggle.trim()) {
            nextMe.kaggle = undefined;
            nextMe.kaggleTier = undefined;
            nextMe.kaggleNotebooks = undefined;
          }
          if (!nextMe.linkedin || !nextMe.linkedin.trim()) {
            nextMe.linkedin = undefined;
          }
          firestoreUpdateMe(nextMe).catch(console.error);
          return { me: nextMe };
        }),

      connect: (id) => {
        set((s) => ({ connections: { ...s.connections, [id]: "sent" } }));
        firestoreSendConnection(id).catch(console.error);
      },
      accept: (id) => {
        set((s) => ({ connections: { ...s.connections, [id]: "connected" } }));
        firestoreAcceptConnection(id).catch(console.error);
      },
      removeConnection: (id) => {
        set((s) => {
          const c = { ...s.connections };
          delete c[id];
          return { connections: c };
        });
        firestoreRemoveConnection(id).catch(console.error);
      },
      toggleSave: (kind, id) => {
        const has = get().saved[kind].includes(id);
        set((s) => ({ saved: { ...s.saved, [kind]: has ? s.saved[kind].filter((x) => x !== id) : [id, ...s.saved[kind]] } }));
        return !has;
      },

      upsertProject: (p) => {
        set((s) => ({
          projects: s.projects.some((x) => x.id === p.id) ? s.projects.map((x) => (x.id === p.id ? p : x)) : [p, ...s.projects],
        }));
        firestoreUpsertProject(p).catch(console.error);
      },
      deleteProject: (id) => {
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
        firestoreDeleteProject(id).catch(console.error);
      },
      toggleJoinProject: (id) => {
        const p = get().projects.find((x) => x.id === id);
        if (!p) return false;
        const joined = p.members.includes("me");
        const nextProject = {
          ...p,
          members: joined ? p.members.filter((m) => m !== "me") : [...p.members, "me"],
        };
        set((s) => ({
          projects: s.projects.map((x) => (x.id === id ? nextProject : x)),
        }));
        firestoreUpsertProject(nextProject).catch(console.error);
        return !joined;
      },

      upsertTeam: (t) => {
        set((s) => ({ teams: s.teams.some((x) => x.id === t.id) ? s.teams.map((x) => (x.id === t.id ? t : x)) : [t, ...s.teams] }));
        firestoreUpsertTeam(t).catch(console.error);
      },
      toggleJoinTeam: (id) => {
        const t = get().teams.find((x) => x.id === id);
        if (!t) return false;
        const joined = t.members.includes("me");
        const nextTeam = {
          ...t,
          members: joined ? t.members.filter((m) => m !== "me") : [...t.members, "me"],
          activity: [{ text: joined ? `${get().me.name} left the team` : `${get().me.name} joined the team`, when: "just now" }, ...t.activity],
        };
        set((s) => ({
          teams: s.teams.map((x) => (x.id === id ? nextTeam : x)),
        }));
        firestoreUpsertTeam(nextTeam).catch(console.error);
        return !joined;
      },
      inviteToTeam: (teamId, studentId) => {
        set((s) => ({
          teams: s.teams.map((t) =>
            t.id === teamId
              ? { ...t, activity: [{ text: `Invite sent to ${s.students.find((x) => x.id === studentId)?.name}`, when: "just now" }, ...t.activity] }
              : t,
          ),
        }));
        const t = get().teams.find((x) => x.id === teamId);
        if (t) firestoreUpsertTeam(t).catch(console.error);
      },

      toggleRegister: (id) => {
        const e = get().events.find((x) => x.id === id);
        if (!e) return false;
        const reg = e.attendees.includes("me");
        set((s) => ({
          events: s.events.map((x) => (x.id === id ? { ...x, attendees: reg ? x.attendees.filter((a) => a !== "me") : [...x.attendees, "me"] } : x)),
        }));
        firestoreToggleRegister(id).catch(console.error);
        return !reg;
      },
      addEvent: (e) => {
        set((s) => ({ events: [e, ...s.events] }));
        firestoreAddEvent(e).catch(console.error);
      },

      openConversation: (studentId) => {
        return firestoreOpenConversation(studentId);
      },
      sendMessage: (convId, text, attachment) => {
        set((s) => ({
          conversations: s.conversations
            .map((c) =>
              c.id === convId
                ? { ...c, messages: [...c.messages, { id: newId("m"), from: "me", text, ts: Date.now(), reactions: [], attachment }] }
                : c,
            )
            .sort((a, b) => (a.id === convId ? -1 : b.id === convId ? 1 : 0)),
        }));
        firestoreSendMessage(convId, text, attachment).catch(console.error);
      },
      receiveMessage: (convId, text) => {
        const c = get().conversations.find((x) => x.id === convId);
        if (!c) return;
        set((s) => ({
          conversations: s.conversations.map((x) =>
            x.id === convId
              ? { ...x, messages: [...x.messages, { id: newId("m"), from: x.participantId, text, ts: Date.now(), reactions: [] }] }
              : x,
          ),
        }));
      },
      markConversationRead: (convId) =>
        set((s) => ({ conversations: s.conversations.map((c) => (c.id === convId && c.unread ? { ...c, unread: 0 } : c)) })),
      toggleReaction: (convId, msgId, emoji) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === msgId ? { ...m, reactions: m.reactions.includes(emoji) ? m.reactions.filter((r) => r !== emoji) : [...m.reactions, emoji] } : m,
                  ),
                }
              : c,
          ),
        }));
        firestoreToggleReaction(convId, msgId, emoji).catch(console.error);
      },

      markNotification: (id, read = true) =>
        set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read } : n)) })),
      markAllNotifications: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      pushNotification: (n) =>
        set((s) => ({ notifications: [{ ...n, id: newId("n"), ts: Date.now(), read: false }, ...s.notifications] })),

      setIntegration: (p, i) =>
        set((s) => {
          const nextIntegrations = { ...s.integrations, [p]: i };
          const nextMe = { ...s.me };

          if (i.status === "connected" && i.handle) {
            if (p === "GitHub") {
              nextMe.github = i.handle;
              if (i.stats?.repos !== undefined) nextMe.repos = i.stats.repos;
              if (i.stats?.contributions) nextMe.contributions = i.stats.contributions;
              if (i.stats?.dailyContributions) nextMe.githubDaily = i.stats.dailyContributions;
              if (i.stats?.avatarUrl) nextMe.githubAvatar = i.stats.avatarUrl;
            } else if (p === "LeetCode") {
              nextMe.leetcode = i.handle;
              if (i.stats?.easySolved !== undefined && i.stats?.mediumSolved !== undefined && i.stats?.hardSolved !== undefined) {
                nextMe.lcSolved = i.stats.easySolved + i.stats.mediumSolved + i.stats.hardSolved;
                nextMe.lcEasySolved = i.stats.easySolved;
                nextMe.lcMediumSolved = i.stats.mediumSolved;
                nextMe.lcHardSolved = i.stats.hardSolved;
              } else if (i.stats?.primary) {
                const match = i.stats.primary.match(/\d+/);
                if (match) nextMe.lcSolved = parseInt(match[0], 10);
              }
              if (i.stats?.ranking) nextMe.lcRanking = Number(i.stats.ranking);
              if (i.stats?.contributions) nextMe.leetcodeContributions = i.stats.contributions;
              if (i.stats?.dailyContributions) nextMe.leetcodeDaily = i.stats.dailyContributions;
              if (i.stats?.avatarUrl) nextMe.leetcodeAvatar = i.stats.avatarUrl;
            } else if (p === "Codeforces") {
              nextMe.codeforces = i.handle;
              if (i.stats?.rating !== undefined) nextMe.cfRating = i.stats.rating;
              if (i.stats?.maxRating !== undefined) nextMe.cfMaxRating = i.stats.maxRating;
              if (i.stats?.rank) nextMe.cfRank = i.stats.rank;
              if (i.stats?.contributions) nextMe.codeforcesContributions = i.stats.contributions;
              if (i.stats?.dailyContributions) nextMe.codeforcesDaily = i.stats.dailyContributions;
              if (i.stats?.avatarUrl) nextMe.codeforcesAvatar = i.stats.avatarUrl;
            } else if (p === "CodeChef") {
              nextMe.codechef = i.handle;
              if (i.stats?.rating !== undefined) nextMe.ccRating = i.stats.rating;
              if (i.stats?.stars) nextMe.ccStars = i.stats.stars;
              if (i.stats?.globalRank) nextMe.ccGlobalRank = Number(i.stats.globalRank);
            } else if (p === "Kaggle") {
              nextMe.kaggle = i.handle;
              if (i.stats?.badge) nextMe.kaggleTier = i.stats.badge;
              if (i.stats?.notebooks !== undefined) nextMe.kaggleNotebooks = i.stats.notebooks;
            } else if (p === "LinkedIn") {
              nextMe.linkedin = i.handle;
            }
          } else if (i.status === "disconnected") {
            if (p === "GitHub") {
              nextMe.github = undefined;
              nextMe.repos = 0;
              nextMe.contributions = [];
              nextMe.githubDaily = [];
              nextMe.githubAvatar = undefined;
            } else if (p === "LeetCode") {
              nextMe.leetcode = undefined;
              nextMe.lcSolved = 0;
              nextMe.lcEasySolved = undefined;
              nextMe.lcMediumSolved = undefined;
              nextMe.lcHardSolved = undefined;
              nextMe.lcRanking = undefined;
              nextMe.leetcodeContributions = undefined;
              nextMe.leetcodeDaily = undefined;
              nextMe.leetcodeAvatar = undefined;
            } else if (p === "Codeforces") {
              nextMe.codeforces = undefined;
              nextMe.cfRating = 0;
              nextMe.cfMaxRating = undefined;
              nextMe.cfRank = undefined;
              nextMe.codeforcesContributions = undefined;
              nextMe.codeforcesDaily = undefined;
              nextMe.codeforcesAvatar = undefined;
            } else if (p === "CodeChef") {
              nextMe.codechef = undefined;
              nextMe.ccRating = undefined;
              nextMe.ccStars = undefined;
              nextMe.ccGlobalRank = undefined;
            } else if (p === "Kaggle") {
              nextMe.kaggle = undefined;
              nextMe.kaggleTier = undefined;
              nextMe.kaggleNotebooks = undefined;
            } else if (p === "LinkedIn") {
              nextMe.linkedin = undefined;
            }
          }

          return { integrations: nextIntegrations, me: nextMe };
        }),

      connectAllIntegrations: () => {
        const defaults = getDefaultConnectedIntegrations();
        set(() => ({
          integrations: defaults,
        }));
      },

      syncAllIntegrations: async () => {
        const state = get();
        const platforms = Object.keys(state.integrations) as Platform[];
        const syncingState = { ...state.integrations };
        for (const p of platforms) {
          if (syncingState[p].status === "connected") {
            syncingState[p] = { ...syncingState[p], status: "syncing" };
          }
        }
        set({ integrations: syncingState });

        for (const p of platforms) {
          const current = state.integrations[p];
          if (current.status === "connected" && current.handle) {
            try {
              const { handle, stats } = await fetchPlatformStats(p, current.handle);
              get().setIntegration(p, {
                status: "connected",
                handle,
                lastSync: Date.now(),
                stats,
              });
            } catch (err) {
              console.warn(`Sync failed for ${p}:`, err);
            }
          }
        }
      },

      setPrivacy: (p) => set((s) => ({ privacy: { ...s.privacy, ...p } })),
      setNotifPrefs: (p) => set((s) => ({ notifPrefs: { ...s.notifPrefs, ...p } })),
      addRecentSearch: (q) =>
        set((s) => ({ recentSearches: [q, ...s.recentSearches.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6) })),
      resetDemo: () => set(seed()),
    }),
    {
      name: "campusgraph-v4",
      skipHydration: true,
      version: 4,
      migrate: (persistedState: any) => {
        const state = { ...persistedState };
        if (state.me) {
          state.me.name = "Abhishek Tiwari";
          state.me.pronoun = "he";
          // If codechef was not explicitly provided by the user, clear mock codechef
          if (state.me.codechef === "abhishek_t" || state.me.codechef === "aditi_t") {
            state.me.codechef = undefined;
            state.me.ccRating = undefined;
            state.me.ccStars = undefined;
            state.me.ccGlobalRank = undefined;
          }
          if (state.me.leetcode === "abhishek_t" || state.me.leetcode === "aditi_t") {
            state.me.leetcode = undefined;
            state.me.lcSolved = 0;
            state.me.leetcodeContributions = undefined;
            state.me.leetcodeDaily = undefined;
          }
          if (state.me.codeforces === "abhishek_coder" || state.me.codeforces === "aditi_coder") {
            state.me.codeforces = undefined;
            state.me.cfRating = 0;
            state.me.codeforcesContributions = undefined;
            state.me.codeforcesDaily = undefined;
          }
          if (state.me.kaggle === "abhishek_tiwari" || state.me.kaggle === "aditi_tiwari") {
            state.me.kaggle = undefined;
            state.me.kaggleTier = undefined;
            state.me.kaggleNotebooks = undefined;
          }
          if (state.me.linkedin === "abhishek-tiwari" || state.me.linkedin === "aditi-tiwari") {
            state.me.linkedin = undefined;
          }
        }
        if (state.auth && state.auth.email === "aditi.tiwari@gmail.com") {
          state.auth.email = "abhishek.tiwari@gmail.com";
          state.auth.collegeEmail = "abhishek.229301@muj.manipal.edu";
        }
        return {
          ...state,
          integrations: getDefaultConnectedIntegrations(),
        };
      },
    },
  ),
  shallow,
);

export function getPerson(state: AppState, id: string): Student | undefined {
  return id === "me" ? state.me : state.students.find((s) => s.id === id);
}
