"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { getProjectForUser } from "@/features/projects/queries/get-project";

export async function deleteChangeOrderAction(projectId: string, formData: FormData) {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);
  const changeOrderId = String(formData.get("changeOrderId") ?? "").trim();

  if (!project || !changeOrderId) {
    return;
  }

  const existing = await db.changeOrder.findFirst({
    where: {
      id: changeOrderId,
      projectId,
    },
    select: { id: true },
  });

  if (!existing) {
    return;
  }

  await db.changeOrder.delete({
    where: { id: changeOrderId },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/change-orders`);
  revalidatePath(`/projects/${projectId}/export`);
}
