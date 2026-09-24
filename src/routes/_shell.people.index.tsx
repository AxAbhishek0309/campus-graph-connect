import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader } from "@/components/cg/primitives";
import { PeopleBrowser } from "@/components/cg/people-browser";

export const Route = createFileRoute("/_shell/people/")({
  validateSearch: (s) => z.object({ q: z.string().optional(), cat: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "People — CampusGraph" },
      { name: "description", content: "Find students by skill, college, interest and what they're looking for." },
      { property: "og:title", content: "Find your people — CampusGraph" },
      { property: "og:description", content: "Search students across campuses by skill, interest and goals." },
    ],
  }),
  component: People,
});

function People() {
  const { q, cat } = Route.useSearch();
  return (
    <>
      <PageHeader eyebrow="Discover" title="Find your people." description="Search across names, skills, projects, interests and bios. Every card tells you why you might get along." />
      <PeopleBrowser initialQuery={q ?? ""} initialCategory={cat ?? "for-you"} />
    </>
  );
}
