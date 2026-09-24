import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { ProfileView } from "@/components/cg/profile-view";

export const Route = createFileRoute("/_shell/profile/")({
  head: () => ({
    meta: [
      { title: "Your profile — CampusGraph" },
      { name: "description", content: "Your student profile on CampusGraph." },
      { property: "og:title", content: "Your profile — CampusGraph" },
      { property: "og:description", content: "Skills, projects and what you're looking for." },
    ],
  }),
  component: () => <ProfileView person={useApp((s) => s.me)} isMe />,
});
