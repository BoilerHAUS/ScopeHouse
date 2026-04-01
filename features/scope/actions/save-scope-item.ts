"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { normalizeProjectScopeOrdering } from "@/features/scope/services/normalize-project-scope-ordering";
import {
  scopeItemFormSchema,
  type ScopeItemFormActionState,
} from "@/features/scope/schemas/scope-item-form";

export async function saveScopeItemAction(
  projectId: string,
  _previousState: ScopeItemFormActionState,
  formData: FormData,
): Promise<ScopeItemFormActionState> {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);

  if (!project) {
    return {
      error: "Project not found.",
    };
  }

  const result = scopeItemFormSchema.safeParse({
    itemId: formData.get("itemId") || undefined,
    phaseName: formData.get("phaseName"),
    areaName: formData.get("areaName"),
    label: formData.get("label"),
    notes: formData.get("notes"),
    status: formData.get("status"),
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    return {
      error: "Fix the highlighted fields and try again.",
      fieldErrors: {
        phaseName: fieldErrors.phaseName?.[0],
        areaName: fieldErrors.areaName?.[0],
        label: fieldErrors.label?.[0],
        notes: fieldErrors.notes?.[0],
        status: fieldErrors.status?.[0],
      },
    };
  }

  const itemId = result.data.itemId?.trim();

  if (itemId) {
    const existingItem = await db.scopeItem.findFirst({
      where: {
        id: itemId,
        projectId,
      },
      select: {
        id: true,
      },
    });

    if (!existingItem) {
      return {
        error: "Scope item not found.",
      };
    }

    await db.scopeItem.update({
      where: {
        id: itemId,
      },
      data: {
        phaseName: result.data.phaseName,
        areaName: result.data.areaName,
        label: result.data.label,
        notes: result.data.notes,
        status: result.data.status,
      },
    });
  } else {
    const lastItem = await db.scopeItem.findFirst({
      where: {
        projectId,
      },
      orderBy: [{ phaseOrder: "desc" }, { areaOrder: "desc" }, { itemOrder: "desc" }],
      select: {
        phaseOrder: true,
        areaOrder: true,
        itemOrder: true,
      },
    });

    await db.scopeItem.create({
      data: {
        projectId,
        phaseName: result.data.phaseName,
        areaName: result.data.areaName,
        label: result.data.label,
        notes: result.data.notes,
        status: result.data.status,
        source: "manual",
        phaseOrder: lastItem?.phaseOrder ?? 0,
        areaOrder: lastItem?.areaOrder ?? 0,
        itemOrder: (lastItem?.itemOrder ?? -1) + 1,
      },
    });
  }

  await normalizeProjectScopeOrdering(projectId);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/scope`);

  return {
    success: itemId ? "Scope item updated." : "Scope item added.",
  };
}
