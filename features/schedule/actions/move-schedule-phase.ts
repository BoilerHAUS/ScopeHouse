"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";

export async function moveSchedulePhaseAction(
  projectId: string,
  phaseId: string,
  direction: "up" | "down",
) {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);

  if (!project) {
    return;
  }

  const currentPhase = await db.schedulePhase.findFirst({
    where: {
      id: phaseId,
      projectId,
    },
    select: {
      id: true,
      itemOrder: true,
    },
  });

  if (!currentPhase) {
    return;
  }

  const adjacentPhase = await db.schedulePhase.findFirst({
    where: {
      projectId,
      itemOrder:
        direction === "up"
          ? {
              lt: currentPhase.itemOrder,
            }
          : {
              gt: currentPhase.itemOrder,
            },
    },
    orderBy: {
      itemOrder: direction === "up" ? "desc" : "asc",
    },
    select: {
      id: true,
      itemOrder: true,
    },
  });

  if (!adjacentPhase) {
    return;
  }

  await db.$transaction([
    db.schedulePhase.update({
      where: {
        id: currentPhase.id,
      },
      data: {
        itemOrder: adjacentPhase.itemOrder,
      },
    }),
    db.schedulePhase.update({
      where: {
        id: adjacentPhase.id,
      },
      data: {
        itemOrder: currentPhase.itemOrder,
      },
    }),
  ]);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/schedule`);
}
