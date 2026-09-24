import type {
  Conversation,
  EventItem,
  LookingFor,
  Notification,
  Project,
  Student,
  Team,
} from "./types";

// Fixed reference time so seed data is deterministic across server and client.
export const BASE_TIME = Date.UTC(2026, 8, 24, 9, 0, 0);

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SKILLS = [
  "Python", "Java", "C++", "JavaScript", "TypeScript", "React", "Node.js", "ML", "NLP",
  "Cybersecurity", "Cloud", "SQL", "UI/UX", "Go", "Rust", "Flutter", "Figma", "PyTorch",
  "Docker", "Kotlin", "Data Analysis", "Computer Vision", "Embedded C", "Solidity",
];
export const INTERESTS = [
  "AI/ML", "Web Development", "Research", "Startups", "Hackathons", "Competitive Programming",
  "Robotics", "Finance", "Design", "Open Source", "Blockchain", "Game Dev", "Product",
  "Public Speaking", "Music", "Photography",
];
export const LOOKING_FOR: LookingFor[] = [
  "Coding Partner", "Hackathon Partner", "Project Collaborator", "Research Partner",
  "Study Partner", "Mentor", "Career Peer", "Friends",
];
export const COLLEGES = [
  "Manipal University Jaipur", "IIT Delhi", "BITS Pilani", "NIT Trichy", "VIT Vellore",
  "IIIT Hyderabad", "DTU Delhi", "SRM Chennai",
];
export const BRANCHES = [
  "CSE", "CSE (Data Science)", "IT", "ECE", "Mechanical", "Electrical", "CSE (AI & ML)",
  "Mathematics & Computing", "Biotech",
];
export const PLATFORMS = ["GitHub", "LeetCode", "Codeforces", "CodeChef", "Kaggle", "LinkedIn"] as const;

const NAMES: [string, Student["pronoun"]][] = [
  ["Rohan Mehta", "he"], ["Sneha Iyer", "she"], ["Arjun Nair", "he"], ["Kavya Reddy", "she"],
  ["Ishaan Kapoor", "he"], ["Meera Joshi", "she"], ["Aarav Sharma", "he"], ["Diya Menon", "she"],
  ["Vikram Singh", "he"], ["Ananya Rao", "she"], ["Kabir Malhotra", "he"], ["Tara Bose", "she"],
  ["Nikhil Verma", "he"], ["Riya Desai", "she"], ["Aditya Kulkarni", "he"], ["Pooja Pillai", "she"],
  ["Siddharth Jain", "he"], ["Nisha Agarwal", "she"], ["Yash Gupta", "he"], ["Aisha Khan", "she"],
  ["Dev Patel", "he"], ["Shreya Ghosh", "she"], ["Rahul Chatterjee", "he"], ["Zara Sheikh", "she"],
  ["Om Trivedi", "he"], ["Lavanya Krishnan", "she"], ["Harsh Pandey", "he"], ["Ira Saxena", "she"],
  ["Karan Bhatia", "he"], ["Myra Fernandes", "she"], ["Sahil Arora", "he"], ["Neha Chauhan", "she"],
  ["Parth Shah", "he"], ["Aditi Banerjee", "she"], ["Varun Das", "he"], ["Sana Mirza", "she"],
  ["Alex Thomas", "they"], ["Rhea Kaur", "she"], ["Manav Sethi", "he"], ["Priya Natarajan", "she"],
  ["Tanmay Hegde", "he"], ["Juhi Mathur", "she"],
];

const BIOS = [
  "Backend person who likes clean APIs and cold coffee. Currently building a campus ride-share app.",
  "ML student exploring NLP for Indian languages. Always up for a research discussion.",
  "Competitive programmer, Codeforces Expert. Looking for people to practice virtual contests with.",
  "Designer who codes. I care about how things feel, not just how they look.",
  "Hackathon regular — 6 so far, 2 wins. Need a frontend teammate for the next one.",
  "Trying to get into open source. Would love a mentor who has contributed to big projects.",
  "Robotics club lead. We build line followers and occasionally things that actually work.",
  "Interested in fintech and product. Prepping for PM internships this cycle.",
  "First year, still figuring things out. Happy to join any project that needs an extra pair of hands.",
  "Cloud and DevOps nerd. Kubernetes clusters in my free time, which says a lot.",
  "Security enthusiast. CTF player, occasional bug bounty hunter.",
  "",
];

