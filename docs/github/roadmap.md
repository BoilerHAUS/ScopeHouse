# ScopeHouse MVP Roadmap

## Goal

Ship a credible MVP that proves the core ScopeHouse promise:

- create a renovation project
- structure intake
- generate and edit a draft scope
- record key decisions
- export a clean project summary

## Roadmap Principles

- keep the first release narrow and useful
- favor workflow clarity over breadth
- ship the first vertical slice early
- treat AI as support, not hidden automation
- avoid enterprise complexity before product fit

## Milestones

### 1. Foundation

Focus:

- initialize app and toolchain
- establish app shell and navigation
- set up database and migration workflow
- add auth and workspace guardrails

Exit criteria:

- app runs locally
- database workflow is documented and working
- authenticated areas are protected
- repo structure is stable enough for feature work

### 2. Core Project Model

Focus:

- implement project schema and status model
- ship create project flow
- ship project overview
- add lightweight activity log foundation

Exit criteria:

- users can create and open projects
- project state is represented clearly
- key events are recordable for trust and reporting

### 3. Scope Builder

Focus:

- guided intake model and multi-step form
- scope data model with phase, room, and work-item structure
- manual scope editing flow

Exit criteria:

- users can complete intake
- the project has a structured editable scope baseline

### 4. Budget Planner

Focus:

- budget categories and lines
- planner UI with totals
- reusable calculation logic with tests

Exit criteria:

- users can create a first-pass budget
- totals are reliable and tested

### 5. Schedule Planner

Focus:

- phase and milestone model
- lightweight schedule planner UI

Exit criteria:

- users can define ordered phases and milestones
- schedule supports visibility without heavy planning logic

### 6. Documents And Photos

Focus:

- document upload model and storage flow
- photo log model and upload flow

Exit criteria:

- users can attach files and photos to a project
- storage and retrieval work securely

### 7. Decisions And Change Orders

Focus:

- decision log model and CRUD flow
- change order model and CRUD flow

Exit criteria:

- project decisions and changes are tracked in context
- status and ownership fields are reliable

### 8. AI Workflows

Focus:

- shared AI wrapper, prompt system, and output schemas
- AI-assisted scope draft generation
- AI-assisted project summary generation

Exit criteria:

- AI outputs are structured and reviewable
- no high-impact project changes happen without confirmation

### 9. Export And Reporting

Focus:

- print-friendly export view
- PDF generation for project summary

Exit criteria:

- users can generate a credible shareable PDF project summary

## Recommended Delivery Order

### Vertical slice first

1. Issue 1, initialize app and toolchain
2. Issue 2, app shell and navigation
3. Issue 3, database and migrations
4. Issue 4, auth and workspace guardrails
5. Issue 5, project data model
6. Issue 6, create project flow
7. Issue 7, project overview
8. Issue 9, guided intake flow
9. Issue 10, scope data model
10. Issue 21, AI prompt and wrapper system
11. Issue 22, AI-assisted scope draft generation
12. Issue 11, manual scope editor
13. Issue 19, decision log
14. Issue 24, export summary view
15. Issue 25, PDF generation

This sequence proves the first MVP promise quickly:

- create project
- complete guided intake
- generate AI draft scope
- edit scope
- record decisions
- export project summary

### Follow-on work

After the first vertical slice lands, continue with:

- Issue 8, activity log foundation
- Issues 12 to 14, budget planner and calculations
- Issues 15 to 16, schedule planner
- Issues 17 to 18, documents and photos
- Issue 20, change orders
- Issue 23, AI project summary generation

## Suggested Milestone Targets

- Milestone 1 to 3: get to first usable planning loop
- Milestone 4 to 7: add project control and evidence
- Milestone 8 to 9: add leverage and shareable output

## Release Readiness Gate

The MVP is ready for a limited beta when:

- a user can complete the first vertical slice without manual intervention
- the system protects project ownership and data access
- AI outputs are reviewable and safe
- export output is clean enough to share externally
- critical budget and scope logic has test coverage where required
