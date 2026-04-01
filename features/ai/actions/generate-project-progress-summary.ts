"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/server/auth/session";
import { generateProjectProgressSummaryForUser } from "@/features/ai/services/generate-project-progress-summary";

export type ProjectProgressSummaryActionState = {
  error?: string;
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
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate the project summary.",
    } satisfies ProjectProgressSummaryActionState;
  }

  revalidatePath(`/projects/${projectId}/export`);
  redirect(`/projects/${projectId}/export`);
}
