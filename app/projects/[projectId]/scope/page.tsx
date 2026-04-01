import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { ScopeWorkbench } from "@/features/scope/components/scope-workbench";
import { getLatestScopeDraftForUser } from "@/features/scope/queries/get-latest-scope-draft";
import { getProjectScopeForUser } from "@/features/scope/queries/get-project-scope";
import { getProjectIntakeForUser } from "@/features/intake/queries/get-project-intake";
import { requireCurrentUser } from "@/server/auth/session";

type ProjectScopePageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectScopePage({
  params,
}: ProjectScopePageProps) {
  const user = await requireCurrentUser();
  const { projectId } = await params;
  const [intakeRecord, latestDraft, appliedScope] = await Promise.all([
    getProjectIntakeForUser(projectId, user.id),
    getLatestScopeDraftForUser(projectId, user.id),
    getProjectScopeForUser(projectId, user.id),
  ]);

  if (!intakeRecord) {
    notFound();
  }

  return (
    <PageContainer>
      <ScopeWorkbench
        projectId={projectId}
        intakeCompleted={Boolean(intakeRecord.intake?.completedAt)}
        latestDraft={latestDraft}
        appliedScope={appliedScope}
      />
    </PageContainer>
  );
}
