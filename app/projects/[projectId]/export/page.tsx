import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";
import { PageContainer } from "@/components/layout/page-container";

export default function ProjectExportPage() {
  return (
    <PageContainer>
      <FeaturePlaceholder
        eyebrow="Export"
        title="Project export"
        description="Exports are a first-class workflow for ScopeHouse. This page should assemble clean summaries that are credible to share."
        points={[
          "Support PDF summary generation.",
          "Favor print-friendly structure and clarity.",
          "Compose export inputs from feature queries, not page-level glue code.",
        ]}
      />
    </PageContainer>
  );
}
