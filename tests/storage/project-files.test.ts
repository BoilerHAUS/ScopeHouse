import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  createStorageAdapter,
  readStorageAdapterConfig,
  setStorageAdapter,
} from "@/server/storage/adapter";
import {
  deleteProjectFile,
  readProjectFileBuffer,
  saveProjectFile,
} from "@/server/storage/project-files";

test("readStorageAdapterConfig defaults to local and rejects unsupported backends", () => {
  assert.deepEqual(readStorageAdapterConfig({}), {
    backend: "local",
  });

  assert.throws(
    () => readStorageAdapterConfig({ PROJECT_FILES_BACKEND: "s3" }),
    /Unsupported PROJECT_FILES_BACKEND "s3"/,
  );
});

test("project file helpers route reads and writes through the configured adapter", async (t) => {
  const writes: Array<{ key: string; bytes: Uint8Array }> = [];
  const reads: string[] = [];
  const deletes: string[] = [];

  setStorageAdapter({
    async write(key, bytes) {
      writes.push({ key, bytes });
    },
    async read(key) {
      reads.push(key);
      return Buffer.from("stored-file");
    },
    async delete(key) {
      deletes.push(key);
    },
  });

  t.after(() => {
    setStorageAdapter(createStorageAdapter({ backend: "local" }));
  });

  const bytes = new TextEncoder().encode("quote body");
  const storedFile = await saveProjectFile({
    kind: "documents",
    projectId: "project_123",
    originalName: "Quote Set.pdf",
    bytes,
  });

  assert.equal(writes.length, 1);
  assert.match(writes[0]!.key, /^project-files\/documents\/project_123\//);
  assert.deepEqual(Array.from(writes[0]!.bytes), Array.from(bytes));
  assert.equal(storedFile.storageKey, writes[0]!.key);

  const fileBuffer = await readProjectFileBuffer(storedFile.storageKey);
  assert.equal(fileBuffer.toString("utf8"), "stored-file");
  assert.deepEqual(reads, [storedFile.storageKey]);

  await deleteProjectFile(storedFile.storageKey);
  assert.deepEqual(deletes, [storedFile.storageKey]);
});

test("local storage adapter writes inside the configured root and blocks traversal keys", async (t) => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "scopehouse-storage-"));
  const previousDir = process.env.PROJECT_FILES_DIR;
  const relativeRoot = path.relative(process.cwd(), tempRoot);

  process.env.PROJECT_FILES_DIR = relativeRoot;

  t.after(async () => {
    if (previousDir === undefined) {
      delete process.env.PROJECT_FILES_DIR;
    } else {
      process.env.PROJECT_FILES_DIR = previousDir;
    }

    await rm(tempRoot, { recursive: true, force: true });
  });

  const adapter = createStorageAdapter({ backend: "local" });
  const key = "project-files/documents/project_1/spec-sheet.txt";
  const bytes = new TextEncoder().encode("hello");

  await adapter.write(key, bytes);

  const savedPath = path.join(tempRoot, key);
  const savedBytes = await readFile(savedPath, "utf8");
  assert.equal(savedBytes, "hello");

  const readBytes = await adapter.read(key);
  assert.equal(readBytes.toString("utf8"), "hello");

  await adapter.delete(key);

  await assert.rejects(
    async () => adapter.write("../escape.txt", bytes),
    /Invalid storage key/,
  );
});
