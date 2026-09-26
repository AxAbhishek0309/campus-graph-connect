import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { AuthLayout, GoogleIcon } from "@/components/cg/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Tribe" },
      { name: "description", content: "Sign in to Tribe to find people, projects and events on your campus." },
      { property: "og:title", content: "Sign in — Tribe" },
      { property: "og:description", content: "Sign in to your student network." },
    ],
  }),
  component: Login,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

function friendlyAuthError(code: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "That email and password don't match. Try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed. Please try again.";
    case "auth/cancelled-popup-request":
      return "";
    default:
      return "Sign-in failed. Please try again.";
  }
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [forgot, setForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Email + password sign-in
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse({ email, password });
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setServerError("");
    setStatus("loading");
    try {
      await signInWithEmailAndPassword(auth, r.data.email, r.data.password);
      setStatus("success");
      // AuthProvider's onAuthStateChanged will call store.login() automatically
      setTimeout(() => navigate({ to: "/home" }), 500);
    } catch (err: any) {
      const msg = friendlyAuthError(err.code);
      if (msg) setServerError(msg);
      setStatus("error");
    }
  };

  // Google sign-in
  const signInWithGoogle = async () => {
    setStatus("loading");
    setServerError("");
    try {
      await signInWithPopup(auth, googleProvider);
      setStatus("success");
      setTimeout(() => navigate({ to: "/home" }), 500);
    } catch (err: any) {
      const msg = friendlyAuthError(err.code);
      if (msg) setServerError(msg);
      setStatus("idle");
    }
  };

  // Password reset
  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!z.string().email().safeParse(resetEmail).success) {
      toast.error("Enter a valid email address.");
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      toast.success("Reset email sent — check your inbox.");
    } catch (err: any) {
      toast.error(friendlyAuthError(err.code) || "Failed to send reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to see who's around.</p>

      <Button
        variant="outline"
        className="mt-8 w-full"
        disabled={status === "loading"}
        onClick={signInWithGoogle}
      >
        {status === "loading" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setServerError(""); }}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => { setForgot(true); setResetEmail(email); }}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setServerError(""); }}
              aria-invalid={!!errors.password}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>
        {serverError && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={status === "loading" || status === "success"}>
          {status === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : status === "success" ? (
            <><Check className="size-4" /> Signed in</>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
        <p>
          New here? <Link to="/signup" className="font-medium text-foreground hover:underline">Create account</Link>
        </p>
        <p className="text-xs">
          Looking for hackathons & competitions?{" "}
          <Link to="/events" className="font-medium text-primary hover:underline">
            Explore live events without signing in →
          </Link>
        </p>
      </div>

      {/* Password reset dialog */}
      <Dialog open={forgot} onOpenChange={(o) => { setForgot(o); if (!o) { setResetSent(false); setResetLoading(false); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              {resetSent ? `We sent a reset link to ${resetEmail}.` : "We'll email you a link to set a new password."}
            </DialogDescription>
          </DialogHeader>
          {!resetSent ? (
            <form onSubmit={sendReset} className="space-y-3">
              <Input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                aria-label="Email for password reset"
                placeholder="your@email.com"
              />
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading ? <Loader2 className="size-4 animate-spin" /> : "Send reset link"}
              </Button>
            </form>
          ) : (
            <Button onClick={() => setForgot(false)}>Done</Button>
          )}
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
}
