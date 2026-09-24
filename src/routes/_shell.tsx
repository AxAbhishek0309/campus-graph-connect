import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/cg/app-shell";

export const Route = createFileRoute("/_shell")({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
