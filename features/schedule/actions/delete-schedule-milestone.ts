"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { logProjectActivity } from "@/server/activity/log";
import { getProjectForUser } from "@/features/projects/queries/get-project";

export async function deleteScheduleMilestoneAction(
  projectId: string,
  formData: FormData,
) {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);
  const milestoneId = String(formData.get("milestoneId") ?? "").trim();

  if (!project || !milestoneId) {
    return;
  }

  const milestone = await db.scheduleMilestone.findFirst({
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

  if (!milestone) {
    return;
  }

  await db.$transaction([
    db.scheduleMilestone.delete({
      where: {
        id: milestone.id,
      },
    }),
    db.scheduleMilestone.updateMany({
      where: {
        projectId,
        phaseId: milestone.phaseId,
        itemOrder: {
          gt: milestone.itemOrder,
        },
      },
      data: {
        itemOrder: {
          decrement: 1,
        },
      },
    }),
  ]);

  await logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "schedule_milestone_deleted",
    summary: `Removed milestone ${milestone.label}.`,
    metadata: {
      milestoneId: milestone.id,
      phaseId: milestone.phaseId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/schedule`);
}
