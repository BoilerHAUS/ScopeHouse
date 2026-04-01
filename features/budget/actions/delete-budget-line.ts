"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";

export async function deleteBudgetLineAction(projectId: string, formData: FormData) {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);
  const lineId = formData.get("lineId");

  if (!project || typeof lineId !== "string" || lineId.length === 0) {
    return;
  }

  await db.budgetLine.deleteMany({
    where: {
      id: lineId,
      projectId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/budget`);
}
