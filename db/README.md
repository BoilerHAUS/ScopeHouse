# Database

Use this folder for schema, migrations, seeds, and data model notes.

Prisma is the schema and migration tool for the current ScopeHouse foundation.

## Layout

- `schema/schema.prisma`: primary Prisma schema
- `migrations/`: Prisma migration history
- `seed.ts`: local seed entry point
- `../prisma.config.ts`: Prisma CLI config and datasource URL wiring

## Local Workflow

1. Copy `.env.example` to `.env.local`.
2. Start PostgreSQL with `npm run db:start`.
3. Create or apply migrations with `npm run db:migrate -- --name <name>`.
4. Seed data with `npm run db:seed`.
5. Inspect data with `npm run db:studio`.

The local PostgreSQL container is exposed on `localhost:5434` to avoid clashing with an existing host PostgreSQL service.

## Current Scope

The initial schema is intentionally narrow:

- `User`
- `Workspace`
- `WorkspaceMember`
- `Project`
- `ProjectIntake`
- `ActivityLog`
- `ScopeDraft`
- `ScopeItem`
- `AiGeneration`
- `Decision`
- `BudgetCategory`
- `BudgetLine`
- `ProjectDocument`
- `ProjectPhoto`
- `ChangeOrder`
- `SchedulePhase`
- `ScheduleMilestone`

The project model now includes:

- workspace ownership
- creator linkage
- status enum
- project type enum
- archival support

The intake and activity foundation now add:

- one-to-one guided intake persistence
- lightweight project activity events
- event metadata for future summaries and reporting

The scope and AI foundation now add:

- grouped scope items with explicit ordering
- reviewable AI scope drafts before writeback
- AI generation logs with prompt version and model metadata

The decision foundation now adds:

- project-linked decision records
- explicit decision status values
- owner, date, and notes fields for reviewable project context

The budget foundation now adds:

- budget categories with explicit ordering
- planning line items with estimate, allowance, quote, and actual amounts
- cent-based currency storage for deterministic calculations

The schedule foundation now adds:

- ordered project phases with optional target start and finish dates
- phase-linked milestones with optional target dates
- string-based day-level schedule fields to avoid timezone drift

The document and photo foundation now adds:

- document metadata with uploader linkage, size, type, and tags
- photo metadata with caption, room tag, phase tag, taken date, and upload date
- local storage-backed secure retrieval paths for project assets
- a storage adapter boundary so future object storage backends can replace local files without feature rewrites

The change and AI summary foundation now adds:

- project-linked change orders with impact summaries and lightweight budget or schedule references
- reusable AI project summaries sourced from intake, scope, decisions, and change orders

The quote comparison foundation now adds:

- project-linked contractor quotes with amount, scope reference, and notes
- AI quote comparisons logged through `AiGeneration`
- versioned quote comparison prompts in `prompts/quote-compare/`
