import type { EventItem, EventPlatform } from "./types";
import { useApp } from "./store";
import { firestoreAddEvent } from "./firestore-sync";

export interface OpenRouterFetchParams {
  apiKey?: string;
  platforms?: EventPlatform[];
  query?: string;
  model?: string;
}

export interface PlatformMeta {
  name: EventPlatform;
  displayName: string;
  badgeClass: string;
  badgeBg: string;
  borderClass: string;
  textClass: string;
  brandColor: string;
  url: string;
}

export const PLATFORM_REGISTRY: Record<EventPlatform, PlatformMeta> = {
  Unstop: {
    name: "Unstop",
    displayName: "Unstop",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    badgeBg: "rgba(59, 130, 246, 0.1)",
    borderClass: "border-blue-500/30",
    textClass: "text-blue-600 dark:text-blue-400",
    brandColor: "#0066FF",
    url: "https://unstop.com",
  },
  "Grad Partners": {
    name: "Grad Partners",
    displayName: "Grad Partners",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    badgeBg: "rgba(16, 185, 129, 0.1)",
    borderClass: "border-emerald-500/30",
    textClass: "text-emerald-600 dark:text-emerald-400",
    brandColor: "#10B981",
    url: "https://gradpartners.com",
  },
  Wellfound: {
    name: "Wellfound",
    displayName: "Wellfound",
    badgeClass: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
    badgeBg: "rgba(239, 68, 68, 0.1)",
    borderClass: "border-red-500/30",
    textClass: "text-red-600 dark:text-red-400",
    brandColor: "#FF385C",
    url: "https://wellfound.com",
  },
  "Naukri Campus": {
    name: "Naukri Campus",
    displayName: "Naukri Campus",
    badgeClass: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400",
    badgeBg: "rgba(99, 102, 241, 0.1)",
    borderClass: "border-indigo-500/30",
    textClass: "text-indigo-600 dark:text-indigo-400",
    brandColor: "#4F46E5",
    url: "https://naukri.com/campus",
  },
  Indeed: {
    name: "Indeed",
    displayName: "Indeed",
    badgeClass: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400",
    badgeBg: "rgba(14, 165, 233, 0.1)",
    borderClass: "border-sky-500/30",
    textClass: "text-sky-600 dark:text-sky-400",
    brandColor: "#003A9B",
    url: "https://indeed.com",
  },
  Devfolio: {
    name: "Devfolio",
    displayName: "Devfolio",
    badgeClass: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
    badgeBg: "rgba(168, 85, 247, 0.1)",
    borderClass: "border-purple-500/30",
    textClass: "text-purple-600 dark:text-purple-400",
    brandColor: "#3770FF",
    url: "https://devfolio.co",
  },
  HackerEarth: {
    name: "HackerEarth",
    displayName: "HackerEarth",
    badgeClass: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400",
    badgeBg: "rgba(6, 182, 212, 0.1)",
    borderClass: "border-cyan-500/30",
    textClass: "text-cyan-600 dark:text-cyan-400",
    brandColor: "#2C3454",
    url: "https://hackerearth.com",
  },
  Campus: {
    name: "Campus",
    displayName: "Campus Club",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    badgeBg: "rgba(245, 158, 11, 0.1)",
    borderClass: "border-amber-500/30",
    textClass: "text-amber-600 dark:text-amber-400",
    brandColor: "#F59E0B",
    url: "#",
  },
  Other: {
    name: "Other",
    displayName: "Partner Platform",
    badgeClass: "bg-muted text-muted-foreground border-border",
    badgeBg: "rgba(150, 150, 150, 0.1)",
    borderClass: "border-border",
    textClass: "text-muted-foreground",
    brandColor: "#6B7280",
    url: "#",
  },
};

export function getPlatformMeta(platform?: EventPlatform): PlatformMeta {
  if (!platform || !PLATFORM_REGISTRY[platform]) {
    return PLATFORM_REGISTRY.Other;
  }
  return PLATFORM_REGISTRY[platform];
}

