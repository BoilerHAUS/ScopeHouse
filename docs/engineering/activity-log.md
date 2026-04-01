# Activity Log

## Goal

Keep a lightweight, queryable audit trail for important project actions without introducing a heavy workflow engine.

## Current Event Types

- `project_created`
- `project_updated`
- `intake_started`
- `intake_saved`
- `intake_completed`

## MVP Rules

- Every activity entry belongs to a `Project`.
- Every activity entry belongs to a `Workspace`.
- The actor is linked when a user action triggered the event.
- `summary` is human-readable and safe to show in the project UI.
- `metadata` stays narrow and structured for later reporting.

## Initial Usage

- log project creation
- log intake start
- log intake saves
- log intake completion

## Query Pattern

Use a project-scoped query helper that:

- enforces workspace ownership
- returns newest-first entries
- exposes actor display name, event type, summary, and created timestamp

This supports trust, future exports, and higher-value summaries later.
