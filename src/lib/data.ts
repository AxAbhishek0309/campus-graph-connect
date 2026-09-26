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
    name: "Abhishek Tiwari",
    pronoun: "he",
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
    github: "axabhishek03",
    leetcode: undefined,
    linkedin: undefined,
    codeforces: undefined,
    codechef: undefined,
    kaggle: undefined,
    repos: 0,
    lcSolved: 0,
    cfRating: 0,
    ccRating: undefined,
    ccStars: undefined,
    kaggleTier: undefined,
    contributions: [],
    githubDaily: [],
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
    const lc = incomplete ? 0 : Math.floor(r() * 600);
    const gh = incomplete ? undefined : name.toLowerCase().replace(" ", "-");
    const cf = incomplete || r() < 0.3 ? undefined : name.split(" ")[0].toLowerCase() + "_cf";
    const cc = incomplete || r() < 0.4 ? undefined : name.split(" ")[0].toLowerCase() + "_cc";
    const kg = i % 4 === 0 && !incomplete ? name.split(" ")[0].toLowerCase() : undefined;

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
      github: gh,
      leetcode: lc > 0 ? name.split(" ")[0].toLowerCase() + (i + 10) : undefined,
      linkedin: incomplete ? undefined : name.toLowerCase().replace(" ", "-"),
      codeforces: cf,
      codechef: cc,
      kaggle: kg,
      repos: !gh ? 0 : activity === "new" ? Math.floor(r() * 3) : Math.floor(r() * 45),
      lcSolved: lc,
      cfRating: !cf ? 0 : 900 + Math.floor(r() * 1100),
      ccRating: !cc ? undefined : 1300 + Math.floor(r() * 700),
      ccStars: !cc ? undefined : activity !== "new" && r() > 0.4 ? "3★" : "2★",
      kaggleTier: !kg ? undefined : i % 8 === 0 ? "Master" : "Expert",
      contributions: !gh ? [] : makeContrib(r, activity),
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

