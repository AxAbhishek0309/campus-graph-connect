import type { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";

export function SettingsSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="mb-8 rounded-xl border bg-card">
      <div className="border-b px-5 py-4"><h2 className="font-medium">{title}</h2>{description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}</div>
      <div className="divide-y">{children}</div>
    </section>
  );
}

export function ToggleRow({ id, label, description, checked, onChange }: { id: string; label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <label htmlFor={id} className="cursor-pointer"><p className="text-sm font-medium">{label}</p>{description && <p className="text-sm text-muted-foreground">{description}</p>}</label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
