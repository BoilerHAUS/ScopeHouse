"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { db } from "@/server/db/client";
import { deleteProjectFile } from "@/server/storage/project-files";

export async function deleteProjectDocumentAction(
  projectId: string,
  formData: FormData,
) {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);
  const documentId = formData.get("documentId");

  if (!project || typeof documentId !== "string" || documentId.length === 0) {
    return;
  }

  const document = await db.projectDocument.findFirst({
    where: {
      id: documentId,
      projectId,
    },
    select: {
      id: true,
      storageKey: true,
    },
  });

  if (!document) {
    return;
  }

  await deleteProjectFile(document.storageKey);

  await db.projectDocument.delete({
    where: {
      id: document.id,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/documents`);
}
