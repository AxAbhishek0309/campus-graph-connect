import { createFileRoute } from "@tanstack/react-router";
import { DiscoverPage, discoverHead } from "@/components/cg/discover-page";

export const Route = createFileRoute("/_shell/research-partners")({
  head: discoverHead("Research Partners", "Students reading papers, running experiments and writing them up — across departments."),
  component: ResearchPartners,
});

function ResearchPartners() {
  return <DiscoverPage category="research" eyebrow="Research Partners" title="Find research partners." description="Students reading papers, running experiments and writing them up — across departments." cta={{ to: "/projects", label: "Research projects" }} />;
}
