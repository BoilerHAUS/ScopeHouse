import { AppShell } from "@/components/layout/app-shell";
import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";

export default function ProjectIntakePage() {
  return (
    <AppShell>
      <FeaturePlaceholder
        eyebrow="Intake"
        title="Guided renovation intake"
        description="Structured intake captures project goals, rooms, constraints, budget context, timeline expectations, and contractor involvement."
        points={[
          "Save progress between steps.",
          "Keep validation shared inside features/intake/schemas.",
          "Feed reviewed intake data into AI scope drafting.",
        ]}
      />
    </AppShell>
  );
}
