import { AppShell } from "@/components/layout/app-shell";
import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";

export default function ProjectSchedulePage() {
  return (
    <AppShell>
      <FeaturePlaceholder
        eyebrow="Schedule"
        title="Schedule planner"
        description="The MVP schedule is lightweight. It should support sequencing and visibility without becoming a heavy CPM tool."
        points={[
          "Model phases and milestones first.",
          "Prefer practical visibility over dense calendar UI.",
          "Keep schedule rules in features/schedule, not in route components.",
        ]}
      />
    </AppShell>
  );
}
