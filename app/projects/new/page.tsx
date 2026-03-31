import { AppShell } from "@/components/layout/app-shell";
import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";

export default function NewProjectPage() {
  return (
    <AppShell>
      <FeaturePlaceholder
        eyebrow="Projects"
        title="New project flow"
        description="This page is the entry point for the first MVP workflow: create project, collect intake, and move into a structured scope baseline."
        points={[
          "Capture the project shell first.",
          "Use guided intake after core project details exist.",
          "Lead users toward the first vertical slice output.",
        ]}
      />
    </AppShell>
  );
}
