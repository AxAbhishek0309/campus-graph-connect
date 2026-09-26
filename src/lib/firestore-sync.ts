import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { useApp } from "./store";
import { makeStudents, makeEvents, makeProjects, makeTeams } from "./data";
import type { ConnectionState, Conversation, EventItem, Message, Project, Student, Team } from "./types";

// Active unsubscribe functions to prevent memory leaks / duplicate subscriptions
let unsubUsers: Unsubscribe | null = null;
let unsubMe: Unsubscribe | null = null;
let unsubConnections: Unsubscribe | null = null;
let unsubConversations: Unsubscribe | null = null;
let unsubEvents: Unsubscribe | null = null;
let unsubProjects: Unsubscribe | null = null;
let unsubTeams: Unsubscribe | null = null;
const activeMessageUnsubs = new Map<string, Unsubscribe>();

/**
 * Generate a deterministic conversation ID for direct messaging between two users.
 */
export function getDirectConversationId(userA: string, userB: string): string {
  return [userA, userB].sort().join("__");
}

/**
 * Clean up all active listeners.
 */
export function cleanupFirestoreSync() {
  if (unsubUsers) { unsubUsers(); unsubUsers = null; }
  if (unsubMe) { unsubMe(); unsubMe = null; }
  if (unsubConnections) { unsubConnections(); unsubConnections = null; }
  if (unsubConversations) { unsubConversations(); unsubConversations = null; }
  if (unsubEvents) { unsubEvents(); unsubEvents = null; }
  if (unsubProjects) { unsubProjects(); unsubProjects = null; }
  if (unsubTeams) { unsubTeams(); unsubTeams = null; }
  for (const unsub of activeMessageUnsubs.values()) {
    unsub();
  }
  activeMessageUnsubs.clear();
}

/**
 * Seed initial students into Firestore if the `users` collection is empty.
 */
async function seedInitialUsersIfEmpty() {
  try {
    const snap = await getDocs(collection(db, "users"));
    if (!snap.empty) return;

    console.info("[Firestore] Initializing 'users' collection with student profiles...");
    const batch = writeBatch(db);
    const initialStudents = makeStudents();

    for (const student of initialStudents) {
      const ref = doc(db, "users", student.id);
      batch.set(ref, student);
    }

    await batch.commit();
    console.info(`[Firestore] Successfully seeded ${initialStudents.length} students.`);
  } catch (err) {
    console.warn("[Firestore] Notice: Auto-seed skipped or permission restricted:", err);
  }
}

/**
 * Seed real upcoming hackathons & competitions into Firestore if `events` is empty.
 */
async function seedInitialEventsIfEmpty() {
  try {
    const snap = await getDocs(collection(db, "events"));
    if (!snap.empty) return;

    console.info("[Firestore] Initializing 'events' collection with top-notch hackathons & competitions...");
    const batch = writeBatch(db);
    const students = useApp.getState().students;
    const projects = useApp.getState().projects;
    const initialEvents = makeEvents(students, projects);

    for (const event of initialEvents) {
      const ref = doc(db, "events", event.id);
      batch.set(ref, event);
    }

    await batch.commit();
    console.info(`[Firestore] Successfully seeded ${initialEvents.length} hackathons and competitions.`);
  } catch (err) {
    console.warn("[Firestore] Events auto-seed notice:", err);
  }
}

/**
 * Seed initial projects if empty.
 */
async function seedInitialProjectsIfEmpty() {
  try {
    const snap = await getDocs(collection(db, "projects"));
    if (!snap.empty) return;

    const batch = writeBatch(db);
    const students = useApp.getState().students;
    const initialProjects = makeProjects(students);

    for (const project of initialProjects) {
      const ref = doc(db, "projects", project.id);
      batch.set(ref, project);
    }

    await batch.commit();
  } catch (err) {
    console.warn("[Firestore] Projects auto-seed notice:", err);
  }
}

/**
 * Seed initial teams if empty.
 */
async function seedInitialTeamsIfEmpty() {
  try {
    const snap = await getDocs(collection(db, "teams"));
    if (!snap.empty) return;

    const batch = writeBatch(db);
    const students = useApp.getState().students;
    const projects = useApp.getState().projects;
    const initialTeams = makeTeams(students, projects);

    for (const team of initialTeams) {
      const ref = doc(db, "teams", team.id);
      batch.set(ref, team);
    }

    await batch.commit();
  } catch (err) {
    console.warn("[Firestore] Teams auto-seed notice:", err);
  }
}

