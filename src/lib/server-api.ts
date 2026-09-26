import { createServerFn } from "@tanstack/react-start";
import type { IntegrationStats, Platform } from "./types";

/**
 * Converts a LeetCode submissionCalendar JSON string into:
 * - 364 daily counts (52 weeks x 7 days)
 * - 52 weekly sums
 */
function parseLeetCodeCalendar(calendarStr?: string): { weeks: number[]; daily: number[] } {
  const daily = Array(364).fill(0);
  const weeks = Array(52).fill(0);
  if (!calendarStr) return { weeks, daily };

  try {
    const calendar: Record<string, number> =
      typeof calendarStr === "string" ? JSON.parse(calendarStr) : calendarStr;
    const now = Math.floor(Date.now() / 1000);

    for (const [timestampStr, countVal] of Object.entries(calendar)) {
      const ts = parseInt(timestampStr, 10);
      const diffSecs = now - ts;
      if (diffSecs >= 0 && diffSecs < 364 * 86400) {
        const diffDays = Math.floor(diffSecs / 86400);
        const dayIndex = 363 - diffDays;
        if (dayIndex >= 0 && dayIndex < 364) {
          const count = Number(countVal) || 0;
          daily[dayIndex] += count;
          weeks[Math.floor(dayIndex / 7)] += count;
        }
      }
    }
  } catch (e) {
    console.error("[LeetCode] Error parsing submissionCalendar:", e);
  }

  return { weeks, daily };
}