const REAL_EVENT_SEEDS = [
  {
    title: "Flipkart GRiD 7.0 – Campus Engineering Challenge",
    category: "Competitions" as const,
    organizer: "Flipkart Engineering",
    location: "Online Assessment & Flipkart Campus, Bengaluru",
    date: "2026-10-18",
    time: "11:00 AM",
    description: "Flagship technical challenge for engineering undergraduates across Software Development, Information Security, and Robotics Tracks. Solve high-concurrency architecture and computer vision challenges with real-world enterprise constraints.",
    prize: "₹5,25,000 Cash Pool + PPOs (₹32 LPA CTC)",
    link: "https://unstop.com/competitions/flipkart-grid",
    mode: "Hybrid" as const,
    sourcePlatform: "Unstop" as const,
    sourceUrl: "https://unstop.com/competitions/flipkart-grid",
    eligibility: "B.Tech/B.E./M.Tech/Dual Degree students (Batch 2025-2028), all engineering disciplines. Teams of 1-3.",
    deadline: "Oct 12, 2026 · 11:59 PM IST",
    tags: ["Robotics", "Software Track", "PPO Offered", "Unstop Flagship", "Coding Challenge"],
    isFlagship: true,
    externalRegistrations: "48,250+ Registered on Unstop",
    speakers: [
      { name: "Jeyandran Venugopal", role: "CPTO, Flipkart" },
    ],
    capacity: 1200,
    hue: 45,
  },
  {
    title: "ITC Interrobang?! 2026 – Campus Case Challenge",
    category: "Competitions" as const,
    organizer: "ITC Limited",
    location: "Online Case Submission & ITC Grand Chola, Chennai",
    date: "2026-10-30",
    time: "11:00 AM",
    description: "Flagship corporate case competition evaluating product design, supply chain optimization, and sustainable business models for ITC FMCG brands (Sunfeast, Bingo!, Fiama, Classmate). Compete against premier university teams for pre-placement offers.",
    prize: "₹3,00,000 Cash Pool + PPIs for Management & Tech Trainee",
    link: "https://gradpartners.com/competitions/itc-interrobang-2026",
    mode: "Hybrid" as const,
    sourcePlatform: "Grad Partners" as const,
    sourceUrl: "https://gradpartners.com/competitions/itc-interrobang-2026",
    eligibility: "Pre-final & Final year B.Tech, Dual Degree, and MBA students across recognized universities",
    deadline: "Oct 25, 2026 · 6:00 PM IST",
    tags: ["Case Challenge", "FMCG", "Product Strategy", "PPO Offered"],
    isFlagship: true,
    externalRegistrations: "16,400+ Registered on Grad Partners",
    speakers: [
      { name: "Sanjiv Puri", role: "CMD, ITC Limited" },
    ],
    capacity: 600,
    hue: 155,
  },
  {
    title: "Wellfound Global AI & Web3 Builder Bounty 2026",
    category: "Hackathons" as const,
    organizer: "Wellfound (formerly AngelList Talent)",
    location: "Global Virtual Hackathon & Live Pitch Stage",
    date: "2026-11-08",
    time: "6:00 PM",
    description: "Fast-paced 48-hour build challenge for student engineers, solo hackers, and startup teams. Build autonomous AI agents, open source developer infrastructure, or consumer fintech apps. Top projects get seed funding intros to Y Combinator and tier-1 US/Global angel syndicates.",
    prize: "$50,000 USD Venture Grants + Direct Founder Job Matches",
    link: "https://wellfound.com/hackathons/global-builder-bounty-2026",
    mode: "Online" as const,
    sourcePlatform: "Wellfound" as const,
    sourceUrl: "https://wellfound.com/hackathons/global-builder-bounty-2026",
    eligibility: "Open to university students, recent grads, and independent builders globally. Solo or teams of up to 4",
    deadline: "Nov 05, 2026 · 11:59 PM PST",
    tags: ["Startup Grants", "AI Agents", "AngelList", "YC Scout Intros"],
    isFlagship: true,
    externalRegistrations: "12,800+ Builders on Wellfound",
    speakers: [
      { name: "Amit Matani", role: "VP of Product, Wellfound" },
    ],
    capacity: 2000,
    hue: 350,
  },
  {
    title: "Tata Imagination Challenge 2026",
    category: "Competitions" as const,
    organizer: "Tata Sons & Tata Group",
    location: "Online Rounds & Tata Management Training Centre (TMTC), Pune",
    date: "2026-10-22",
    time: "10:00 AM",
    description: "India's largest leadership & case challenge designed to discover visionaries and innovators. Assess real strategic hurdles across aerospace, EV mobility, green hydrogen, and digital retail. Winners receive direct access to Tata senior leadership, cash grants, and pre-placement interview fast-tracks across Tata companies.",
    prize: "₹2,00,000 per winner + Tata Leadership PPIs",
    link: "https://unstop.com/competitions/tata-imagination-challenge-2026",
    mode: "Hybrid" as const,
    sourcePlatform: "Unstop" as const,
    sourceUrl: "https://unstop.com/competitions/tata-imagination-challenge-2026",
    eligibility: "Open to all enrolled undergraduate & postgraduate college students across India (All disciplines)",
    deadline: "Oct 18, 2026 · 11:59 PM IST",
    tags: ["Leadership", "Case Competition", "Tata Group", "PPI Opportunities", "All Degrees"],
    isFlagship: true,
    externalRegistrations: "92,000+ Registered on Unstop",
    speakers: [
      { name: "N. Chandrasekaran", role: "Chairman, Tata Sons (Grand Finale Judge)" },
    ],
    capacity: 2500,
    hue: 210,
  },
  {
    title: "Naukri Campus Tech League 2026",
    category: "Hiring Challenges" as const,
    organizer: "Info Edge (Naukri.com)",
    location: "Online Proctored Coding Arena",
    date: "2026-10-25",
    time: "4:00 PM",
    description: "National algorithmic coding and system architecture championship connecting 50,000+ student coders with 40+ premier tech companies, unicorn startups, and high-growth scaleups for 2026-2027 graduate engineer roles.",
    prize: "₹5,00,000 Cash Pool + 500+ Direct Interview Shortlists",
    link: "https://naukri.com/campus/tech-league-2026",
    mode: "Online" as const,
    sourcePlatform: "Naukri Campus" as const,
    sourceUrl: "https://naukri.com/campus/tech-league-2026",
    eligibility: "B.Tech, B.E., M.Tech, MCA students (Batch 2025, 2026, 2027) with no backlogs",
    deadline: "Oct 22, 2026 · 8:00 PM IST",
    tags: ["DSA Challenge", "Campus Placements", "Naukri Campus", "Direct Hiring"],
    isFlagship: true,
    externalRegistrations: "54,000+ Coders on Naukri Campus",
    speakers: [
      { name: "Hitesh Oberoi", role: "Co-Promoter & MD, Info Edge" },
    ],
    capacity: 5000,
    hue: 240,
  },
  {
    title: "Indeed Tech Apprenticeship Hackathon 2026",
    category: "Hiring Challenges" as const,
    organizer: "Indeed Engineering",
    location: "Online Proctored Hackathon & Hyderabad Technology Center",
    date: "2026-11-22",
    time: "1:00 PM",
    description: "Build robust full-stack tools and search relevancy models on real job market data. Shortlisted finalists receive paid 6-month software engineering apprenticeships with conversion to full-time Associate Software Engineer roles.",
    prize: "₹3,50,000 Cash Pool + 6-Month Paid SWE Apprenticeships",
    link: "https://indeed.com/engineering/apprenticeship-challenge-2026",
    mode: "Hybrid" as const,
    sourcePlatform: "Indeed" as const,
    sourceUrl: "https://indeed.com/engineering/apprenticeship-challenge-2026",
    eligibility: "Current undergraduates graduating in 2026, 2027, or 2028 (CS, IT, or related fields)",
    deadline: "Nov 15, 2026 · 11:59 PM IST",
    tags: ["SWE Apprenticeship", "Search & NLP", "Indeed Engineering", "Full-Time Conversion"],
    isFlagship: true,
    externalRegistrations: "8,900+ Applicants on Indeed",
    speakers: [
      { name: "Suresh Kartha", role: "Head of Engineering, Indeed India" },
    ],
    capacity: 1000,
    hue: 205,
  },
  {
    title: "Smart India Hackathon (SIH 2026) – National Grand Finale",
    category: "Hackathons" as const,
    organizer: "Ministry of Education & AICTE",
    location: "Manipal University Jaipur (Nodal Center) & National Venues",
    date: "2026-10-14",
    time: "9:00 AM",
    description: "The world's biggest open innovation hackathon by Govt of India. 50+ central ministries and corporate problem statements across Smart Vehicles, CleanTech, Healthcare, Agriculture, Robotics and Cybersecurity. Winning teams receive ₹1,00,000 per problem statement plus fast-tracked incubation support.",
    prize: "₹1 Crore+ Total Cash Awards",
    link: "https://sih.gov.in",
    mode: "Hybrid" as const,
    sourcePlatform: "Devfolio" as const,
    sourceUrl: "https://sih.gov.in",
    eligibility: "Regular students of HEI's pursuing Graduate / Post-Graduate degrees. Teams of 6 with at least one female teammate.",
    deadline: "Oct 04, 2026 · 5:00 PM IST",
    tags: ["SIH 2026", "Govt of India", "AICTE", "National Grand Finale"],
    isFlagship: true,
    externalRegistrations: "60,000+ Teams on AICTE Portal",
    speakers: [
      { name: "Dr. Abhay Jere", role: "Chief Innovation Officer, MoE" },
      { name: "Prof. K. VijayRaghavan", role: "Former Principal Scientific Advisor" },
    ],
    capacity: 350,
    hue: 25,
  },
  {
    title: "ETHIndia 2026 – Asia's Flagship Ethereum Hackathon",
    category: "Hackathons" as const,
    organizer: "Devfolio & Ethereum Foundation",
    location: "KTPO Convention Centre, Whitefield, Bengaluru",
    date: "2026-11-06",
    time: "10:00 AM",
    description: "Asia's premier 36-hour in-person Web3 hackathon gathering 2,000+ top builders, cryptographers, and founders. Hack across Zero-Knowledge Proofs, Account Abstraction, Decentralized AI agents, and Rollup architectures with access to global VC scouts and protocol bounties.",
    prize: "$125,000+ in Protocol Bounties & Grants",
    link: "https://ethindia.co",
    mode: "In-person" as const,
    sourcePlatform: "Devfolio" as const,
    sourceUrl: "https://devfolio.co/ethindia",
    eligibility: "Open to developers, designers, and researchers globally. Free entry upon application approval.",
    deadline: "Oct 20, 2026 · 11:59 PM IST",
    tags: ["Web3", "Ethereum", "Devfolio", "ZK Proofs", "Global Builders"],
    isFlagship: true,
    externalRegistrations: "2,000+ Selected Hackers",
    speakers: [
      { name: "Sandeep Nailwal", role: "Co-Founder, Polygon" },
      { name: "Vitalik Buterin", role: "Keynote, Ethereum Foundation" },
    ],
    capacity: 2000,
    hue: 220,
  },
  {
    title: "Mahindra Rise Innovation Challenge 2026",
    category: "Competitions" as const,
    organizer: "Mahindra Group & Tech Mahindra",
    location: "Virtual Submissions & Mahindra Research Valley, Chennai",
    date: "2026-11-18",
    time: "10:30 AM",
    description: "Solve high-impact problems in electric vehicle telematics, autonomous agricultural machinery, and aerospace composite structures. Top prototypes receive incubation funding and direct placement interview rounds with Mahindra leadership.",
    prize: "₹2,50,000 + Fast-Track PPIs for Graduate Engineer Trainee (GET)",
    link: "https://gradpartners.com/competitions/mahindra-rise-2026",
    mode: "Hybrid" as const,
    sourcePlatform: "Grad Partners" as const,
    sourceUrl: "https://gradpartners.com/competitions/mahindra-rise-2026",
    eligibility: "B.Tech/B.E. (Mechanical, CS, EEE, ECE, Automobile) graduating in 2026 or 2027",
    deadline: "Nov 10, 2026 · 11:59 PM IST",
    tags: ["EV Technology", "Automotive", "GET Recruitment", "Live Prototype"],
    isFlagship: true,
    externalRegistrations: "11,800+ Registered on Grad Partners",
    speakers: [
      { name: "Anish Shah", role: "MD & CEO, Mahindra Group" },
    ],
    capacity: 800,
    hue: 10,
  },
  {
    title: "L'Oréal Brandstorm 2026 – Tech & Beauty Innovation",
    category: "Competitions" as const,
    organizer: "L'Oréal Paris",
    location: "Online Rounds & Grand Finale at Station F, Paris",
    date: "2026-11-12",
    time: "2:30 PM",
    description: "Global student innovation competition spanning 65+ countries. Tackle the future of beauty-tech, augmented personalization, generative AI, and biodegradable packaging. Global winners get a 3-month intrapreneurship mission at Station F in Paris with all expenses paid.",
    prize: "3-Month Paris Intrapreneurship + Global Trophies",
    link: "https://unstop.com/competitions/loreal-brandstorm-2026",
    mode: "Hybrid" as const,
    sourcePlatform: "Unstop" as const,
    sourceUrl: "https://unstop.com/competitions/loreal-brandstorm-2026",
    eligibility: "Undergraduate & Master's students aged 18-30. Teams of 3 (Diversity encouraged)",
    deadline: "Nov 02, 2026 · 11:59 PM IST",
    tags: ["Product Innovation", "Beauty Tech", "Paris Mission", "Global Final"],
    isFlagship: true,
    externalRegistrations: "34,500+ Registered on Unstop",
    speakers: [
      { name: "Nicolas Hieronimus", role: "CEO, L'Oréal Group" },
    ],
    capacity: 1500,
    hue: 330,
  },
  {
    title: "ICPC Asia-West Regional Collegiate Championship 2026",
    category: "Competitions" as const,
    organizer: "International Collegiate Programming Contest",
    location: "Amritapuri & Kanpur Regional Onsite Centers",
    date: "2026-10-24",
    time: "8:30 AM",
    description: "The Olympics of competitive programming. Teams of three tackle 12 algorithmic problems covering advanced dynamic programming, tree decomposition, number theory, and computational geometry under strict 5-hour time constraints. Top teams qualify for the ICPC World Finals.",
    prize: "World Finals Qualification & ICPC Gold Medals",
    link: "https://icpc.global",
    mode: "In-person" as const,
    sourcePlatform: "Devfolio" as const,
    sourceUrl: "https://icpc.global",
    eligibility: "Full-time college students meeting ICPC eligibility criteria (under 24 years old). Teams of 3 from the same university.",
    deadline: "Oct 10, 2026",
    tags: ["Algorithms", "ICPC", "Competitive Programming", "World Finals"],
    isFlagship: true,
    externalRegistrations: "3,500+ Collegiate Teams",
    speakers: [
      { name: "Dr. Anand Shenoi", role: "Director, ICPC Asia West" },
    ],
    capacity: 150,
    hue: 200,
  },
  {
    title: "Amazon ML Summer School & Tech Challenge 2026",
    category: "Seminars" as const,
    organizer: "Amazon Science",
    location: "Virtual Tech Auditorium & Amazon Live Stream",
    date: "2026-10-06",
    time: "2:00 PM",
    description: "Comprehensive interactive seminar series on modern Machine Learning architectures led by Amazon Chief Scientists. Covers generative foundation models, reinforcement learning from human feedback (RLHF), recommendation algorithms, and production ML pipelines.",
    prize: "Direct PPO & Internship Interviews for ML Engineer roles",
    link: "https://amazonmlchallenge.in",
    mode: "Online" as const,
    sourcePlatform: "Unstop" as const,
    sourceUrl: "https://unstop.com/competitions/amazon-ml-challenge-2026",
    eligibility: "Engineering and data science students graduating in 2026 or 2027",
    deadline: "Oct 01, 2026 · 11:59 PM IST",
    tags: ["Machine Learning", "Amazon Science", "PPO", "Foundation Models"],
    isFlagship: true,
    externalRegistrations: "22,000+ Students on Unstop",
    speakers: [
      { name: "Dr. Rajeev Rastogi", role: "VP of Machine Learning, Amazon" },
      { name: "Dr. Tanveer Faruquie", role: "Principal Applied Scientist, Amazon" },
    ],
    capacity: 1000,
    hue: 35,
  },
];

export function makeEvents(students: Student[], projects: Project[]): EventItem[] {
  const r = rng(23);
  return REAL_EVENT_SEEDS.map((seed, i) => {
    return {
      id: `e${i + 1}`,
      title: seed.title,
      category: seed.category,
      organizer: seed.organizer,
      date: seed.date,
      time: seed.time,
      location: seed.location,
      description: seed.description,
      prize: seed.prize,
      link: seed.link,
      mode: seed.mode,
      sourcePlatform: seed.sourcePlatform,
      sourceUrl: seed.sourceUrl,
      eligibility: seed.eligibility,
      deadline: seed.deadline,
      tags: seed.tags,
      isFlagship: seed.isFlagship,
      externalRegistrations: seed.externalRegistrations,
      speakers: seed.speakers,
      attendees: pickN(r, students.map((s) => s.id), 8, 35),
      capacity: seed.capacity,
      relatedProjects: pickN(r, projects.map((p) => p.id), 0, 2),
      hue: seed.hue,
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
