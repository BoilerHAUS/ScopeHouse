import crypto from "node:crypto";
import path from "node:path";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";

function getStorageRoot() {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), process.env.PROJECT_FILES_DIR ?? ".storage");
}

function getBucketName() {
  return process.env.PROJECT_FILES_BUCKET?.trim() || "project-files";
}

function sanitizePathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
}

function normalizeStorageKey(storageKey: string) {
  const normalized = storageKey.replaceAll("\\", "/").replace(/^\/+/, "");

  if (normalized.length === 0 || normalized.includes("..")) {
    throw new Error("Invalid storage key.");
  }

  return normalized;
}

function resolveStoragePath(storageKey: string) {
  const normalizedKey = normalizeStorageKey(storageKey);
  const root = getStorageRoot();
  // Compute absolutePath from process.cwd() directly so Turbopack's file-tracing
  // analysis sees the ignore annotation rather than a path.resolve on a variable.
  const absolutePath = path.join(/*turbopackIgnore: true*/ process.cwd(), process.env.PROJECT_FILES_DIR ?? ".storage", normalizedKey);

  if (
    absolutePath !== root &&
    !absolutePath.startsWith(`${root}${path.sep}`)
  ) {
    throw new Error("Resolved file path escaped the storage root.");
  }

  return {
    root,
    normalizedKey,
    absolutePath,
  };
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
  const { absolutePath, normalizedKey } = resolveStoragePath(storageKey);

  await mkdir(/*turbopackIgnore: true*/ path.dirname(absolutePath), { recursive: true });
  await writeFile(/*turbopackIgnore: true*/ absolutePath, bytes);

  return {
    storageKey: normalizedKey,
    absolutePath,
  };
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
  const storageKey = createProjectFileStorageKey({
    kind,
    projectId,
    originalName,
  });

  return writeProjectFileBuffer(storageKey, bytes);
}

export async function readProjectFileBuffer(storageKey: string) {
  const { absolutePath } = resolveStoragePath(storageKey);
  return readFile(/*turbopackIgnore: true*/ absolutePath);
}

export async function deleteProjectFile(storageKey: string) {
  const { absolutePath } = resolveStoragePath(storageKey);
  // Ignore ENOENT — the DB record is the source of truth; a missing file is not fatal.
  await unlink(/*turbopackIgnore: true*/ absolutePath).catch((err: NodeJS.ErrnoException) => {
    if (err.code !== "ENOENT") throw err;
  });
}
