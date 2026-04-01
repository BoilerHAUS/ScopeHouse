import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { ProjectSummaryExportView } from "@/features/export/components/project-summary-export-view";
import { getProjectExportSummaryForUser } from "@/features/export/queries/get-project-export-summary";
import { requireCurrentUser } from "@/server/auth/session";

type ProjectExportPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectExportPage({
  params,
}: ProjectExportPageProps) {
  const user = await requireCurrentUser();
  const { projectId } = await params;
  const summary = await getProjectExportSummaryForUser(projectId, user.id);

  if (!summary) {
    notFound();
  }

  return (
    <PageContainer>
      <ProjectSummaryExportView projectId={projectId} summary={summary} />
    </PageContainer>
  );
}
