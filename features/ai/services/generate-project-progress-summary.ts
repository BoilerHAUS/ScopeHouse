import { runStructuredAiWorkflow } from "@/server/ai/run-structured-workflow";
import { progressSummaryOutputSchema } from "@/features/ai/schemas/progress-summary";
import { listProjectChangeOrdersForUser } from "@/features/change-orders/queries/list-project-change-orders";
import { getProjectExportSummaryForUser } from "@/features/export/queries/get-project-export-summary";

export async function generateProjectProgressSummaryForUser(
  projectId: string,
  userId: string,
) {
  const [exportSummary, changeOrders] = await Promise.all([
    getProjectExportSummaryForUser(projectId, userId),
    listProjectChangeOrdersForUser(projectId, userId),
  ]);

  if (!exportSummary) {
    throw new Error("Project summary source data was not found.");
  }

  if (!changeOrders) {
    throw new Error("Project change-order data was not found.");
  }

  const workflowInput = {
    project: {
      title: exportSummary.project.title,
      projectType: exportSummary.project.projectType,
      locationLabel: exportSummary.project.locationLabel,
      goals: exportSummary.project.goals,
      status: exportSummary.project.status,
      updatedAt: exportSummary.project.updatedAt.toISOString(),
    },
    intake: exportSummary.intake,
    scope: {
      phaseCount: exportSummary.scope.phaseCount,
      itemCount: exportSummary.scope.itemCount,
      groups: exportSummary.scope.groups.map((phase) => ({
        name: phase.phaseName,
        areas: phase.areas.map((area) => ({
          name: area.areaName,
          items: area.items.map((item) => item.label),
        })),
      })),
    },
    decisions: exportSummary.decisions.map((decision) => ({
      summary: decision.summary,
      owner: decision.owner,
      status: decision.status,
      recordedAt: decision.recordedAt.toISOString(),
      notes: decision.notes,
    })),
    changeOrders: changeOrders.map((changeOrder) => ({
      title: changeOrder.title,
      status: changeOrder.status,
      requestedAt: changeOrder.requestedAt.toISOString(),
      description: changeOrder.description,
      impactSummary: changeOrder.impactSummary,
      budgetReference: changeOrder.budgetReference,
      scheduleReference: changeOrder.scheduleReference,
      notes: changeOrder.notes,
    })),
    completeness: {
      intakeReady: exportSummary.readiness.intakeReady,
      scopeReady: exportSummary.readiness.scopeReady,
      decisionsReady: exportSummary.readiness.decisionsReady,
      changeOrdersReady: changeOrders.length > 0,
    },
  };

  const result = await runStructuredAiWorkflow({
    workflow: "progress_summary",
    schema: progressSummaryOutputSchema,
    input: workflowInput,
    projectId,
  });

  return {
    generationId: result.generationId,
    model: result.model,
    promptVersion: result.promptVersion,
    output: result.output,
  };
}
