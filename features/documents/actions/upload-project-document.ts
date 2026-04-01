"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { db } from "@/server/db/client";
import {
  getDocumentContentType,
  MAX_DOCUMENT_SIZE_BYTES,
} from "@/server/storage/file-rules";
import { saveProjectFile } from "@/server/storage/project-files";
import {
  documentUploadMetadataSchema,
  type DocumentUploadActionState,
} from "@/features/documents/schemas/document-upload-form";

export async function uploadProjectDocumentAction(
  projectId: string,
  _previousState: DocumentUploadActionState,
  formData: FormData,
): Promise<DocumentUploadActionState> {
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
      error: "Choose a document to upload.",
      fieldErrors: {
        file: "Choose a document to upload.",
      },
    };
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return {
      error: "Document is too large.",
      fieldErrors: {
        file: "Keep document uploads under 15 MB.",
      },
    };
  }

  const contentType = getDocumentContentType(file.name, file.type);

  if (!contentType) {
    return {
      error: "Unsupported document type.",
      fieldErrors: {
        file: "Supported files: PDF, Word, text, CSV, and Excel.",
      },
    };
  }

  const metadataResult = documentUploadMetadataSchema.safeParse({
    tags: formData.get("tags"),
  });

  if (!metadataResult.success) {
    return {
      error: "Fix the highlighted fields and try again.",
      fieldErrors: {
        tags: "Tags must be a short comma-separated list.",
      },
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const storedFile = await saveProjectFile({
    kind: "documents",
    projectId,
    originalName: file.name,
    bytes,
  });

  await db.projectDocument.create({
    data: {
      projectId,
      createdById: user.id,
      originalName: file.name,
      storageKey: storedFile.storageKey,
      contentType,
      sizeBytes: file.size,
      tags: metadataResult.data.tags,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/documents`);

  return {
    success: "Document uploaded.",
  };
}
