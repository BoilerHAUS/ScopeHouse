# Rate Limiting

ScopeHouse uses lightweight in-memory rate limiting to reduce obvious abuse on high-risk entry points without adding external infrastructure.

## Protected paths

- auth server actions: per IP
- document and photo upload actions: per user
- AI generation routes and server actions: per project

## Why this approach

- it works in local development and single-instance deployments
- it avoids adding Redis or another shared dependency before MVP fit
- it keeps the enforcement logic isolated in `server/rate-limit/`

## Current limits

Environment variables:

- `RATE_LIMIT_AUTH_MAX_REQUESTS`
- `RATE_LIMIT_AUTH_WINDOW_SECONDS`
- `RATE_LIMIT_UPLOAD_MAX_REQUESTS`
- `RATE_LIMIT_UPLOAD_WINDOW_SECONDS`
- `RATE_LIMIT_AI_MAX_REQUESTS`
- `RATE_LIMIT_AI_WINDOW_SECONDS`

Default behavior:

- auth: 10 attempts per 5 minutes
- uploads: 20 requests per 10 minutes
- AI: 6 generations per 15 minutes

## Current limitations

- the default store is in-memory and instance-local
- counters do not sync across multiple replicas
- server restarts clear counters

That is acceptable for the current MVP, but this should not be treated as a full abuse-prevention layer for larger-scale deployments.

## Upgrade path

If ScopeHouse needs stronger production enforcement later:

1. Keep the action and route call sites as-is.
2. Replace the in-memory store in `server/rate-limit/store.ts`.
3. Point the same limiter functions at the new shared store.
