import { db } from "@/server/db/client";
import { logProjectActivity } from "@/server/activity/log";
import { runStructuredAiWorkflow } from "@/server/ai/run-structured-workflow";
import { scopeDraftOutputSchema } from "@/features/ai/schemas/scope-draft";
import { getProjectIntakeForUser } from "@/features/intake/queries/get-project-intake";
import { getProjectForUser } from "@/features/projects/queries/get-project";

export async function generateScopeDraftForUser(
  projectId: string,
  userId: string,
) {
  const [project, intakeRecord] = await Promise.all([
    getProjectForUser(projectId, userId),
    getProjectIntakeForUser(projectId, userId),
  ]);

  if (!project) {
    throw new Error("Project not found.");
  }

  if (!intakeRecord?.intake?.completedAt) {
    throw new Error(
      "Finish guided intake before generating a scope draft.",
    );
  }

  const workflowInput = {
    project: {
      title: project.title,
      projectType: project.projectType,
      locationLabel: project.locationLabel,
      goals: project.goals,
      status: project.status,
    },
    intake: {
      renovationType: intakeRecord.intake.renovationType,
      rooms: intakeRecord.intake.rooms,
      goals: intakeRecord.intake.goals,
      priorities: intakeRecord.intake.priorities,
      timingExpectation: intakeRecord.intake.timingExpectation,
      budgetRange: intakeRecord.intake.budgetRange,
      constraints: intakeRecord.intake.constraints,
      contractorInvolvement: intakeRecord.intake.contractorInvolvement,
      notes: intakeRecord.intake.notes,
    },
  };

  const result = await runStructuredAiWorkflow({
    workflow: "scope_draft",
    schema: scopeDraftOutputSchema,
    input: workflowInput,
    projectId,
  });

  const draft = await db.$transaction(async (tx) => {
    await tx.scopeDraft.updateMany({
      where: {
        projectId,
        status: "pending_review",
      },
      data: {
        status: "discarded",
      },
    });

    const createdDraft = await tx.scopeDraft.create({
      data: {
        projectId,
        generationId: result.generationId,
        projectSummary: result.output.projectSummary,
        phases: result.output.phases,
        assumptions: result.output.assumptions,
        risks: result.output.risks,
      },
      select: {
        id: true,
        projectId: true,
        projectSummary: true,
        phases: true,
        assumptions: true,
        risks: true,
        status: true,
        createdAt: true,
      },
    });

    await tx.project.update({
      where: {
        id: projectId,
      },
      data: {
        status: "scope_review",
      },
    });

    return createdDraft;
  });

  await logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: userId,
    eventType: "scope_draft_generated",
    summary: "Generated an AI scope draft for review.",
    metadata: {
      draftId: draft.id,
      generationId: result.generationId,
      promptVersion: result.promptVersion,
      model: result.model,
    },
  });

  return {
    id: draft.id,
    projectId: draft.projectId,
    projectSummary: draft.projectSummary,
    phases: result.output.phases,
    assumptions: result.output.assumptions,
    risks: result.output.risks,
    status: draft.status,
    createdAt: draft.createdAt,
  };
}
