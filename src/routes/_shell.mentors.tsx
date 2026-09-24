import { createFileRoute } from "@tanstack/react-router";
import { DiscoverPage, discoverHead } from "@/components/cg/discover-page";

export const Route = createFileRoute("/_shell/mentors")({
  head: discoverHead("Mentors", "Seniors and final years who've been through internships, research and hackathons — and are happy to help."),
  component: Mentors,
});

function Mentors() {
  return <DiscoverPage category="mentors" eyebrow="Mentors" title="Learn from people a few steps ahead." description="Seniors and final years who've been through internships, research and hackathons — and are happy to help." />;
}
