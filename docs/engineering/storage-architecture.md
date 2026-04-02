# Storage Architecture

ScopeHouse stores binary project files behind a small adapter boundary so file-backed features do not depend on one concrete backend.

## Current shape

- Feature code imports `saveProjectFile`, `readProjectFileBuffer`, and `deleteProjectFile` from `server/storage/project-files.ts`.
- `server/storage/project-files.ts` owns storage key generation and delegates reads and writes to the active adapter.
- `server/storage/adapter.ts` selects the backend using `PROJECT_FILES_BACKEND`.
- `server/storage/local-adapter.ts` is the default implementation for development and current deployments.

## Why this boundary exists

- documents and photos already need persistent binary storage
- local filesystem storage is acceptable for development and single-node deployments
- production object storage should be addable without rewriting feature actions, routes, or database models

## Current configuration

Supported backends:

- `local`

Relevant environment variables:

- `PROJECT_FILES_BACKEND`
- `PROJECT_FILES_DIR`
- `PROJECT_FILES_BUCKET`

## Rules

- feature code must not import `local-adapter.ts` directly
- storage reads and writes should stay behind `project-files.ts`
- database rows keep metadata and the `storageKey`, but not the file bytes
- adapters are responsible for the actual file IO

## Future migration path

When moving to object storage:

1. Add a new adapter in `server/storage/`.
2. Register the backend selector in `server/storage/adapter.ts`.
3. Update deployment configuration to point `PROJECT_FILES_BACKEND` at the new backend.
4. Backfill existing files from the local store into the new backend.
5. Keep the existing `storageKey` values stable where possible to minimize record churn.
