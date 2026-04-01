"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { logProjectActivity } from "@/server/activity/log";
import { getProjectForUser } from "@/features/projects/queries/get-project";

export async function deleteDecisionAction(projectId: string, formData: FormData) {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);
  const decisionId = formData.get("decisionId");

  if (!project || typeof decisionId !== "string" || decisionId.length === 0) {
    return;
  }

  const decision = await db.decision.findFirst({
    where: {
      id: decisionId,
      projectId,
    },
    select: {
      id: true,
      summary: true,
      status: true,
    },
  });

  if (!decision) {
    return;
  }

  await db.decision.delete({
    where: {
      id: decision.id,
    },
  });

  await logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "decision_deleted",
    summary: `Removed decision ${decision.summary}.`,
    metadata: {
      decisionId: decision.id,
      status: decision.status,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/decisions`);
}
