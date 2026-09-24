import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/lib/store";
import { ProfileView } from "@/components/cg/profile-view";
import { EmptyState } from "@/components/cg/primitives";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_shell/people/$id")({
  head: () => ({
    meta: [
      { title: "Student profile — CampusGraph" },
      { name: "description", content: "Skills, projects, coding activity and what this student is looking for." },
      { property: "og:title", content: "Student profile — CampusGraph" },
      { property: "og:description", content: "See skills, projects and shared interests." },
    ],
  }),
  component: PersonPage,
});

function PersonPage() {
  const { id } = Route.useParams();
  const person = useApp((s) => s.students.find((x) => x.id === id));
  if (!person) return <EmptyState title="Profile not found" description="This student may have left CampusGraph." action={<Button asChild><Link to="/people">Browse people</Link></Button>} />;
  return (
    <>
      <Link to="/people" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> People</Link>
      <ProfileView person={person} />
    </>
  );
}
