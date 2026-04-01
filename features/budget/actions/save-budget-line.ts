"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { logProjectActivity } from "@/server/activity/log";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import {
  budgetLineFormSchema,
  type BudgetLineActionState,
} from "@/features/budget/schemas/budget-line-form";

type SaveBudgetLineActionDependencies = {
  db: typeof db;
  requireCurrentUser: typeof requireCurrentUser;
  getProjectForUser: typeof getProjectForUser;
  logProjectActivity: typeof logProjectActivity;
  revalidatePath: typeof revalidatePath;
};

const saveBudgetLineActionDependencies: SaveBudgetLineActionDependencies = {
  db,
  requireCurrentUser,
  getProjectForUser,
  logProjectActivity,
  revalidatePath,
};

export async function saveBudgetLineAction(
  projectId: string,
  previousState: BudgetLineActionState,
  formData: FormData,
): Promise<BudgetLineActionState> {
  return saveBudgetLineActionWithDependencies(
    saveBudgetLineActionDependencies,
    projectId,
    previousState,
    formData,
  );
}

export async function saveBudgetLineActionWithDependencies(
  dependencies: SaveBudgetLineActionDependencies,
  projectId: string,
  _previousState: BudgetLineActionState,
  formData: FormData,
): Promise<BudgetLineActionState> {
  const user = await dependencies.requireCurrentUser();
  const project = await dependencies.getProjectForUser(projectId, user.id);

  if (!project) {
    return { error: "Project not found." };
  }

  const result = budgetLineFormSchema.safeParse({
    lineId: formData.get("lineId") || undefined,
    categoryId: formData.get("categoryId"),
    label: formData.get("label"),
    estimate: formData.get("estimate"),
    allowance: formData.get("allowance"),
    quoted: formData.get("quoted"),
    actual: formData.get("actual"),
    sourceReference: formData.get("sourceReference"),
    notes: formData.get("notes"),
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    return {
      error: "Fix the highlighted fields and try again.",
      fieldErrors: {
        categoryId: fieldErrors.categoryId?.[0],
        label: fieldErrors.label?.[0],
        estimate: fieldErrors.estimate?.[0],
        allowance: fieldErrors.allowance?.[0],
        quoted: fieldErrors.quoted?.[0],
        actual: fieldErrors.actual?.[0],
        sourceReference: fieldErrors.sourceReference?.[0],
        notes: fieldErrors.notes?.[0],
      },
    };
  }

  const category = await dependencies.db.budgetCategory.findFirst({
    where: {
      id: result.data.categoryId,
      projectId,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    return {
      error: "Choose a valid project budget category.",
    };
  }

  const lineId = result.data.lineId?.trim();
  let savedLineId = lineId ?? "";
  const actionLabel = lineId ? "Updated" : "Added";

  if (lineId) {
    const existingLine = await dependencies.db.budgetLine.findFirst({
      where: {
        id: lineId,
        projectId,
      },
      select: {
        id: true,
      },
    });

    if (!existingLine) {
      return { error: "Budget line not found." };
    }

    const updatedLine = await dependencies.db.budgetLine.update({
      where: {
        id: lineId,
      },
      data: {
        categoryId: result.data.categoryId,
        label: result.data.label,
        estimateCents: result.data.estimate,
        allowanceCents: result.data.allowance,
        quotedCents: result.data.quoted,
        actualCents: result.data.actual,
        sourceReference: result.data.sourceReference,
        notes: result.data.notes,
      },
      select: {
        id: true,
      },
    });

    savedLineId = updatedLine.id;
  } else {
    const lastLine = await dependencies.db.budgetLine.findFirst({
      where: {
        projectId,
        categoryId: result.data.categoryId,
      },
      orderBy: {
        itemOrder: "desc",
      },
      select: {
        itemOrder: true,
      },
    });

    const createdLine = await dependencies.db.budgetLine.create({
      data: {
        projectId,
        categoryId: result.data.categoryId,
        label: result.data.label,
        estimateCents: result.data.estimate,
        allowanceCents: result.data.allowance,
        quotedCents: result.data.quoted,
        actualCents: result.data.actual,
        sourceReference: result.data.sourceReference,
        notes: result.data.notes,
        itemOrder: (lastLine?.itemOrder ?? -1) + 1,
      },
      select: {
        id: true,
      },
    });

    savedLineId = createdLine.id;
  }

  await dependencies.logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "budget_line_saved",
    summary: `${actionLabel} budget line ${result.data.label}.`,
    metadata: {
      lineId: savedLineId,
      categoryId: result.data.categoryId,
      isUpdate: Boolean(lineId),
    },
  });

  dependencies.revalidatePath(`/projects/${projectId}`);
  dependencies.revalidatePath(`/projects/${projectId}/budget`);

  return {
    success: lineId ? "Line updated." : "Line created.",
  };
}
