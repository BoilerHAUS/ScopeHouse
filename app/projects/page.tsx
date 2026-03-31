import { AppShell } from "@/components/layout/app-shell";
import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";

export default function ProjectsPage() {
  return (
    <AppShell>
      <FeaturePlaceholder
        eyebrow="Projects"
        title="Project workspace index"
        description="This route is reserved for project listing, filtering, archive state, and quick-launch creation flows."
        points={[
          "Keep list querying inside features/projects/queries.",
          "Keep project mutations inside features/projects/actions.",
          "Use this page only for composition and route-level concerns.",
        ]}
      />
    </AppShell>
  );
}
