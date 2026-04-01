import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { BudgetPlanner } from "@/features/budget/components/budget-planner";
import { getProjectBudgetForUser } from "@/features/budget/queries/get-project-budget";
import { requireCurrentUser } from "@/server/auth/session";

type ProjectBudgetPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectBudgetPage({
  params,
}: ProjectBudgetPageProps) {
  const user = await requireCurrentUser();
  const { projectId } = await params;
  const budget = await getProjectBudgetForUser(projectId, user.id);

  if (!budget) {
    notFound();
  }

  return (
    <PageContainer>
      <BudgetPlanner projectId={projectId} budget={budget} />
    </PageContainer>
  );
}
