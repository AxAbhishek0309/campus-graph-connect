import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "./primitives";

export function AuthLayout({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link to="/" aria-label="CampusGraph home"><Logo /></Link>
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
