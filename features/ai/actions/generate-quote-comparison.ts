"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/server/auth/session";
import { logProjectActivity } from "@/server/activity/log";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { generateQuoteComparisonForUser } from "@/features/ai/services/generate-quote-comparison";
import { normalizeAiWorkflowError } from "@/server/ai/errors";
import {
  isRateLimitExceededError,
  rateLimitAiByProject,
} from "@/server/rate-limit/limit";

export type QuoteComparisonActionState = {
  error?: string;
  errorTitle?: string;
  errorCode?: string;
  helpText?: string;
};

type GenerateQuoteComparisonActionDependencies = {
  requireCurrentUser: typeof requireCurrentUser;
  generateQuoteComparisonForUser: typeof generateQuoteComparisonForUser;
  getProjectForUser: typeof getProjectForUser;
  logProjectActivity: typeof logProjectActivity;
  revalidatePath: typeof revalidatePath;
};

const generateQuoteComparisonActionDependencies: GenerateQuoteComparisonActionDependencies = {
  requireCurrentUser,
  generateQuoteComparisonForUser,
  getProjectForUser,
  logProjectActivity,
  revalidatePath,
};

export async function generateQuoteComparisonAction(
  projectId: string,
  previousState: QuoteComparisonActionState,
) {
  return generateQuoteComparisonActionWithDependencies(
    generateQuoteComparisonActionDependencies,
    projectId,
    previousState,
  );
}

export async function generateQuoteComparisonActionWithDependencies(
  dependencies: GenerateQuoteComparisonActionDependencies,
  projectId: string,
  previousState: QuoteComparisonActionState,
) {
  void previousState;
  const user = await dependencies.requireCurrentUser();
  const project = await dependencies.getProjectForUser(projectId, user.id);
  let result:
    | Awaited<ReturnType<typeof generateQuoteComparisonForUser>>
    | undefined;

  try {
    await rateLimitAiByProject(projectId);
    result = await dependencies.generateQuoteComparisonForUser(projectId, user.id);
  } catch (error) {
    if (isRateLimitExceededError(error)) {
      return {
        error: error.message,
        errorTitle: "Rate limit reached",
        errorCode: "rate-limit-exceeded",
        helpText: "Wait a few minutes before running another quote comparison.",
      } satisfies QuoteComparisonActionState;
    }

    const normalizedError = normalizeAiWorkflowError(error, "AI quote comparison");

    return {
      error: normalizedError.message,
      errorTitle: normalizedError.title,
      errorCode: normalizedError.code,
      helpText: normalizedError.configurationHint,
    } satisfies QuoteComparisonActionState;
  }

  if (project && result) {
    await dependencies.logProjectActivity({
      projectId,
      workspaceId: project.workspaceId,
      actorId: user.id,
      eventType: "quote_comparison_generated",
      summary: "Generated AI quote comparison.",
      metadata: {
        generationId: result.generationId,
        model: result.model,
        promptVersion: result.promptVersion,
      },
    });
  }

  dependencies.revalidatePath(`/projects/${projectId}/quotes`);

  return {} satisfies QuoteComparisonActionState;
}