const EXPERIENCE = [
  { title: "SDE Intern", org: "Razorpay", period: "May – Jul 2026" },
  { title: "Research Intern", org: "IISc Bangalore", period: "Summer 2025" },
  { title: "Frontend Intern", org: "Zomato", period: "Jan – Apr 2026" },
  { title: "ML Intern", org: "Sarvam AI", period: "Summer 2026" },
  { title: "Core Member", org: "ACM Student Chapter", period: "2025 – Present" },
  { title: "GSoC Contributor", org: "Mozilla", period: "2025" },
  { title: "Teaching Assistant", org: "Data Structures", period: "Fall 2025" },
];

function pick<T>(r: () => number, arr: readonly T[]): T {
  return arr[Math.floor(r() * arr.length)];
}
function pickN<T>(r: () => number, arr: readonly T[], min: number, max: number): T[] {
  const n = min + Math.floor(r() * (max - min + 1));
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(r() * copy.length), 1)[0]);
  return out;
}

export function makeMe(): Student {
  return {
    id: "me",
    name: "Aditi Tiwari",
    pronoun: "she",
    hue: 222,
    college: "Manipal University Jaipur",
    degree: "B.Tech",
    branch: "CSE (Data Science)",
    year: 3,
    bio: "Data science student who enjoys building full-stack tools around ML models. Currently working on a course-review platform for our campus and looking for a hackathon team for Smart India Hackathon.",
    skills: ["Python", "React", "Node.js", "ML", "SQL"],
    interests: ["AI/ML", "Web Development", "Hackathons", "Startups"],
    lookingFor: ["Hackathon Partner", "Project Collaborator", "Mentor"],
    verified: true,
    activity: "high",
    availability: "Open to chat",
    connections: 0,
    joinedDaysAgo: 120,
    lastActiveMins: 0,
    github: "aditi-tiwari",
    leetcode: "aditi_t",
    linkedin: "aditi-tiwari",
    repos: 23,
    lcSolved: 312,
    cfRating: 1412,
    contributions: makeContrib(rng(999), "high"),
    experience: [EXPERIENCE[0], EXPERIENCE[4]],
  };
}

function makeContrib(r: () => number, activity: Student["activity"]) {
  const base = activity === "high" ? 9 : activity === "medium" ? 4 : activity === "low" ? 1 : 0.4;
  return Array.from({ length: 52 }, () => Math.max(0, Math.round(base * r() * 2 - (r() < 0.2 ? base : 0))));
}

export function makeStudents(): Student[] {
  const r = rng(42);
  return NAMES.map(([name, pronoun], i) => {
    const activity: Student["activity"] =
      i % 7 === 0 ? "new" : i % 5 === 0 ? "low" : i % 3 === 0 ? "high" : "medium";
    const incomplete = i % 6 === 5;
    const lc = activity === "new" ? 0 : Math.floor(r() * 600);
    return {
      id: `s${i + 1}`,
      name,
      pronoun,
      hue: Math.floor(r() * 360),
      college: i < 14 ? "Manipal University Jaipur" : pick(r, COLLEGES),
      degree: i % 11 === 0 ? "M.Tech" : "B.Tech",
      branch: pick(r, BRANCHES),
      year: 1 + Math.floor(r() * 4),
      bio: incomplete ? "" : BIOS[i % (BIOS.length - 1)],
      skills: incomplete ? pickN(r, SKILLS, 1, 2) : pickN(r, SKILLS, 3, 6),
      interests: incomplete ? pickN(r, INTERESTS, 0, 1) : pickN(r, INTERESTS, 2, 4),
      lookingFor: pickN(r, LOOKING_FOR, 1, 3),
      verified: i % 8 !== 3,
      activity,
      availability: pick(r, ["Available", "Busy", "Open to chat"] as const),
      connections: activity === "new" ? Math.floor(r() * 5) : Math.floor(r() * 320),
      joinedDaysAgo: activity === "new" ? 1 + Math.floor(r() * 10) : 30 + Math.floor(r() * 600),
      lastActiveMins: activity === "high" ? Math.floor(r() * 60) : Math.floor(r() * 6000),
      github: incomplete ? undefined : name.toLowerCase().replace(" ", "-"),
      leetcode: lc > 0 ? name.split(" ")[0].toLowerCase() + (i + 10) : undefined,
      linkedin: incomplete ? undefined : name.toLowerCase().replace(" ", "-"),
      repos: activity === "new" ? Math.floor(r() * 3) : Math.floor(r() * 45),
      lcSolved: lc,
      cfRating: activity === "new" || r() < 0.3 ? 0 : 900 + Math.floor(r() * 1100),
      contributions: makeContrib(r, activity),
      experience: incomplete ? [] : pickN(r, EXPERIENCE, 0, 2),
      mentor: i % 9 === 2 || (i % 4 === 0 && i > 20),
    } satisfies Student;
  }).map((s) => (s.mentor ? { ...s, year: 4 } : s));
}

