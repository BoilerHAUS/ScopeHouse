"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import {
  decisionFormSchema,
  type DecisionFormActionState,
} from "@/features/decisions/schemas/decision-form";

export async function saveDecisionAction(
  projectId: string,
  _previousState: DecisionFormActionState,
  formData: FormData,
): Promise<DecisionFormActionState> {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);

  if (!project) {
    return {
      error: "Project not found.",
    };
  }

  const result = decisionFormSchema.safeParse({
    decisionId: formData.get("decisionId") || undefined,
    summary: formData.get("summary"),
    owner: formData.get("owner"),
    status: formData.get("status"),
    recordedAt: formData.get("recordedAt"),
    notes: formData.get("notes"),
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    return {
      error: "Fix the highlighted fields and try again.",
      fieldErrors: {
        summary: fieldErrors.summary?.[0],
        owner: fieldErrors.owner?.[0],
        status: fieldErrors.status?.[0],
        recordedAt: fieldErrors.recordedAt?.[0],
        notes: fieldErrors.notes?.[0],
      },
    };
  }

  const decisionId = result.data.decisionId?.trim();

  if (decisionId) {
    const existingDecision = await db.decision.findFirst({
      where: {
        id: decisionId,
        projectId,
      },
      select: {
        id: true,
      },
    });

    if (!existingDecision) {
      return {
        error: "Decision not found.",
      };
    }

    await db.decision.update({
      where: {
        id: decisionId,
      },
      data: {
        summary: result.data.summary,
        owner: result.data.owner,
        status: result.data.status,
        recordedAt: new Date(`${result.data.recordedAt}T12:00:00.000Z`),
        notes: result.data.notes,
      },
    });
  } else {
    await db.decision.create({
      data: {
        projectId,
        summary: result.data.summary,
        owner: result.data.owner,
        status: result.data.status,
        recordedAt: new Date(`${result.data.recordedAt}T12:00:00.000Z`),
        notes: result.data.notes,
      },
    });
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/decisions`);

  return {
    success: decisionId ? "Decision updated." : "Decision created.",
  };
}
