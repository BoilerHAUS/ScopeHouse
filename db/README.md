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
