"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { logProjectActivity } from "@/server/activity/log";
import { getProjectForUser } from "@/features/projects/queries/get-project";

export async function moveScheduleMilestoneAction(
  projectId: string,
  milestoneId: string,
  direction: "up" | "down",
) {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);

  if (!project) {
    return;
  }

  const currentMilestone = await db.scheduleMilestone.findFirst({
    where: {
      id: milestoneId,
      projectId,
    },
    select: {
      id: true,
      phaseId: true,
      label: true,
      itemOrder: true,
    },
  });

  if (!currentMilestone) {
    return;
  }

  const adjacentMilestone = await db.scheduleMilestone.findFirst({
    where: {
      projectId,
      phaseId: currentMilestone.phaseId,
      itemOrder:
        direction === "up"
          ? {
              lt: currentMilestone.itemOrder,
            }
          : {
              gt: currentMilestone.itemOrder,
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

  if (!adjacentMilestone) {
    return;
  }

  await db.$transaction([
    db.scheduleMilestone.update({
      where: {
        id: currentMilestone.id,
      },
      data: {
        itemOrder: adjacentMilestone.itemOrder,
      },
    }),
    db.scheduleMilestone.update({
      where: {
        id: adjacentMilestone.id,
      },
      data: {
        itemOrder: currentMilestone.itemOrder,
      },
    }),
  ]);

  await logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "schedule_milestone_reordered",
    summary: `Moved milestone ${currentMilestone.label} ${direction}.`,
    metadata: {
      milestoneId: currentMilestone.id,
      phaseId: currentMilestone.phaseId,
      direction,
      adjacentMilestoneId: adjacentMilestone.id,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/schedule`);
}
