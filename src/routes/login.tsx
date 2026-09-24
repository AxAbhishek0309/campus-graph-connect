import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import { useApp } from "@/lib/store";
import { useStoreHydrated } from "@/lib/hydration";
import { AuthLayout, GoogleIcon } from "@/components/cg/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — CampusGraph" },
      { name: "description", content: "Sign in to CampusGraph to find people, projects and events on your campus." },
      { property: "og:title", content: "Sign in — CampusGraph" },
      { property: "og:description", content: "Sign in to your student network." },
    ],
  }),
  component: Login,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

function Login() {
  useStoreHydrated();
  const login = useApp((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("aditi.tiwari@gmail.com");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [forgot, setForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse({ email, password });
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setStatus("loading");
    setTimeout(() => {
      if (password === "wrongpass") {
        setStatus("error");
        return;
      }
      setStatus("success");
      login(r.data.email);
      setTimeout(() => navigate({ to: "/home" }), 500);
    }, 900);
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to see who's around.</p>

      <Button variant="outline" className="mt-8 w-full" onClick={() => { setStatus("loading"); setTimeout(() => { login("aditi.tiwari@gmail.com"); navigate({ to: "/home" }); }, 700); }}>
        <GoogleIcon /> Continue with Google
      </Button>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setForgot(true)}>Forgot password?</button>
          </div>
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} className="pr-10" />
            <button type="button" onClick={() => setShow(!show)} className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>
        {status === "error" && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">That email and password don't match. Try again.</p>}
        <Button type="submit" className="w-full" disabled={status === "loading" || status === "success"}>
          {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : status === "success" ? <><Check className="size-4" /> Signed in</> : "Sign In"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here? <Link to="/signup" className="font-medium text-foreground hover:underline">Create account</Link>
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">Demo: any password with 6+ characters works.</p>

      <Dialog open={forgot} onOpenChange={(o) => { setForgot(o); if (!o) setResetSent(false); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>{resetSent ? `We sent a reset link to ${email}.` : "We'll email you a link to set a new password."}</DialogDescription>
          </DialogHeader>
          {!resetSent ? (
            <form onSubmit={(e) => { e.preventDefault(); if (!z.string().email().safeParse(email).success) return toast.error("Enter a valid email first."); setResetSent(true); }} className="space-y-3">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
              <Button type="submit" className="w-full">Send reset link</Button>
            </form>
          ) : (
            <Button onClick={() => setForgot(false)}>Done</Button>
          )}
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
}
