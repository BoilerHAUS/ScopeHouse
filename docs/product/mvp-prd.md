# ScopeHouse MVP PRD

## 1. Overview

ScopeHouse is a renovation operating system for homeowners and renovation professionals.

It helps users plan, price, run, track, and finish home renovation projects from first idea to final closeout.

The product is built for two realities at once:
- a serious homeowner needs structure without complexity
- a renovation pro needs a system that feels disciplined, credible, and useful

ScopeHouse is not generic construction software.
ScopeHouse is not enterprise ERP.
AI is not the main product.

ScopeHouse is a renovation planning and control platform with pro-grade structure and clean usability.

## 2. Product Goal

Help users take a renovation from uncertainty to control.

ScopeHouse should reduce confusion, tighten decision-making, and create a clear project record across scope, budget, schedule, documents, and changes.

## 3. Product Promise

Plan the renovation.
Price the renovation.
Run the renovation.
Track the renovation.
Finish the renovation.

## 4. Target Users

### Primary users

1. Homeowners planning medium to large renovations
2. Solo general contractors
3. Small renovation firms
4. Renovation consultants
5. Design-build professionals
6. Owner-builders

### Ideal early wedge

The best early wedge is likely:
- homeowners running complex renovations
- solo GCs and small firms who need stronger project control but do not want heavy construction software

This wedge is narrow enough to build for and broad enough to monetize.

## 5. Core Problems

Users struggle with:

1. unclear project scope
2. budget uncertainty
3. confusing quote comparisons
4. schedule drift
5. change order chaos
6. scattered photos and documents
7. weak decision tracking
8. poor homeowner-contractor communication
9. no central record of what was agreed, changed, spent, or completed

## 6. Product Pillars

1. Project intake
2. Scope builder
3. Budget planner
4. Schedule planner
5. Change order management
6. Document and photo vault
7. Communication and decision log
8. AI copilot for draft generation, summarization, comparison, and reporting
9. Project closeout and handoff

## 7. MVP Thesis

The MVP should prove one thing:

A user can start with a rough renovation idea and end with a structured, trackable project record.

The MVP does not need full operational depth.
It needs a clean, credible core workflow.

## 8. MVP Scope

### Included in MVP

#### A. Project creation
Users can create a project with a title, address or location label, project type, high-level goals, and status.

#### B. Guided renovation intake
Users answer structured intake questions about:
- renovation type
- rooms or areas involved
- priorities
- desired outcomes
- rough timing
- rough budget range
- known constraints
- known risks
- contractor involvement
- special notes

#### C. Scope builder
Users can turn intake data into a structured scope organized by:
- project
- phase
- room or area
- line item or work item

Users can edit the scope manually.

#### D. Budget planner
Users can create and manage budget categories and line items.
Users can assign estimates, allowances, quoted values, and actuals later.
Users can track budget status at a simple but useful level.

#### E. Schedule planner
Users can define phases, milestones, and target timing.
The MVP schedule can stay lightweight.
It should support sequencing and visibility, not complex CPM logic.

#### F. Document storage
Users can upload and organize project documents.

#### G. Photo log
Users can upload and organize project photos with timestamps, captions, and optional room or phase tagging.

#### H. Decision log
Users can record project decisions with date, owner, summary, and status.

#### I. Change order basics
Users can create and track scope or budget changes with:
- title
- description
- impact summary
- status
- date
- linked budget or schedule impact

#### J. PDF export
Users can export a clean summary of the project including:
- intake summary
- draft scope
- budget summary
- milestone summary
- decisions
- change log

#### K. AI-assisted scope drafting
AI turns intake data into a first-pass scope draft.

#### L. AI-assisted quote comparison
AI helps compare vendor quotes against the defined scope.

#### M. AI-assisted progress summaries
AI helps summarize project state from notes, decisions, and changes.

## 9. Non-Goals for MVP

The MVP should not include:

1. full accounting
2. full CRM
3. procurement workflows
4. deep estimating database
5. enterprise permissions complexity
6. native mobile app
7. heavy integrations before core workflow is proven
8. hidden AI automation that edits project records without user confirmation

## 10. Primary Workflows

### Workflow 1, Create a new project
User creates a project and enters basic details.

Outcome:
A project shell exists and is ready for intake.

### Workflow 2, Complete guided intake
User answers renovation intake questions.

Outcome:
Project goals, scope signals, timing expectations, and budget context are captured in one place.

### Workflow 3, Generate and edit draft scope
AI drafts a structured scope from intake data.
User reviews and edits the scope.

Outcome:
The project now has a working scope baseline.

### Workflow 4, Build initial budget
User creates budget categories and line items tied to the project scope.

Outcome:
The project has a first-pass financial frame.

### Workflow 5, Build initial schedule
User defines phases and milestones.

Outcome:
The project has a visible timeline structure.

### Workflow 6, Upload documents and photos
User stores project files and images in one place.

Outcome:
The project gains a central source of truth.

### Workflow 7, Record decisions
User logs decisions as the renovation evolves.

Outcome:
The project gains an auditable decision history.

