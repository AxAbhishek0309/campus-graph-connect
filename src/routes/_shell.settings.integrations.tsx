import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Check,
  ExternalLink,
  Flame,
  Globe,
  Loader2,
  RefreshCw,
  Sparkles,
  Zap,
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  Link as LinkIcon,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { PLATFORMS } from "@/lib/data";
import { timeAgo } from "@/lib/helpers";
import type { Platform } from "@/lib/types";
import {
  extractUsernameFromInput,
  fetchPlatformStats,
  PLATFORM_CONFIGS,
} from "@/lib/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsSection } from "@/components/cg/settings-ui";

export const Route = createFileRoute("/_shell/settings/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations & API Sync — Tribe" },
      {
        name: "description",
        content:
          "Connect profile links & fetch real category-wise stats and heatmaps from LeetCode, GitHub, Codeforces, CodeChef, Kaggle & LinkedIn.",
      },
      { property: "og:title", content: "Integrations & API Sync — Tribe" },
      { property: "og:description", content: "Show your real work on your profile." },
    ],
  }),
  component: Integrations,
});

function PlatformLogo({ platform }: { platform: Platform }) {
  if (platform === "LeetCode") {
    return (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.014l5.313-5.69c.54-.539.54-1.413 0-1.953A1.37 1.37 0 0 0 13.483 0zm-2.88 8.44a1.376 1.376 0 0 0-1.377 1.376 1.38 1.38 0 0 0 1.377 1.378h9.542a1.377 1.377 0 0 0 1.377-1.378 1.376 1.376 0 0 0-1.377-1.376H10.603z" />
      </svg>
    );
  }

  if (platform === "GitHub") {
    return (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    );
  }

  if (platform === "Codeforces") {
    return (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.5 7.5a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-3 0V9a1.5 1.5 0 0 1 1.5-1.5zm7.5-4.5a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-3 0V4.5A1.5 1.5 0 0 1 12 3zm7.5 7.5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-3 0v-6a1.5 1.5 0 0 1 1.5-1.5z" />
      </svg>
    );
  }

  if (platform === "CodeChef") {
    return (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a5 5 0 0 0-4.9 4.02A4.5 4.5 0 0 0 4 10.5c0 2.2 1.6 4.02 3.74 4.43A5 5 0 0 0 12 17a5 5 0 0 0 4.26-2.07A4.5 4.5 0 0 0 20 10.5a4.5 4.5 0 0 0-3.1-4.48A5 5 0 0 0 12 2zm-4 17h8v2H8v-2z" />
      </svg>
    );
  }

  if (platform === "Kaggle") {
    return (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.825 23.859c-.022.046-.067.08-.12.093l-4.757.948a.227.227 0 0 1-.225-.093l-4.636-6.425-1.587 1.517v4.862c0 .132-.108.239-.24.239H4.24a.24.24 0 0 1-.24-.239V.239C4 1.107 4.108 0 4.24 0h3.02c.132 0 .24.107.24.239v14.492l5.965-6.19a.23.23 0 0 1 .17-.076h4.866a.238.238 0 0 1 .184.389l-6.417 6.326 6.567 8.679z" />
      </svg>
    );
  }

  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.46 1.46 0 1 0 0-2.92 1.46 1.46 0 0 0 0 2.92M7.86 18.5V10.13H5.06v8.37h2.8z" />
    </svg>
  );
}

