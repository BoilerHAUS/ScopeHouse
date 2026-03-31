import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";
import { PageContainer } from "@/components/layout/page-container";

export default function ProjectIntakePage() {
  return (
    <PageContainer>
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
    </PageContainer>
  );
}
