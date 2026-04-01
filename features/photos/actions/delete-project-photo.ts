"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { db } from "@/server/db/client";
import { deleteProjectFile } from "@/server/storage/project-files";

export async function deleteProjectPhotoAction(
  projectId: string,
  formData: FormData,
) {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);
  const photoId = formData.get("photoId");

  if (!project || typeof photoId !== "string" || photoId.length === 0) {
    return;
  }

  const photo = await db.projectPhoto.findFirst({
    where: {
      id: photoId,
      projectId,
    },
    select: {
      id: true,
      storageKey: true,
    },
  });

  if (!photo) {
    return;
  }

  await deleteProjectFile(photo.storageKey);

  await db.projectPhoto.delete({
    where: {
      id: photo.id,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/photos`);
}
