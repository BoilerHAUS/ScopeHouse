"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { db } from "@/server/db/client";
import { deleteProjectFile } from "@/server/storage/project-files";

type DeleteProjectDocumentActionDependencies = {
  db: typeof db;
  requireCurrentUser: typeof requireCurrentUser;
  getProjectForUser: typeof getProjectForUser;
  deleteProjectFile: typeof deleteProjectFile;
  revalidatePath: typeof revalidatePath;
};

const deleteProjectDocumentActionDependencies: DeleteProjectDocumentActionDependencies = {
  db,
  requireCurrentUser,
  getProjectForUser,
  deleteProjectFile,
  revalidatePath,
};

export async function deleteProjectDocumentAction(
  projectId: string,
  formData: FormData,
) {
  return deleteProjectDocumentActionWithDependencies(
    deleteProjectDocumentActionDependencies,
    projectId,
    formData,
  );
}

export async function deleteProjectDocumentActionWithDependencies(
  dependencies: DeleteProjectDocumentActionDependencies,
  projectId: string,
  formData: FormData,
) {
  const user = await dependencies.requireCurrentUser();
  const project = await dependencies.getProjectForUser(projectId, user.id);
  const documentId = formData.get("documentId");

  if (!project || typeof documentId !== "string" || documentId.length === 0) {
    return;
  }

  const document = await dependencies.db.projectDocument.findFirst({
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

  await dependencies.deleteProjectFile(document.storageKey);

  await dependencies.db.projectDocument.delete({
    where: {
      id: document.id,
    },
  });

  dependencies.revalidatePath(`/projects/${projectId}`);
  dependencies.revalidatePath(`/projects/${projectId}/documents`);
}
