/**
 * project-files.ts — public boundary for project file storage operations.
 *
 * Feature code (actions, route handlers) should import from this module only.
 * The concrete storage implementation lives behind the StorageAdapter interface
 * in server/storage/adapter.ts. To swap to a different backend (S3, GCS, R2…)
 * register a new adapter via setStorageAdapter() without touching feature code.
 */

import crypto from "node:crypto";
import path from "node:path";
import { getStorageAdapter } from "./adapter";

function getBucketName() {
  return process.env.PROJECT_FILES_BUCKET?.trim() || "project-files";
}

function sanitizePathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
}

export function createProjectFileStorageKey({
  kind,
  projectId,
  originalName,
}: {
  kind: "documents" | "photos";
  projectId: string;
  originalName: string;
}) {
  const extension = path.extname(originalName).toLowerCase();
  const safeProjectId = sanitizePathSegment(projectId);
  const safeBasename = sanitizePathSegment(path.basename(originalName, extension));
  const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;

  return `${getBucketName()}/${kind}/${safeProjectId}/${safeBasename}-${uniqueSuffix}${extension}`;
}

export async function writeProjectFileBuffer(storageKey: string, bytes: Uint8Array) {
  await getStorageAdapter().write(storageKey, bytes);
  return { storageKey };
}

export async function saveProjectFile({
  kind,
  projectId,
  originalName,
  bytes,
}: {
  kind: "documents" | "photos";
  projectId: string;
  originalName: string;
  bytes: Uint8Array;
}) {
  const storageKey = createProjectFileStorageKey({ kind, projectId, originalName });
  await getStorageAdapter().write(storageKey, bytes);
  return { storageKey };
}

export async function readProjectFileBuffer(storageKey: string) {
  return getStorageAdapter().read(storageKey);
}

export async function deleteProjectFile(storageKey: string) {
  return getStorageAdapter().delete(storageKey);
}
