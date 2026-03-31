# ScopeHouse Architecture

## Objective

Keep the MVP fast to ship without allowing page-level chaos or hidden business logic.

## Core Boundaries

- `app/` composes routes and layouts
- `features/` owns workflows and domain logic
- `components/` owns reusable UI
- `server/` owns server-only infrastructure
- `db/` owns schema and migrations
- `prompts/` owns AI prompt contracts

## First-Cut Feature Coverage

- `features/projects`
- `features/intake`
- `features/scope`
- `features/decisions`
- `features/ai`
- `features/export`

## Expansion Order

Add next:

- `features/budget`
- `features/schedule`
- `features/documents`
- `features/photos`
- `features/change-orders`

## AI Workflow Rule

Do not hide prompt logic inside route handlers.

Every AI workflow should have:

- versioned prompt files
- explicit output contracts
- human review before official writeback
