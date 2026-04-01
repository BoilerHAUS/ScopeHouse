"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
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

  await db.budgetCategory.deleteMany({
    where: {
      id: categoryId,
      projectId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/budget`);
}
