<!-- ENV_VARS.md: Documentation of environment variables used across the Image Processor project -->
# Environment Variables

This file documents all environment variables used by the Image Processor system. It is organized by component: Backend (Go server), Frontend (Vite + React), End-to-End Tests (Playwright), Docker Compose overrides, and additional development/testing helpers.

## Backend Configuration (Go Server)

- **MODE**
  - Purpose: Set server mode.
  - Values: `dev`, `prod`
  - Default: `prod`
  - Notes: When set to `dev`, the backend reverse-proxies unmatched routes to the frontend development server.

- **DEV_SERVER_URL**
  - Purpose: URL of the frontend development server (used when `MODE=dev`).
  - Default: `https://localhost:5800`

- **IMAGE_DIR**
  - Purpose: Base directory for image storage and metadata.
  - Default: `images`
  - Notes: Path is relative to the working directory unless an absolute path is provided. The server creates this directory if it does not exist.

- **SERVER_HOST**
  - Purpose: Host/address for the backend HTTP/HTTPS server to bind to.
  - Default: `127.0.0.1`

- **SERVER_PORT**
  - Purpose: Port for the backend HTTP/HTTPS server.
  - Default: `5700`

- **FORGE_SERVER_URL**
  - Purpose: URL of the SD-Forge server used for AI-based image generation.
  - Default: `http://localhost:7860`

## Frontend Configuration (Vite + React)

- **BACKEND_URL**
  - Purpose: Base URL for API and image requests in development (used by Vite proxy).
  - Default: `http://localhost:5700`
  - Read by: `vite.config.ts` to configure `/api` and `/images` proxies.

- **VITEST**
  - Purpose: Indicator set by Vitest to signal test environment.
  - Default: (set automatically by Vitest)
  - Read by: `vite.config.ts` to disable the React plugin during tests.

## End-to-End Tests (Playwright)

- **CI**
  - Purpose: Detect continuous integration environment.
  - Default: unset locally.
  - Effects: When set, Playwright skips auto-starting the dev server and increases test retry counts.

- **BASE_URL**
  - Purpose: Base URL for Playwright browser tests.
  - Default: `http://localhost:5800`
  - Read by: `playwright.config.ts` for test `use.baseURL`.

## Docker Compose Overrides

These environment variables are set or overridden in `docker-compose.yml` for containerized development:

- `IMAGE_DIR` (backend): `/app/images`
- `GOCACHE`: `/app/.cache/go-build` (Go build cache directory)
- `SERVER_HOST` (backend): `0.0.0.0`
- `MODE` (backend): `dev`
- `DEV_SERVER_URL` (backend): `https://frontend:5800`
- `BACKEND_URL` (frontend): `https://backend:5700`
- `BASE_URL` (e2e tests, commented out): `http://frontend:5800`

## Development & Testing Helpers

- **GOCACHE**
  - Purpose: Directory for Go build cache (speeds up recompilation).
  - Used in: `docker-compose.yml`, `scripts/setup-dev.sh`.

- **TMPDIR**, **GOTMPDIR**
  - Purpose: Directories for temporary files during Go module operations and tests.
  - Used in: `scripts/setup-dev.sh`, Go test invocations.