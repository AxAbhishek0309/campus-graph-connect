import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { BadgeCheck, Bookmark, BookmarkCheck, Check, Clock, Copy, Share2, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/helpers";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 28 28" className="size-7" aria-hidden>
        <rect width="28" height="28" rx="7" className="fill-foreground" />
        <circle cx="9" cy="9" r="2.6" className="fill-background" />
        <circle cx="19" cy="9" r="2.6" className="fill-background" />
        <circle cx="14" cy="19" r="2.6" className="fill-brand" />
        <path d="M9 9 L19 9 M9 9 L14 19 M19 9 L14 19" className="stroke-background" strokeWidth="1.4" fill="none" opacity="0.7" />
      </svg>
      {withText && <span className="text-[15px] font-semibold tracking-tight">CampusGraph</span>}
    </span>
  );
}

export function UserAvatar({
  name,
  hue,
  size = 40,
  className,
  online,
}: {
  name: string;
  hue: number;
  size?: number;
  className?: string;
  online?: boolean;
}) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)} style={{ width: size, height: size }}>
      <span
        className="inline-flex size-full items-center justify-center rounded-full font-medium tracking-tight"
        style={{
          background: `oklch(0.93 0.045 ${hue})`,
          color: `oklch(0.35 0.09 ${hue})`,
          fontSize: size * 0.36,
        }}
        aria-hidden
      >
        {initials(name)}
      </span>
      {online && (
        <span className="absolute right-0 bottom-0 size-[28%] min-h-2 min-w-2 rounded-full border-2 border-card bg-success" aria-label="Online" />
      )}
    </span>
  );
}

export function Verified({ className }: { className?: string }) {
  return <BadgeCheck className={cn("size-4 text-brand", className)} aria-label="Verified student" />;
}

export function Tag({ children, tone = "default", className }: { children: ReactNode; tone?: "default" | "brand" | "success" | "warning" | "violet"; className?: string }) {
  const tones = {
    default: "bg-secondary text-secondary-foreground",
    brand: "bg-brand-soft text-brand",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-[oklch(0.5_0.13_60)]",
    violet: "bg-violet-soft text-violet",
  };
  return <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", tones[tone], className)}>{children}</span>;
}

export function SaveButton({ kind, id, label, size = "sm", variant = "ghost" }: { kind: "people" | "projects" | "teams" | "events"; id: string; label?: boolean; size?: "sm" | "icon" | "default"; variant?: "ghost" | "outline" }) {
  const saved = useApp((s) => s.saved[kind].includes(id));
  const toggle = useApp((s) => s.toggleSave);
  return (
    <Button
      type="button"
      variant={variant}
      size={label ? size : "icon"}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const now = toggle(kind, id);
        toast(now ? "Saved to your network." : "Removed from saved.");
      }}
      className={cn(!label && "size-8", saved && "text-brand")}
    >
      {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
      {label && (saved ? "Saved" : "Save")}
    </Button>
  );
}

export function ConnectButton({ id, size = "sm", className }: { id: string; size?: "sm" | "default"; className?: string }) {
  const state = useApp((s) => s.connections[id]);
  const connect = useApp((s) => s.connect);
  const accept = useApp((s) => s.accept);
  const remove = useApp((s) => s.removeConnection);
  if (state === "connected")
    return (
      <Button size={size} variant="outline" className={className} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} aria-label="Connected">
        <Check className="size-4" /> Connected
      </Button>
    );
  if (state === "sent")
    return (
      <Button
        size={size}
        variant="outline"
        className={cn("text-muted-foreground", className)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          remove(id);
          toast("Connection request withdrawn.");
        }}
        title="Click to withdraw"
      >
        <Clock className="size-4" /> Pending
      </Button>
    );
  if (state === "received")
    return (
      <Button
        size={size}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          accept(id);
          toast.success("You're now connected.");
        }}
      >
        <Check className="size-4" /> Accept
      </Button>
    );
  return (
    <Button
      size={size}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        connect(id);
        toast("Connection request sent.");
      }}
    >
      <UserPlus className="size-4" /> Connect
    </Button>
  );
}

export function ShareButton({ path, title, label = false, variant = "ghost" }: { path: string; title: string; label?: boolean; variant?: "ghost" | "outline" }) {
  const [open, setOpen] = useState(false);
  const url = typeof window !== "undefined" ? window.location.origin + path : path;
  return (
    <>
      <Button variant={variant} size={label ? "sm" : "icon"} className={cn(!label && "size-8")} onClick={() => setOpen(true)} aria-label="Share">
        <Share2 className="size-4" />
        {label && "Share"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share {title}</DialogTitle>
            <DialogDescription>Anyone with a CampusGraph account can open this link.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input readOnly value={url} aria-label="Link" onFocus={(e) => e.target.select()} />
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  toast.success("Link copied to clipboard.");
                } catch {
                  toast.error("Couldn't copy — select the link and copy manually.");
                }
              }}
            >
              <Copy className="size-4" /> Copy
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {[
              ["WhatsApp", `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`],
              ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`],
              ["Email", `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`],
            ].map(([n, h]) => (
              <a key={n} href={h} target="_blank" rel="noreferrer" className="rounded-md border px-3 py-2 text-center hover:bg-accent">
                {n}
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: string; actions?: ReactNode; eyebrow?: string }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Chip({ active, onClick, children, removable }: { active?: boolean; onClick?: () => void; children: ReactNode; removable?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition-all active:scale-[0.97]",
        active ? "border-foreground bg-foreground text-background" : "bg-card hover:border-foreground/30",
      )}
    >
      {children}
      {removable && active && <X className="size-3" />}
    </button>
  );
}

export function PersonLink({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  if (id === "me") return <Link to="/profile" className={className}>{children}</Link>;
  return (
    <Link to="/people/$id" params={{ id }} className={className}>
      {children}
    </Link>
  );
}

export function AvatarStack({ ids, max = 4, size = 26 }: { ids: string[]; max?: number; size?: number }) {
  const people = useApp((s) => ids.map((id) => (id === "me" ? s.me : s.students.find((x) => x.id === id))).filter(Boolean));
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {people.slice(0, max).map((p) => (
          <UserAvatar key={p!.id} name={p!.name} hue={p!.hue} size={size} className="rounded-full ring-2 ring-card" />
        ))}
      </div>
      {people.length > max && <span className="ml-2 text-xs text-muted-foreground">+{people.length - max}</span>}
    </div>
  );
}