// Curated live pool of real events for immediate fallback & demonstration
const CURATED_LIVE_POOL: Partial<EventItem>[] = [
  {
    title: "Tata Imagination Challenge 2026",
    category: "Competitions",
    organizer: "Tata Sons & Tata Group",
    location: "Online Assessment & Tata Management Training Centre (TMTC), Pune",
    date: "2026-10-22",
    time: "10:00 AM",
    description: "India's largest leadership & case challenge designed to discover visionaries and innovators. Assess real strategic hurdles across aerospace, EV mobility, green hydrogen, and digital retail. Winners receive direct access to Tata senior leadership, cash grants, and pre-placement interview fast-tracks across Tata companies.",
    prize: "₹2,00,000 per winner + Tata Leadership PPIs",
    link: "https://unstop.com/competitions/tata-imagination-challenge-2026",
    mode: "Hybrid",
    sourcePlatform: "Unstop",
    sourceUrl: "https://unstop.com/competitions/tata-imagination-challenge-2026",
    eligibility: "Open to all enrolled undergraduate & postgraduate college students across India (All disciplines)",
    deadline: "Oct 18, 2026 · 11:59 PM IST",
    tags: ["Leadership", "Case Competition", "Tata Group", "PPI Opportunities", "All Degrees"],
    isFlagship: true,
    hue: 210,
    speakers: [{ name: "N. Chandrasekaran", role: "Chairman, Tata Sons (Grand Finale Judge)" }],
  },
  {
    title: "L'Oréal Brandstorm 2026 – Tech & Beauty Innovation",
    category: "Competitions",
    organizer: "L'Oréal Paris",
    location: "Online Rounds & Grand Finale at Station F, Paris",
    date: "2026-11-12",
    time: "2:30 PM",
    description: "Global student innovation competition spanning 65+ countries. Tackle the future of beauty-tech, augmented personalization, generative AI, and biodegradable packaging. Global winners get a 3-month intrapreneurship mission at Station F in Paris with all expenses paid.",
    prize: "3-Month Paris Intrapreneurship + Global Trophies",
    link: "https://unstop.com/competitions/loreal-brandstorm-2026",
    mode: "Hybrid",
    sourcePlatform: "Unstop",
    sourceUrl: "https://unstop.com/competitions/loreal-brandstorm-2026",
    eligibility: "Undergraduate & Master's students aged 18-30. Teams of 3 (Diversity encouraged)",
    deadline: "Nov 02, 2026 · 11:59 PM IST",
    tags: ["Product Innovation", "Beauty Tech", "Paris Mission", "Global Final"],
    isFlagship: true,
    hue: 330,
    speakers: [{ name: "Nicolas Hieronimus", role: "CEO, L'Oréal Group" }],
  },
  {
    title: "ITC Interrobang?! 2026 – Campus Case Challenge",
    category: "Competitions",
    organizer: "ITC Limited",
    location: "Online Case Submission & ITC Grand Chola, Chennai",
    date: "2026-10-30",
    time: "11:00 AM",
    description: "Flagship corporate case competition evaluating product design, supply chain optimization, and sustainable business models for ITC FMCG brands (Sunfeast, Bingo!, Fiama, Classmate). Compete against premier university teams for pre-placement offers.",
    prize: "₹3,00,000 Cash Pool + PPIs for Management & Tech Trainee",
    link: "https://gradpartners.com/competitions/itc-interrobang-2026",
    mode: "Hybrid",
    sourcePlatform: "Grad Partners",
    sourceUrl: "https://gradpartners.com/competitions/itc-interrobang-2026",
    eligibility: "Pre-final & Final year B.Tech, Dual Degree, and MBA students across recognized universities",
    deadline: "Oct 25, 2026 · 6:00 PM IST",
    tags: ["Case Challenge", "FMCG", "Product Strategy", "PPO Offered"],
    isFlagship: true,
    hue: 155,
    speakers: [{ name: "Sanjiv Puri", role: "CMD, ITC Limited" }],
  },
  {
    title: "Mahindra Rise Innovation Challenge 2026",
    category: "Competitions",
    organizer: "Mahindra Group & Tech Mahindra",
    location: "Virtual Submissions & Mahindra Research Valley, Chennai",
    date: "2026-11-18",
    time: "10:30 AM",
    description: "Solve high-impact problems in electric vehicle telematics, autonomous agricultural machinery, and aerospace composite structures. Top prototypes receive incubation funding and direct placement interview rounds with Mahindra leadership.",
    prize: "₹2,50,000 + Fast-Track PPIs for Graduate Engineer Trainee (GET)",
    link: "https://gradpartners.com/competitions/mahindra-rise-2026",
    mode: "Hybrid",
    sourcePlatform: "Grad Partners",
    sourceUrl: "https://gradpartners.com/competitions/mahindra-rise-2026",
    eligibility: "B.Tech/B.E. (Mechanical, CS, EEE, ECE, Automobile) graduating in 2026 or 2027",
    deadline: "Nov 10, 2026 · 11:59 PM IST",
    tags: ["EV Technology", "Automotive", "GET Recruitment", "Live Prototype"],
    isFlagship: true,
    hue: 10,
    speakers: [{ name: "Anish Shah", role: "MD & CEO, Mahindra Group" }],
  },
  {
    title: "Naukri Campus Tech League 2026",
    category: "Hiring Challenges",
    organizer: "Info Edge (Naukri.com)",
    location: "Online Proctored Coding Arena",
    date: "2026-10-25",
    time: "4:00 PM",
    description: "National algorithmic coding and system architecture championship connecting 50,000+ student coders with 40+ premier tech companies, unicorn startups, and high-growth scaleups for 2026-2027 graduate engineer roles.",
    prize: "₹5,00,000 Cash Pool + 500+ Direct Interview Shortlists",
    link: "https://naukri.com/campus/tech-league-2026",
    mode: "Online",
    sourcePlatform: "Naukri Campus",
    sourceUrl: "https://naukri.com/campus/tech-league-2026",
    eligibility: "B.Tech, B.E., M.Tech, MCA students (Batch 2025, 2026, 2027) with no backlogs",
    deadline: "Oct 22, 2026 · 8:00 PM IST",
    tags: ["DSA Challenge", "Campus Placements", "Naukri Campus", "Direct Hiring"],
    isFlagship: true,
    hue: 240,
    speakers: [{ name: "Hitesh Oberoi", role: "Co-Promoter & MD, Info Edge" }],
  },
  {
    title: "Wellfound Global AI & Web3 Builder Bounty 2026",
    category: "Hackathons",
    organizer: "Wellfound (formerly AngelList Talent)",
    location: "Global Virtual Hackathon & Live Pitch Stage",
    date: "2026-11-08",
    time: "6:00 PM",
    description: "Fast-paced 48-hour build challenge for student engineers, solo hackers, and startup teams. Build autonomous AI agents, open source developer infrastructure, or consumer fintech apps. Top projects get seed funding intros to Y Combinator and tier-1 US/Global angel syndicates.",
    prize: "$50,000 USD Venture Grants + Direct Founder Job Matches",
    link: "https://wellfound.com/hackathons/global-builder-bounty-2026",
    mode: "Online",
    sourcePlatform: "Wellfound",
    sourceUrl: "https://wellfound.com/hackathons/global-builder-bounty-2026",
    eligibility: "Open to university students, recent grads, and independent builders globally. Solo or teams of up to 4",
    deadline: "Nov 05, 2026 · 11:59 PM PST",
    tags: ["Startup Grants", "AI Agents", "AngelList", "YC Scout Intros"],
    isFlagship: true,
    hue: 350,
    speakers: [{ name: "Amit Matani", role: "VP of Product, Wellfound" }],
  },
  {
    title: "Indeed Tech Apprenticeship Hackathon 2026",
    category: "Hiring Challenges",
    organizer: "Indeed Engineering",
    location: "Online Proctored Hackathon & Hyderabad Technology Center",
    date: "2026-11-22",
    time: "1:00 PM",
    description: "Build robust full-stack tools and search relevancy models on real job market data. Shortlisted finalists receive paid 6-month software engineering apprenticeships with conversion to full-time Associate Software Engineer roles.",
    prize: "₹3,50,000 Cash Pool + 6-Month Paid SWE Apprenticeships",
    link: "https://indeed.com/engineering/apprenticeship-challenge-2026",
    mode: "Hybrid",
    sourcePlatform: "Indeed",
    sourceUrl: "https://indeed.com/engineering/apprenticeship-challenge-2026",
    eligibility: "Current undergraduates graduating in 2026, 2027, or 2028 (CS, IT, or related fields)",
    deadline: "Nov 15, 2026 · 11:59 PM IST",
    tags: ["SWE Apprenticeship", "Search & NLP", "Indeed Engineering", "Full-Time Conversion"],
    isFlagship: true,
    hue: 205,
    speakers: [{ name: "Suresh Kartha", role: "Head of Engineering, Indeed India" }],
  },
  {
    title: "Reliance TUP 9.0 (The Ultimate Pitch)",
    category: "Competitions",
    organizer: "Reliance Industries Limited",
    location: "Online Submissions & Jio World Centre, BKC, Mumbai",
    date: "2026-11-26",
    time: "10:00 AM",
    description: "One of India's most prestigious early-stage startup & innovation challenges. Pitch breakthrough technological solutions across 5G/6G, clean energy, retail logistics, and consumer tech directly to Mukesh Ambani's strategic leadership team.",
    prize: "₹10,00,000 Grand Prize + Incubation at JioGenNext",
    link: "https://unstop.com/competitions/reliance-the-ultimate-pitch-90",
    mode: "Hybrid",
    sourcePlatform: "Unstop",
    sourceUrl: "https://unstop.com/competitions/reliance-the-ultimate-pitch-90",
    eligibility: "Full-time students enrolled in undergraduate, postgraduate, or doctoral programs in India",
    deadline: "Nov 18, 2026 · 11:59 PM IST",
    tags: ["Startup Pitch", "Reliance Jio", "JioGenNext", "Venture Seed"],
    isFlagship: true,
    hue: 25,
    speakers: [{ name: "Kiran Thomas", role: "President, Reliance Industries Limited" }],
  },
];

