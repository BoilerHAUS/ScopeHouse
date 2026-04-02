/**
 * LocalStorageAdapter — filesystem-backed StorageAdapter for development and testing.
 *
 * Files are stored under PROJECT_FILES_DIR (default: .storage) relative to
 * process.cwd(). The adapter enforces that resolved paths cannot escape the
 * storage root (path traversal protection).
 *
 * This module should not be imported directly by feature code. Use the
 * project-files.ts boundary functions instead.
 */

import path from "node:path";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import type { StorageAdapter } from "./adapter";

function getStorageRoot() {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), process.env.PROJECT_FILES_DIR ?? ".storage");
}

function normalizeKey(storageKey: string) {
  const normalized = storageKey.replaceAll("\\", "/").replace(/^\/+/, "");

  if (normalized.length === 0 || normalized.includes("..")) {
    throw new Error("Invalid storage key.");
  }

  return normalized;
}

function resolveAbsolutePath(storageKey: string) {
  const normalizedKey = normalizeKey(storageKey);
  const root = getStorageRoot();
  const absolutePath = path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    process.env.PROJECT_FILES_DIR ?? ".storage",
    normalizedKey,
  );

  if (absolutePath !== root && !absolutePath.startsWith(`${root}${path.sep}`)) {
    throw new Error("Resolved file path escaped the storage root.");
  }

  return absolutePath;
}

export const localStorageAdapter: StorageAdapter = {
  async write(key: string, bytes: Uint8Array) {
    const absolutePath = resolveAbsolutePath(key);
    await mkdir(/*turbopackIgnore: true*/ path.dirname(absolutePath), { recursive: true });
    await writeFile(/*turbopackIgnore: true*/ absolutePath, bytes);
  },

  async read(key: string): Promise<Buffer<ArrayBufferLike>> {
    const absolutePath = resolveAbsolutePath(key);
    return readFile(/*turbopackIgnore: true*/ absolutePath);
  },

  async delete(key: string) {
    const absolutePath = resolveAbsolutePath(key);
    // Ignore ENOENT — the DB record is the source of truth; a missing file is not fatal.
    await unlink(/*turbopackIgnore: true*/ absolutePath).catch((err: NodeJS.ErrnoException) => {
      if (err.code !== "ENOENT") throw err;
    });
  },
};
