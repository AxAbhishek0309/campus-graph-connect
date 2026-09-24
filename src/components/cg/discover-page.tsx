import { Link } from "@tanstack/react-router";
import { PageHeader } from "./primitives";
import { PeopleBrowser } from "./people-browser";
import { Button } from "@/components/ui/button";

export function DiscoverPage({ category, title, description, eyebrow, cta }: { category: string; title: string; description: string; eyebrow: string; cta?: { label: string; to: "/hackathon-teams" | "/projects" | "/teams" | "/events" } }) {
  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={cta && <Button variant="outline" asChild><Link to={cta.to}>{cta.label}</Link></Button>}
      />
      <PeopleBrowser initialCategory={category} lockCategory />
    </>
  );
}

export function discoverHead(title: string, description: string) {
  return () => ({
    meta: [
      { title: `${title} — CampusGraph` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — CampusGraph` },
      { property: "og:description", content: description },
    ],
  });
}
