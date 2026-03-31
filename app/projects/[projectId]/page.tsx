import { AppShell } from "@/components/layout/app-shell";
import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";

export default function ProjectWorkspacePage() {
  return (
    <AppShell>
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
    </AppShell>
  );
}
