import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";
import { PageContainer } from "@/components/layout/page-container";

export default function ProjectBudgetPage() {
  return (
    <PageContainer>
      <FeaturePlaceholder
        eyebrow="Budget"
        title="Budget planner"
        description="Budgeting belongs here once the project has a usable scope baseline and category structure."
        points={[
          "Keep rollups and calculations in testable domain logic.",
          "Track estimate, allowance, quote, and actual states explicitly.",
          "Avoid spreadsheet-style sprawl in page files.",
        ]}
      />
    </PageContainer>
  );
}
