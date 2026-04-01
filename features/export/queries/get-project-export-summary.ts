import { cache } from "react";
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
    const [project, intakeRecord, scope, decisions] = await Promise.all([
      getProjectForUser(projectId, userId),
      getProjectIntakeForUser(projectId, userId),
      getProjectScopeForUser(projectId, userId),
      listProjectDecisionsForUser(projectId, userId),
    ]);

    if (!project || !intakeRecord) {
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
      readiness: {
        intakeReady: Boolean(intake?.completedAt),
        scopeReady: scopeItemCount > 0,
        decisionsReady: decisions.length > 0,
      },
    };
  },
);
