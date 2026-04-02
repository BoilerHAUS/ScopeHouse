/**
 * StorageAdapter defines the boundary that all file storage operations must go through.
 *
 * The active adapter is set at startup. For local development the default is
 * LocalStorageAdapter (filesystem under PROJECT_FILES_DIR). A future production
 * adapter (S3, GCS, R2, etc.) can be registered here without touching any
 * feature-layer code — only this module and the concrete adapter file change.
 *
 * Usage:
 *   import { getStorageAdapter, setStorageAdapter } from "@/server/storage/adapter";
 *
 * Swapping adapters (e.g. in tests):
 *   setStorageAdapter(myMockAdapter);
 */

export interface StorageAdapter {
  write(key: string, bytes: Uint8Array): Promise<void>;
  read(key: string): Promise<Buffer<ArrayBufferLike>>;
  delete(key: string): Promise<void>;
}

let _adapter: StorageAdapter | null = null;

/**
 * Returns the active storage adapter.
 * Lazily loads the local adapter on first call so that the filesystem
 * imports (and the Turbopack annotations inside them) are not evaluated
 * at module-import time in environments that don't use them.
 */
export function getStorageAdapter(): StorageAdapter {
  if (!_adapter) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { localStorageAdapter } = require("./local-adapter") as {
      localStorageAdapter: StorageAdapter;
    };
    _adapter = localStorageAdapter;
  }

  return _adapter;
}

/**
 * Replaces the active adapter.
 * Call this during test setup or at application boot when configuring a
 * non-default backend.
 */
export function setStorageAdapter(adapter: StorageAdapter) {
  _adapter = adapter;
}
