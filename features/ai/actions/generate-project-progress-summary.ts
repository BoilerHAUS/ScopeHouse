"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/server/auth/session";
import { logProjectActivity } from "@/server/activity/log";
import { generateProjectProgressSummaryForUser } from "@/features/ai/services/generate-project-progress-summary";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { normalizeAiWorkflowError } from "@/server/ai/errors";

export type ProjectProgressSummaryActionState = {
  error?: string;
  errorTitle?: string;
  errorCode?: string;
  helpText?: string;
};

type GenerateProjectProgressSummaryActionDependencies = {
  requireCurrentUser: typeof requireCurrentUser;
  generateProjectProgressSummaryForUser: typeof generateProjectProgressSummaryForUser;
  getProjectForUser: typeof getProjectForUser;
  logProjectActivity: typeof logProjectActivity;
  revalidatePath: typeof revalidatePath;
  redirect: typeof redirect;
};

const generateProjectProgressSummaryActionDependencies: GenerateProjectProgressSummaryActionDependencies = {
  requireCurrentUser,
  generateProjectProgressSummaryForUser,
  getProjectForUser,
  logProjectActivity,
  revalidatePath,
  redirect,
};

export async function generateProjectProgressSummaryAction(
  projectId: string,
  previousState: ProjectProgressSummaryActionState,
) {
  return generateProjectProgressSummaryActionWithDependencies(
    generateProjectProgressSummaryActionDependencies,
    projectId,
    previousState,
  );
}

export async function generateProjectProgressSummaryActionWithDependencies(
  dependencies: GenerateProjectProgressSummaryActionDependencies,
  projectId: string,
  previousState: ProjectProgressSummaryActionState,
) {
  void previousState;
  const user = await dependencies.requireCurrentUser();
  const project = await dependencies.getProjectForUser(projectId, user.id);
  let result:
    | Awaited<ReturnType<typeof generateProjectProgressSummaryForUser>>
    | undefined;

  try {
    result = await dependencies.generateProjectProgressSummaryForUser(
      projectId,
      user.id,
    );
  } catch (error) {
    const normalizedError = normalizeAiWorkflowError(
      error,
      "AI project summary generation",
    );

    return {
      error: normalizedError.message,
      errorTitle: normalizedError.title,
      errorCode: normalizedError.code,
      helpText: normalizedError.configurationHint,
    } satisfies ProjectProgressSummaryActionState;
  }

  if (project && result) {
    await dependencies.logProjectActivity({
      projectId,
      workspaceId: project.workspaceId,
      actorId: user.id,
      eventType: "progress_summary_generated",
      summary: "Generated AI project progress summary.",
      metadata: {
        generationId: result.generationId,
        model: result.model,
        promptVersion: result.promptVersion,
      },
    });
  }

  dependencies.revalidatePath(`/projects/${projectId}/export`);
  dependencies.redirect(`/projects/${projectId}/export`);
}
