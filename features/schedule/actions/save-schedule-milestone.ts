"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import {
  scheduleMilestoneFormSchema,
  type ScheduleMilestoneFormActionState,
} from "@/features/schedule/schemas/schedule-milestone-form";

export async function saveScheduleMilestoneAction(
  projectId: string,
  _previousState: ScheduleMilestoneFormActionState,
  formData: FormData,
): Promise<ScheduleMilestoneFormActionState> {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);

  if (!project) {
    return {
      error: "Project not found.",
    };
  }

  const result = scheduleMilestoneFormSchema.safeParse({
    milestoneId: formData.get("milestoneId") || undefined,
    phaseId: formData.get("phaseId"),
    label: formData.get("label"),
    targetDate: formData.get("targetDate"),
    notes: formData.get("notes"),
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    return {
      error: "Fix the highlighted fields and try again.",
      fieldErrors: {
        label: fieldErrors.label?.[0],
        targetDate: fieldErrors.targetDate?.[0],
        notes: fieldErrors.notes?.[0],
      },
    };
  }

  const phase = await db.schedulePhase.findFirst({
    where: {
      id: result.data.phaseId,
      projectId,
    },
    select: {
      id: true,
    },
  });

  if (!phase) {
    return {
      error: "Phase not found.",
    };
  }

  const milestoneId = result.data.milestoneId?.trim();

  if (milestoneId) {
    const existingMilestone = await db.scheduleMilestone.findFirst({
      where: {
        id: milestoneId,
        projectId,
      },
      select: {
        id: true,
      },
    });

    if (!existingMilestone) {
      return {
        error: "Milestone not found.",
      };
    }

    await db.scheduleMilestone.update({
      where: {
        id: milestoneId,
      },
      data: {
        phaseId: result.data.phaseId,
        label: result.data.label,
        targetDate: result.data.targetDate,
        notes: result.data.notes,
      },
    });
  } else {
    const lastMilestone = await db.scheduleMilestone.findFirst({
      where: {
        projectId,
        phaseId: result.data.phaseId,
      },
      orderBy: {
        itemOrder: "desc",
      },
      select: {
        itemOrder: true,
      },
    });

    await db.scheduleMilestone.create({
      data: {
        projectId,
        phaseId: result.data.phaseId,
        label: result.data.label,
        targetDate: result.data.targetDate,
        notes: result.data.notes,
        itemOrder: (lastMilestone?.itemOrder ?? -1) + 1,
      },
    });
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/schedule`);

  return {
    success: milestoneId ? "Milestone updated." : "Milestone created.",
  };
}
