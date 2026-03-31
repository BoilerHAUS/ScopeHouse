import { AppShell } from "@/components/layout/app-shell";
import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";

export default function ProjectDocumentsPage() {
  return (
    <AppShell>
      <FeaturePlaceholder
        eyebrow="Documents"
        title="Document vault"
        description="This route is for project files, photo evidence, and tagged records that support the renovation history."
        points={[
          "Handle uploads safely on the server side.",
          "Support room and phase tagging.",
          "Keep file access and permissions out of client-only code.",
        ]}
      />
    </AppShell>
  );
}
