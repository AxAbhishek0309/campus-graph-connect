import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SettingsSection } from "@/components/cg/settings-ui";
import { UserAvatar, Verified } from "@/components/cg/primitives";

export const Route = createFileRoute("/_shell/settings/account")({
  head: () => ({
    meta: [
      { title: "Account settings — CampusGraph" },
      { name: "description", content: "Change your email, password and profile basics." },
      { property: "og:title", content: "Account settings — CampusGraph" },
      { property: "og:description", content: "Manage your account." },
    ],
  }),
  component: Account,
});

function Account() {
  const s = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState(s.auth.email);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwErr, setPwErr] = useState("");
  const [reset, setReset] = useState(false);

  return (
    <>
      <SettingsSection title="Profile">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3"><UserAvatar name={s.me.name} hue={s.me.hue} size={44} /><div><p className="flex items-center gap-1 font-medium">{s.me.name} <Verified /></p><p className="text-sm text-muted-foreground">{s.me.college}</p></div></div>
          <Button variant="outline" size="sm" asChild><Link to="/profile/edit">Edit profile</Link></Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Email" description="Used for sign-in and notifications.">
        <form className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-end" onSubmit={(e) => { e.preventDefault(); if (!z.string().email().safeParse(email).success) return toast.error("Enter a valid email."); useApp.setState((st) => ({ auth: { ...st.auth, email } })); toast.success("Email updated."); }}>
          <div className="flex-1 space-y-1.5"><Label htmlFor="em">Email</Label><Input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <Button type="submit" disabled={email === s.auth.email}>Update</Button>
        </form>
        <div className="px-5 py-4 text-sm"><span className="text-muted-foreground">Verified college email: </span>{s.auth.collegeEmail || "Not verified"} {!s.auth.verified && <Link to="/verify-college" className="ml-2 underline">Verify now</Link>}</div>
      </SettingsSection>

      <SettingsSection title="Password">
        <form className="grid gap-3 px-5 py-4 sm:grid-cols-3" onSubmit={(e) => {
          e.preventDefault();
          if (pw.current.length < 6) return setPwErr("Enter your current password.");
          if (pw.next.length < 8) return setPwErr("New password must be at least 8 characters.");
          if (pw.next !== pw.confirm) return setPwErr("Passwords don't match.");
          setPwErr(""); setPw({ current: "", next: "", confirm: "" }); toast.success("Password changed.");
        }}>
          {(["current", "next", "confirm"] as const).map((k) => <div key={k} className="space-y-1.5"><Label htmlFor={`pw-${k}`}>{k === "current" ? "Current" : k === "next" ? "New password" : "Confirm"}</Label><Input id={`pw-${k}`} type="password" value={pw[k]} onChange={(e) => setPw({ ...pw, [k]: e.target.value })} /></div>)}
          {pwErr && <p className="text-sm text-destructive sm:col-span-3">{pwErr}</p>}
          <div className="sm:col-span-3"><Button type="submit" variant="outline">Change password</Button></div>
        </form>
      </SettingsSection>

      <SettingsSection title="Session & data">
        <div className="flex items-center justify-between px-5 py-4"><div><p className="text-sm font-medium">Sign out</p><p className="text-sm text-muted-foreground">You can sign back in any time.</p></div><Button variant="outline" size="sm" onClick={() => { s.logout(); navigate({ to: "/login" }); }}>Sign out</Button></div>
        <div className="flex items-center justify-between px-5 py-4"><div><p className="text-sm font-medium">Reset demo data</p><p className="text-sm text-muted-foreground">Restore all people, projects and messages to the original sample.</p></div><Button variant="outline" size="sm" className="text-destructive" onClick={() => setReset(true)}>Reset</Button></div>
      </SettingsSection>

      <AlertDialog open={reset} onOpenChange={setReset}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Reset all data?</AlertDialogTitle><AlertDialogDescription>Your projects, messages, connections and profile edits will be lost.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { s.resetDemo(); toast("Demo data restored."); navigate({ to: "/home" }); }}>Reset</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
