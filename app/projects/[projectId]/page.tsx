import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";
import { PageContainer } from "@/components/layout/page-container";

export default function ProjectWorkspacePage() {
  return (
    <PageContainer>
      <FeaturePlaceholder
        eyebrow="Project"
        title="Project overview"
        description="Use this page for the consolidated project record across intake, scope, budget, schedule, documents, and decisions."
        points={[
          "Show status, summary, and next actions.",
          "Keep projections and calculations inside feature modules.",
          "Prefer exportable project state over dashboard noise.",
        ]}
      />
    </PageContainer>
  );
}
