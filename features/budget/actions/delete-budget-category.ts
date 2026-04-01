"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { logProjectActivity } from "@/server/activity/log";
import { getProjectForUser } from "@/features/projects/queries/get-project";

export async function deleteBudgetCategoryAction(
  projectId: string,
  formData: FormData,
) {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);
  const categoryId = formData.get("categoryId");

  if (!project || typeof categoryId !== "string" || categoryId.length === 0) {
    return;
  }

  const category = await db.budgetCategory.findFirst({
    where: {
      id: categoryId,
      projectId,
    },
    select: {
      id: true,
      label: true,
    },
  });

  if (!category) {
    return;
  }

  await db.budgetCategory.delete({
    where: {
      id: category.id,
    },
  });

  await logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "budget_category_deleted",
    summary: `Removed budget category ${category.label}.`,
    metadata: {
      categoryId: category.id,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/budget`);
}
