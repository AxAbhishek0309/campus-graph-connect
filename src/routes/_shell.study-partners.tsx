import { createFileRoute } from "@tanstack/react-router";
import { DiscoverPage, discoverHead } from "@/components/cg/discover-page";

export const Route = createFileRoute("/_shell/study-partners")({
  head: discoverHead("Study Partners", "Classmates and seniors who want accountability for exams, GATE, placements or just the next quiz."),
  component: StudyPartners,
});

function StudyPartners() {
  return <DiscoverPage category="study" eyebrow="Study Partners" title="Study better, together." description="Classmates and seniors who want accountability for exams, GATE, placements or just the next quiz.", cta: { to: "/events", label: "Study sessions" } />;
}
