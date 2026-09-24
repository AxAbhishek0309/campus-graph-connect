import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Check, Loader2, Mail } from "lucide-react";
import { z } from "zod";
import { useApp } from "@/lib/store";
import { useStoreHydrated } from "@/lib/hydration";
import { AuthLayout } from "@/components/cg/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export const Route = createFileRoute("/verify-college")({
  head: () => ({
    meta: [
      { title: "Verify your college — CampusGraph" },
      { name: "description", content: "Verify your college email to join your campus network." },
      { property: "og:title", content: "Verify your college — CampusGraph" },
      { property: "og:description", content: "Only verified students can join CampusGraph." },
    ],
  }),
  component: Verify,
});

const DEMO_CODE = "246810";

function Verify() {
  useStoreHydrated();
  const verify = useApp((s) => s.verifyCollege);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<"email" | "code" | "done">("email");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    const ok = z.string().email().safeParse(email).success && /\.(edu|ac\.in|edu\.in)$|manipal\.edu$/i.test(email);
    if (!ok) return setError("Use your college email, e.g. name@college.edu");
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStage("code");
      setCooldown(30);
      toast(`Verification code sent to ${email}`, { description: `Demo code: ${DEMO_CODE}` });
    }, 700);
  };

  const check = (value: string) => {
    setCode(value);
    setError("");
    if (value.length < 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (value !== DEMO_CODE) {
        setError("That code isn't right. Check your inbox and try again.");
        return;
      }
      setStage("done");
      verify(email);
      setTimeout(() => navigate({ to: "/onboarding" }), 1100);
    }, 600);
  };

  return (
    <AuthLayout
      aside={
        <div className="max-w-sm space-y-4 text-sm">
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">WHY VERIFY?</p>
          <p className="text-2xl font-medium tracking-tight">Everyone you meet here is a real student.</p>
          <p className="text-muted-foreground">We check your college email once. It's never shown on your profile.</p>
        </div>
      }
    >
      <div className="mb-6 flex size-11 items-center justify-center rounded-xl border bg-card">
        {stage === "done" ? <Check className="size-5 text-success" /> : <Mail className="size-5" />}
      </div>
      {stage === "email" && (
        <>
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Verify your college</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your college email address. We'll send a 6-digit code.</p>
          <form onSubmit={send} className="mt-8 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="cemail">College email</Label>
              <Input id="cemail" type="email" placeholder="name@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <Button className="w-full" disabled={loading}>{loading ? <Loader2 className="size-4 animate-spin" /> : "Send verification code"}</Button>
          </form>
        </>
      )}
      {stage === "code" && (
        <>
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Check your inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">We sent a code to <span className="font-medium text-foreground">{email}</span>.</p>
          <div className="mt-8">
            <InputOTP maxLength={6} value={code} onChange={check} disabled={loading} aria-label="Verification code">
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => <InputOTPSlot key={i} index={i} className="size-12 text-lg" />)}
              </InputOTPGroup>
            </InputOTP>
            {loading && <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Checking…</p>}
            {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
          </div>
          <div className="mt-8 flex items-center justify-between text-sm">
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground" onClick={() => { setStage("email"); setCode(""); }}>
              <ArrowLeft className="size-3.5" /> Change email
            </button>
            <button disabled={cooldown > 0} className="font-medium disabled:text-muted-foreground" onClick={() => send()}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </>
      )}
      {stage === "done" && (
        <>
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">You're verified.</h1>
          <p className="mt-2 text-sm text-muted-foreground">Let's set up your profile.</p>
        </>
      )}
    </AuthLayout>
  );
}
