import { AppShell } from "@/components/layout/app-shell";
import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";

export default function ProjectScopePage() {
  return (
    <AppShell>
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
    </AppShell>
  );
}