const PROJECT_SEEDS: [string, string, string, string[]][] = [
  ["CourseLens", "Honest course and professor reviews for our campus, with syllabus breakdowns and exam patterns.", "Web", ["React", "Node.js", "SQL"]],
  ["Hindi Sentiment Toolkit", "Open-source sentiment analysis models and datasets for Hindi and Hinglish social media text.", "Research", ["Python", "NLP", "PyTorch"]],
  ["RideShare MUJ", "Share cabs to Jaipur airport and railway station with verified students.", "Mobile", ["Flutter", "Node.js", "Cloud"]],
  ["LabSlot", "Book lab equipment and time slots without the Google Sheet chaos.", "Web", ["TypeScript", "React", "SQL"]],
  ["CropScan", "Detect crop diseases from leaf photos, built for farmers with low-end phones.", "AI/ML", ["Python", "Computer Vision", "Flutter"]],
  ["CTF Arena", "A self-hosted capture-the-flag platform for our security club.", "Security", ["Go", "Docker", "Cybersecurity"]],
  ["Mess Menu Bot", "WhatsApp bot that tells you today's mess menu and lets you rate it.", "Tools", ["Node.js", "JavaScript"]],
  ["Line Follower v4", "PID-tuned line follower robot for inter-college robotics competitions.", "Hardware", ["Embedded C", "C++"]],
  ["PaperTrail", "Summarise and organise research papers with citation graphs.", "Research", ["Python", "React", "NLP"]],
  ["Budget Buddy", "Expense splitting for hostel roommates, with UPI reminders.", "Fintech", ["Kotlin", "SQL"]],
  ["OpenAttendance", "Face-recognition attendance with privacy-first on-device processing.", "AI/ML", ["Python", "Computer Vision"]],
  ["Campus Map 3D", "Interactive map of campus with indoor navigation for new students.", "Web", ["JavaScript", "React", "UI/UX"]],
  ["Codeforces Tracker", "Track rating changes and upsolving lists for your friend group.", "Tools", ["TypeScript", "React", "Node.js"]],
  ["GreenGrid", "Smart energy monitoring for hostels using IoT sensors.", "Hardware", ["Embedded C", "Python", "Cloud"]],
  ["Placement Prep Hub", "Curated interview questions from seniors, organised by company.", "Web", ["React", "Node.js", "SQL"]],
  ["Signbridge", "Real-time Indian Sign Language to text translation.", "AI/ML", ["Python", "PyTorch", "Computer Vision"]],
  ["ChainVote", "Transparent student council elections on a private blockchain.", "Blockchain", ["Solidity", "React"]],
  ["Study Rooms", "Find quiet study spots on campus with live occupancy.", "Mobile", ["Flutter", "Cloud"]],
  ["Fest Ticketing", "Ticketing and check-in for college fests, handled 4,000 entries last year.", "Web", ["TypeScript", "Node.js", "Docker"]],
  ["MedNotes", "Shared, peer-reviewed lecture notes for biotech students.", "Education", ["React", "UI/UX"]],
  ["Rust Raytracer", "A weekend raytracer written in Rust, now slowly becoming a renderer.", "Open Source", ["Rust"]],
];
const ROLES = ["Frontend", "Backend", "ML", "UI/UX", "Product", "Pitching", "DevOps", "Mobile", "Research"];

