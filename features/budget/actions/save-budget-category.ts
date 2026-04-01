"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { logProjectActivity } from "@/server/activity/log";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import {
  budgetCategoryFormSchema,
  type BudgetCategoryActionState,
} from "@/features/budget/schemas/budget-category-form";

export async function saveBudgetCategoryAction(
  projectId: string,
  _previousState: BudgetCategoryActionState,
  formData: FormData,
): Promise<BudgetCategoryActionState> {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);

  if (!project) {
    return { error: "Project not found." };
  }

  const result = budgetCategoryFormSchema.safeParse({
    categoryId: formData.get("categoryId") || undefined,
    label: formData.get("label"),
    notes: formData.get("notes"),
    status: formData.get("status"),
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    return {
      error: "Fix the highlighted fields and try again.",
      fieldErrors: {
        label: fieldErrors.label?.[0],
        notes: fieldErrors.notes?.[0],
        status: fieldErrors.status?.[0],
      },
    };
  }

  const categoryId = result.data.categoryId?.trim();
  let savedCategoryId = categoryId ?? "";

  if (categoryId) {
    const existingCategory = await db.budgetCategory.findFirst({
      where: {
        id: categoryId,
        projectId,
      },
      select: {
        id: true,
      },
    });

    if (!existingCategory) {
      return { error: "Budget category not found." };
    }

    const updatedCategory = await db.budgetCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        label: result.data.label,
        notes: result.data.notes,
        status: result.data.status,
      },
      select: {
        id: true,
      },
    });

    savedCategoryId = updatedCategory.id;
  } else {
    const lastCategory = await db.budgetCategory.findFirst({
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

    const createdCategory = await db.budgetCategory.create({
      data: {
        projectId,
        label: result.data.label,
        notes: result.data.notes,
        status: result.data.status,
        itemOrder: (lastCategory?.itemOrder ?? -1) + 1,
      },
      select: {
        id: true,
      },
    });

    savedCategoryId = createdCategory.id;
  }

  await logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "budget_category_saved",
    summary: `${categoryId ? "Updated" : "Added"} budget category ${result.data.label}.`,
    metadata: {
      categoryId: savedCategoryId,
      isUpdate: Boolean(categoryId),
      status: result.data.status,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/budget`);

  return {
    success: categoryId ? "Category updated." : "Category created.",
  };
}
