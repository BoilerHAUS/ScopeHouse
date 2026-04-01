"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { db } from "@/server/db/client";
import { getPhotoContentType, MAX_PHOTO_SIZE_BYTES } from "@/server/storage/file-rules";
import { saveProjectFile } from "@/server/storage/project-files";
import {
  photoUploadMetadataSchema,
  type PhotoUploadActionState,
} from "@/features/photos/schemas/photo-upload-form";

export async function uploadProjectPhotoAction(
  projectId: string,
  _previousState: PhotoUploadActionState,
  formData: FormData,
): Promise<PhotoUploadActionState> {
  const user = await requireCurrentUser();
  const project = await getProjectForUser(projectId, user.id);

  if (!project) {
    return {
      error: "Project not found.",
    };
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return {
      error: "Choose a photo to upload.",
      fieldErrors: {
        file: "Choose a photo to upload.",
      },
    };
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return {
      error: "Photo is too large.",
      fieldErrors: {
        file: "Keep photo uploads under 10 MB.",
      },
    };
  }

  const contentType = getPhotoContentType(file.name, file.type);

  if (!contentType) {
    return {
      error: "Unsupported photo type.",
      fieldErrors: {
        file: "Supported photos: JPG, PNG, and WebP.",
      },
    };
  }

  const metadataResult = photoUploadMetadataSchema.safeParse({
    caption: formData.get("caption"),
    roomTag: formData.get("roomTag"),
    phaseTag: formData.get("phaseTag"),
    takenOn: formData.get("takenOn"),
  });

  if (!metadataResult.success) {
    const fieldErrors = metadataResult.error.flatten().fieldErrors;

    return {
      error: "Fix the highlighted fields and try again.",
      fieldErrors: {
        caption: fieldErrors.caption?.[0],
        roomTag: fieldErrors.roomTag?.[0],
        phaseTag: fieldErrors.phaseTag?.[0],
        takenOn: fieldErrors.takenOn?.[0],
      },
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const storedFile = await saveProjectFile({
    kind: "photos",
    projectId,
    originalName: file.name,
    bytes,
  });

  await db.projectPhoto.create({
    data: {
      projectId,
      createdById: user.id,
      originalName: file.name,
      storageKey: storedFile.storageKey,
      contentType,
      sizeBytes: file.size,
      caption: metadataResult.data.caption,
      roomTag: metadataResult.data.roomTag,
      phaseTag: metadataResult.data.phaseTag,
      takenOn: metadataResult.data.takenOn,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/photos`);

  return {
    success: "Photo uploaded.",
  };
}
