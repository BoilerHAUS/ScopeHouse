import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";
import { PageContainer } from "@/components/layout/page-container";

export default function ProjectScopePage() {
  return (
    <PageContainer>
      <FeaturePlaceholder
        eyebrow="Scope"
        title="Scope builder"
        description="This route is reserved for the editable project scope organized by phase, room, and work item."
        points={[
          "Keep scope version logic in features/scope/services.",
          "Treat AI draft output as a starting point, not final truth.",
          "Design for export and quote comparison from day one.",
        ]}
      />
    </PageContainer>
  );
}
