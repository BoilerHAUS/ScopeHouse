import { AppShell } from "@/components/layout/app-shell";
import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";

export default function ProjectDecisionsPage() {
  return (
    <AppShell>
      <FeaturePlaceholder
        eyebrow="Decisions"
        title="Decision log"
        description="Use this route for recording approvals, ownership, dates, and status changes in a clean audit trail."
        points={[
          "Keep decision status explicit.",
          "Make entries easy to scan and export.",
          "Connect changes back to project scope and budget context.",
        ]}
      />
    </AppShell>
  );
}
