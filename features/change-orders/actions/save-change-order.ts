"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { logProjectActivity } from "@/server/activity/log";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import {
  changeOrderFormSchema,
  type ChangeOrderFormActionState,
} from "@/features/change-orders/schemas/change-order-form";

type SaveChangeOrderActionDependencies = {
  db: typeof db;
  requireCurrentUser: typeof requireCurrentUser;
  getProjectForUser: typeof getProjectForUser;
  logProjectActivity: typeof logProjectActivity;
  revalidatePath: typeof revalidatePath;
};

const saveChangeOrderActionDependencies: SaveChangeOrderActionDependencies = {
  db,
  requireCurrentUser,
  getProjectForUser,
  logProjectActivity,
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
    scopeItemId: formData.get("scopeItemId") || undefined,
    budgetLineId: formData.get("budgetLineId") || undefined,
    scheduleMilestoneId: formData.get("scheduleMilestoneId") || undefined,
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
        scopeItemId: fieldErrors.scopeItemId?.[0],
        budgetLineId: fieldErrors.budgetLineId?.[0],
        scheduleMilestoneId: fieldErrors.scheduleMilestoneId?.[0],
        notes: fieldErrors.notes?.[0],
      },
    };
  }

  const changeOrderId = result.data.changeOrderId?.trim();
  let savedChangeOrderId = changeOrderId ?? "";

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

    const updatedChangeOrder = await dependencies.db.changeOrder.update({
      where: { id: changeOrderId },
      data: {
        title: result.data.title,
        description: result.data.description,
        status: result.data.status,
        requestedAt: new Date(`${result.data.requestedAt}T12:00:00.000Z`),
        impactSummary: result.data.impactSummary,
        budgetReference: result.data.budgetReference,
        scheduleReference: result.data.scheduleReference,
        scopeItemId: result.data.scopeItemId,
        budgetLineId: result.data.budgetLineId,
        scheduleMilestoneId: result.data.scheduleMilestoneId,
        notes: result.data.notes,
      },
      select: {
        id: true,
      },
    });

    savedChangeOrderId = updatedChangeOrder.id;
  } else {
    const createdChangeOrder = await dependencies.db.changeOrder.create({
      data: {
        projectId,
        title: result.data.title,
        description: result.data.description,
        status: result.data.status,
        requestedAt: new Date(`${result.data.requestedAt}T12:00:00.000Z`),
        impactSummary: result.data.impactSummary,
        budgetReference: result.data.budgetReference,
        scheduleReference: result.data.scheduleReference,
        scopeItemId: result.data.scopeItemId,
        budgetLineId: result.data.budgetLineId,
        scheduleMilestoneId: result.data.scheduleMilestoneId,
        notes: result.data.notes,
      },
      select: {
        id: true,
      },
    });

    savedChangeOrderId = createdChangeOrder.id;
  }

  await dependencies.logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "change_order_saved",
    summary: `${changeOrderId ? "Updated" : "Recorded"} change order ${result.data.title}.`,
    metadata: {
      changeOrderId: savedChangeOrderId,
      isUpdate: Boolean(changeOrderId),
      status: result.data.status,
    },
  });

  dependencies.revalidatePath(`/projects/${projectId}`);
  dependencies.revalidatePath(`/projects/${projectId}/change-orders`);
  dependencies.revalidatePath(`/projects/${projectId}/export`);

  return {
    success: changeOrderId ? "Change order updated." : "Change order created.",
  };
}