/**
 * Initialize real-time synchronization between Firestore and the application state.
 */
export function initFirestoreSync(uid: string | null) {
  // Clear previous listeners if any
  cleanupFirestoreSync();

  // Background seed checks
  seedInitialUsersIfEmpty().catch(() => {});
  seedInitialEventsIfEmpty().catch(() => {});
  seedInitialProjectsIfEmpty().catch(() => {});
  seedInitialTeamsIfEmpty().catch(() => {});

  // 1. Real-time listener for all students (users)
  try {
    unsubUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        if (!snapshot.empty) {
          const liveStudents: Student[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as Student;
            liveStudents.push({ ...data, id: d.id });
          });

          const currentUid = uid || auth.currentUser?.uid;
          const otherStudents = currentUid
            ? liveStudents.filter((s) => s.id !== currentUid && s.id !== "me")
            : liveStudents.filter((s) => s.id !== "me");

          useApp.setState({ students: otherStudents.length > 0 ? otherStudents : liveStudents });
        }
      },
      (err) => console.warn("[Firestore] users listener:", err.message)
    );
  } catch (err) {
    console.error("[Firestore] users listener error:", err);
  }

  // 2. Real-time listener for events (hackathons, competitions, workshops)
  try {
    unsubEvents = onSnapshot(
      collection(db, "events"),
      (snapshot) => {
        if (!snapshot.empty) {
          const liveEvents: EventItem[] = [];
          snapshot.forEach((d) => {
            liveEvents.push({ ...(d.data() as EventItem), id: d.id });
          });
          useApp.setState({ events: liveEvents });
        }
      },
      (err) => console.warn("[Firestore] events listener:", err.message)
    );
  } catch (err) {
    console.error("[Firestore] events listener error:", err);
  }

  // 3. Real-time listener for projects
  try {
    unsubProjects = onSnapshot(
      collection(db, "projects"),
      (snapshot) => {
        if (!snapshot.empty) {
          const liveProjects: Project[] = [];
          snapshot.forEach((d) => {
            liveProjects.push({ ...(d.data() as Project), id: d.id });
          });
          useApp.setState({ projects: liveProjects });
        }
      },
      (err) => console.warn("[Firestore] projects listener:", err.message)
    );
  } catch (err) {
    console.error("[Firestore] projects listener error:", err);
  }

  // 4. Real-time listener for teams
  try {
    unsubTeams = onSnapshot(
      collection(db, "teams"),
      (snapshot) => {
        if (!snapshot.empty) {
          const liveTeams: Team[] = [];
          snapshot.forEach((d) => {
            liveTeams.push({ ...(d.data() as Team), id: d.id });
          });
          useApp.setState({ teams: liveTeams });
        }
      },
      (err) => console.warn("[Firestore] teams listener:", err.message)
    );
  } catch (err) {
    console.error("[Firestore] teams listener error:", err);
  }

  // If user is not authenticated, only public discovery is synced
  if (!uid) return;

  // 5. Real-time listener for current user's profile (`users/{uid}`)
  try {
    const userDocRef = doc(db, "users", uid);
    unsubMe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data() as Student;
          const currentStoreMe = useApp.getState().me;
          useApp.setState({
            me: {
              ...currentStoreMe,
              ...userData,
              id: "me", // Keep consistent UI binding
            },
          });
        } else {
          // Initialize document for newly authenticated user
          const currentMe = useApp.getState().me;
          const user = auth.currentUser;
          const newProfile: Student = {
            ...currentMe,
            id: uid,
            name: user?.displayName || currentMe.name || "Student",
            college: currentMe.college || "Manipal University Jaipur",
          };
          setDoc(userDocRef, newProfile, { merge: true }).catch((err) =>
            console.warn("[Firestore] user doc init error:", err)
          );
        }
      },
      (err) => console.warn("[Firestore] me listener:", err.message)
    );
  } catch (err) {
    console.error("[Firestore] me listener error:", err);
  }

  // 6. Real-time listener for friends / connections
  try {
    const connQuery = query(
      collection(db, "connections"),
      where("participants", "array-contains", uid)
    );

    unsubConnections = onSnapshot(
      connQuery,
      (snapshot) => {
        const conns: Record<string, ConnectionState> = {};
        snapshot.forEach((d) => {
          const data = d.data();
          const from = data.from as string;
          const to = data.to as string;
          const status = data.status as string;
          const partnerId = from === uid ? to : from;

          if (status === "connected") {
            conns[partnerId] = "connected";
          } else if (status === "pending") {
            conns[partnerId] = from === uid ? "sent" : "received";
          }
        });

        useApp.setState({ connections: conns });
      },
      (err) => console.warn("[Firestore] connections listener:", err.message)
    );
  } catch (err) {
    console.error("[Firestore] connections listener error:", err);
  }

  // 7. Real-time listener for conversations
  try {
    const convQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", uid),
      orderBy("updatedAt", "desc")
    );

    unsubConversations = onSnapshot(
      convQuery,
      (snapshot) => {
        const existingConversations = useApp.getState().conversations;
        const convList: Conversation[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const convId = docSnap.id;
          const participants = (data.participants as string[]) || [];
          const partnerId = participants.find((p) => p !== uid) || "unknown";

          const ex = existingConversations.find((c) => c.id === convId);

          convList.push({
            id: convId,
            participantId: partnerId,
            messages: ex?.messages || [],
            unread: data.unreadCount?.[uid] || 0,
          });

          // Attach subcollection listener for messages
          if (!activeMessageUnsubs.has(convId)) {
            const msgQuery = query(
              collection(db, "conversations", convId, "messages"),
              orderBy("ts", "asc")
            );

            const unsubMsg = onSnapshot(
              msgQuery,
              (msgSnapshot) => {
                const messages: Message[] = [];
                msgSnapshot.forEach((mDoc) => {
                  const mData = mDoc.data();
                  messages.push({
                    id: mDoc.id,
                    from: mData.from === uid ? "me" : mData.from,
                    text: mData.text || "",
                    ts: mData.ts || Date.now(),
                    reactions: mData.reactions || [],
                    attachment: mData.attachment || undefined,
                  });
                });

                useApp.setState((s) => ({
                  conversations: s.conversations.map((c) =>
                    c.id === convId ? { ...c, messages } : c
                  ),
                }));
              },
              (err) => console.warn(`[Firestore] messages listener (${convId}):`, err.message)
            );

            activeMessageUnsubs.set(convId, unsubMsg);
          }
        });

        if (convList.length > 0) {
          useApp.setState((s) => {
            const merged = convList.map((c) => {
              const existing = s.conversations.find((x) => x.id === c.id);
              return {
                ...c,
                messages: existing && existing.messages.length > 0 ? existing.messages : c.messages,
              };
            });
            return { conversations: merged };
          });
        }
      },
      (err) => console.warn("[Firestore] conversations listener:", err.message)
    );
  } catch (err) {
    console.error("[Firestore] conversations listener error:", err);
  }
}