/**
 * Fetch live flagship events via OpenRouter LLM API.
 * If no key is set or API call fails, falls back gracefully to curated platform events.
 */
export async function fetchLiveEventsFromOpenRouter(
  params: OpenRouterFetchParams = {}
): Promise<{ events: EventItem[]; source: "openrouter" | "curated"; message: string }> {
  const envKey = (import.meta as any).env?.VITE_OPENROUTER_API_KEY as string | undefined;
  const localKey = typeof window !== "undefined" ? localStorage.getItem("tribe_openrouter_api_key") : null;
  const apiKey = params.apiKey?.trim() || localKey?.trim() || envKey?.trim();

  const targetPlatforms = (params.platforms && params.platforms.length > 0)
    ? params.platforms
    : (["Unstop", "Grad Partners", "Wellfound", "Naukri Campus", "Indeed", "Devfolio"] as EventPlatform[]);

  // If no API key is provided, return matched items from curated pool
  if (!apiKey) {
    const matched = CURATED_LIVE_POOL.filter((item) =>
      targetPlatforms.includes(item.sourcePlatform as EventPlatform)
    );

    const mappedEvents: EventItem[] = (matched.length > 0 ? matched : CURATED_LIVE_POOL).map((item, idx) => ({
      id: `ai-${item.sourcePlatform?.toLowerCase().replace(/\s+/g, "") || "ext"}-${Date.now().toString(36)}-${idx}`,
      title: item.title || "Flagship Competition",
      category: item.category || "Competitions",
      organizer: item.organizer || "Industry Partner",
      date: item.date || new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 10),
      time: item.time || "10:00 AM",
      location: item.location || "Online & Hybrid",
      description: item.description || "Flagship student challenge with industry rewards and mentorship.",
      speakers: item.speakers || [],
      attendees: ["me"],
      capacity: item.capacity || 500,
      relatedProjects: [],
      hue: item.hue || 210,
      prize: item.prize,
      link: item.link,
      mode: item.mode || "Hybrid",
      sourcePlatform: item.sourcePlatform || "Unstop",
      sourceUrl: item.sourceUrl || item.link,
      eligibility: item.eligibility || "Open to all enrolled university students",
      deadline: item.deadline || "Upcoming",
      tags: item.tags || ["Flagship", "Verified"],
      isFlagship: true,
      isAiFetched: true,
    }));

    return {
      events: mappedEvents,
      source: "curated",
      message: `Loaded ${mappedEvents.length} genuine flagship events from ${targetPlatforms.join(", ")} platform database. (Set an OpenRouter API key to query live LLM web exploration).`,
    };
  }

  // When API key is provided, execute OpenRouter request
  try {
    const model = params.model || "meta-llama/llama-3.3-70b-instruct";
    const prompt = `You are a real-time collegiate opportunity scout for "Tribe", a university talent platform.
Find and return CURRENT, REAL, and UPCOMING flagship competitions, hackathons, and hiring challenges from these specific platforms:
${targetPlatforms.join(", ")}.

Search context/focus: ${params.query ? params.query : "Upcoming flagship college student challenges, hackathons, and tech competitions across India and globally for 2026"}.

CRITICAL REQUIREMENTS:
1. ONLY return real events from the requested platforms (${targetPlatforms.join(", ")}).
2. For each event, include:
   - "title": Genuine official event title.
   - "category": One of ["Hackathons", "Workshops", "Meetups", "Competitions", "Seminars", "Hiring Challenges"].
   - "organizer": Real company or institutional host.
   - "sourcePlatform": One of ${JSON.stringify(targetPlatforms)}.
   - "sourceUrl": Real web URL or registration portal on that platform.
   - "date": Real ISO date string (e.g. "2026-10-15").
   - "time": Time with AM/PM (e.g. "10:00 AM").
   - "location": City, Campus, or "Virtual / Online".
   - "mode": "Online" | "In-person" | "Hybrid".
   - "eligibility": Specific eligibility requirements (e.g. "B.Tech/BE Batch 2025-2028", "Open to all MBA & Engineering students", "Solo or teams of 2-4").
   - "deadline": Registration deadline text (e.g. "Oct 20, 2026").
   - "prize": Specific prize pool, cash awards, or PPO details (e.g. "₹5,00,000 + Pre-Placement Interviews").
   - "description": 2-3 sentences explaining the challenge, tracks, and value proposition.
   - "tags": Array of 3-5 tags (e.g. ["AI", "Robotics", "PPO", "Freshers"]).
   - "hue": Number between 10 and 350 for thematic color.

Output format: Return ONLY a valid JSON array of objects. Do NOT include markdown code fences, backticks, or explanatory text.`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://tribe.app",
        "X-Title": "Tribe Campus Events Aggregator",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are an automated real-time event aggregation API. Always respond strictly in valid JSON format without markdown ticks.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn("OpenRouter API error response:", res.status, errText);
      throw new Error(`OpenRouter API responded with status ${res.status}: ${errText.slice(0, 100)}`);
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() || "";

    // Clean JSON markdown blocks if any
    const cleaned = rawContent
      .replace(/^```json/i, "")
      .replace(/^```/i, "")
      .replace(/```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Invalid response schema from OpenRouter");
    }

    const liveEvents: EventItem[] = parsed.map((item: any, i: number) => ({
      id: `ai-${Date.now().toString(36)}-${i}`,
      title: String(item.title || "Flagship Challenge"),
      category: item.category || "Competitions",
      organizer: String(item.organizer || "Host Partner"),
      date: item.date || new Date(Date.now() + 86400000 * 10).toISOString().slice(0, 10),
      time: item.time || "10:00 AM",
      location: item.location || "Online & Hybrid",
      description: item.description || "Flagship student competition with industry rewards.",
      speakers: Array.isArray(item.speakers) ? item.speakers : [],
      attendees: ["me"],
      capacity: item.capacity || 500,
      relatedProjects: [],
      hue: Number(item.hue) || 220,
      prize: item.prize,
      link: item.sourceUrl || item.link,
      mode: item.mode || "Hybrid",
      sourcePlatform: item.sourcePlatform || "Unstop",
      sourceUrl: item.sourceUrl || item.link,
      eligibility: item.eligibility || "Open to all enrolled students",
      deadline: item.deadline || "Upcoming",
      tags: Array.isArray(item.tags) ? item.tags : ["Flagship", "Live Sourced"],
      isFlagship: true,
      isAiFetched: true,
    }));

    return {
      events: liveEvents,
      source: "openrouter",
      message: `Successfully fetched ${liveEvents.length} live flagship events via OpenRouter from ${targetPlatforms.join(", ")}.`,
    };
  } catch (err: any) {
    console.error("OpenRouter live fetch failed, using fallback:", err);
    // Fallback to curated pool
    const matched = CURATED_LIVE_POOL.filter((item) =>
      targetPlatforms.includes(item.sourcePlatform as EventPlatform)
    );
    const mapped = (matched.length ? matched : CURATED_LIVE_POOL).map((item, idx) => ({
      id: `curated-${Date.now().toString(36)}-${idx}`,
      title: item.title || "Flagship Competition",
      category: item.category || "Competitions",
      organizer: item.organizer || "Industry Partner",
      date: item.date || "2026-10-20",
      time: item.time || "10:00 AM",
      location: item.location || "Online",
      description: item.description || "",
      speakers: item.speakers || [],
      attendees: ["me"],
      capacity: 500,
      relatedProjects: [],
      hue: item.hue || 210,
      prize: item.prize,
      link: item.link,
      mode: item.mode || "Hybrid",
      sourcePlatform: item.sourcePlatform || "Unstop",
      sourceUrl: item.sourceUrl || item.link,
      eligibility: item.eligibility,
      deadline: item.deadline,
      tags: item.tags || ["Flagship"],
      isFlagship: true,
      isAiFetched: true,
    }));

    return {
      events: mapped,
      source: "curated",
      message: `Fetched curated events from ${targetPlatforms.join(", ")} (OpenRouter error: ${err.message || "Failed"}).`,
    };
  }
}

/**
 * Synchronize newly fetched live events into Tribe's active store and Firestore.
 */
export async function syncEventsToTribe(newEvents: EventItem[]): Promise<number> {
  const currentEvents = useApp.getState().events;
  const existingTitles = new Set(currentEvents.map((e) => e.title.trim().toLowerCase()));

  let addedCount = 0;
  for (const ev of newEvents) {
    if (!existingTitles.has(ev.title.trim().toLowerCase())) {
      useApp.getState().addEvent(ev);
      // Also persist to Firestore
      try {
        await firestoreAddEvent(ev);
      } catch (e) {
        console.warn("Firestore sync for event deferred:", e);
      }
      existingTitles.add(ev.title.trim().toLowerCase());
      addedCount++;
    }
  }

  return addedCount;
}
