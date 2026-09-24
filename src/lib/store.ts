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
    auth: { loggedIn: true, email: "aditi.tiwari@gmail.com", collegeEmail: "aditi.229301@muj.manipal.edu", verified: true },
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
    integrations: {
      GitHub: { status: "connected", handle: "aditi-tiwari", lastSync: Date.UTC(2026, 8, 24, 6) },
      LeetCode: { status: "connected", handle: "aditi_t", lastSync: Date.UTC(2026, 8, 23, 18) },
      Codeforces: { status: "disconnected" },
      CodeChef: { status: "disconnected" },
      Kaggle: { status: "disconnected" },
      LinkedIn: { status: "connected", handle: "aditi-tiwari", lastSync: Date.UTC(2026, 8, 20) },
    } as Record<Platform, Integration>,
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
      updateMe: (p) => set((s) => ({ me: { ...s.me, ...p } })),

      connect: (id) => {
        set((s) => ({ connections: { ...s.connections, [id]: "sent" } }));
        // Simulate acceptance from highly active students after a moment
        const st = get().students.find((x) => x.id === id);
        if (st?.activity === "high") {
          setTimeout(() => {
            if (get().connections[id] !== "sent") return;
            set((s) => ({ connections: { ...s.connections, [id]: "connected" } }));
            get().pushNotification({ type: "connection", text: `${st.name} accepted your connection request`, actorId: id, href: `/people/${id}` });
          }, 6000);
        }
      },
      accept: (id) => set((s) => ({ connections: { ...s.connections, [id]: "connected" } })),
      removeConnection: (id) =>
        set((s) => {
          const c = { ...s.connections };
          delete c[id];
          return { connections: c };
        }),
      toggleSave: (kind, id) => {
        const has = get().saved[kind].includes(id);
        set((s) => ({ saved: { ...s.saved, [kind]: has ? s.saved[kind].filter((x) => x !== id) : [id, ...s.saved[kind]] } }));
        return !has;
      },

      upsertProject: (p) =>
        set((s) => ({
          projects: s.projects.some((x) => x.id === p.id) ? s.projects.map((x) => (x.id === p.id ? p : x)) : [p, ...s.projects],
        })),
      deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      toggleJoinProject: (id) => {
        const p = get().projects.find((x) => x.id === id);
        if (!p) return false;
        const joined = p.members.includes("me");
        set((s) => ({
          projects: s.projects.map((x) => (x.id === id ? { ...x, members: joined ? x.members.filter((m) => m !== "me") : [...x.members, "me"] } : x)),
        }));
        return !joined;
      },

      upsertTeam: (t) =>
        set((s) => ({ teams: s.teams.some((x) => x.id === t.id) ? s.teams.map((x) => (x.id === t.id ? t : x)) : [t, ...s.teams] })),
      toggleJoinTeam: (id) => {
        const t = get().teams.find((x) => x.id === id);
        if (!t) return false;
        const joined = t.members.includes("me");
        set((s) => ({
          teams: s.teams.map((x) =>
            x.id === id
              ? {
                  ...x,
                  members: joined ? x.members.filter((m) => m !== "me") : [...x.members, "me"],
                  activity: [{ text: joined ? "Aditi left the team" : `${s.me.name} joined the team`, when: "just now" }, ...x.activity],
                }
              : x,
          ),
        }));
        return !joined;
      },
      inviteToTeam: (teamId, studentId) =>
        set((s) => ({
          teams: s.teams.map((t) =>
            t.id === teamId
              ? { ...t, activity: [{ text: `Invite sent to ${s.students.find((x) => x.id === studentId)?.name}`, when: "just now" }, ...t.activity] }
              : t,
          ),
        })),

      toggleRegister: (id) => {
        const e = get().events.find((x) => x.id === id);
        if (!e) return false;
        const reg = e.attendees.includes("me");
        set((s) => ({
          events: s.events.map((x) => (x.id === id ? { ...x, attendees: reg ? x.attendees.filter((a) => a !== "me") : [...x.attendees, "me"] } : x)),
        }));
        return !reg;
      },
      addEvent: (e) => set((s) => ({ events: [e, ...s.events] })),

      openConversation: (studentId) => {
        const ex = get().conversations.find((c) => c.participantId === studentId);
        if (ex) return ex.id;
        const id = newId("c");
        set((s) => ({ conversations: [{ id, participantId: studentId, messages: [], unread: 0 }, ...s.conversations] }));
        return id;
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
      toggleReaction: (convId, msgId, emoji) =>
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
        })),

      markNotification: (id, read = true) =>
        set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read } : n)) })),
      markAllNotifications: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      pushNotification: (n) =>
        set((s) => ({ notifications: [{ ...n, id: newId("n"), ts: Date.now(), read: false }, ...s.notifications] })),

      setIntegration: (p, i) => set((s) => ({ integrations: { ...s.integrations, [p]: i } })),
      setPrivacy: (p) => set((s) => ({ privacy: { ...s.privacy, ...p } })),
      setNotifPrefs: (p) => set((s) => ({ notifPrefs: { ...s.notifPrefs, ...p } })),
      addRecentSearch: (q) =>
        set((s) => ({ recentSearches: [q, ...s.recentSearches.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6) })),
      resetDemo: () => set(seed()),
    }),
    { name: "campusgraph-v1", skipHydration: true, version: 1 },
  ),
  shallow,
);

export function getPerson(state: AppState, id: string): Student | undefined {
  return id === "me" ? state.me : state.students.find((s) => s.id === id);
}
