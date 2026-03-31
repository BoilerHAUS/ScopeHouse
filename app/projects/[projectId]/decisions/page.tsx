import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";
import { PageContainer } from "@/components/layout/page-container";

export default function ProjectDecisionsPage() {
  return (
    <PageContainer>
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
    </PageContainer>
  );
}