### Workflow 8, Track changes
User records change orders and links them to scope, budget, or schedule impact.

Outcome:
The project stays controlled as work changes.

### Workflow 9, Export project summary
User exports a project summary as a PDF.

Outcome:
The project is easy to share with contractors, clients, or internal stakeholders.

## 11. User Stories

### Homeowner stories

- As a homeowner, I want a guided intake so I can turn a vague renovation idea into a structured plan.
- As a homeowner, I want a draft scope so I stop forgetting important parts of the job.
- As a homeowner, I want a budget view so I understand what I am trying to spend and where risk sits.
- As a homeowner, I want a decision log so I can track what I approved and when.
- As a homeowner, I want a clean export so I can share a credible project summary with contractors.

### Contractor and consultant stories

- As a solo GC, I want a structured intake so I can capture project details fast.
- As a renovation consultant, I want a clean scope builder so I can create project clarity early.
- As a pro user, I want quote comparison support so I can see gaps, overlaps, and missing items.
- As a pro user, I want change tracking so I can show how the project evolved.
- As a pro user, I want one project record so scope, documents, photos, and decisions are not scattered.

## 12. UX Principles

1. Clear over clever
2. Calm over flashy
3. Guided where ambiguity is high
4. Flexible where project reality varies
5. Desktop-first for serious work
6. Strong structure without enterprise heaviness
7. AI support should feel useful, visible, and reviewable

## 13. Functional Requirements

### Project management
- Create, edit, archive, and view projects
- Track project status
- Associate related records to a project

### Intake
- Structured multi-step intake flow
- Save progress
- Edit responses later

### Scope
- Generate AI draft from intake
- Manual editing
- Organize by phase, room, and work item
- Track revisions or baseline state

### Budget
- Create categories and line items
- Assign estimate values
- Support notes and source references
- Roll up totals

### Schedule
- Create phases and milestones
- Assign rough dates or target timing
- Show simple project sequence

### Documents and photos
- Upload files
- Associate records with rooms, phases, or project areas
- View uploaded assets in project context

### Decisions
- Log decisions
- Track who made the decision
- Track date and status

### Change orders
- Create change records
- Track summary, impact, and status
- Link to project elements

### AI workflows
- Generate draft scope from intake
- Compare quotes against scope
- Generate progress summaries from notes and records
- Require user review before material changes become official

### Export
- Generate PDF summary
- Produce clean print-friendly output

## 14. Data Model, Early View

Core MVP entities:

- User
- Workspace
- Project
- IntakeResponse
- Room
- Phase
- ScopeItem
- BudgetCategory
- BudgetLine
- Milestone
- Document
- Photo
- Decision
- ChangeOrder
- Vendor
- Quote
- ActivityLog

## 15. Success Metrics

### Product metrics
1. project creation completion rate
2. intake completion rate
3. scope draft generation rate
4. percentage of projects with budget created
5. percentage of projects with at least one decision logged
6. percentage of projects exported as PDF
7. weekly active projects
8. retention after first project setup

### User value metrics
1. time from new project to first structured scope
2. number of decisions captured per active project
3. number of changes tracked per active project
4. frequency of document and photo uploads
5. repeat use across multiple projects

### Business learning metrics
1. number of beta users onboarded
2. number of homeowner users vs pro users
3. willingness to pay by segment
4. strongest acquisition channel
5. top use case by user segment

## 16. Risks

### Product risks
- trying to serve homeowners and pros equally at launch
- building too broad too early
- adding too much workflow before proving core value

### UX risks
- intake feels long or bureaucratic
- scope builder feels too rigid
- budget planner feels too shallow for pros and too complex for homeowners

### Engineering risks
- file handling and export add hidden complexity
- AI outputs become messy without structure
- data model becomes too heavy before workflow is proven

### Business risks
- unclear wedge
- weak willingness to pay
- slow onboarding if value is not visible in the first session

## 17. MVP Release Phases

### Phase 1, Core planning loop
- project creation
- intake
- AI scope draft
- manual scope editing
- project summary view

### Phase 2, Control layer
- budget planner
- schedule planner
- decision log
- change orders

### Phase 3, Evidence and output
- documents
- photos
- PDF export
- AI progress summaries
- quote comparison

## 18. Recommended First Vertical Slice

The first vertical slice should be:

1. create project
2. complete guided intake
3. generate AI draft scope
4. edit scope
5. record decisions
6. export project summary PDF

This slice proves the core promise fast.
It gives the user a tangible output.
It creates a clear demo story.
It is narrow enough to ship without getting trapped in full project management depth.

## 19. Open Questions for Validation

1. Which early wedge is stronger, homeowner-led planning or pro-led project control?
2. What is the minimum budget functionality users see as credible?
3. How much schedule detail do early users expect?
4. Do users want room-based planning, phase-based planning, or both by default?
5. Is PDF export a major driver of value early?
6. Which AI feature feels most valuable in the first session?
7. What form of project summary do users most want to share?

## 20. Immediate Next Steps

1. finalize repo structure
2. define core data model
3. define first vertical slice in GitHub issues
4. write first Codex build prompt
5. start founder-led validation with mockups and workflow demos