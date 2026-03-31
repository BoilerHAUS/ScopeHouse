# ScopeHouse Repo Structure

## Goal

Create a repo structure that stays clean during MVP, supports fast iteration, and does not collapse into page-level chaos.

This structure is designed for:

- Next.js
- TypeScript
- Tailwind
- shadcn/ui
- PostgreSQL or Supabase
- AI-assisted workflows
- GitHub-first delivery

## Top-Level Structure

```txt
scopehouse/
├─ app/
├─ components/
├─ features/
├─ lib/
├─ server/
├─ db/
├─ prompts/
├─ types/
├─ hooks/
├─ tests/
├─ docs/
├─ public/
├─ scripts/
├─ package.json
├─ tsconfig.json
├─ next.config.ts
├─ tailwind.config.ts
├─ postcss.config.js
├─ components.json
├─ .env.local
├─ .env.example
├─ .gitignore
└─ README.md
```

## Folder Rules

### app/

Use for routing, layouts, top-level pages, and route handlers.

Keep app files thin.
Do not bury domain logic here.

Example:

```txt
app/
├─ layout.tsx
├─ page.tsx
├─ projects/
│  ├─ page.tsx
│  ├─ new/
│  │  └─ page.tsx
│  └─ [projectId]/
│     ├─ page.tsx
│     ├─ intake/
│     │  └─ page.tsx
│     ├─ scope/
│     │  └─ page.tsx
│     ├─ budget/
│     │  └─ page.tsx
│     ├─ schedule/
│     │  └─ page.tsx
│     ├─ decisions/
│     │  └─ page.tsx
│     ├─ documents/
│     │  └─ page.tsx
│     └─ export/
│        └─ page.tsx
└─ api/
   └─ ai/
      ├─ scope-draft/route.ts
      ├─ quote-compare/route.ts
      └─ progress-summary/route.ts
```

### components/

Shared UI building blocks.

Use for generic and reusable UI only.

Example:

```txt
components/
├─ ui/
├─ layout/
├─ navigation/
├─ data-display/
├─ forms/
├─ feedback/
└─ export/
```

Suggested contents:

- app shell
- header
- sidebar
- table wrappers
- cards
- dialogs
- form controls
- upload UI
- status badges
- PDF print components

### features/

This is the core of the product.

Group code by business domain, not by technical pattern alone.

Example:

```txt
features/
├─ projects/
│  ├─ components/
│  ├─ actions/
│  ├─ queries/
│  ├─ schemas/
│  ├─ types/
│  └─ utils/
├─ intake/
│  ├─ components/
│  ├─ actions/
│  ├─ queries/
│  ├─ schemas/
│  ├─ config/
│  └─ utils/
├─ scope/
│  ├─ components/
│  ├─ actions/
│  ├─ queries/
│  ├─ schemas/
│  ├─ services/
│  ├─ types/
│  └─ utils/
├─ budget/
│  ├─ components/
│  ├─ actions/
│  ├─ queries/
│  ├─ schemas/
│  ├─ services/
│  └─ utils/
├─ schedule/
│  ├─ components/
│  ├─ actions/
│  ├─ queries/
│  ├─ schemas/
│  └─ utils/
├─ decisions/
│  ├─ components/
│  ├─ actions/
│  ├─ queries/
│  ├─ schemas/
│  └─ utils/
├─ change-orders/
│  ├─ components/
│  ├─ actions/
│  ├─ queries/
│  ├─ schemas/
│  └─ utils/
├─ documents/
│  ├─ components/
│  ├─ actions/
│  ├─ queries/
│  ├─ schemas/
│  └─ utils/
├─ photos/
│  ├─ components/
│  ├─ actions/
│  ├─ queries/
│  ├─ schemas/
│  └─ utils/
├─ quotes/
│  ├─ components/
│  ├─ actions/
│  ├─ queries/
│  ├─ schemas/
│  └─ utils/
├─ export/
│  ├─ components/
│  ├─ services/
│  └─ utils/
└─ ai/
   ├─ components/
   ├─ actions/
   ├─ schemas/
   ├─ services/
   ├─ parsers/
   └─ utils/
```

### lib/

Use for cross-cutting helpers with low business specificity.

Example:

```txt
lib/
├─ auth/
├─ db/
├─ env/
├─ utils/
├─ dates/
├─ currency/
├─ files/
└─ constants/
```

Do not dump product logic here.

### server/

Use for server-only code that supports multiple features.

Example:

```txt
server/
├─ auth/
├─ db/
├─ storage/
├─ permissions/
├─ ai/
└─ export/
```

Suggested use:

- database client setup
- storage adapters
- auth guards
- permission checks
- server-side AI client wrappers
- PDF generation services

### db/

Use for schema, migrations, seeds, and data model docs.