export function makeProjects(students: Student[]): Project[] {
  const r = rng(7);
  return PROJECT_SEEDS.map(([name, description, category, tech], i) => {
    const owner = i === 0 ? "me" : students[(i * 3) % students.length].id;
    const teamSize = 3 + Math.floor(r() * 4);
    const memberCount = 1 + Math.floor(r() * (teamSize - 1));
    const members = [owner, ...pickN(r, students.map((s) => s.id).filter((id) => id !== owner), memberCount - 1, memberCount - 1)];
    return {
      id: `p${i + 1}`,
      name,
      description,
      category,
      stage: pick(r, ["Idea", "Prototype", "Building", "Launched"] as const),
      tech,
      ownerId: owner,
      members,
      teamSize,
      roles: members.length >= teamSize ? [] : pickN(r, ROLES, 1, 3),
      github: r() < 0.7 ? `github.com/${name.toLowerCase().replace(/\s+/g, "-")}` : undefined,
      deadline: r() < 0.6 ? `2026-${10 + Math.floor(r() * 3)}-${10 + Math.floor(r() * 18)}` : undefined,
      visibility: "Public",
      status: "published",
      createdDaysAgo: Math.floor(r() * 90),
      college: i % 3 === 0 ? "Manipal University Jaipur" : pick(r, COLLEGES),
      timeline: [
        { label: "Idea & scope", date: "Aug 2026", done: true },
        { label: "First prototype", date: "Sep 2026", done: r() < 0.7 },
        { label: "Beta with 50 students", date: "Oct 2026", done: false },
        { label: "Public launch", date: "Dec 2026", done: false },
      ],
    };
  });
}

const TEAM_SEEDS: [string, string][] = [
  ["Null Pointers", "Smart India Hackathon 2026"],
  ["Byte Club", "Weekly competitive programming practice"],
  ["Team Kernel", "HackMIT application"],
  ["Pixel & Pine", "Design sprint collective"],
  ["Overfit", "Kaggle competitions"],
  ["Root Access", "CTF team"],
  ["Low Latency", "Building CourseLens"],
  ["Paper Planes", "Research reading group on NLP"],
  ["Servo Squad", "Robocon 2027"],
  ["Deploy Fridays", "Open-source DevOps contributions"],
  ["The Pitch Room", "Startup ideation and pitching"],
  ["Night Owls", "GATE preparation study group"],
];

export function makeTeams(students: Student[], projects: Project[]): Team[] {
  const r = rng(11);
  return TEAM_SEEDS.map(([name, purpose], i) => {
    const maxSize = 4 + Math.floor(r() * 3);
    const n = 2 + Math.floor(r() * (maxSize - 2));
    const members = pickN(r, students.map((s) => s.id), n, n);
    if (i === 6 || i === 1) members.unshift("me");
    const skills = [...new Set(members.flatMap((m) => students.find((s) => s.id === m)?.skills ?? []))].slice(0, 5);
    return {
      id: `t${i + 1}`,
      name,
      purpose,
      description: `${purpose}. We meet twice a week, split work on a shared board and keep things friendly. New members are welcome if they can commit a few hours a week.`,
      members: members.slice(0, maxSize),
      roles: members.length < maxSize ? pickN(r, ROLES, 1, 2) : [],
      skills: skills.length ? skills : ["Python"],
      projectId: i === 6 ? "p1" : r() < 0.5 ? projects[Math.floor(r() * projects.length)].id : undefined,
      maxSize,
      lookingForMembers: members.length < maxSize,
      activity: [
        { text: "Weekly sync notes posted", when: "2h ago" },
        { text: "New role opened: " + pick(r, ROLES), when: "1d ago" },
        { text: "Team created", when: `${2 + Math.floor(r() * 20)}d ago` },
      ],
    };
  });
}

const EVENT_SEEDS: [string, EventItem["category"], string, string][] = [
  ["HackJaipur 2026", "Hackathons", "ACM MUJ", "Old Academic Block, Hall A"],
  ["Intro to Rust Workshop", "Workshops", "Open Source Society", "Lab 305, AB-2"],
  ["Founders Coffee Meetup", "Meetups", "E-Cell", "Campus Café"],
  ["ICPC Mock Contest", "Competitions", "CP Club", "Online"],
  ["Research Careers in ML", "Seminars", "Dept. of CSE", "TMA Pai Auditorium"],
  ["Alumni Networking Night", "Networking", "Alumni Office", "Sharda Pai Auditorium"],
  ["DSA Study Marathon", "Study", "Coding Club", "Central Library, 3rd floor"],
  ["Smart India Hackathon – Internal Round", "Hackathons", "Innovation Cell", "AB-1 Seminar Hall"],
  ["Figma to Production", "Workshops", "Design Club", "Lab 102, AB-3"],
  ["Women in Tech Mixer", "Networking", "WiT Chapter", "Student Lounge"],
  ["CTF Night", "Competitions", "Root Access", "Cyber Lab"],
  ["Kaggle Days Campus", "Competitions", "Data Science Club", "Online + Lab 204"],
  ["Cloud Native Meetup", "Meetups", "GDG on Campus", "Innovation Hub"],
  ["How to Read a Paper", "Seminars", "Research Society", "Room 401, AB-2"],
  ["GATE Strategy Session", "Study", "Night Owls", "Online"],
  ["Robotics Demo Day", "Meetups", "Robotics Club", "Workshop Floor"],
];

