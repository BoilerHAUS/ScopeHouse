import { cache } from "react";
import { getLatestProjectProgressSummaryForUser } from "@/features/ai/queries/get-latest-project-progress-summary";
import { getProjectBudgetForUser } from "@/features/budget/queries/get-project-budget";
import { listProjectChangeOrdersForUser } from "@/features/change-orders/queries/list-project-change-orders";
import { listProjectDecisionsForUser } from "@/features/decisions/queries/list-project-decisions";
import { getProjectIntakeForUser } from "@/features/intake/queries/get-project-intake";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { getProjectScopeForUser } from "@/features/scope/queries/get-project-scope";

function countScopeItems(
  scope: Awaited<ReturnType<typeof getProjectScopeForUser>>,
) {
  return scope.reduce(
    (total, phase) =>
      total +
      phase.areas.reduce((areaTotal, area) => areaTotal + area.items.length, 0),
    0,
  );
}

export const getProjectExportSummaryForUser = cache(
  async (projectId: string, userId: string) => {
    const [project, intakeRecord, scope, decisions, changeOrders, aiSummary, budget] =
      await Promise.all([
        getProjectForUser(projectId, userId),
        getProjectIntakeForUser(projectId, userId),
        getProjectScopeForUser(projectId, userId),
        listProjectDecisionsForUser(projectId, userId),
        listProjectChangeOrdersForUser(projectId, userId),
        getLatestProjectProgressSummaryForUser(projectId, userId),
        getProjectBudgetForUser(projectId, userId),
      ]);

    if (!project || !intakeRecord || !changeOrders) {
      return null;
    }

    const scopeItemCount = countScopeItems(scope);
    const intake = intakeRecord.intake;

    return {
      project,
      intake: {
        completedAt: intake?.completedAt ?? null,
        renovationType: intake?.renovationType ?? intakeRecord.fallbackProjectType,
        rooms: intake?.rooms ?? [],
        goals: intake?.goals ?? intakeRecord.fallbackGoals,
        priorities: intake?.priorities ?? [],
        timingExpectation: intake?.timingExpectation ?? null,
        budgetRange: intake?.budgetRange ?? null,
        constraints: intake?.constraints ?? [],
        contractorInvolvement: intake?.contractorInvolvement ?? null,
        notes: intake?.notes ?? null,
      },
      scope: {
        groups: scope,
        phaseCount: scope.length,
        itemCount: scopeItemCount,
      },
      decisions,
      changeOrders,
      aiSummary,
      budget: budget ?? null,
      readiness: {
        intakeReady: Boolean(intake?.completedAt),
        scopeReady: scopeItemCount > 0,
        decisionsReady: decisions.length > 0,
        changeOrdersReady: changeOrders.length > 0,
      },
    };
  },
);
