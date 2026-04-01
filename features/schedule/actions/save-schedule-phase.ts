"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { logProjectActivity } from "@/server/activity/log";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import {
  schedulePhaseFormSchema,
  type SchedulePhaseFormActionState,
} from "@/features/schedule/schemas/schedule-phase-form";

export async function saveSchedulePhaseAction(
  projectId: string,
  _previousState: SchedulePhaseFormActionState,
  formData: FormData,
): Promise<SchedulePhaseFormActionState> {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);

  if (!project) {
    return {
      error: "Project not found.",
    };
  }

  const result = schedulePhaseFormSchema.safeParse({
    phaseId: formData.get("phaseId") || undefined,
    name: formData.get("name"),
    targetStartDate: formData.get("targetStartDate"),
    targetEndDate: formData.get("targetEndDate"),
    notes: formData.get("notes"),
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    return {
      error: "Fix the highlighted fields and try again.",
      fieldErrors: {
        name: fieldErrors.name?.[0],
        targetStartDate: fieldErrors.targetStartDate?.[0],
        targetEndDate: fieldErrors.targetEndDate?.[0],
        notes: fieldErrors.notes?.[0],
      },
    };
  }

  const phaseId = result.data.phaseId?.trim();
  let savedPhaseId = phaseId ?? "";

  if (phaseId) {
    const existingPhase = await db.schedulePhase.findFirst({
      where: {
        id: phaseId,
        projectId,
      },
      select: {
        id: true,
      },
    });

    if (!existingPhase) {
      return {
        error: "Phase not found.",
      };
    }

    const updatedPhase = await db.schedulePhase.update({
      where: {
        id: phaseId,
      },
      data: {
        name: result.data.name,
        notes: result.data.notes,
        targetStartDate: result.data.targetStartDate,
        targetEndDate: result.data.targetEndDate,
      },
      select: {
        id: true,
      },
    });

    savedPhaseId = updatedPhase.id;
  } else {
    const lastPhase = await db.schedulePhase.findFirst({
      where: {
        projectId,
      },
      orderBy: {
        itemOrder: "desc",
      },
      select: {
        itemOrder: true,
      },
    });

    const createdPhase = await db.schedulePhase.create({
      data: {
        projectId,
        name: result.data.name,
        notes: result.data.notes,
        targetStartDate: result.data.targetStartDate,
        targetEndDate: result.data.targetEndDate,
        itemOrder: (lastPhase?.itemOrder ?? -1) + 1,
      },
      select: {
        id: true,
      },
    });

    savedPhaseId = createdPhase.id;
  }

  await logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "schedule_phase_saved",
    summary: `${phaseId ? "Updated" : "Added"} schedule phase ${result.data.name}.`,
    metadata: {
      phaseId: savedPhaseId,
      isUpdate: Boolean(phaseId),
      targetStartDate: result.data.targetStartDate,
      targetEndDate: result.data.targetEndDate,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/schedule`);

  return {
    success: phaseId ? "Phase updated." : "Phase created.",
  };
}
