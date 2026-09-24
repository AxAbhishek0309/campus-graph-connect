import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_shell/messages/")({
  component: () => (
    <div className="flex size-full flex-col items-center justify-center p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-full border"><MessageSquare className="size-5" /></span>
      <p className="mt-4 font-medium">Pick a conversation</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">Or find someone new to talk to — every profile has a Message button.</p>
      <Button variant="outline" className="mt-5" asChild><Link to="/people">Find people</Link></Button>
    </div>
  ),
});
