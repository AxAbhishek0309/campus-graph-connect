import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "./primitives";

export function AuthLayout({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link to="/" aria-label="Tribe home"><Logo /></Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12 animate-rise">{children}</div>
      </div>
      <div className="hidden border-l bg-card lg:flex lg:items-center lg:justify-center lg:p-12">
        {aside ?? (
          <blockquote className="max-w-md">
            <p className="text-3xl font-medium leading-tight tracking-[-0.03em]">
              “I found my SIH teammates two floors below my hostel room. We'd never have met otherwise.”
            </p>
            <footer className="mt-6 text-sm text-muted-foreground">Sneha Iyer · 3rd Year, CSE</footer>
          </blockquote>
        )}
      </div>
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8l3.6-2.8z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
    </svg>
  );
}

