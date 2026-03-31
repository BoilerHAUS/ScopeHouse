import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";
import { PageContainer } from "@/components/layout/page-container";

export default function ProjectChangeOrdersPage() {
  return (
    <PageContainer>
      <FeaturePlaceholder
        eyebrow="Change Orders"
        title="Change tracking"
        description="Use this route for recording scope, budget, and schedule changes with clear impact context."
        points={[
          "Track changes without drifting into full contract administration.",
          "Keep linked budget or schedule impacts visible.",
          "Make review and auditability straightforward.",
        ]}
      />
    </PageContainer>
  );
}
