"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { db } from "@/server/db/client";
import { logProjectActivity } from "@/server/activity/log";
import {
  getDocumentContentType,
  MAX_DOCUMENT_SIZE_BYTES,
} from "@/server/storage/file-rules";
import { saveProjectFile } from "@/server/storage/project-files";
import {
  documentUploadMetadataSchema,
  type DocumentUploadActionState,
} from "@/features/documents/schemas/document-upload-form";

type UploadProjectDocumentActionDependencies = {
  db: typeof db;
  requireCurrentUser: typeof requireCurrentUser;
  getProjectForUser: typeof getProjectForUser;
  saveProjectFile: typeof saveProjectFile;
  logProjectActivity: typeof logProjectActivity;
  revalidatePath: typeof revalidatePath;
};

const uploadProjectDocumentActionDependencies: UploadProjectDocumentActionDependencies = {
  db,
  requireCurrentUser,
  getProjectForUser,
  saveProjectFile,
  logProjectActivity,
  revalidatePath,
};

export async function uploadProjectDocumentAction(
  projectId: string,
  previousState: DocumentUploadActionState,
  formData: FormData,
): Promise<DocumentUploadActionState> {
  return uploadProjectDocumentActionWithDependencies(
    uploadProjectDocumentActionDependencies,
    projectId,
    previousState,
    formData,
  );
}

export async function uploadProjectDocumentActionWithDependencies(
  dependencies: UploadProjectDocumentActionDependencies,
  projectId: string,
  _previousState: DocumentUploadActionState,
  formData: FormData,
): Promise<DocumentUploadActionState> {
  const user = await dependencies.requireCurrentUser();
  const project = await dependencies.getProjectForUser(projectId, user.id);

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
  const storedFile = await dependencies.saveProjectFile({
    kind: "documents",
    projectId,
    originalName: file.name,
    bytes,
  });

  const document = await dependencies.db.projectDocument.create({
    data: {
      projectId,
      createdById: user.id,
      originalName: file.name,
      storageKey: storedFile.storageKey,
      contentType,
      sizeBytes: file.size,
      tags: metadataResult.data.tags,
    },
    select: {
      id: true,
    },
  });

  await dependencies.logProjectActivity({
    projectId,
    workspaceId: project.workspaceId,
    actorId: user.id,
    eventType: "document_uploaded",
    summary: `Uploaded document ${file.name}.`,
    metadata: {
      documentId: document.id,
      contentType,
      sizeBytes: file.size,
      tagCount: metadataResult.data.tags.length,
    },
  });

  dependencies.revalidatePath(`/projects/${projectId}`);
  dependencies.revalidatePath(`/projects/${projectId}/documents`);

  return {
    success: "Document uploaded.",
  };
}