/**
 * Save user profile updates to Firestore in real-time.
 */
export async function firestoreUpdateMe(p: Partial<Student>) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(db, "users", user.uid);
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(p)) {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    cleaned.lastActiveMins = 0;
    cleaned.updatedAt = Date.now();

    await setDoc(userRef, cleaned, { merge: true });
  } catch (err) {
    console.error("[Firestore] updateMe error:", err);
  }
}

/**
 * Send a connection / friend request in Firestore.
 */
export async function firestoreSendConnection(targetId: string) {
  const user = auth.currentUser;
  const uid = user ? user.uid : "me";
  const docId = [uid, targetId].sort().join("__");

  try {
    await setDoc(
      doc(db, "connections", docId),
      {
        participants: [uid, targetId],
        from: uid,
        to: targetId,
        status: "pending",
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("[Firestore] sendConnection error:", err);
  }
}

/**
 * Accept a connection / friend request in Firestore.
 */
export async function firestoreAcceptConnection(targetId: string) {
  const user = auth.currentUser;
  const uid = user ? user.uid : "me";
  const docId = [uid, targetId].sort().join("__");

  try {
    await setDoc(
      doc(db, "connections", docId),
      {
        status: "connected",
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("[Firestore] acceptConnection error:", err);
  }
}

/**
 * Remove or decline a friend connection in Firestore.
 */
export async function firestoreRemoveConnection(targetId: string) {
  const user = auth.currentUser;
  const uid = user ? user.uid : "me";
  const docId = [uid, targetId].sort().join("__");

  try {
    await deleteDoc(doc(db, "connections", docId));
  } catch (err) {
    console.error("[Firestore] removeConnection error:", err);
  }
}

/**
 * Open or create a conversation with a student. Returns conversation ID.
 */
export function firestoreOpenConversation(targetStudentId: string): string {
  const user = auth.currentUser;
  const uid = user ? user.uid : "me";
  const convId = getDirectConversationId(uid, targetStudentId);

  const existing = useApp.getState().conversations.find((c) => c.id === convId);
  if (!existing) {
    useApp.setState((s) => ({
      conversations: [
        { id: convId, participantId: targetStudentId, messages: [], unread: 0 },
        ...s.conversations,
      ],
    }));
  }

  if (user) {
    setDoc(
      doc(db, "conversations", convId),
      {
        id: convId,
        participants: [uid, targetStudentId],
        updatedAt: Date.now(),
      },
      { merge: true }
    ).catch((err) => console.warn("[Firestore] openConversation setDoc:", err));
  }

  return convId;
}

/**
 * Send a real-time message to a conversation in Firestore.
 */
export async function firestoreSendMessage(
  convId: string,
  text: string,
  attachment?: string
) {
  const user = auth.currentUser;
  const uid = user ? user.uid : "me";
  const parts = convId.split("__");
  const targetId = parts.find((p) => p !== uid) || "unknown";

  const messagePayload = {
    from: uid,
    text,
    ts: Date.now(),
    reactions: [],
    attachment: attachment || null,
  };

  try {
    await addDoc(
      collection(db, "conversations", convId, "messages"),
      messagePayload
    );

    await setDoc(
      doc(db, "conversations", convId),
      {
        participants: [uid, targetId],
        lastMessage: {
          text,
          from: uid,
          ts: Date.now(),
          attachment: attachment || null,
        },
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("[Firestore] sendMessage error:", err);
  }
}

/**
 * Toggle a reaction on a message in Firestore.
 */
export async function firestoreToggleReaction(
  convId: string,
  msgId: string,
  emoji: string
) {
  try {
    const msgRef = doc(db, "conversations", convId, "messages", msgId);
    const snap = await getDoc(msgRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const current: string[] = data.reactions || [];
    const next = current.includes(emoji)
      ? current.filter((r) => r !== emoji)
      : [...current, emoji];

    await updateDoc(msgRef, { reactions: next });
  } catch (err) {
    console.error("[Firestore] toggleReaction error:", err);
  }
}

/**
 * Toggle event registration in Firestore.
 */
export async function firestoreToggleRegister(eventId: string): Promise<boolean> {
  const user = auth.currentUser;
  const uid = user ? user.uid : "me";
  const eventRef = doc(db, "events", eventId);

  try {
    const snap = await getDoc(eventRef);
    if (!snap.exists()) return false;

    const data = snap.data() as EventItem;
    const isRegistered = data.attendees.includes(uid) || data.attendees.includes("me");
    const nextAttendees = isRegistered
      ? data.attendees.filter((a) => a !== uid && a !== "me")
      : [...data.attendees, uid];

    await updateDoc(eventRef, { attendees: nextAttendees });
    return !isRegistered;
  } catch (err) {
    console.error("[Firestore] toggleRegister error:", err);
    return false;
  }
}

/**
 * Add a new event hosted by a student to Firestore.
 */
export async function firestoreAddEvent(event: EventItem) {
  try {
    await setDoc(doc(db, "events", event.id), event);
  } catch (err) {
    console.error("[Firestore] addEvent error:", err);
  }
}

/**
 * Upsert a project to Firestore.
 */
export async function firestoreUpsertProject(p: Project) {
  try {
    await setDoc(doc(db, "projects", p.id), p, { merge: true });
  } catch (err) {
    console.error("[Firestore] upsertProject error:", err);
  }
}

/**
 * Delete a project from Firestore.
 */
export async function firestoreDeleteProject(id: string) {
  try {
    await deleteDoc(doc(db, "projects", id));
  } catch (err) {
    console.error("[Firestore] deleteProject error:", err);
  }
}

/**
 * Upsert a team to Firestore.
 */
export async function firestoreUpsertTeam(t: Team) {
  try {
    await setDoc(doc(db, "teams", t.id), t, { merge: true });
  } catch (err) {
    console.error("[Firestore] upsertTeam error:", err);
  }
}
