import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { PageHeader } from "@/components/cg/primitives";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Tribe" },
      { name: "description", content: "Account, privacy, notification and integration settings." },
      { property: "og:title", content: "Settings — Tribe" },
      { property: "og:description", content: "Manage your Tribe account." },
    ],
  }),
  component: SettingsLayout,
});

const NAV = [["/settings/account", "Account"], ["/settings/privacy", "Privacy"], ["/settings/notifications", "Notifications"], ["/settings/integrations", "Integrations"]] as const;

function SettingsLayout() {
  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-8 md:grid-cols-[180px_1fr]">
        <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Settings">
          {NAV.map(([to, l]) => (
            <Link key={to} to={to} className="shrink-0 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-accent font-medium text-foreground" }}>{l}</Link>
          ))}
        </nav>
        <div className="min-w-0"><Outlet /></div>
      </div>
    </>
  );
}
