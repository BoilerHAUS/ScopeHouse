"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { normalizeProjectScopeOrdering } from "@/features/scope/services/normalize-project-scope-ordering";

export async function deleteScopeItemAction(projectId: string, formData: FormData) {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);
  const itemId = formData.get("itemId");

  if (!project || typeof itemId !== "string" || itemId.length === 0) {
    return;
  }

  await db.scopeItem.deleteMany({
    where: {
      id: itemId,
      projectId,
    },
  });

  await normalizeProjectScopeOrdering(projectId);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/scope`);
}
