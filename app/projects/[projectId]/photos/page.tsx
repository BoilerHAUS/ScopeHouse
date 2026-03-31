import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";
import { PageContainer } from "@/components/layout/page-container";

export default function ProjectPhotosPage() {
  return (
    <PageContainer>
      <FeaturePlaceholder
        eyebrow="Photos"
        title="Project photo log"
        description="This route is reserved for photo uploads, captions, timestamps, and optional room or phase tagging."
        points={[
          "Keep the photo workflow distinct from generic document storage.",
          "Support practical jobsite and planning evidence first.",
          "Preserve upload metadata and project context cleanly.",
        ]}
      />
    </PageContainer>
  );
}
