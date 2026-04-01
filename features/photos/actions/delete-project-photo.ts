"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { db } from "@/server/db/client";
import { logProjectActivity } from "@/server/activity/log";
import { deleteProjectFile } from "@/server/storage/project-files";

type DeleteProjectPhotoActionDependencies = {
  db: typeof db;
  requireCurrentUser: typeof requireCurrentUser;
  getProjectForUser: typeof getProjectForUser;
  deleteProjectFile: typeof deleteProjectFile;
  logProjectActivity: typeof logProjectActivity;
  revalidatePath: typeof revalidatePath;
};

const deleteProjectPhotoActionDependencies: DeleteProjectPhotoActionDependencies = {
  db,
  requireCurrentUser,
  getProjectForUser,
  deleteProjectFile,
  logProjectActivity,
  revalidatePath,
};

export async function deleteProjectPhotoAction(
  projectId: string,
  formData: FormData,
) {
  return deleteProjectPhotoActionWithDependencies(
    deleteProjectPhotoActionDependencies,
    projectId,
    formData,
  );
}

export async function deleteProjectPhotoActionWithDependencies(
  dependencies: DeleteProjectPhotoActionDependencies,
  projectId: string,
  formData: FormData,
) {
  const user = await dependencies.requireCurrentUser();
  const project = await dependencies.getProjectForUser(projectId, user.id);
  const photoId = formData.get("photoId");

  if (!project || typeof photoId !== "string" || photoId.length === 0) {
    return;
  }

  const photo = await dependencies.db.projectPhoto.findFirst({
    where: {
      id: photoId,
      projectId,
    },
    select: {
      id: true,
      originalName: true,
      caption: true,
      storageKey: true,
    },
  });

  if (!photo) {
    return;
  }

  await dependencies.deleteProjectFile(photo.storageKey);

  await dependencies.db.projectPhoto.delete({
    where: {
      id: photo.id,
    },
  });

  await dependencies.logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "photo_deleted",
    summary: `Removed photo ${photo.caption ?? photo.originalName}.`,
    metadata: {
      photoId: photo.id,
      storageKey: photo.storageKey,
    },
  });

  dependencies.revalidatePath(`/projects/${projectId}`);
  dependencies.revalidatePath(`/projects/${projectId}/photos`);
}
