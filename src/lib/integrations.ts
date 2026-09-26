import type { Integration, IntegrationStats, Platform } from "./types";
import { fetchPlatformDataServerFn } from "./server-api";

export interface PlatformConfig {
  id: Platform;
  name: string;
  tagline: string;
  description: string;
  prefix: string;
  placeholder: string;
  brandColor: string;
  accentBg: string;
  accentBorder: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  category: "DSA & Problem Solving" | "Open Source & Code" | "Competitive Programming" | "Contest Challenges" | "AI & Data Science" | "Professional Network";
  getUrl: (handle: string) => string;
}

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  LeetCode: {
    id: "LeetCode",
    name: "LeetCode",
    tagline: "Problems solved, contests & difficulty breakdown",
    description: "Connect your LeetCode profile to verify DSA proficiency, accuracy & submissions calendar.",
    prefix: "leetcode.com/u/",
    placeholder: "https://leetcode.com/u/abhishek_t or abhishek_t",
    brandColor: "#FFA116",
    accentBg: "rgba(255, 161, 22, 0.08)",
    accentBorder: "rgba(255, 161, 22, 0.25)",
    textColor: "#FEA116",
    badgeBg: "rgba(255, 161, 22, 0.15)",
    badgeText: "#E58E0B",
    category: "DSA & Problem Solving",
    getUrl: (h) => `https://leetcode.com/u/${h}`,
  },
  GitHub: {
    id: "GitHub",
    name: "GitHub",
    tagline: "Repositories, commits & contribution graph",
    description: "Sync your open-source repositories, commit activity & yearly contributions heatmap.",
    prefix: "github.com/",
    placeholder: "https://github.com/abhishek-tiwari or abhishek-tiwari",
    brandColor: "#24292E",
    accentBg: "rgba(100, 116, 139, 0.08)",
    accentBorder: "rgba(100, 116, 139, 0.25)",
    textColor: "currentColor",
    badgeBg: "rgba(100, 116, 139, 0.15)",
    badgeText: "currentColor",
    category: "Open Source & Code",
    getUrl: (h) => `https://github.com/${h}`,
  },
  Codeforces: {
    id: "Codeforces",
    name: "Codeforces",
    tagline: "Competitive rating & rank title",
    description: "Showcase your real-time contest rating, max rank, and contest solution activity.",
    prefix: "codeforces.com/profile/",
    placeholder: "https://codeforces.com/profile/abhishek_coder or abhishek_coder",
    brandColor: "#1F8ACB",
    accentBg: "rgba(31, 138, 203, 0.08)",
    accentBorder: "rgba(31, 138, 203, 0.25)",
    textColor: "#1F8ACB",
    badgeBg: "rgba(31, 138, 203, 0.15)",
    badgeText: "#0284C7",
    category: "Competitive Programming",
    getUrl: (h) => `https://codeforces.com/profile/${h}`,
  },
  CodeChef: {
    id: "CodeChef",
    name: "CodeChef",
    tagline: "Stars, division & global contest rating",
    description: "Display star ranking, divisional ratings, and monthly long challenge stats.",
    prefix: "codechef.com/users/",
    placeholder: "https://www.codechef.com/users/abhishek_t or abhishek_t",
    brandColor: "#5B4638",
    accentBg: "rgba(180, 83, 9, 0.08)",
    accentBorder: "rgba(180, 83, 9, 0.25)",
    textColor: "#B45309",
    badgeBg: "rgba(180, 83, 9, 0.15)",
    badgeText: "#92400E",
    category: "Contest Challenges",
    getUrl: (h) => `https://www.codechef.com/users/${h}`,
  },
  Kaggle: {
    id: "Kaggle",
    name: "Kaggle",
    tagline: "Notebooks, datasets & competition medals",
    description: "Connect your data science portfolio, Kaggle master/expert rank and models.",
    prefix: "kaggle.com/",
    placeholder: "https://www.kaggle.com/abhishek_tiwari or abhishek_tiwari",
    brandColor: "#20BEFF",
    accentBg: "rgba(32, 190, 255, 0.08)",
    accentBorder: "rgba(32, 190, 255, 0.25)",
    textColor: "#0284C7",
    badgeBg: "rgba(32, 190, 255, 0.15)",
    badgeText: "#0369A1",
    category: "AI & Data Science",
    getUrl: (h) => `https://www.kaggle.com/${h}`,
  },
  LinkedIn: {
    id: "LinkedIn",
    name: "LinkedIn",
    tagline: "Professional headline & verified student presence",
    description: "Link your verified professional profile to build genuine campus credibility.",
    prefix: "linkedin.com/in/",
    placeholder: "https://linkedin.com/in/abhishek-tiwari or abhishek-tiwari",
    brandColor: "#0A66C2",
    accentBg: "rgba(10, 102, 194, 0.08)",
    accentBorder: "rgba(10, 102, 194, 0.25)",
    textColor: "#0A66C2",
    badgeBg: "rgba(10, 102, 194, 0.15)",
    badgeText: "#0A66C2",
    category: "Professional Network",
    getUrl: (h) => `https://linkedin.com/in/${h}`,
  },
};

