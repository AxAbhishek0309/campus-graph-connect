import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Camera, Check, Loader2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { BRANCHES, COLLEGES, INTERESTS, LOOKING_FOR, PLATFORMS, SKILLS } from "@/lib/data";
import { useStoreHydrated } from "@/lib/hydration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chip, Logo, UserAvatar } from "@/components/cg/primitives";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your profile — CampusGraph" },
      { name: "description", content: "Tell CampusGraph about your skills, interests and what you're looking for." },
      { property: "og:title", content: "Set up your profile — CampusGraph" },
      { property: "og:description", content: "Five quick steps to find your people." },
    ],
  }),
  component: Onboarding,
});

const STEPS = ["Profile", "Skills", "Interests", "Looking for", "Platforms"];

function toggle<T>(arr: T[], v: T) {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function Onboarding() {
  const hydrated = useStoreHydrated();
  const me = useApp((s) => s.me);
  const update = useApp((s) => s.updateMe);
  const step = useApp((s) => s.onboarding.step);
  const setOnboarding = useApp((s) => s.setOnboarding);
  const integrations = useApp((s) => s.integrations);
  const setIntegration = useApp((s) => s.setIntegration);
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState<string | null>(null);

  const go = (n: number) => setOnboarding({ step: Math.max(0, Math.min(STEPS.length - 1, n)) });
  const finish = () => {
    setOnboarding({ done: true, step: 0 });
    toast.success("Profile saved. Welcome to CampusGraph.");
    navigate({ to: "/home" });
  };

  if (!hydrated) return <div className="min-h-screen" />;

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Logo />
        <Button variant="ghost" size="sm" onClick={() => { toast("Progress saved. Finish any time."); navigate({ to: "/home" }); }}>Save & exit</Button>
      </header>
      <div className="mx-auto max-w-3xl px-6 pb-20">
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm tabular-nums">{String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}</span>
          <div className="flex flex-1 gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={5}>
            {STEPS.map((s, i) => <span key={s} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", i <= step ? "bg-foreground" : "bg-border")} />)}
          </div>
        </div>

        <div key={step} className="mt-12 animate-rise">
          {step === 0 && (
            <>
              <h1 className="text-4xl font-semibold tracking-[-0.035em]">Let's start with you.</h1>
              <p className="mt-2 text-muted-foreground">This is how other students will see you.</p>
              <div className="mt-10 flex items-center gap-5">
                <div className="relative">
                  <UserAvatar name={me.name || "You"} hue={me.hue} size={80} />
                  <button className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full border bg-card shadow-sm" aria-label="Change avatar color" onClick={() => update({ hue: (me.hue + 47) % 360 })}>
                    <Camera className="size-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">Tap the camera to change your avatar colour.<br />Photo uploads come with your account settings.</p>
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="n">Name</Label><Input id="n" value={me.name} onChange={(e) => update({ name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>College</Label>
                  <Select value={me.college} onValueChange={(v) => update({ college: v })}><SelectTrigger aria-label="College"><SelectValue /></SelectTrigger><SelectContent>{COLLEGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-1.5"><Label>Degree</Label>
                  <Select value={me.degree} onValueChange={(v) => update({ degree: v })}><SelectTrigger aria-label="Degree"><SelectValue /></SelectTrigger><SelectContent>{["B.Tech", "B.E.", "B.Sc", "M.Tech", "MCA", "BBA"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-1.5"><Label>Branch</Label>
                  <Select value={me.branch} onValueChange={(v) => update({ branch: v })}><SelectTrigger aria-label="Branch"><SelectValue /></SelectTrigger><SelectContent>{BRANCHES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-1.5"><Label>Year</Label>
                  <Select value={String(me.year)} onValueChange={(v) => update({ year: Number(v) })}><SelectTrigger aria-label="Year"><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4, 5].map((c) => <SelectItem key={c} value={String(c)}>Year {c}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="bio">Bio</Label><Textarea id="bio" rows={4} maxLength={400} value={me.bio} onChange={(e) => update({ bio: e.target.value })} placeholder="What are you working on? What do you want to build?" /><p className="text-right text-xs text-muted-foreground">{me.bio.length}/400</p></div>
              </div>
            </>
          )}
          {step === 1 && (
            <Picker title="What are you good at?" sub="Pick a few. You can always change these later." options={SKILLS} value={me.skills} onChange={(v) => update({ skills: v })} />
          )}
          {step === 2 && (
            <Picker title="What are you into?" sub="We'll use these to suggest people and events." options={INTERESTS} value={me.interests} onChange={(v) => update({ interests: v })} />
          )}
          {step === 3 && (
            <>
              <h1 className="text-4xl font-semibold tracking-[-0.035em]">I'm looking for…</h1>
              <p className="mt-2 text-muted-foreground">Choose everything that applies.</p>
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {LOOKING_FOR.map((l) => {
                  const on = me.lookingFor.includes(l);
                  return (
                    <button key={l} onClick={() => update({ lookingFor: toggle(me.lookingFor, l) })} aria-pressed={on}
                      className={cn("flex items-center justify-between rounded-xl border p-4 text-left transition-all active:scale-[0.99]", on ? "border-foreground bg-card shadow-sm" : "bg-card hover:border-foreground/30")}>
                      <span className="font-medium">{l}</span>
                      <span className={cn("flex size-5 items-center justify-center rounded-full border", on && "border-foreground bg-foreground text-background")}>{on && <Check className="size-3" />}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <h1 className="text-4xl font-semibold tracking-[-0.035em]">Connect your platforms.</h1>
              <p className="mt-2 text-muted-foreground">Optional. Your real activity helps others know what you work on.</p>
              <div className="mt-10 divide-y rounded-xl border bg-card">
                {PLATFORMS.map((p) => {
                  const st = integrations[p as Platform];
                  return (
                    <div key={p} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{p}</p>
                        <p className="text-sm text-muted-foreground">{st.status === "connected" ? `Connected as ${st.handle}` : "Not connected"}</p>
                      </div>
                      <Button size="sm" variant={st.status === "connected" ? "outline" : "default"} disabled={connecting === p}
                        onClick={() => {
                          if (st.status === "connected") return setIntegration(p as Platform, { status: "disconnected" });
                          setConnecting(p);
                          setTimeout(() => { setIntegration(p as Platform, { status: "connected", handle: me.name.split(" ")[0].toLowerCase(), lastSync: Date.now() }); setConnecting(null); toast.success(`${p} connected.`); }, 900);
                        }}>
                        {connecting === p ? <Loader2 className="size-4 animate-spin" /> : st.status === "connected" ? <><Check className="size-4" /> Connected</> : "Connect"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="mt-12 flex items-center justify-between border-t pt-6">
          <Button variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}><ArrowLeft className="size-4" /> Back</Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => (step === STEPS.length - 1 ? finish() : go(step + 1))}>Skip</Button>
            {step === STEPS.length - 1 ? <Button onClick={finish}>Finish</Button> : <Button onClick={() => { if (step === 0 && me.name.trim().length < 2) return toast.error("Add your name to continue."); go(step + 1); }}>Continue</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Picker({ title, sub, options, value, onChange }: { title: string; sub: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const [custom, setCustom] = useState("");
  const all = [...new Set([...options, ...value])];
  return (
    <>
      <h1 className="text-4xl font-semibold tracking-[-0.035em]">{title}</h1>
      <p className="mt-2 text-muted-foreground">{sub} <span className="text-foreground">{value.length} selected.</span></p>
      <div className="mt-10 flex flex-wrap gap-2">
        {all.map((o) => <Chip key={o} active={value.includes(o)} onClick={() => onChange(toggle(value, o))}>{value.includes(o) && <Check className="size-3.5" />}{o}</Chip>)}
      </div>
      <form className="mt-6 flex max-w-sm gap-2" onSubmit={(e) => { e.preventDefault(); const v = custom.trim().slice(0, 30); if (v && !value.includes(v)) onChange([...value, v]); setCustom(""); }}>
        <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Add your own" aria-label="Add custom" />
        <Button variant="outline" type="submit">Add</Button>
      </form>
    </>
  );
}
