import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { useApp } from "@/lib/store";
import { PLATFORMS } from "@/lib/data";
import { timeAgo } from "@/lib/helpers";
import type { Platform } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SettingsSection } from "@/components/cg/settings-ui";

export const Route = createFileRoute("/_shell/settings/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — CampusGraph" },
      { name: "description", content: "Connect GitHub, LeetCode, Codeforces, CodeChef, Kaggle and LinkedIn." },
      { property: "og:title", content: "Integrations — CampusGraph" },
      { property: "og:description", content: "Show your real work on your profile." },
    ],
  }),
  component: Integrations,
});

const DESC: Record<Platform, string> = {
  GitHub: "Repositories and contribution graph",
  LeetCode: "Problems solved",
  Codeforces: "Contest rating",
  CodeChef: "Stars and rating",
  Kaggle: "Competitions and notebooks",
  LinkedIn: "Experience and headline",
};

function Integrations() {
  const integrations = useApp((s) => s.integrations);
  const set = useApp((s) => s.setIntegration);
  const [connecting, setConnecting] = useState<Platform | null>(null);
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);

  const sync = (p: Platform) => {
    const cur = integrations[p];
    set(p, { ...cur, status: "syncing" });
    setTimeout(() => { set(p, { ...cur, status: "connected", lastSync: Date.now() }); toast.success(`${p} synced.`); }, 1400);
  };

  return (
    <>
      <SettingsSection title="Coding platforms" description="Connected accounts appear on your profile. We only read public data.">
        {PLATFORMS.map((p) => {
          const st = integrations[p];
          const on = st.status !== "disconnected";
          return (
            <div key={p} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <span className="flex size-10 items-center justify-center rounded-lg border font-mono text-xs font-semibold">{p.slice(0, 2)}</span>
              <div className="flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">{p} {on && <span className="inline-flex items-center gap-1 text-xs font-normal text-success"><Check className="size-3" /> Connected</span>}</p>
                <p className="text-sm text-muted-foreground">{on ? `@${st.handle} · ${st.status === "syncing" ? "Syncing…" : `Synced ${st.lastSync ? timeAgo(st.lastSync) : "never"}`}` : DESC[p]}</p>
              </div>
              <div className="flex gap-2">
                {on ? (
                  <>
                    <Button size="sm" variant="outline" disabled={st.status === "syncing"} onClick={() => sync(p)}>{st.status === "syncing" ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Sync</Button>
                    <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => { set(p, { status: "disconnected" }); toast(`${p} disconnected.`); }}>Disconnect</Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => { setConnecting(p); setHandle(""); }}>Connect</Button>
                )}
              </div>
            </div>
          );
        })}
      </SettingsSection>

      <Dialog open={!!connecting} onOpenChange={(o) => !o && setConnecting(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Connect {connecting}</DialogTitle><DialogDescription>Enter your public {connecting} username.</DialogDescription></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const h = handle.trim();
            if (!/^[\w.-]{2,39}$/.test(h)) return toast.error("Enter a valid username.");
            setBusy(true);
            setTimeout(() => { set(connecting!, { status: "connected", handle: h, lastSync: Date.now() }); toast.success(`${connecting} connected.`); setBusy(false); setConnecting(null); }, 1000);
          }} className="space-y-3">
            <Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="username" aria-label="Username" autoFocus />
            <Button type="submit" className="w-full" disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : "Connect"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
