# ScopeHouse Roadmap

## Status

The original MVP roadmap is complete.

Completed MVP outcomes:

- create a renovation project
- structure intake
- generate and edit a draft scope
- plan budget and schedule
- upload documents and photos
- record decisions and change orders
- export a clean project summary and PDF

The roadmap now shifts from MVP delivery to two follow-on tracks:

1. beta hardening and operations
2. post-MVP product expansion

## Roadmap Principles

- keep the first beta stable before widening scope
- favor trust, auditability, and recoverability over new surface area
- add tests and operational controls before adding expensive workflow breadth
- keep AI outputs reviewable and failure states explicit
- extend planning relationships only where they improve real user visibility

## Completed Milestones

### 1. Foundation

Completed issues:

- Issue 1, initialize app and toolchain
- Issue 2, app shell and navigation
- Issue 3, database and migrations
- Issue 4, auth and workspace guardrails

### 2. Core Project Model

Completed issues:

- Issue 5, project data model
- Issue 6, create project flow
- Issue 7, project overview
- Issue 8, activity log foundation

### 3. Scope Builder

Completed issues:

- Issue 9, guided intake flow
- Issue 10, scope data model
- Issue 11, manual scope editor

### 4. Budget Planner

Completed issues:

- Issues 12 to 14, budget planner and calculations

### 5. Schedule Planner

Completed issues:

- Issues 15 to 16, schedule planner

### 6. Documents And Photos

Completed issues:

- Issues 17 to 18, documents and photos

### 7. Decisions And Change Orders

Completed issues:

- Issue 19, decisions
- Issue 20, change orders

### 8. AI Workflows

Completed issues:

- Issue 21, AI wrapper and prompt system
- Issue 22, AI scope draft generation
- Issue 23, AI project summary generation

### 9. Export And Reporting

Completed issues:

- Issue 24, export view
- Issue 25, PDF generation

## Open Work

### 10. Beta Hardening And Operations

Focus:

- fix user-facing bugs in the core planning loop
- remove known build and operational rough edges
- add automated coverage around protected and high-risk workflows
- expand project auditability
- close obvious lifecycle and failure-state gaps
- make local testing and VPS deployment more repeatable

Open issues in this track:

- Issue 39, bug: when creating an account, repeat password
- Issue 40, bug: next steps after constraints and supports is filled out
- Issue 41, bug: generate AI draft failure
- Issue 26, resolve Turbopack file tracing warning for local storage adapter
- Issue 27, add integration test coverage for authenticated project workflows
- Issue 28, add targeted tests for server actions, queries, and core planning logic
- Issue 29, expand activity log coverage across planning workflows
- Issue 30, add document and photo deletion flows
- Issue 32, improve AI project summary UX for missing configuration and provider failures
- Issue 42, add Dockerfile and Dokploy deployment scaffold
- Issue 33, add a pluggable production storage adapter boundary
- Issue 37, add rate limiting to API routes and server actions

Exit criteria:

- the core create-account, intake, and AI draft loop works for manual local testing
- builds are clean enough to trust in CI and deployment
- critical project workflows have meaningful automated coverage
- high-signal project actions are visible in activity history
- destructive and AI-failure paths are explicit and safe
- Dokploy deployment is no longer blocked by missing container packaging

### 11. Planning Model Refinement

Focus:

- tighten planning relationships that already exist in schema or UI intent
- improve data linkage across budget, scope, schedule, and change control
- add project lifecycle controls for real-world use

Open issues in this track:

- Issue 31, add structured links from change orders to scope, budget, and schedule records
- Issue 35, add project archiving and restore flow
- Issue 36, add budget line to scope item linking UI

Exit criteria:

- users can archive and restore projects without losing data
- budget and change records can point to the planning objects they affect
- planning relationships are visible enough to support exports and review

### 12. Workflow Expansion

Focus:

- add new user-facing planning outputs
- add the next AI workflow after scope draft and project summary

Open issues in this track:

- Issue 34, add quote comparison AI workflow and quotes feature
- Issue 38, add CSV export for budget and scope data

Exit criteria:

- users can compare contractor quotes against project scope in a structured review flow
- users can export scope and budget data in spreadsheet-friendly formats

## Recommended Execution Order

### Immediate priority

These issues best support a credible limited beta:

