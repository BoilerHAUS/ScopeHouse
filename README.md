# ScopeHouse

ScopeHouse is a renovation operating system for homeowners and renovation professionals.

It helps users plan, price, run, track, and finish renovation projects with one structured project record across intake, scope, budget, schedule, documents, decisions, changes, and exports.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-ready component structure
- PostgreSQL or Supabase
- OpenAI API for AI-assisted workflows

## Core Product Areas

- Projects
- Intake
- Scope
- Budget
- Schedule
- Decisions
- Documents
- Photos
- Change orders
- Export
- AI workflows

## Repo Structure

- `app/`: routing, layouts, route handlers, and thin page composition
- `components/`: reusable shared UI
- `features/`: business-domain modules and workflow logic
- `lib/`: low-specificity utilities and shared helpers
- `server/`: server-only infrastructure
- `db/`: schema, migrations, seeds, and data-model notes
- `prompts/`: versioned AI prompt contracts
- `types/`: shared cross-feature types
- `hooks/`: client-only hooks
- `tests/`: unit and integration coverage for critical logic
- `docs/`: product, engineering, GitHub planning, and ADRs

## Local Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` values into `.env.local`.
3. Start local Postgres with `npm run db:start`.
4. Run the first migration with `npm run db:migrate -- --name init`.
5. Seed local data with `npm run db:seed`.
6. Start the dev server with `npm run dev`.
7. Open `http://localhost:3000`.

For AI scope drafting, also set:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` default is `gpt-5-mini`

## Development Rules

- Keep `app/` files thin.
- Keep business logic inside `features/`.
- Keep prompts explicit and versioned in `prompts/`.
- Keep server-only code out of client hooks and components.
- Keep AI outputs structured, reviewable, and human-approved before writeback.
- Keep planning docs current as the product sharpens.

## Database Workflow

- Prisma schema lives at `db/schema/schema.prisma`.
- Migrations live in `db/migrations`.
- Seed entry point is `db/seed.ts`.
- Prisma CLI config lives in `prisma.config.ts`.
- Local PostgreSQL runs through `docker-compose` on `localhost:5434`.
- Use `npm run db:migrate -- --name <migration_name>` for schema changes.

## Core Docs

The original planning documents now live under `docs/`:

- `docs/product/founder-instructions.md`
- `docs/product/mvp-prd.md`
- `docs/engineering/engineering-rules.md`
- `docs/engineering/repo-structure.md`

These act as the source material for `AGENTS.md` and the repo scaffold.
