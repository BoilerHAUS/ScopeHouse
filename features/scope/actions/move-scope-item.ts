"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { normalizeProjectScopeOrdering } from "@/features/scope/services/normalize-project-scope-ordering";

export async function moveScopeItemAction(projectId: string, formData: FormData) {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);
  const itemId = formData.get("itemId");
  const direction = formData.get("direction");

  if (
    !project ||
    typeof itemId !== "string" ||
    itemId.length === 0 ||
    (direction !== "up" && direction !== "down")
  ) {
    return;
  }

  const currentItem = await db.scopeItem.findFirst({
    where: {
      id: itemId,
      projectId,
    },
    select: {
      id: true,
      phaseName: true,
      areaName: true,
      itemOrder: true,
    },
  });

  if (!currentItem) {
    return;
  }

  const siblings = await db.scopeItem.findMany({
    where: {
      projectId,
      phaseName: currentItem.phaseName,
      areaName: currentItem.areaName,
    },
    orderBy: {
      itemOrder: "asc",
    },
    select: {
      id: true,
      itemOrder: true,
    },
  });

  const currentIndex = siblings.findIndex((item) => item.id === currentItem.id);
  const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || swapIndex < 0 || swapIndex >= siblings.length) {
    return;
  }

  const swapTarget = siblings[swapIndex];

  await db.$transaction(async (tx) => {
    await tx.scopeItem.update({
      where: {
        id: currentItem.id,
      },
      data: {
        itemOrder: swapTarget.itemOrder,
      },
    });

    await tx.scopeItem.update({
      where: {
        id: swapTarget.id,
      },
      data: {
        itemOrder: currentItem.itemOrder,
      },
    });
  });

  await normalizeProjectScopeOrdering(projectId);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/scope`);
}
