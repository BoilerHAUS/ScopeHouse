"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db/client";
import { requireCurrentUser } from "@/server/auth/session";
import { logProjectActivity } from "@/server/activity/log";
import { getProjectForUser } from "@/features/projects/queries/get-project";

type DeleteQuoteActionDependencies = {
  db: typeof db;
  requireCurrentUser: typeof requireCurrentUser;
  getProjectForUser: typeof getProjectForUser;
  logProjectActivity: typeof logProjectActivity;
  revalidatePath: typeof revalidatePath;
};

const deleteQuoteActionDependencies: DeleteQuoteActionDependencies = {
  db,
  requireCurrentUser,
  getProjectForUser,
  logProjectActivity,
  revalidatePath,
};

export async function deleteQuoteAction(projectId: string, formData: FormData) {
  return deleteQuoteActionWithDependencies(
    deleteQuoteActionDependencies,
    projectId,
    formData,
  );
}

export async function deleteQuoteActionWithDependencies(
  dependencies: DeleteQuoteActionDependencies,
  projectId: string,
  formData: FormData,
) {
  const user = await dependencies.requireCurrentUser();
  const project = await dependencies.getProjectForUser(projectId, user.id);
  const quoteId = formData.get("quoteId");

  if (!project || typeof quoteId !== "string" || quoteId.length === 0) {
    return;
  }

  const quote = await dependencies.db.quote.findFirst({
    where: { id: quoteId, projectId },
    select: { id: true, contractor: true },
  });

  if (!quote) {
    return;
  }

  await dependencies.db.quote.delete({ where: { id: quote.id } });

  await dependencies.logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "quote_deleted",
    summary: `Removed quote from ${quote.contractor}.`,
    metadata: { quoteId: quote.id, contractor: quote.contractor },
  });

  dependencies.revalidatePath(`/projects/${projectId}`);
  dependencies.revalidatePath(`/projects/${projectId}/quotes`);
}
