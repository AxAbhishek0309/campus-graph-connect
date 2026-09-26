import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useApp } from "@/lib/store";
import { COLLEGES } from "@/lib/data";
import { AuthLayout, GoogleIcon } from "@/components/cg/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — Tribe" },
      { name: "description", content: "Join Tribe with your college and start finding collaborators." },
      { property: "og:title", content: "Join Tribe" },
      { property: "og:description", content: "Create a student account in two minutes." },
    ],
  }),
  component: Signup,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(128),
  college: z.string().min(1, "Choose your college"),
});

function friendlyAuthError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 8 characters.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-up popup was closed. Please try again.";
    case "auth/cancelled-popup-request":
      return "";
    default:
      return "Sign-up failed. Please try again.";
  }
}

function Signup() {
  const storeSignup = useApp((s) => s.signup);
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", college: "" });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const strength = Math.min(
    4,
    [
      f.password.length >= 8,
      /[A-Z]/.test(f.password),
      /\d/.test(f.password),
      /[^A-Za-z0-9]/.test(f.password),
    ].filter(Boolean).length
  );

  // Email + password sign-up
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setServerError("");
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, r.data.email, r.data.password);
      // Set display name in Firebase
      await updateProfile(user, { displayName: r.data.name });
      // Seed the Zustand store with name + college (auth state will sync the login)
      storeSignup(r.data.name, r.data.email, r.data.college);
      navigate({ to: "/verify-college" });
    } catch (err: any) {
      const msg = friendlyAuthError(err.code);
      if (msg) setServerError(msg);
      setLoading(false);
    }
  };

  // Google sign-up (also works for sign-in — Firebase handles both)
  const signUpWithGoogle = async () => {
    setLoading(true);
    setServerError("");
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      // Pull name from Google profile, college defaults to the campus
      storeSignup(user.displayName ?? "Student", user.email ?? "", "Manipal University Jaipur");
      navigate({ to: "/verify-college" });
    } catch (err: any) {
      const msg = friendlyAuthError(err.code);
      if (msg) setServerError(msg);
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">You'll verify your college email next.</p>

      <Button
        variant="outline"
        className="mt-8 w-full"
        disabled={loading}
        onClick={signUpWithGoogle}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        {(["name", "email"] as const).map((k) => (
          <div key={k} className="space-y-1.5">
            <Label htmlFor={k}>{k === "name" ? "Full name" : "Email"}</Label>
            <Input
              id={k}
              type={k === "email" ? "email" : "text"}
              value={f[k]}
              onChange={(e) => { setF({ ...f, [k]: e.target.value }); setServerError(""); }}
              aria-invalid={!!errors[k]}
              autoComplete={k}
            />
            {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
          </div>
        ))}
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
              className="pr-10"
              aria-invalid={!!errors.password}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <div className="flex gap-1" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full ${i < strength ? (strength >= 3 ? "bg-success" : "bg-warning") : "bg-border"}`}
              />
            ))}
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>College</Label>
          <Select value={f.college} onValueChange={(v) => setF({ ...f, college: v })}>
            <SelectTrigger aria-invalid={!!errors.college} aria-label="College">
              <SelectValue placeholder="Select your college" />
            </SelectTrigger>
            <SelectContent>
              {COLLEGES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.college && <p className="text-xs text-destructive">{errors.college}</p>}
        </div>
        {serverError && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Create Account"}
        </Button>
      </form>
      <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
        <p>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
        </p>
        <p className="text-xs">
          Looking for hackathons & competitions?{" "}
          <Link to="/events" className="font-medium text-primary hover:underline">
            Explore live events without signing in →
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
