"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { logProjectActivity } from "@/server/activity/log";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import {
  scheduleMilestoneFormSchema,
  type ScheduleMilestoneFormActionState,
} from "@/features/schedule/schemas/schedule-milestone-form";

type SaveScheduleMilestoneActionDependencies = {
  db: typeof db;
  requireCurrentUser: typeof requireCurrentUser;
  getProjectForUser: typeof getProjectForUser;
  logProjectActivity: typeof logProjectActivity;
  revalidatePath: typeof revalidatePath;
};

const saveScheduleMilestoneActionDependencies: SaveScheduleMilestoneActionDependencies = {
  db,
  requireCurrentUser,
  getProjectForUser,
  logProjectActivity,
  revalidatePath,
};

export async function saveScheduleMilestoneAction(
  projectId: string,
  previousState: ScheduleMilestoneFormActionState,
  formData: FormData,
): Promise<ScheduleMilestoneFormActionState> {
  return saveScheduleMilestoneActionWithDependencies(
    saveScheduleMilestoneActionDependencies,
    projectId,
    previousState,
    formData,
  );
}

export async function saveScheduleMilestoneActionWithDependencies(
  dependencies: SaveScheduleMilestoneActionDependencies,
  projectId: string,
  _previousState: ScheduleMilestoneFormActionState,
  formData: FormData,
): Promise<ScheduleMilestoneFormActionState> {
  const user = await dependencies.requireCurrentUser();
  const project = await dependencies.getProjectForUser(projectId, user.id);

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

  const phase = await dependencies.db.schedulePhase.findFirst({
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
  let savedMilestoneId = milestoneId ?? "";

  if (milestoneId) {
    const existingMilestone = await dependencies.db.scheduleMilestone.findFirst({
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

    const updatedMilestone = await dependencies.db.scheduleMilestone.update({
      where: {
        id: milestoneId,
      },
      data: {
        phaseId: result.data.phaseId,
        label: result.data.label,
        targetDate: result.data.targetDate,
        notes: result.data.notes,
      },
      select: {
        id: true,
      },
    });

    savedMilestoneId = updatedMilestone.id;
  } else {
    const lastMilestone = await dependencies.db.scheduleMilestone.findFirst({
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

    const createdMilestone = await dependencies.db.scheduleMilestone.create({
      data: {
        projectId,
        phaseId: result.data.phaseId,
        label: result.data.label,
        targetDate: result.data.targetDate,
        notes: result.data.notes,
        itemOrder: (lastMilestone?.itemOrder ?? -1) + 1,
      },
      select: {
        id: true,
      },
    });

    savedMilestoneId = createdMilestone.id;
  }

  await dependencies.logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "schedule_milestone_saved",
    summary: `${milestoneId ? "Updated" : "Added"} milestone ${result.data.label}.`,
    metadata: {
      milestoneId: savedMilestoneId,
      phaseId: result.data.phaseId,
      isUpdate: Boolean(milestoneId),
      targetDate: result.data.targetDate,
    },
  });

  dependencies.revalidatePath(`/projects/${projectId}`);
  dependencies.revalidatePath(`/projects/${projectId}/schedule`);

  return {
    success: milestoneId ? "Milestone updated." : "Milestone created.",
  };
}