/**
 * Extracts clean username from raw user input, whether it's a full URL or a handle.
 */
export function extractUsernameFromInput(platform: Platform, rawInput: string): string {
  if (!rawInput) return "";
  let val = rawInput.trim();
  val = val.replace(/\/+$/, "");

  try {
    if (val.startsWith("http://") || val.startsWith("https://")) {
      const url = new URL(val);
      const parts = url.pathname.split("/").filter(Boolean);
      if (platform === "LeetCode") {
        if (parts[0] === "u" && parts[1]) return parts[1];
        if (parts[0]) return parts[0];
      } else if (platform === "GitHub") {
        if (parts[0]) return parts[0];
      } else if (platform === "Codeforces") {
        if (parts[0] === "profile" && parts[1]) return parts[1];
        if (parts[0]) return parts[0];
      } else if (platform === "CodeChef") {
        if (parts[0] === "users" && parts[1]) return parts[1];
        if (parts[0]) return parts[0];
      } else if (platform === "Kaggle") {
        if (parts[0]) return parts[0];
      } else if (platform === "LinkedIn") {
        if (parts[0] === "in" && parts[1]) return parts[1];
        if (parts[0]) return parts[0];
      }
    }
  } catch {
    // fallback to regex
  }

  if (platform === "LeetCode") {
    const m = val.match(/leetcode\.com\/(?:u\/)?([A-Za-z0-9_.-]+)/i);
    if (m) return m[1];
  } else if (platform === "GitHub") {
    const m = val.match(/github\.com\/([A-Za-z0-9_.-]+)/i);
    if (m) return m[1];
  } else if (platform === "Codeforces") {
    const m = val.match(/codeforces\.com\/(?:profile\/)?([A-Za-z0-9_.-]+)/i);
    if (m) return m[1];
  } else if (platform === "CodeChef") {
    const m = val.match(/codechef\.com\/(?:users\/)?([A-Za-z0-9_.-]+)/i);
    if (m) return m[1];
  } else if (platform === "Kaggle") {
    const m = val.match(/kaggle\.com\/([A-Za-z0-9_.-]+)/i);
    if (m) return m[1];
  } else if (platform === "LinkedIn") {
    const m = val.match(/linkedin\.com\/in\/([A-Za-z0-9_.-]+)/i);
    if (m) return m[1];
  }

  val = val.replace(/^@+/, "");
  return val;
}

/**
 * Fetches real API statistics and heatmap data for a platform handle/link.
 */
export async function fetchPlatformStats(platform: Platform, input: string): Promise<{ handle: string; stats: IntegrationStats }> {
  const handle = extractUsernameFromInput(platform, input);
  if (!handle) {
    throw new Error("Invalid username or URL");
  }

  try {
    const serverResult = await fetchPlatformDataServerFn({ data: { platform, handle } });
    if (serverResult && serverResult.primary) {
      return { handle, stats: serverResult };
    }
  } catch (err: any) {
    throw new Error(err.message || `Failed to fetch verified data for ${platform} (@${handle})`);
  }

  throw new Error(`Failed to fetch verified data for ${platform} (@${handle}). Please verify the handle.`);
}

/**
 * Clean default connections. By default, unlinked platforms are disconnected with NO mock data.
 */
export function getDefaultConnectedIntegrations(): Record<Platform, Integration> {
  return {
    GitHub: {
      status: "disconnected",
    },
    LeetCode: {
      status: "disconnected",
    },
    Codeforces: {
      status: "disconnected",
    },
    CodeChef: {
      status: "disconnected",
    },
    Kaggle: {
      status: "disconnected",
    },
    LinkedIn: {
      status: "disconnected",
    },
  };
}