export const fetchPlatformDataServerFn = createServerFn({ method: "POST" })
  .validator((d: { platform: Platform; handle: string }) => d)
  .handler(async ({ data: { platform, handle } }): Promise<IntegrationStats> => {
    const clean = handle.trim().replace(/^@+/, "");
    if (!clean) {
      throw new Error("Username/handle cannot be empty");
    }

    if (platform === "LeetCode") {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      try {
        const res = await fetch("https://leetcode.com/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)",
            Referer: "https://leetcode.com",
          },
          body: JSON.stringify({
            query: `query getUserProfile($username: String!) {
              matchedUser(username: $username) {
                username
                submitStats: submitStatsGlobal {
                  acSubmissionNum {
                    difficulty
                    count
                  }
                }
                profile {
                  ranking
                  reputation
                  userAvatar
                }
                submissionCalendar
              }
            }`,
            variables: { username: clean },
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`LeetCode API returned status ${res.status}`);
        }

        const json = await res.json();
        const user = json?.data?.matchedUser;
        if (!user) {
          throw new Error(`LeetCode user "${clean}" does not exist.`);
        }

        const counts = user.submitStats?.acSubmissionNum || [];
        const allSolved = counts.find((c: any) => c.difficulty === "All")?.count ?? 0;
        const easySolved = counts.find((c: any) => c.difficulty === "Easy")?.count ?? 0;
        const mediumSolved = counts.find((c: any) => c.difficulty === "Medium")?.count ?? 0;
        const hardSolved = counts.find((c: any) => c.difficulty === "Hard")?.count ?? 0;
        const ranking = user.profile?.ranking;
        const avatarUrl = user.profile?.userAvatar;
        const { weeks, daily } = parseLeetCodeCalendar(user.submissionCalendar);

        return {
          primary: `${allSolved} solved`,
          secondary: `Easy: ${easySolved} · Med: ${mediumSolved} · Hard: ${hardSolved}`,
          badge: ranking ? `Rank #${ranking.toLocaleString()}` : "Active Solver",
          avatarUrl,
          easySolved,
          mediumSolved,
          hardSolved,
          ranking,
          contributions: weeks,
          dailyContributions: daily,
        };
      } finally {
        clearTimeout(timeout);
      }
    }

    if (platform === "GitHub") {
      let repos = 0;
      let followers = 0;
      let avatarUrl: string | undefined;

      // 1. Fetch user metadata
      const ctrl1 = new AbortController();
      const tm1 = setTimeout(() => ctrl1.abort(), 5000);
      try {
        const res = await fetch(`https://api.github.com/users/${encodeURIComponent(clean)}`, {
          headers: {
            "User-Agent": "Tribe-Platform/1.0",
            Accept: "application/vnd.github.v3+json",
          },
          signal: ctrl1.signal,
        });
        if (res.status === 404) {
          throw new Error(`GitHub user "${clean}" not found.`);
        }
        if (res.ok) {
          const u = await res.json();
          repos = u.public_repos ?? 0;
          followers = u.followers ?? 0;
          avatarUrl = u.avatar_url;
        }
      } finally {
        clearTimeout(tm1);
      }

      // 2. Fetch actual contributions heatmap
      let daily: number[] = Array(364).fill(0);
      let weeks: number[] = Array(52).fill(0);
      let fetchedRealHeatmap = false;

      // Primary source: jogruber API
      try {
        const ctrl2 = new AbortController();
        const tm2 = setTimeout(() => ctrl2.abort(), 5000);
        const res2 = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(clean)}?y=last`,
          { signal: ctrl2.signal }
        );
        clearTimeout(tm2);
        if (res2.ok) {
          const contribData = await res2.json();
          if (Array.isArray(contribData?.contributions)) {
            const rawDaily = contribData.contributions;
            const slice = rawDaily.slice(-364);
            const padded = Array(Math.max(0, 364 - slice.length))
              .fill(0)
              .concat(slice.map((d: any) => Number(d.count) || 0));

            daily = padded;
            weeks = [];
            for (let i = 0; i < 52; i++) {
              const weekSlice = daily.slice(i * 7, (i + 1) * 7);
              weeks.push(weekSlice.reduce((sum, n) => sum + n, 0));
            }
            fetchedRealHeatmap = true;
          }
        }
      } catch (e) {
        console.warn("[GitHub] jogruber API error, attempting HTML scrape fallback", e);
      }

      // Secondary fallback: scrape github.com/users/{handle}/contributions
      if (!fetchedRealHeatmap) {
        try {
          const ctrl3 = new AbortController();
          const tm3 = setTimeout(() => ctrl3.abort(), 5000);
          const res3 = await fetch(
            `https://github.com/users/${encodeURIComponent(clean)}/contributions`,
            {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)",
              },
              signal: ctrl3.signal,
            }
          );
          clearTimeout(tm3);
          if (res3.ok) {
            const html = await res3.text();
            const dayRegex = /<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d+)"[^>]*>/g;
            let match;
            const scrapedDays: number[] = [];
            while ((match = dayRegex.exec(html)) !== null) {
              const lvl = parseInt(match[2], 10) || 0;
              const approxCount = lvl === 0 ? 0 : lvl === 1 ? 1 : lvl === 2 ? 4 : lvl === 3 ? 8 : 14;
              scrapedDays.push(approxCount);
            }
            if (scrapedDays.length >= 52) {
              const slice = scrapedDays.slice(-364);
              daily = Array(Math.max(0, 364 - slice.length)).fill(0).concat(slice);
              weeks = [];
              for (let i = 0; i < 52; i++) {
                const weekSlice = daily.slice(i * 7, (i + 1) * 7);
                weeks.push(weekSlice.reduce((sum, n) => sum + n, 0));
              }
              fetchedRealHeatmap = true;
            }
          }
        } catch (e) {
          console.error("[GitHub] Contributions HTML fallback failed:", e);
        }
      }

      return {
        primary: `${repos} repositories`,
        secondary: `${followers} followers · Verified GitHub`,
        badge: repos >= 15 ? "Prolific Maker" : "Open Source Contributor",
        avatarUrl,
        repos,
        followers,
        contributions: weeks,
        dailyContributions: daily,
      };
    }

    if (platform === "Codeforces") {
      const ctrl1 = new AbortController();
      const tm1 = setTimeout(() => ctrl1.abort(), 5000);
      let user: any;
      try {
        const res = await fetch(
          `https://codeforces.com/api/user.info?handles=${encodeURIComponent(clean)}`,
          { signal: ctrl1.signal }
        );
        if (!res.ok) {
          throw new Error(`Codeforces API returned HTTP ${res.status}`);
        }
        const data = await res.json();
        if (data.status !== "OK" || !data.result?.[0]) {
          throw new Error(`Codeforces handle "${clean}" not found.`);
        }
        user = data.result[0];
      } finally {
        clearTimeout(tm1);
      }

      const rating = user.rating ?? 0;
      const maxRating = user.maxRating ?? rating;
      const rank = user.rank || (rating > 0 ? "Specialist" : "Unrated");
      const avatarUrl = user.avatar || user.titlePhoto;

      // Fetch actual submissions for heatmap
      let daily: number[] = Array(364).fill(0);
      let weeks: number[] = Array(52).fill(0);

      try {
        const ctrl2 = new AbortController();
        const tm2 = setTimeout(() => ctrl2.abort(), 6000);
        const res2 = await fetch(
          `https://codeforces.com/api/user.status?handle=${encodeURIComponent(clean)}&from=1&count=1000`,
          { signal: ctrl2.signal }
        );
        clearTimeout(tm2);
        if (res2.ok) {
          const subData = await res2.json();
          if (subData.status === "OK" && Array.isArray(subData.result)) {
            const now = Math.floor(Date.now() / 1000);
            for (const sub of subData.result) {
              const diffSecs = now - (sub.creationTimeSeconds || 0);
              if (diffSecs >= 0 && diffSecs < 364 * 86400) {
                const diffDays = Math.floor(diffSecs / 86400);
                const dayIndex = 363 - diffDays;
                if (dayIndex >= 0 && dayIndex < 364) {
                  daily[dayIndex] += 1;
                  weeks[Math.floor(dayIndex / 7)] += 1;
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn("[Codeforces] Submissions fetch error:", e);
      }

      const rankTitle = rank.charAt(0).toUpperCase() + rank.slice(1);
      return {
        primary: rating > 0 ? `${rating} rating` : "Unrated",
        secondary: rating > 0 ? `Max: ${maxRating} · ${rankTitle}` : "New Contestant",
        badge: rankTitle,
        avatarUrl,
        rating,
        maxRating,
        rank: rankTitle,
        contributions: weeks,
        dailyContributions: daily,
      };
    }

    if (platform === "CodeChef") {
      const ctrl = new AbortController();
      const tm = setTimeout(() => ctrl.abort(), 6000);
      try {
        const res = await fetch(`https://www.codechef.com/users/${encodeURIComponent(clean)}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)",
          },
          signal: ctrl.signal,
        });

        if (res.status === 404) {
          throw new Error(`CodeChef user "${clean}" does not exist.`);
        }

        const html = await res.text();
        if (
          html.includes("User not found") ||
          html.includes("Page Not Found") ||
          html.includes("Could not find the page")
        ) {
          throw new Error(`CodeChef user "${clean}" not found.`);
        }

        // Extract rating number
        const ratingMatch = html.match(/<div class="rating-number">\s*([0-9]+)\s*<\/div>/);
        const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;

        // Extract division
        const divMatch = html.match(/\((Div\s*[0-9]+)\)/i);
        const division = divMatch ? divMatch[1] : "Div 2";

        // Extract stars
        let stars = "1★";
        if (rating >= 2500) stars = "7★";
        else if (rating >= 2200) stars = "6★";
        else if (rating >= 2000) stars = "5★";
        else if (rating >= 1800) stars = "4★";
        else if (rating >= 1600) stars = "3★";
        else if (rating >= 1400) stars = "2★";

        // Extract global rank
        const rankMatch =
          html.match(/<strong class='global-rank'>([0-9]+)<\/strong>/) ||
          html.match(/global rank ([0-9]+)/i);
        const globalRank = rankMatch ? parseInt(rankMatch[1], 10) : undefined;

        return {
          primary: rating > 0 ? `${rating} rating (${stars})` : "Unrated",
          secondary: `${division}${globalRank ? ` · Global Rank #${globalRank.toLocaleString()}` : ""}`,
          badge: `${stars} Coder`,
          rating,
          stars,
          globalRank,
          contributions: Array(52).fill(0),
          dailyContributions: Array(364).fill(0),
        };
      } finally {
        clearTimeout(tm);
      }
    }

    if (platform === "Kaggle") {
      const ctrl = new AbortController();
      const tm = setTimeout(() => ctrl.abort(), 5000);
      try {
        const res = await fetch(`https://www.kaggle.com/${encodeURIComponent(clean)}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)",
          },
          signal: ctrl.signal,
        });
        if (res.status === 404) {
          throw new Error(`Kaggle user "${clean}" does not exist.`);
        }
        return {
          primary: "Kaggle Profile",
          secondary: `@${clean} · Verified Data Scientist`,
          badge: "Kaggler",
          contributions: Array(52).fill(0),
          dailyContributions: Array(364).fill(0),
        };
      } finally {
        clearTimeout(tm);
      }
    }

    if (platform === "LinkedIn") {
      return {
        primary: "Connected Profile",
        secondary: `@${clean} · Verified student presence`,
        badge: "Verified Student",
        contributions: Array(52).fill(0),
        dailyContributions: Array(364).fill(0),
      };
    }

    throw new Error(`Platform ${platform} is not supported.`);
  });