Example:

```txt
db/
├─ schema/
├─ migrations/
├─ seeds/
└─ README.md
```

If using Prisma:

```txt
db/
├─ schema.prisma
├─ migrations/
└─ seed.ts
```

### prompts/

Keep AI prompts versioned and explicit.

Example:

```txt
prompts/
├─ scope-draft/
│  ├─ system.md
│  ├─ developer.md
│  └─ output-schema.json
├─ quote-compare/
│  ├─ system.md
│  ├─ developer.md
│  └─ output-schema.json
└─ progress-summary/
   ├─ system.md
   ├─ developer.md
   └─ output-schema.json
```

This matters.
Do not hardcode long prompts deep inside random files.

### types/

Shared TypeScript types that cross feature boundaries.

Example:

```txt
types/
├─ project.ts
├─ budget.ts
├─ schedule.ts
├─ decision.ts
├─ document.ts
├─ ai.ts
└─ common.ts
```

Use this sparingly.
Keep most types close to the feature unless they are truly shared.

### hooks/

Client hooks only.

Example:

```txt
hooks/
├─ use-project.ts
├─ use-upload.ts
├─ use-debounce.ts
└─ use-project-filters.ts
```

Do not put server logic here.

### tests/

Organize by business-critical logic first.

Example:

```txt
tests/
├─ unit/
│  ├─ budget/
│  ├─ schedule/
│  ├─ scope/
│  └─ ai/
├─ integration/
│  ├─ project-creation/
│  ├─ intake/
│  ├─ scope-draft/
│  └─ export/
└─ fixtures/
```

### docs/

Keep docs as part of the product.

Example:

```txt
docs/
├─ product/
│  ├─ prd.md
│  ├─ user-personas.md
│  └─ feature-map.md
├─ engineering/
│  ├─ architecture.md
│  ├─ data-model.md
│  ├─ ai-workflows.md
│  └─ export-system.md
├─ github/
│  ├─ milestones.md
│  ├─ issue-map.md
│  └─ release-plan.md
└─ decisions/
   ├─ adr-001-repo-structure.md
   └─ adr-002-ai-output-contracts.md
```

### public/

Static files.
Use for logos, icons, and fixed assets.

### scripts/

Use for one-off developer tasks.

Example:

- seed scripts
- migration helpers
- import utilities
- cleanup jobs

Do not let scripts become hidden production logic.

## Recommended Internal Pattern for Features

Each feature should follow a predictable structure.

Example:

```txt
features/scope/
├─ components/
│  ├─ scope-editor.tsx
│  ├─ scope-phase-group.tsx
│  └─ scope-item-row.tsx
├─ actions/
│  ├─ create-scope-item.ts
│  ├─ update-scope-item.ts
│  └─ reorder-scope-items.ts
├─ queries/
│  ├─ get-project-scope.ts
│  └─ get-scope-baseline.ts
├─ schemas/
│  ├─ scope-item.schema.ts
│  └─ scope-draft.schema.ts
├─ services/
│  ├─ build-scope-tree.ts
│  ├─ apply-scope-draft.ts
│  └─ compare-scope-versions.ts
├─ types/
│  └─ scope.types.ts
└─ utils/
   └─ scope-labels.ts
```

## Naming Conventions

Use direct names.

Good:

- create-project.ts
- get-project-by-id.ts
- compare-quotes-to-scope.ts
- generate-scope-draft.ts

Bad:

- helpers.ts
- stuff.ts
- project-utils-final.ts
- misc.ts

## Boundary Rules

Keep these boundaries strict:

1. app/ handles routing and screen composition
2. features/ owns business workflows
3. components/ owns shared UI
4. server/ owns server-only infrastructure
5. db/ owns schema and migrations
6. prompts/ owns AI prompt definitions
7. tests/ verifies core logic

## Recommended First-Cut Domain Coverage

For MVP, build these feature folders first:

```txt
features/
├─ projects/
├─ intake/
├─ scope/
├─ decisions/
├─ ai/
└─ export/
```

Then add:

```txt
features/
├─ budget/
├─ schedule/
├─ documents/
├─ photos/
└─ change-orders/
```

## Example README Starter Outline

```md
# ScopeHouse

ScopeHouse is a renovation operating system for homeowners and renovation professionals.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL or Supabase
- OpenAI API

## Core product areas

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

## Repo structure

Short explanation of app, features, server, db, prompts, tests, and docs.

## Local setup

Environment variables, install steps, run steps, and database setup.

## Development rules

Keep page files thin.
Keep business logic in features.
Keep AI outputs structured.
Keep docs current.
```

## Notes

This repo structure is aligned with the main ScopeHouse project instruction, the engineering instruction, the GitHub workflow instruction, and the MVP PRD.
