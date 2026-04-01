# AI Workflows

## Goal

Keep AI features observable, reviewable, and easy to debug.

## Current Pattern

- prompt files live under `prompts/<workflow>/`
- structured output schemas live in `features/ai/schemas/`
- provider and prompt loading live in `server/ai/`
- feature services call the shared AI runner instead of hand-rolling requests
- AI generations are logged in `AiGeneration`

## Prompt Contract

Each workflow directory includes:

- `system.md`
- `developer.md`
- `output-schema.json`

The runtime loader reads those files, hashes their contents, and records a prompt version alongside each AI generation.

## Logging Strategy

Each AI call records:

- workflow
- project linkage when available
- model
- prompt version
- request metadata
- response metadata
- structured output
- failure message when generation fails

This supports debugging without hiding AI behavior behind opaque helpers.

## Guardrails

- use structured outputs for MVP workflows
- do not let AI silently mutate core records
- store draft outputs for review before applying them
- fail safely when the model does not return a valid object
- keep prompts explicit and versioned

## Current Supported Flow

- `scope_draft`

The wrapper also has schemas and prompt wiring ready for:

- `quote_compare`
- `progress_summary`
