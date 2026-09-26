import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { SettingsSection, ToggleRow } from "@/components/cg/settings-ui";

export const Route = createFileRoute("/_shell/settings/notifications")({
  head: () => ({
    meta: [
      { title: "Notification settings — Tribe" },
      { name: "description", content: "Choose which updates you want to hear about." },
      { property: "og:title", content: "Notification settings — Tribe" },
      { property: "og:description", content: "Pick your notifications." },
    ],
  }),
  component: NotifSettings,
});

function NotifSettings() {
  const n = useApp((s) => s.notifPrefs);
  const set = useApp((s) => s.setNotifPrefs);
  const rows: [keyof typeof n, string, string][] = [
    ["messages", "Messages", "When someone sends you a message."],
    ["connections", "Connections", "Requests and accepted connections."],
    ["projects", "Projects", "Join requests and updates on your projects."],
    ["events", "Events", "Reminders for events you registered for."],
    ["recommendations", "Suggestions", "People and projects we think you'd like."],
  ];
  return (
    <SettingsSection title="Notify me about" description="Changes save automatically.">
      {rows.map(([k, l, d]) => <ToggleRow key={k} id={`n-${k}`} label={l} description={d} checked={n[k]} onChange={(v) => { set({ [k]: v }); toast("Notification settings saved.", { duration: 1200 }); }} />)}
    </SettingsSection>
  );
}
