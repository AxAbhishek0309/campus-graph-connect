import { createFileRoute } from "@tanstack/react-router";
import { DiscoverPage, discoverHead } from "@/components/cg/discover-page";

export const Route = createFileRoute("/_shell/career-peers")({
  head: discoverHead("Career Peers", "Peers preparing for the same internships and placements. Share notes, do mock interviews, compare offers."),
  component: CareerPeers,
});

function CareerPeers() {
  return <DiscoverPage category="career" eyebrow="Career Peers" title="Prepare for what's next." description="Peers preparing for the same internships and placements. Share notes, do mock interviews, compare offers." />;
}
