import crypto from "node:crypto";
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

function getStorageRoot() {
  return path.join(
    /* turbopackIgnore: true */ process.cwd(),
    process.env.PROJECT_FILES_DIR ?? ".storage",
  );
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
  const root = getStorageRoot();
  const normalizedKey = normalizeStorageKey(storageKey);
  const absolutePath = path.resolve(root, normalizedKey);

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

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, bytes);

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
  return readFile(absolutePath);
}
