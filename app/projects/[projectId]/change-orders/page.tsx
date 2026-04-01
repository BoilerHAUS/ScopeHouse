import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { ChangeOrderManager } from "@/features/change-orders/components/change-order-manager";
import { listProjectChangeOrdersForUser } from "@/features/change-orders/queries/list-project-change-orders";
import { getProjectBudgetForUser } from "@/features/budget/queries/get-project-budget";
import { getProjectScheduleForUser } from "@/features/schedule/queries/get-project-schedule";
import { getProjectScopeForUser } from "@/features/scope/queries/get-project-scope";
import { requireCurrentUser } from "@/server/auth/session";

type ProjectChangeOrdersPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectChangeOrdersPage({
  params,
}: ProjectChangeOrdersPageProps) {
  const user = await requireCurrentUser();
  const { projectId } = await params;
  const [changeOrders, scopeTree, budget, schedule] = await Promise.all([
    listProjectChangeOrdersForUser(projectId, user.id),
    getProjectScopeForUser(projectId, user.id),
    getProjectBudgetForUser(projectId, user.id),
    getProjectScheduleForUser(projectId, user.id),
  ]);

  if (changeOrders === null) {
    notFound();
  }

  return (
    <PageContainer>
      <ChangeOrderManager
        projectId={projectId}
        changeOrders={changeOrders}
        scopeTree={scopeTree}
        budgetCategories={budget?.categories ?? []}
        schedulePhases={schedule?.phases ?? []}
      />
    </PageContainer>
  );
}
