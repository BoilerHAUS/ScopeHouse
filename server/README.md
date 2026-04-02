# Server Layer

Use `server/` for server-only infrastructure that supports multiple features.

Examples:

- database client setup
- storage adapters
- auth guards
- permission checks
- AI client wrappers
- PDF generation services

Storage note:

- file uploads should only talk to `server/storage/project-files.ts`
- `server/storage/adapter.ts` owns backend selection through `PROJECT_FILES_BACKEND`
- the default backend is `local`, but the boundary is set up so a managed object store can be added without changing feature code
