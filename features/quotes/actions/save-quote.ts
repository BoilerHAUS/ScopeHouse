"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { logProjectActivity } from "@/server/activity/log";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import {
  quoteFormSchema,
  type QuoteFormActionState,
} from "@/features/quotes/schemas/quote-form";

type SaveQuoteActionDependencies = {
  db: typeof db;
  requireCurrentUser: typeof requireCurrentUser;
  getProjectForUser: typeof getProjectForUser;
  logProjectActivity: typeof logProjectActivity;
  revalidatePath: typeof revalidatePath;
};

const saveQuoteActionDependencies: SaveQuoteActionDependencies = {
  db,
  requireCurrentUser,
  getProjectForUser,
  logProjectActivity,
  revalidatePath,
};

export async function saveQuoteAction(
  projectId: string,
  previousState: QuoteFormActionState,
  formData: FormData,
): Promise<QuoteFormActionState> {
  return saveQuoteActionWithDependencies(
    saveQuoteActionDependencies,
    projectId,
    previousState,
    formData,
  );
}

export async function saveQuoteActionWithDependencies(
  dependencies: SaveQuoteActionDependencies,
  projectId: string,
  _previousState: QuoteFormActionState,
  formData: FormData,
): Promise<QuoteFormActionState> {
  const user = await dependencies.requireCurrentUser();
  const project = await dependencies.getProjectForUser(projectId, user.id);

  if (!project) {
    return { error: "Project not found." };
  }

  const result = quoteFormSchema.safeParse({
    quoteId: formData.get("quoteId") || undefined,
    contractor: formData.get("contractor"),
    amount: formData.get("amount"),
    scopeReference: formData.get("scopeReference"),
    notes: formData.get("notes"),
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;

    return {
      error: "Fix the highlighted fields and try again.",
      fieldErrors: {
        contractor: fieldErrors.contractor?.[0],
        amount: fieldErrors.amount?.[0],
        scopeReference: fieldErrors.scopeReference?.[0],
        notes: fieldErrors.notes?.[0],
      },
    };
  }

  const quoteId = result.data.quoteId?.trim();
  let savedQuoteId = quoteId ?? "";
  const actionLabel = quoteId ? "Updated" : "Added";

  if (quoteId) {
    const existing = await dependencies.db.quote.findFirst({
      where: { id: quoteId, projectId },
      select: { id: true },
    });

    if (!existing) {
      return { error: "Quote not found." };
    }

    const updated = await dependencies.db.quote.update({
      where: { id: quoteId },
      data: {
        contractor: result.data.contractor,
        amountCents: result.data.amount,
        scopeReference: result.data.scopeReference,
        notes: result.data.notes,
      },
      select: { id: true },
    });

    savedQuoteId = updated.id;
  } else {
    const lastQuote = await dependencies.db.quote.findFirst({
      where: { projectId },
      orderBy: { itemOrder: "desc" },
      select: { itemOrder: true },
    });

    const created = await dependencies.db.quote.create({
      data: {
        projectId,
        contractor: result.data.contractor,
        amountCents: result.data.amount,
        scopeReference: result.data.scopeReference,
        notes: result.data.notes,
        itemOrder: (lastQuote?.itemOrder ?? -1) + 1,
      },
      select: { id: true },
    });

    savedQuoteId = created.id;
  }

  await dependencies.logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "quote_saved",
    summary: `${actionLabel} quote from ${result.data.contractor}.`,
    metadata: {
      quoteId: savedQuoteId,
      isUpdate: Boolean(quoteId),
      contractor: result.data.contractor,
    },
  });

  dependencies.revalidatePath(`/projects/${projectId}`);
  dependencies.revalidatePath(`/projects/${projectId}/quotes`);

  return {
    success: quoteId ? "Quote updated." : "Quote added.",
  };
}
