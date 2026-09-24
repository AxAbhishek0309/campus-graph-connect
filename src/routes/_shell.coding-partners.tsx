import { createFileRoute } from "@tanstack/react-router";
import { DiscoverPage, discoverHead } from "@/components/cg/discover-page";

export const Route = createFileRoute("/_shell/coding-partners")({
  head: discoverHead("Coding Partners", "Pair on side projects, grind LeetCode together or review each other's pull requests."),
  component: CodingPartners,
});

function CodingPartners() {
  return <DiscoverPage category="coding" eyebrow="Coding Partners" title="Find someone to code with." description="Pair on side projects, grind LeetCode together or review each other's pull requests." cta={{ to: "/projects", label: "Browse projects" }} />;
}
