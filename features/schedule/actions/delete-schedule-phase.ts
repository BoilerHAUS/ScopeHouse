"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { logProjectActivity } from "@/server/activity/log";
import { getProjectForUser } from "@/features/projects/queries/get-project";

export async function deleteSchedulePhaseAction(projectId: string, formData: FormData) {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);
  const phaseId = String(formData.get("phaseId") ?? "").trim();

  if (!project || !phaseId) {
    return;
  }

  const phase = await db.schedulePhase.findFirst({
    where: {
      id: phaseId,
      projectId,
    },
    select: {
      id: true,
      name: true,
      itemOrder: true,
    },
  });

  if (!phase) {
    return;
  }

  await db.$transaction([
    db.schedulePhase.delete({
      where: {
        id: phase.id,
      },
    }),
    db.schedulePhase.updateMany({
      where: {
        projectId,
        itemOrder: {
          gt: phase.itemOrder,
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
    eventType: "schedule_phase_deleted",
    summary: `Removed schedule phase ${phase.name}.`,
    metadata: {
      phaseId: phase.id,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/schedule`);
}