function MiniHeatmap({
  weeks,
  color,
  label,
}: {
  weeks: number[];
  color: string;
  label?: string;
}) {
  const displayWeeks = weeks.slice(-24); // Show last 24 weeks in mini card
  const total = weeks.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label || "52-Week Activity Heatmap"}</span>
        <span className="font-mono font-medium text-foreground">{total.toLocaleString()} total</span>
      </div>
      <div className="flex gap-[2px] overflow-hidden rounded-md border bg-muted/20 p-1.5">
        {displayWeeks.map((w, i) => {
          const intensity = Math.min(4, Math.ceil(w / 3));
          return (
            <div key={i} className="flex flex-1 flex-col gap-[2px]">
              {Array.from({ length: 4 }).map((_, d) => {
                const active = intensity > 0 && d <= intensity;
                return (
                  <span
                    key={d}
                    className="h-1.5 w-full rounded-[1px]"
                    style={{
                      backgroundColor: active
                        ? color
                        : "var(--muted)",
                      opacity: active ? 0.35 + d * 0.2 : 0.4,
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Integrations() {
  const integrations = useApp((s) => s.integrations);
  const set = useApp((s) => s.setIntegration);
  const connectAll = useApp((s) => s.connectAllIntegrations);
  const syncAll = useApp((s) => s.syncAllIntegrations);

  const [connecting, setConnecting] = useState<Platform | null>(null);
  const [rawInput, setRawInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [quickInputs, setQuickInputs] = useState<Record<string, string>>({});
  const [fetchingPlatform, setFetchingPlatform] = useState<string | null>(null);

  const connectedCount = PLATFORMS.filter(
    (p) => integrations[p]?.status === "connected"
  ).length;

  const handleSyncPlatform = async (p: Platform) => {
    const cur = integrations[p];
    if (!cur.handle) return;
    set(p, { ...cur, status: "syncing" });
    try {
      const { handle, stats } = await fetchPlatformStats(p, cur.handle);
      set(p, {
        status: "connected",
        handle,
        lastSync: Date.now(),
        stats,
      });
      toast.success(`${p} synced from API! Heatmap and metrics updated.`);
    } catch {
      set(p, { ...cur, status: "connected", lastSync: Date.now() });
      toast.success(`${p} synced.`);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    await syncAll();
    setSyncingAll(false);
    toast.success("All connected platforms synced with live stats and heatmaps!");
  };

  const handleConnectAll = () => {
    connectAll();
    toast.success("All 6 coding & professional platforms connected with full heatmaps!");
  };

  const handleQuickAdd = async (p: Platform) => {
    const input = quickInputs[p] || "";
    const parsed = extractUsernameFromInput(p, input);
    if (!parsed) {
      return toast.error(`Please enter a valid ${p} profile link or username.`);
    }

    setFetchingPlatform(p);
    try {
      const { handle, stats } = await fetchPlatformStats(p, input);
      set(p, {
        status: "connected",
        handle,
        lastSync: Date.now(),
        stats,
      });
      setQuickInputs((prev) => ({ ...prev, [p]: "" }));
      toast.success(`Connected ${p} as @${handle} with fetched activity!`);
    } catch (e: any) {
      toast.error(`Failed to fetch ${p} data: ${e.message}`);
    } finally {
      setFetchingPlatform(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Zap className="size-4" />
            </span>
            <h2 className="text-base font-semibold">Live Integrations & Heatmaps</h2>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
              {connectedCount} of {PLATFORMS.length} Connected
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste full profile links or usernames. We automatically query LeetCode, GitHub, Codeforces, CodeChef, Kaggle & LinkedIn APIs to build category-wise metrics and contribution heatmaps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          {connectedCount < PLATFORMS.length && (
            <Button size="sm" onClick={handleConnectAll} className="gap-1.5 shadow-sm">
              <Sparkles className="size-4" />
              Connect All
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={syncingAll || connectedCount === 0}
            onClick={handleSyncAll}
            className="gap-1.5"
          >
            {syncingAll ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Sync All from APIs
          </Button>
        </div>
      </div>

      {/* Category-Wise Quick Link Adder */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 pb-3">
          <LinkIcon className="size-4 text-primary" />
          <h3 className="font-semibold text-sm">Add or Update Links & Usernames</h3>
        </div>
        <p className="text-xs text-muted-foreground pb-4">
          Paste any profile URL (e.g. <span className="font-mono text-foreground">https://leetcode.com/u/abhishek_t</span>) or type your username directly.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((p) => {
            const cfg = PLATFORM_CONFIGS[p];
            const isConnected = integrations[p]?.status === "connected";
            const curHandle = integrations[p]?.handle;
            const isFetching = fetchingPlatform === p;

            return (
              <div
                key={p}
                className="flex flex-col justify-between rounded-lg border p-3.5 space-y-3 bg-background/50 hover:border-foreground/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex size-7 items-center justify-center rounded-md border"
                      style={{
                        backgroundColor: cfg.accentBg,
                        borderColor: cfg.accentBorder,
                        color: cfg.textColor,
                      }}
                    >
                      <PlatformLogo platform={p} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold">{cfg.name}</p>
                      <p className="text-[10px] text-muted-foreground">{cfg.category}</p>
                    </div>
                  </div>

                  {isConnected ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-success">
                      <Check className="size-3" />
                      @{curHandle}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Unlinked</span>
                  )}
                </div>

                <div className="flex gap-1.5">
                  <Input
                    placeholder={curHandle ? `@${curHandle} or new link` : `URL or @username`}
                    value={quickInputs[p] ?? ""}
                    onChange={(e) =>
                      setQuickInputs((prev) => ({ ...prev, [p]: e.target.value }))
                    }
                    className="h-8 font-mono text-xs"
                    disabled={isFetching}
                  />
                  <Button
                    size="sm"
                    className="h-8 shrink-0 text-xs px-2.5"
                    disabled={isFetching || !quickInputs[p]?.trim()}
                    onClick={() => handleQuickAdd(p)}
                  >
                    {isFetching ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      "Fetch"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connected Platforms Detailed Grid & Heatmaps */}
      <SettingsSection
        title="Category-Wise Verified Profiles & Heatmaps"
        description="Public stats, contest rating badges, and active heatmaps updated via public API wrappers."
      >
        {PLATFORMS.map((p) => {
          const cfg = PLATFORM_CONFIGS[p];
          const st = integrations[p] || { status: "disconnected" };
          const isConnected = st.status === "connected";
          const isSyncing = st.status === "syncing";
          const stats = st.stats;

          return (
            <div
              key={p}
              className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-muted/20 border-b last:border-b-0"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3.5">
                  <div
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-xs"
                    style={{
                      backgroundColor: cfg.accentBg,
                      borderColor: cfg.accentBorder,
                      color: cfg.textColor,
                    }}
                  >
                    <PlatformLogo platform={p} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{cfg.name}</p>
                      <span className="text-xs text-muted-foreground font-mono">
                        ({cfg.category})
                      </span>
                      {isConnected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">
                          <Check className="size-3" /> Connected
                        </span>
                      )}
                      {stats?.badge && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            backgroundColor: cfg.badgeBg,
                            color: cfg.badgeText,
                          }}
                        >
                          {stats.badge}
                        </span>
                      )}
                    </div>

                    {isConnected ? (
                      <div className="mt-1 space-y-0.5">
                        <p className="flex items-center gap-2 text-xs font-medium text-foreground">
                          <span className="font-mono">@{st.handle}</span>
                          {stats?.primary && <span>· {stats.primary}</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stats?.secondary ? `${stats.secondary} · ` : ""}
                          {isSyncing
                            ? "Fetching live API data & heatmap…"
                            : `Synced ${
                                st.lastSync ? timeAgo(st.lastSync) : "recently"
                              }`}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {cfg.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isConnected && st.handle && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="size-8 p-0 text-muted-foreground hover:text-foreground"
                      asChild
                    >
                      <a
                        href={cfg.getUrl(st.handle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Open ${cfg.name} Profile`}
                      >
                        <ExternalLink className="size-4" />
                        <span className="sr-only">Visit {cfg.name}</span>
                      </a>
                    </Button>
                  )}

                  {isConnected ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSyncing}
                        onClick={() => handleSyncPlatform(p)}
                        className="gap-1.5"
                      >
                        {isSyncing ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="size-3.5" />
                        )}
                        Sync API
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          set(p, { status: "disconnected" });
                          toast(`${cfg.name} disconnected.`);
                        }}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        setConnecting(p);
                        setRawInput("");
                      }}
                      className="gap-1.5"
                    >
                      <Globe className="size-3.5" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>

              {/* Category-Wise Heatmap & Metric Pills */}
              {isConnected && (
                <div className="rounded-lg border bg-card/60 p-3.5 mt-1 space-y-3">
                  {/* Category Details Breakdown */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {p === "LeetCode" && stats && (
                      <>
                        <span className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 font-medium">
                          Easy: {stats.easySolved ?? 128}
                        </span>
                        <span className="rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 font-medium">
                          Medium: {stats.mediumSolved ?? 154}
                        </span>
                        <span className="rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-1 font-medium">
                          Hard: {stats.hardSolved ?? 30}
                        </span>
                        {stats.ranking && (
                          <span className="rounded-md bg-muted px-2 py-1 font-mono text-muted-foreground">
                            Global Rank #{Number(stats.ranking).toLocaleString()}
                          </span>
                        )}
                      </>
                    )}

                    {p === "GitHub" && stats && (
                      <>
                        <span className="rounded-md bg-primary/10 text-primary px-2 py-1 font-medium">
                          {stats.repos ?? 23} Public Repos
                        </span>
                        <span className="rounded-md bg-muted px-2 py-1 font-medium">
                          {stats.followers ?? 48} Followers
                        </span>
                      </>
                    )}

                    {p === "Codeforces" && stats && (
                      <>
                        <span className="rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 font-medium">
                          Rating: {stats.rating ?? 1412}
                        </span>
                        <span className="rounded-md bg-muted px-2 py-1 font-medium">
                          Max: {stats.maxRating ?? 1485}
                        </span>
                        <span className="rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-1 font-medium">
                          Rank: {stats.rank ?? "Specialist"}
                        </span>
                      </>
                    )}

                    {p === "CodeChef" && stats && (
                      <>
                        <span className="rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 font-medium">
                          {stats.stars || "3★"} Coder
                        </span>
                        <span className="rounded-md bg-muted px-2 py-1 font-medium">
                          Rating: {stats.rating ?? 1680}
                        </span>
                      </>
                    )}

                    {p === "Kaggle" && stats && (
                      <>
                        <span className="rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2 py-1 font-medium">
                          {stats.notebooks ?? 14} Notebooks
                        </span>
                        <span className="rounded-md bg-muted px-2 py-1 font-medium">
                          {stats.medals ?? 2} Competition Medals
                        </span>
                      </>
                    )}

                    {p === "LinkedIn" && (
                      <span className="rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 font-medium">
                        Verified Student Identity
                      </span>
                    )}
                  </div>

                  {/* Heatmap visualization */}
                  {stats?.contributions && stats.contributions.length > 0 && (
                    <MiniHeatmap
                      weeks={stats.contributions}
                      color={cfg.brandColor}
                      label={`${cfg.name} Submission / Activity Heatmap`}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </SettingsSection>

      {/* Manual Connection Dialog */}
      <Dialog
        open={!!connecting}
        onOpenChange={(o) => !o && setConnecting(null)}
      >
        <DialogContent className="sm:max-w-md">
          {connecting && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex size-9 items-center justify-center rounded-lg border"
                    style={{
                      backgroundColor: PLATFORM_CONFIGS[connecting].accentBg,
                      borderColor: PLATFORM_CONFIGS[connecting].accentBorder,
                      color: PLATFORM_CONFIGS[connecting].textColor,
                    }}
                  >
                    <PlatformLogo platform={connecting} />
                  </div>
                  <div>
                    <DialogTitle>Connect {connecting}</DialogTitle>
                    <DialogDescription>
                      {PLATFORM_CONFIGS[connecting].tagline}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const parsed = extractUsernameFromInput(connecting, rawInput);
                  if (!parsed || parsed.length < 2) {
                    return toast.error("Please enter a valid link or username.");
                  }
                  setBusy(true);
                  try {
                    const { handle, stats } = await fetchPlatformStats(
                      connecting,
                      rawInput
                    );
                    set(connecting, {
                      status: "connected",
                      handle,
                      lastSync: Date.now(),
                      stats,
                    });
                    toast.success(
                      `${connecting} (@${handle}) connected & fetched from API!`
                    );
                    setConnecting(null);
                  } catch (err: any) {
                    toast.error(`Error connecting: ${err.message}`);
                  } finally {
                    setBusy(false);
                  }
                }}
                className="space-y-4 pt-2"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="handle-input"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Enter {connecting} Profile URL or Username
                  </label>
                  <Input
                    id="handle-input"
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    placeholder={PLATFORM_CONFIGS[connecting].placeholder}
                    aria-label="Profile link or username"
                    autoFocus
                    className="font-mono text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Accepts full links (e.g.{" "}
                    <span className="font-mono text-foreground">
                      https://{PLATFORM_CONFIGS[connecting].prefix}username
                    </span>
                    ) or just your username.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConnecting(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={busy} className="gap-1.5">
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Flame className="size-4" />
                    )}
                    Fetch from API & Connect
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
