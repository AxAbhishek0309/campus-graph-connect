import { Link, useNavigate, useRouterState, type LinkProps } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell, Bookmark, Briefcase, Calendar, ChevronDown, Code2, FlaskConical, FolderGit2, GraduationCap, Heart, Home,
  LogOut, MapPin, Menu, MessageSquare, Search, Settings, Swords, User, UserCog, Users, UsersRound, BookOpen, Link2,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useStoreHydrated } from "@/lib/hydration";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CommandSearch } from "./command-search";
import { Logo, UserAvatar } from "./primitives";

type NavItem = { to: NonNullable<LinkProps["to"]>; label: string; icon: typeof Home; badge?: "messages" | "notifications" };

const MAIN: NavItem[] = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/people", label: "People", icon: Users },
  { to: "/projects", label: "Projects", icon: FolderGit2 },
  { to: "/teams", label: "Teams", icon: UsersRound },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/messages", label: "Messages", icon: MessageSquare, badge: "messages" },
  { to: "/connections", label: "Connections", icon: Link2 },
  { to: "/saved", label: "Saved", icon: Bookmark },
];
const DISCOVER: NavItem[] = [
  { to: "/coding-partners", label: "Coding Partners", icon: Code2 },
  { to: "/hackathon-teams", label: "Hackathon Teams", icon: Swords },
  { to: "/research-partners", label: "Research Partners", icon: FlaskConical },
  { to: "/study-partners", label: "Study Partners", icon: BookOpen },
  { to: "/mentors", label: "Mentors", icon: GraduationCap },
  { to: "/career-peers", label: "Career Peers", icon: Briefcase },
  { to: "/friends", label: "Friends", icon: Heart },
];
const BOTTOM: NavItem[] = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

const MY_COLLEGE = "Manipal University Jaipur";
const OTHER_COLLEGES = [
  "IIT Delhi",
  "IIT Bombay",
  "BITS Pilani",
  "NIT Trichy",
  "IIT Madras",
  "VIT Vellore",
  "Jadavpur University",
  "IIIT Hyderabad",
  "DTU Delhi",
  "SRM Chennai",
];

function CollegeSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex w-full items-center gap-2 rounded-lg border bg-card/60 px-2.5 py-2 text-left text-xs hover:bg-accent/60 transition-colors"
          aria-label="Switch campus"
        >
          <MapPin className="size-3.5 shrink-0 text-brand" />
          <span className="flex-1 truncate font-medium text-foreground">{MY_COLLEGE}</span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-1.5 text-[11px]">
          <GraduationCap className="size-3.5" /> Your Campus
        </DropdownMenuLabel>
        <DropdownMenuItem className="gap-2 font-medium text-brand focus:text-brand">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-brand-foreground">✓</span>
          {MY_COLLEGE}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          🚀 Coming soon to these communities
        </DropdownMenuLabel>
        {OTHER_COLLEGES.map((college) => (
          <DropdownMenuItem
            key={college}
            disabled
            className="flex items-center justify-between gap-2 opacity-60 cursor-not-allowed"
          >
            <span className="truncate text-xs">{college}</span>
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
              soon
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function useCounts() {
  const messages = useApp((s) => s.conversations.reduce((a, c) => a + (c.unread > 0 ? 1 : 0), 0));
  const notifications = useApp((s) => s.notifications.filter((n) => !n.read).length);
  return { messages, notifications };
}

function NavLinkItem({ item, onClick }: { item: NavItem; onClick?: (() => void) | undefined }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const counts = useCounts();
  const active = path === item.to || path.startsWith(item.to + "/");
  const count = item.badge ? counts[item.badge] : 0;
  return (
    <Link
      to={item.to}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
        active ? "bg-sidebar-accent font-medium text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
      )}
    >
      <item.icon className={cn("size-4", active && "text-foreground")} strokeWidth={active ? 2.2 : 1.8} />
      <span className="flex-1">{item.label}</span>
      {count > 0 && <span className="rounded bg-brand px-1.5 text-[11px] font-medium text-brand-foreground tabular-nums">{count}</span>}
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-5 pb-6">
        <Link to="/home" onClick={onNavigate} aria-label="Tribe home"><Logo /></Link>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-2.5" aria-label="Main">
        <div className="space-y-0.5">{MAIN.map((i) => <NavLinkItem key={i.to} item={i} onClick={onNavigate} />)}</div>
        <div>
          <p className="mb-1.5 px-2.5 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">DISCOVER</p>
          <div className="space-y-0.5">{DISCOVER.map((i) => <NavLinkItem key={i.to} item={i} onClick={onNavigate} />)}</div>
        </div>
        <div>
          <p className="mb-1.5 px-2.5 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">CAMPUS</p>
          <CollegeSwitcher />
        </div>
      </nav>
      <div className="space-y-0.5 border-t px-2.5 py-3">{BOTTOM.map((i) => <NavLinkItem key={i.to} item={i} onClick={onNavigate} />)}</div>
    </div>
  );
}

function RealtimeSimulator() {
  const hydrated = useStoreHydrated();
  useEffect(() => {
    if (!hydrated) return;
    const lines = ["Are you free to catch up this week?", "Just saw your project, looks great!", "Sending you the doc now.", "Can you share the repo link?"];
    let i = 0;
    const t = setInterval(() => {
      const s = useApp.getState();
      if (!s.notifPrefs.recommendations && i % 2 === 1) { i++; return; }
      const c = s.conversations[(i * 3 + 5) % s.conversations.length];
      const person = s.students.find((x) => x.id === c.participantId);
      if (!person) return;
      s.receiveMessage(c.id, lines[i % lines.length]);
      useApp.setState((st) => ({ conversations: st.conversations.map((x) => (x.id === c.id ? { ...x, unread: x.unread + 1 } : x)) }));
      if (s.notifPrefs.messages) s.pushNotification({ type: "message", text: `${person.name} sent you a message`, actorId: person.id, href: `/messages/${c.id}` });
      i++;
    }, 90000);
    return () => clearInterval(t);
  }, [hydrated]);
  return null;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const hydrated = useStoreHydrated();
  const me = useApp((s) => s.me);
  const loggedIn = useApp((s) => s.auth.loggedIn);
  const logout = useApp((s) => s.logout);
  const counts = useCounts();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const isPublicRoute = path.startsWith("/events") || path.startsWith("/projects") || path.startsWith("/people");

  useEffect(() => {
    if (hydrated && !loggedIn && !isPublicRoute) navigate({ to: "/login" });
  }, [hydrated, loggedIn, navigate, isPublicRoute]);

  const mobileNav: NavItem[] = [MAIN[0], MAIN[1], MAIN[2], MAIN[5], BOTTOM[0]];

  return (
    <div className="min-h-screen bg-background">
      <RealtimeSimulator />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <Button variant="ghost" size="icon" className="size-9 lg:hidden" onClick={() => setDrawer(true)} aria-label="Open navigation">
            <Menu className="size-5" />
          </Button>
          <Link to="/home" className="lg:hidden" aria-label="Home"><Logo withText={false} /></Link>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 max-w-md flex-1 items-center gap-2 rounded-lg border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/20"
            aria-label="Search (Command K)"
          >
            <Search className="size-4" />
            <span className="flex-1 truncate text-left">Search people, projects, events…</span>
            <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline">⌘K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-1">
            {loggedIn ? (
              <>
                <Button variant="ghost" size="icon" className="relative size-9" asChild>
                  <Link to="/notifications" aria-label={`Notifications, ${counts.notifications} unread`}>
                    <Bell className="size-[18px]" />
                    {hydrated && counts.notifications > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-medium text-brand-foreground">
                        {counts.notifications > 9 ? "9+" : counts.notifications}
                      </span>
                    )}
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-full" aria-label="Profile menu">
                    <UserAvatar name={me.name} hue={me.hue} size={32} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <p className="font-medium">{me.name}</p>
                      <p className="truncate text-xs font-normal text-muted-foreground">{me.college}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => navigate({ to: "/profile" })}><User className="size-4" /> View profile</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => navigate({ to: "/profile/edit" })}><UserCog className="size-4" /> Edit profile</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}><Settings className="size-4" /> Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={async () => { try { await signOut(auth); } finally { navigate({ to: "/login" }); } }}><LogOut className="size-4" /> Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Join Tribe</Link>
                </Button>
              </div>
            )}
          </div>
        </header>

        <main key={path} className="mx-auto w-full max-w-6xl animate-rise px-4 pt-8 pb-28 sm:px-6 lg:px-10 lg:pb-16">
          {hydrated ? children : <ShellSkeleton />}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Mobile">
        {mobileNav.map((i) => {
          const active = path === i.to || path.startsWith(i.to + "/");
          return (
            <Link key={i.to} to={i.to} className={cn("relative flex flex-col items-center gap-0.5 py-2.5 text-[11px]", active ? "text-foreground" : "text-muted-foreground")}>
              <i.icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
              {i.label}
              {i.badge && hydrated && counts.messages > 0 && <span className="absolute top-1.5 right-[30%] size-2 rounded-full bg-brand" />}
            </Link>
          );
        })}
      </nav>

      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setDrawer(false)} />
        </SheetContent>
      </Sheet>
      <CommandSearch open={searchOpen} setOpen={setSearchOpen} />
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="h-9 w-72 rounded-md bg-muted" />
      <div className="h-4 w-96 max-w-full rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-52 rounded-xl border bg-card" />)}
      </div>
    </div>
  );
}
