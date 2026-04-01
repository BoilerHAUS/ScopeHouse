import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { DecisionLogManager } from "@/features/decisions/components/decision-log-manager";
import { listProjectDecisionsForUser } from "@/features/decisions/queries/list-project-decisions";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { requireCurrentUser } from "@/server/auth/session";

type ProjectDecisionsPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDecisionsPage({
  params,
}: ProjectDecisionsPageProps) {
  const user = await requireCurrentUser();
  const { projectId } = await params;
  const [project, decisions] = await Promise.all([
    getProjectForUser(projectId, user.id),
    listProjectDecisionsForUser(projectId, user.id),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <PageContainer>
      <DecisionLogManager projectId={projectId} decisions={decisions} />
    </PageContainer>
  );
}
