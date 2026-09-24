import { createFileRoute } from "@tanstack/react-router";
import { DiscoverPage, discoverHead } from "@/components/cg/discover-page";

export const Route = createFileRoute("/_shell/friends")({
  head: discoverHead("Friends", "Not everything needs to be a project. Find people who share your interests outside class."),
  component: Friends,
});

function Friends() {
  return <DiscoverPage category="friends" eyebrow="Friends" title="Just meet people." description="Not everything needs to be a project. Find people who share your interests outside class." cta={{ to: "/events", label: "Campus events" }} />;
}
