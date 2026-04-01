"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { logProjectActivity } from "@/server/activity/log";
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
    select: { id: true, title: true, status: true },
  });

  if (!existing) {
    return;
  }

  await db.changeOrder.delete({
    where: { id: changeOrderId },
  });

  await logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "change_order_deleted",
    summary: `Removed change order ${existing.title}.`,
    metadata: {
      changeOrderId: existing.id,
      status: existing.status,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/change-orders`);
  revalidatePath(`/projects/${projectId}/export`);
}