1. Issue 41, bug: generate AI draft failure
2. Issue 40, bug: next steps after constraints and supports is filled out
3. Issue 39, bug: when creating an account, repeat password
4. Issue 26, resolve Turbopack file tracing warning for local storage adapter
5. Issue 32, improve AI project summary UX for missing configuration and provider failures
6. Issue 27, add integration test coverage for authenticated project workflows
7. Issue 28, add targeted tests for server actions, queries, and core planning logic
8. Issue 29, expand activity log coverage across planning workflows
9. Issue 30, add document and photo deletion flows
10. Issue 37, add rate limiting to API routes and server actions
11. Issue 42, add Dockerfile and Dokploy deployment scaffold
12. Issue 33, add a pluggable production storage adapter boundary

Why this order:

- Issues 41 and 40 block or weaken the core MVP planning loop during manual testing
- Issue 39 closes a standard auth UX and data-quality gap before broader user trials
- Issue 26 removes a known build warning before deployment work piles on top
- Issue 32 makes the current AI experience safer and clearer in local and beta environments
- Issues 27 and 28 reduce regression risk before more feature depth is added
- Issue 29 improves trust and future reporting quality across the now-broad MVP surface
- Issue 30 closes an obvious lifecycle gap in the file workflows
- Issue 37 addresses abuse risk before broader beta exposure
- Issue 42 makes Dokploy deployment realistic once the core app is stable enough to ship
- Issue 33 should follow once the local and container deployment paths are clearer

### Next priority

These issues improve the planning model without expanding into entirely new workflows:

13. Issue 35, add project archiving and restore flow
14. Issue 36, add budget line to scope item linking UI
15. Issue 31, add structured links from change orders to scope, budget, and schedule records

Why this order:

- Issue 35 improves day-to-day usability with relatively low coupling
- Issue 36 exposes a relationship that already exists in schema and will help later reporting
- Issue 31 becomes stronger once budget and scope linkage is already visible in the UI

### Expansion priority

These issues widen the product surface after the beta base is harder and cleaner:

16. Issue 38, add CSV export for budget and scope data
17. Issue 34, add quote comparison AI workflow and quotes feature

Why this order:

- Issue 38 extends existing data flows with moderate risk and no new AI surface
- Issue 34 is the broadest remaining workflow addition and should follow the hardening pass

## Mapping Open Issues To Roadmap Themes

- Core loop bugs:
  Issues 39, 40, 41
- Build and ops hardening:
  Issues 26, 32, 37, 42
- Testing and reliability:
  Issues 27, 28
- Auditability and lifecycle:
  Issues 29, 30, 35
- Data model refinement:
  Issues 31, 36
- Deployment architecture:
  Issue 33
- Workflow expansion:
  Issues 34, 38

## Local Testing Workflow

Use this loop for manual local testing before opening new feature work or validating bug fixes:

1. `npm install`
2. `cp .env.example .env.local`
3. Fill `.env.local`
   Required:
   - `DATABASE_URL`
   Optional for AI:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
4. `npm run db:start`
5. `npm run db:migrate -- --name local_sync`
6. `npm run db:seed`
7. `npm run dev`
8. Open `http://localhost:3000`
9. Sign in with the seeded demo account
   - `owner@scopehouse.local`
   - `scopehouse-demo`

Local validation commands:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

Manual smoke path:

1. create or open a project
2. complete guided intake
3. move into scope drafting
4. review budget and schedule pages
5. verify documents, photos, decisions, change orders, and export routes load

## Dokploy Preparation

Dokploy or VPS deployment is now part of the post-MVP roadmap, but not yet complete in the repo.

Deployment blockers currently tracked:

- Issue 26, build warning cleanup
- Issue 42, Dockerfile and Dokploy deployment scaffold
- Issue 33, production storage adapter boundary

## Beta Readiness Gate

The next limited beta should start only after most of Milestone 10 is complete.

Minimum gate:

- Issues 39 to 41 are resolved
- Issue 26 is done
- Issue 27 or 28 is done enough to give meaningful automated coverage
- Issue 32 is done
- Issue 37 is done
- document and photo lifecycle is no longer upload-only

Preferred gate:

- Milestone 10 is substantially complete

## Notes

This roadmap was updated on April 1, 2026 against the current open GitHub issue set.

Current open issues reviewed:

- 26 to 42, excluding completed MVP issues 1 to 25
