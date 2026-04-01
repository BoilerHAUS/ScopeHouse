# Activity Log

## Goal

Keep a lightweight, queryable audit trail for important project actions without introducing a heavy workflow engine.

## Current Event Types

- `project_created`
- `project_updated`
- `intake_started`
- `intake_saved`
- `intake_completed`
- `scope_draft_generated`
- `scope_draft_applied`
- `budget_category_saved`
- `budget_category_deleted`
- `budget_line_saved`
- `budget_line_deleted`
- `schedule_phase_saved`
- `schedule_phase_deleted`
- `schedule_phase_reordered`
- `schedule_milestone_saved`
- `schedule_milestone_deleted`
- `schedule_milestone_reordered`
- `document_uploaded`
- `document_deleted`
- `photo_uploaded`
- `photo_deleted`
- `decision_saved`
- `decision_deleted`
- `change_order_saved`
- `change_order_deleted`
- `progress_summary_generated`

## MVP Rules

- Every activity entry belongs to a `Project`.
- Every activity entry belongs to a `Workspace`.
- The actor is linked when a user action triggered the event.
- `summary` is human-readable and safe to show in the project UI.
- `metadata` stays narrow and structured for later reporting.

## MVP Usage

- log project creation, intake progress, and scope draft actions
- log budget category and budget line saves and deletions
- log schedule phase and milestone saves, deletions, and reordering
- log document and photo uploads and deletions
- log decision and change-order saves and deletions
- log AI project summary generation

## Query Pattern

Use a project-scoped query helper that:

- enforces workspace ownership
- returns newest-first entries
- exposes actor display name, event type, summary, and created timestamp

This supports trust, future exports, and higher-value summaries later.
