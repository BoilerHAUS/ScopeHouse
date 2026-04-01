"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/server/auth/session";
import { generateProjectProgressSummaryForUser } from "@/features/ai/services/generate-project-progress-summary";
import { normalizeAiWorkflowError } from "@/server/ai/errors";

export type ProjectProgressSummaryActionState = {
  error?: string;
  errorTitle?: string;
  errorCode?: string;
  helpText?: string;
};

export async function generateProjectProgressSummaryAction(
  projectId: string,
  previousState: ProjectProgressSummaryActionState,
) {
  void previousState;
  const user = await requireCurrentUser();

  try {
    await generateProjectProgressSummaryForUser(projectId, user.id);
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

  revalidatePath(`/projects/${projectId}/export`);
  redirect(`/projects/${projectId}/export`);
}