export function makeEvents(students: Student[], projects: Project[]): EventItem[] {
  const r = rng(23);
  return EVENT_SEEDS.map(([title, category, organizer, location], i) => {
    const day = new Date(BASE_TIME + (i - 2) * 2.3 * 86400000 + 86400000 * 3);
    return {
      id: `e${i + 1}`,
      title,
      category,
      organizer,
      date: day.toISOString().slice(0, 10),
      time: pick(r, ["10:00 AM", "2:00 PM", "4:30 PM", "6:00 PM", "9:00 AM"]),
      location,
      description: `${title} is organised by ${organizer}. Expect hands-on sessions, time to meet other students and a relaxed atmosphere. Bring your laptop and a friend — everyone from first years to final years is welcome.`,
      speakers: pickN(r, students.filter((s) => s.year >= 3), 1, 3).map((s) => ({ name: s.name, role: `${s.branch}, ${s.college}` })),
      attendees: pickN(r, students.map((s) => s.id), 3, 22),
      capacity: 40 + Math.floor(r() * 200),
      relatedProjects: pickN(r, projects.map((p) => p.id), 0, 2),
      hue: Math.floor(r() * 360),
    };
  });
}

const MSG_LINES = [
  "Hey! Saw your profile — are you still looking for a hackathon team?",
  "Yes! We need someone on backend. What's your stack?",
  "Mostly Node and Postgres. Did some Go last semester.",
  "Perfect. Want to hop on a call tomorrow evening?",
  "Sure, 7 PM works.",
  "Thanks for the notes from yesterday, they were super helpful.",
  "Did you get the assignment 3 question on graphs?",
  "I pushed the fix, can you review the PR?",
  "See you at the workshop!",
  "Let's meet at the library at 5.",
  "Would love to know how you prepared for your internship interviews.",
  "Haha that bug took me 3 hours 😅",
];

export function makeConversations(students: Student[]): Conversation[] {
  const r = rng(31);
  return students.slice(0, 26).map((s, i) => {
    const n = 2 + Math.floor(r() * 6);
    const start = BASE_TIME - (i * 5 + 1) * 3600000;
    const messages = Array.from({ length: n }, (_, j) => ({
      id: `m${i}-${j}`,
      from: j % 2 === 0 ? s.id : "me",
      text: MSG_LINES[(i + j) % MSG_LINES.length],
      ts: start + j * 6 * 60000,
      reactions: r() < 0.15 ? ["👍"] : [],
    }));
    const unread = messages[messages.length - 1].from !== "me" && i < 8 ? 1 + Math.floor(r() * 3) : 0;
    return { id: `c${i + 1}`, participantId: s.id, messages, unread };
  });
}

export function makeNotifications(students: Student[]): Notification[] {
  const r = rng(51);
  const templates: [Notification["type"], (n: string) => string, (s: Student) => string][] = [
    ["connection", (n) => `${n} sent you a connection request`, () => "/connections"],
    ["connection", (n) => `${n} accepted your connection request`, (s) => `/people/${s.id}`],
    ["message", (n) => `${n} sent you a message`, () => "/messages"],
    ["project", (n) => `${n} wants to join CourseLens`, () => "/projects/p1"],
    ["project", (n) => `${n} starred your project`, () => "/projects/p1"],
    ["team", (n) => `${n} invited you to join Null Pointers`, () => "/teams/t1"],
    ["event", () => `HackJaipur 2026 registrations close in 2 days`, () => "/events/e1"],
    ["profile", (n) => `${n} viewed your profile`, (s) => `/people/${s.id}`],
    ["recommendation", (n) => `${n} is also looking for a hackathon team`, (s) => `/people/${s.id}`],
  ];
  return Array.from({ length: 42 }, (_, i) => {
    const s = students[Math.floor(r() * students.length)];
    const [type, text, href] = templates[i % templates.length];
    return {
      id: `n${i + 1}`,
      type,
      text: text(s.name),
      actorId: s.id,
      href: href(s),
      ts: BASE_TIME - i * 2.7 * 3600000,
      read: i > 7,
    };
  });
}
