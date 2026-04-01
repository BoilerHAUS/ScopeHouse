"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import {
  changeOrderFormSchema,
  type ChangeOrderFormActionState,
} from "@/features/change-orders/schemas/change-order-form";

type SaveChangeOrderActionDependencies = {
  db: typeof db;
  requireCurrentUser: typeof requireCurrentUser;
  getProjectForUser: typeof getProjectForUser;
  revalidatePath: typeof revalidatePath;
};

const saveChangeOrderActionDependencies: SaveChangeOrderActionDependencies = {
  db,
  requireCurrentUser,
  getProjectForUser,
  revalidatePath,
};

export async function saveChangeOrderAction(
  projectId: string,
  previousState: ChangeOrderFormActionState,
  formData: FormData,
): Promise<ChangeOrderFormActionState> {
  return saveChangeOrderActionWithDependencies(
    saveChangeOrderActionDependencies,
    projectId,
    previousState,
    formData,
  );
}

export async function saveChangeOrderActionWithDependencies(
  dependencies: SaveChangeOrderActionDependencies,
  projectId: string,
  _previousState: ChangeOrderFormActionState,
  formData: FormData,
): Promise<ChangeOrderFormActionState> {
  const user = await dependencies.requireCurrentUser();
  const project = await dependencies.getProjectForUser(projectId, user.id);

  if (!project) {
    return { error: "Project not found." };
  }

  const result = changeOrderFormSchema.safeParse({
    changeOrderId: formData.get("changeOrderId") || undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    requestedAt: formData.get("requestedAt"),
    impactSummary: formData.get("impactSummary"),
    budgetReference: formData.get("budgetReference"),
    scheduleReference: formData.get("scheduleReference"),
    notes: formData.get("notes"),
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    return {
      error: "Fix the highlighted fields and try again.",
      fieldErrors: {
        title: fieldErrors.title?.[0],
        description: fieldErrors.description?.[0],
        status: fieldErrors.status?.[0],
        requestedAt: fieldErrors.requestedAt?.[0],
        impactSummary: fieldErrors.impactSummary?.[0],
        budgetReference: fieldErrors.budgetReference?.[0],
        scheduleReference: fieldErrors.scheduleReference?.[0],
        notes: fieldErrors.notes?.[0],
      },
    };
  }

  const changeOrderId = result.data.changeOrderId?.trim();

  if (changeOrderId) {
    const existing = await dependencies.db.changeOrder.findFirst({
      where: {
        id: changeOrderId,
        projectId,
      },
      select: { id: true },
    });

    if (!existing) {
      return { error: "Change order not found." };
    }

    await dependencies.db.changeOrder.update({
      where: { id: changeOrderId },
      data: {
        title: result.data.title,
        description: result.data.description,
        status: result.data.status,
        requestedAt: new Date(`${result.data.requestedAt}T12:00:00.000Z`),
        impactSummary: result.data.impactSummary,
        budgetReference: result.data.budgetReference,
        scheduleReference: result.data.scheduleReference,
        notes: result.data.notes,
      },
    });
  } else {
    await dependencies.db.changeOrder.create({
      data: {
        projectId,
        title: result.data.title,
        description: result.data.description,
        status: result.data.status,
        requestedAt: new Date(`${result.data.requestedAt}T12:00:00.000Z`),
        impactSummary: result.data.impactSummary,
        budgetReference: result.data.budgetReference,
        scheduleReference: result.data.scheduleReference,
        notes: result.data.notes,
      },
    });
  }

  dependencies.revalidatePath(`/projects/${projectId}`);
  dependencies.revalidatePath(`/projects/${projectId}/change-orders`);
  dependencies.revalidatePath(`/projects/${projectId}/export`);

  return {
    success: changeOrderId ? "Change order updated." : "Change order created.",
  };
}
