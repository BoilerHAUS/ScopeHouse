"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { logProjectActivity } from "@/server/activity/log";
import { scopeDraftOutputSchema } from "@/features/ai/schemas/scope-draft";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { flattenScopeDraftForPersistence } from "@/features/scope/services/flatten-scope-draft";
import type { ScopeActionState } from "@/features/scope/actions/scope-action-state";

export async function applyScopeDraftAction(
  projectId: string,
  _previousState: ScopeActionState,
  formData: FormData,
) {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);
  const draftId = formData.get("draftId");

  if (!project) {
    return {
      error: "Project not found.",
    } satisfies ScopeActionState;
  }

  if (typeof draftId !== "string" || draftId.length === 0) {
    return {
      error: "No scope draft was selected.",
    } satisfies ScopeActionState;
  }

  const draft = await db.scopeDraft.findFirst({
    where: {
      id: draftId,
      projectId,
      status: "pending_review",
    },
    select: {
      id: true,
      projectSummary: true,
      phases: true,
      assumptions: true,
      risks: true,
    },
  });

  if (!draft) {
    return {
      error: "Scope draft not found or no longer reviewable.",
    } satisfies ScopeActionState;
  }

  const parsedDraft = scopeDraftOutputSchema.parse({
    projectSummary: draft.projectSummary,
    phases: draft.phases,
    assumptions: Array.isArray(draft.assumptions) ? draft.assumptions : [],
    risks: Array.isArray(draft.risks) ? draft.risks : [],
  });

  const nextScopeItems = flattenScopeDraftForPersistence(
    projectId,
    draft.id,
    parsedDraft,
  );

  await db.$transaction(async (tx) => {
    await tx.scopeItem.deleteMany({
      where: {
        projectId,
      },
    });

    if (nextScopeItems.length > 0) {
      await tx.scopeItem.createMany({
        data: nextScopeItems,
      });
    }

    await tx.scopeDraft.update({
      where: {
        id: draft.id,
      },
      data: {
        status: "applied",
        appliedAt: new Date(),
      },
    });

    await tx.scopeDraft.updateMany({
      where: {
        projectId,
        status: "pending_review",
        id: {
          not: draft.id,
        },
      },
      data: {
        status: "discarded",
      },
    });
  });

  await logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "scope_draft_applied",
    summary: "Applied the reviewed scope draft to the project baseline.",
    metadata: {
      draftId: draft.id,
      itemCount: nextScopeItems.length,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/scope`);
  redirect(`/projects/${projectId}/scope`);
}
