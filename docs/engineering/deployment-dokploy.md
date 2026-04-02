# Deploying ScopeHouse with Dokploy

ScopeHouse ships as a production Docker image. This guide covers deploying it to a VPS using [Dokploy](https://dokploy.com).

## Prerequisites

- A VPS with Dokploy installed
- A managed or self-hosted PostgreSQL database reachable from the server
- (Optional) An OpenAI API key for AI-assisted features

## Image overview

The `Dockerfile` is a three-stage build:

1. **deps** — installs all npm dependencies
2. **builder** — runs `next build` to produce the [standalone output](https://nextjs.org/docs/app/api-reference/next-config-js/output#automatically-copying-traced-files)
3. **runner** — minimal Alpine image with only runtime files and the Prisma CLI

On startup, the entrypoint script (`scripts/docker-entrypoint.sh`) runs `prisma migrate deploy` before handing off to `node server.js`.

## Environment variables

Set these in Dokploy under **Environment → Variables**.

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string (`postgresql://user:pass@host:5432/db`) |
| `OPENAI_API_KEY` | No | — | Enables AI quote comparison. Leave unset to disable gracefully. |
| `OPENAI_MODEL` | No | `gpt-5-mini` | OpenAI model ID to use |
| `PROJECT_FILES_BACKEND` | No | `local` | Storage backend selector. Current supported value: `local` |
| `PROJECT_FILES_DIR` | No | `.storage` | Path inside the container where uploaded files are stored |
| `PROJECT_FILES_BUCKET` | No | `project-files` | Storage bucket label (used by the adapter boundary) |
| `NODE_ENV` | — | set in Dockerfile | Always `production` in the container |

## Persistent file storage

Until a cloud storage adapter is in place, uploaded project files are written to the local filesystem at the path set by `PROJECT_FILES_DIR` (default: `/app/.storage`).

**You must mount a persistent volume at `/app/.storage`** — or at whatever path `PROJECT_FILES_DIR` points to — otherwise uploaded files will be lost on container restarts.

In Dokploy: **Volumes → Add volume**, set the container path to `/app/.storage`.

## Storage adapter boundary

ScopeHouse now resolves file storage through `server/storage/adapter.ts` and `server/storage/project-files.ts`.

- `PROJECT_FILES_BACKEND=local` keeps the current filesystem-backed behavior
- future object storage support should be added as a new adapter behind the same boundary
- feature-layer code should not import a concrete storage backend directly

Migration path for a future production backend:

1. Add a new adapter implementation in `server/storage/`.
2. Register it in `server/storage/adapter.ts`.
3. Switch `PROJECT_FILES_BACKEND` in the environment.
4. Migrate existing files from the local volume into the new backend.

## Migration strategy

Migrations run automatically at container startup via `prisma migrate deploy`. This command:

- Applies any pending migrations from `db/migrations/`
- Is safe to run on every deploy (it is idempotent)
- Does **not** prompt or drop data

If a migration fails, the container will exit with a non-zero code and Dokploy will report the deployment as failed. Check the container logs to diagnose.

To run migrations manually against a running container:

```sh
dokploy exec <app-name> -- ./node_modules/.bin/prisma migrate deploy --config ./prisma.config.ts
```

## Dokploy setup steps

1. **Create a new application** in Dokploy — choose **Docker** source.
2. **Connect your repository** (GitHub / GitLab) or push the image to a registry and point Dokploy at it.
3. Set the **Dockerfile path** to `Dockerfile` (the repo root).
4. Add all required **environment variables** (see table above).
5. Under **Volumes**, add a persistent volume mapped to `/app/.storage`.
6. Set the **exposed port** to `3000`.
7. Deploy. Dokploy will build the image, run migrations on startup, and route traffic to the container.

## Health check

The app does not expose a dedicated health endpoint. Dokploy's default TCP check on port 3000 is sufficient for most setups.

To add an HTTP health check, configure Dokploy to `GET /` and treat a `200` or `302` response as healthy.

## Scaling and zero-downtime deploys

- The app is stateless apart from the database and the file storage volume.
- Running multiple replicas requires a shared network volume for `/app/.storage` (e.g. NFS or a cloud block store) until the production storage adapter is in place.
- Database connection pooling is not configured by default. Add a PgBouncer sidecar or use a pooled connection string for high-concurrency deployments.
