# CLAUDE.md — ScopeHouse

ScopeHouse is a renovation operating system: one structured project record across intake, scope, budget, schedule, documents, decisions, change orders, and PDF export, with AI-assisted drafting.

See `AGENTS.md` for product philosophy and engineering principles. This file covers the practical working rules for Claude Code.

## Stack

- Next.js 16 App Router, TypeScript, Tailwind CSS v4
- PostgreSQL via Prisma (`db/schema/schema.prisma`)
- OpenAI API via Vercel AI SDK (`@ai-sdk/openai`)
- `@react-pdf/renderer` for PDF export
- Custom session auth (no NextAuth) in `server/auth/`
- Local filesystem storage in `server/storage/` (adapter boundary, not S3 yet)

## Dev Commands

```bash
npm run dev           # start dev server (localhost:3000)
npm run db:start      # start Postgres via docker-compose (port 5434)
npm run db:migrate -- --name <name>  # create a migration
npm run db:seed       # seed local data
npm run test          # run unit tests (tsx --test tests/**/*.test.ts)
npm run typecheck     # tsc --noEmit
npm run lint          # eslint
npm run build         # production build
```

## Project Layout

```
app/              routes, layouts, thin page composition — keep lean
features/         business domain modules (scope, budget, decisions, etc.)
  <domain>/
    actions/      server actions
    components/   domain UI components
    queries/      DB query functions
    schemas/      Zod schemas
    services/     business logic
    utils/
server/           server-only infrastructure
  auth/           session management, requireCurrentUser()
  ai/             AI wrapper + run-structured-workflow
  db/             Prisma client
  storage/        file storage adapter (project-files.ts, file-rules.ts)
  permissions/    project ownership checks
components/       shared UI components
lib/              low-specificity shared utilities
types/            shared cross-feature types
hooks/            client-only hooks
prompts/          versioned AI prompt definitions
db/               schema, migrations, seeds
tests/            unit and integration tests
docs/             product and engineering docs, ADRs
```

## Architecture Rules

- **Page files are thin.** All business logic belongs in `features/`. Never write domain logic in `app/` files.
- **Server actions** live in `features/<domain>/actions/`. Use `requireCurrentUser()` + `getProjectForUser()` at the top of every action — no exceptions.
- **Queries** in `features/<domain>/queries/` are plain async functions that call `db` (Prisma client from `server/db/client`).
- **Zod schemas** in `features/<domain>/schemas/` for all form inputs and AI outputs.
- **AI prompts** in `prompts/`. Never inline long prompts in source files. Prompts are versioned contracts.
- **Storage** goes through `server/storage/project-files.ts`. Do not access the filesystem directly from features.
- **Immutable patterns** — don't mutate objects in-place. Return new values.

## Auth Pattern

Every server action and route handler that touches project data must:

```ts
const user = await requireCurrentUser();       // throws if unauthenticated
const project = await getProjectForUser(projectId, user.id);  // null if not found/unauthorized
if (!project) return { error: "Project not found." };
```

## Database

- Schema: `db/schema/schema.prisma`
- Prisma config: `prisma.config.ts`
- Client: `import { db } from "@/server/db/client"`
- Local Postgres runs on `localhost:5434` (docker-compose)
- Always run `npm run db:migrate -- --name <name>` for schema changes, never `db:push` in dev

## Testing

Tests live in `tests/unit/` and `tests/integration/`. Run with `npm run test`.

Priorities: budget calculations, scope behavior, AI response parsing, validation, change order logic.

Do not chase coverage numbers — test failure points and regression risks.

## AI Workflows

- Wrapper: `server/ai/run-structured-workflow.ts`
- Outputs must be structured (Zod-parsed). Never trust raw AI strings for writeback.
- No silent mutations — AI outputs require human review/confirmation before core records change.
- `AiGeneration` records are logged for every workflow run.

## Environment Variables

```
DATABASE_URL          Postgres connection (localhost:5434 locally)
OPENAI_API_KEY        Required for AI workflows
OPENAI_MODEL          Default: gpt-5-mini
PROJECT_FILES_DIR     Local storage root (default: .storage)
PROJECT_FILES_BUCKET  Storage bucket name (default: project-files)
```

## What NOT to Do

- Don't add logic to `app/` page files — put it in `features/`
- Don't bypass auth checks in server actions
- Don't write raw SQL — use Prisma
- Don't hardcode prompts in source files — use `prompts/`
- Don't access storage directly from feature code — use the `server/storage` adapter
- Don't silently swallow errors — surface them to the caller
- Don't add features beyond what the issue asks

## Key Conventions

- Status enums are in the Prisma schema — match them exactly in TypeScript
- All money values are stored as integer cents (`estimateCents`, `actualCents`, etc.)
- Date strings (not `DateTime`) for schedule dates — stored as `String?` in schema
- `itemOrder` integer field used for manual ordering on all ordered list models
- Activity log events use `ActivityEventType` enum — add new types to schema when needed
