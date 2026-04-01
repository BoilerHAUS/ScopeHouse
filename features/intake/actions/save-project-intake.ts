"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import {
  saveProjectIntakeSchema,
  type ProjectIntakeFormValues,
  type SaveProjectIntakeActionState,
} from "@/features/intake/schemas/project-intake";

function isComplete(values: {
  renovationType: string | null | undefined;
  rooms: string[];
  goals: string | null | undefined;
  priorities: string[];
  timingExpectation: string | null | undefined;
  budgetRange: string | null | undefined;
  constraints: string[];
  contractorInvolvement: string | null | undefined;
}) {
  return Boolean(
    values.renovationType &&
      values.rooms.length > 0 &&
      values.goals &&
      values.priorities.length > 0 &&
      values.timingExpectation &&
      values.budgetRange &&
      values.constraints.length > 0 &&
      values.contractorInvolvement,
  );
}

export async function saveProjectIntakeAction(
  projectId: string,
  _previousState: SaveProjectIntakeActionState,
  formData: FormData,
): Promise<SaveProjectIntakeActionState> {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);

  if (!project) {
    return {
      error: "Project not found.",
    };
  }

  const result = saveProjectIntakeSchema.safeParse({
    intent: formData.get("intent"),
    renovationType: formData.get("renovationType") || null,
    roomsRaw: formData.get("roomsRaw"),
    goals: formData.get("goals"),
    prioritiesRaw: formData.get("prioritiesRaw"),
    timingExpectation: formData.get("timingExpectation"),
    budgetRange: formData.get("budgetRange") || null,
    constraintsRaw: formData.get("constraintsRaw"),
    contractorInvolvement: formData.get("contractorInvolvement") || null,
    notes: formData.get("notes"),
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    return {
      error: "Fix the highlighted fields and try again.",
      fieldErrors: {
        renovationType: fieldErrors.renovationType?.[0],
        roomsRaw: fieldErrors.roomsRaw?.[0],
        goals: fieldErrors.goals?.[0],
        prioritiesRaw: fieldErrors.prioritiesRaw?.[0],
        timingExpectation: fieldErrors.timingExpectation?.[0],
        budgetRange: fieldErrors.budgetRange?.[0],
        constraintsRaw: fieldErrors.constraintsRaw?.[0],
        contractorInvolvement: fieldErrors.contractorInvolvement?.[0],
        notes: fieldErrors.notes?.[0],
      } satisfies Partial<Record<keyof ProjectIntakeFormValues, string>>,
    };
  }

  const normalizedBudgetRange =
    result.data.budgetRange && result.data.budgetRange.length > 0
      ? result.data.budgetRange
      : null;

  const intakeValues = {
    renovationType: result.data.renovationType ?? null,
    rooms: result.data.roomsRaw,
    goals: result.data.goals,
    priorities: result.data.prioritiesRaw,
    timingExpectation: result.data.timingExpectation,
    budgetRange: normalizedBudgetRange,
    constraints: result.data.constraintsRaw,
    contractorInvolvement: result.data.contractorInvolvement ?? null,
    notes: result.data.notes,
  };

  const nextCompletedAt = isComplete(intakeValues) ? new Date() : null;

  if (result.data.intent === "complete" && !nextCompletedAt) {
    return {
      error:
        "Complete intake needs the renovation type, rooms, goals, priorities, budget range, timing, constraints, and contractor setup filled in.",
    };
  }

  const existingIntake = await db.projectIntake.findUnique({
    where: {
      projectId,
    },
    select: {
      id: true,
      completedAt: true,
    },
  });

  await db.$transaction(async (tx) => {
    await tx.projectIntake.upsert({
      where: {
        projectId,
      },
      update: {
        renovationType: intakeValues.renovationType,
        rooms: intakeValues.rooms,
        goals: intakeValues.goals,
        priorities: intakeValues.priorities,
        timingExpectation: intakeValues.timingExpectation,
        budgetRange: intakeValues.budgetRange,
        constraints: intakeValues.constraints,
        contractorInvolvement: intakeValues.contractorInvolvement,
        notes: intakeValues.notes,
        completedAt: result.data.intent === "complete" ? nextCompletedAt : null,
      },
      create: {
        projectId,
        renovationType: intakeValues.renovationType,
        rooms: intakeValues.rooms,
        goals: intakeValues.goals,
        priorities: intakeValues.priorities,
        timingExpectation: intakeValues.timingExpectation,
        budgetRange: intakeValues.budgetRange,
        constraints: intakeValues.constraints,
        contractorInvolvement: intakeValues.contractorInvolvement,
        notes: intakeValues.notes,
        completedAt: result.data.intent === "complete" ? nextCompletedAt : null,
      },
    });

    await tx.project.update({
      where: {
        id: projectId,
      },
      data: {
        projectType: intakeValues.renovationType ?? project.projectType,
        goals: intakeValues.goals ?? project.goals,
        status: project.status === "draft" ? "intake" : project.status,
      },
    });

    const wasStarted = Boolean(existingIntake);
    const isNowComplete =
      result.data.intent === "complete" && Boolean(nextCompletedAt);

    if (!wasStarted) {
      await tx.activityLog.create({
        data: {
          projectId,
          workspaceId: project.workspaceId,
          actorId: user.id,
          eventType: "intake_started",
          summary: "Started guided intake.",
        },
      });
    }

    await tx.activityLog.create({
      data: {
        projectId,
        workspaceId: project.workspaceId,
        actorId: user.id,
        eventType: isNowComplete ? "intake_completed" : "intake_saved",
        summary: isNowComplete
          ? "Completed guided intake."
          : "Saved guided intake progress.",
        metadata: {
          completed: isNowComplete,
          stepData: {
            roomsCount: intakeValues.rooms.length,
            prioritiesCount: intakeValues.priorities.length,
            constraintsCount: intakeValues.constraints.length,
          },
        },
      },
    });
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/intake`);

  return {
    success:
      result.data.intent === "complete" && nextCompletedAt
        ? "Intake marked complete. You can now move into scope drafting."
        : "Intake progress saved.",
  };
}
