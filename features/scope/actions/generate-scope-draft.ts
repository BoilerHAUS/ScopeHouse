"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/server/auth/session";
import { generateScopeDraftForUser } from "@/features/ai/services/generate-scope-draft";
import type { ScopeActionState } from "@/features/scope/actions/scope-action-state";

export async function generateScopeDraftAction(
  projectId: string,
  previousState: ScopeActionState,
) {
  void previousState;
  const user = await requireCurrentUser();

  try {
    await generateScopeDraftForUser(projectId, user.id);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to generate scope draft.",
    } satisfies ScopeActionState;
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/scope`);
  redirect(`/projects/${projectId}/scope`);
}
