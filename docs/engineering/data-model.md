# ScopeHouse Data Model

## Goal

Keep the MVP data model explicit, typed, and narrow enough to evolve without hidden baggage.

## Current Core Entities

### User

Purpose:

- authenticated account holder
- creator of projects
- member of one or more workspaces

Key fields:

- `id`
- `email`
- `name`
- `passwordHash`
- `createdAt`
- `updatedAt`

### Workspace

Purpose:

- ownership boundary for project data
- default personal workspace for MVP users

Key fields:

- `id`
- `name`
- `slug`
- `createdAt`
- `updatedAt`

### WorkspaceMember

Purpose:

- links users to workspaces
- provides a simple ownership model for MVP

Key fields:

- `workspaceId`
- `userId`
- `role`
- `createdAt`
- `updatedAt`

### Project

Purpose:

- central planning record for a renovation
- parent entity for intake, scope, budget, schedule, documents, decisions, and export

Key fields:

- `id`
- `workspaceId`
- `createdById`
- `title`
- `projectType`
- `locationLabel`
- `goals`
- `status`
- `archivedAt`
- `createdAt`
- `updatedAt`

Relations:

- belongs to one `Workspace`
- belongs to one creator `User`

Indexes:

- `workspaceId`
- `createdById`
- `status`
- `archivedAt`

## Project Enums

### ProjectType

- `kitchen`
- `bathroom`
- `addition`
- `whole_home`
- `basement`
- `outdoor`
- `other`

### ProjectStatus

- `draft`
- `intake`
- `scope_review`
- `planning`
- `in_progress`
- `closeout`

## Modeling Notes

- Archival is handled by `archivedAt` instead of overloading the status enum.
- `goals` is stored as simple text for the MVP rather than a separate goals table or JSON shape.
- `workspaceId` is the primary ownership boundary.
- `createdById` gives a direct record of who opened the project.

## Next Likely Model Additions

- `IntakeResponse`
- `ScopeItem`
- `Decision`
- `BudgetCategory`
- `BudgetLine`
- `Milestone`
- `Document`
- `Photo`
- `ChangeOrder`
