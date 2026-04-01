"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";

export async function deleteDecisionAction(projectId: string, formData: FormData) {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);
  const decisionId = formData.get("decisionId");

  if (!project || typeof decisionId !== "string" || decisionId.length === 0) {
    return;
  }

  await db.decision.deleteMany({
    where: {
      id: decisionId,
      projectId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/decisions`);
}
