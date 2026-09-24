import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { SettingsSection, ToggleRow } from "@/components/cg/settings-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/settings/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy settings — CampusGraph" },
      { name: "description", content: "Control who sees your profile, stats and online status." },
      { property: "og:title", content: "Privacy settings — CampusGraph" },
      { property: "og:description", content: "Control your visibility." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  const p = useApp((s) => s.privacy);
  const set = useApp((s) => s.setPrivacy);
  const change = (patch: Partial<typeof p>) => { set(patch); toast("Privacy settings saved.", { duration: 1200 }); };
  return (
    <>
      <SettingsSection title="Profile visibility" description="Who can see your full profile.">
        <div className="grid gap-2 p-5 sm:grid-cols-3" role="radiogroup">
          {(["Everyone", "Campus only", "Connections"] as const).map((v) => (
            <button key={v} role="radio" aria-checked={p.visibility === v} onClick={() => change({ visibility: v })} className={cn("rounded-lg border p-3 text-left text-sm transition-colors", p.visibility === v ? "border-foreground" : "hover:border-foreground/30")}>
              <p className="font-medium">{v}</p>
              <p className="text-xs text-muted-foreground">{v === "Everyone" ? "All verified students" : v === "Campus only" ? "Students at your college" : "Only people you've connected with"}</p>
            </button>
          ))}
        </div>
      </SettingsSection>
      <SettingsSection title="What others see">
        <ToggleRow id="cs" label="Show coding stats" description="LeetCode, Codeforces and repository counts." checked={p.codingStats} onChange={(v) => change({ codingStats: v })} />
        <ToggleRow id="gh" label="Show GitHub activity" description="Your contribution graph on your profile." checked={p.github} onChange={(v) => change({ github: v })} />
        <ToggleRow id="am" label="Allow messages" description="Let anyone message you, not just connections." checked={p.allowMessages} onChange={(v) => change({ allowMessages: v })} />
        <ToggleRow id="on" label="Show online status" description="Others see a green dot when you're active." checked={p.online} onChange={(v) => change({ online: v })} />
      </SettingsSection>
    </>
  );
}
