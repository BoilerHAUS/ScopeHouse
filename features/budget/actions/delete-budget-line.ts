"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { logProjectActivity } from "@/server/activity/log";
import { getProjectForUser } from "@/features/projects/queries/get-project";

export async function deleteBudgetLineAction(projectId: string, formData: FormData) {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);
  const lineId = formData.get("lineId");

  if (!project || typeof lineId !== "string" || lineId.length === 0) {
    return;
  }

  const line = await db.budgetLine.findFirst({
    where: {
      id: lineId,
      projectId,
    },
    select: {
      id: true,
      label: true,
      categoryId: true,
    },
  });

  if (!line) {
    return;
  }

  await db.budgetLine.delete({
    where: {
      id: line.id,
    },
  });

  await logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "budget_line_deleted",
    summary: `Removed budget line ${line.label}.`,
    metadata: {
      lineId: line.id,
      categoryId: line.categoryId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/budget`);
}
