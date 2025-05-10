<!-- AI_README.md: Guide for the AI assistant on the Image Processor project -->
# AI Assistant Guide: Image Processor Project

This document equips the AI assistant with everything needed to understand, explore, and modify the Image Processor codebase. It covers project structure, technologies, environment, workflows, testing, and AI-specific guidelines.

## 1. Intent & Base Prompt
- Refer to **BASE_PROMPT.md** for the foundational system prompt.
- **Objective**: Enable the AI to navigate, analyze, propose, and apply targeted, minimal changes with confidence and adherence to project conventions.

## 2. High-Level Overview
- **Backend**: Go HTTP server (Gin) exposing REST and SSE endpoints, serving images and metadata.
- **Frontend**: React + TypeScript (Vite) UI with drag-and-drop reordering, zoom, image dialogs, and speaker configuration.
- **End-to-End Tests**: Playwright tests validating user interactions.
- **Orchestration**: `docker-compose.yml` for cohesive local environment.

## 3. Directory Structure
### Root
- `AI_README.md` ‑ AI-focused guide (this file).
- `BASE_PROMPT.md` ‑ AI base prompt.
- `README.md` ‑ human-oriented quickstart.
- `docker-compose.yml` ‑ container definitions.
- `.env` ‑ environment variables (e.g., `OPENAI_API_KEY`).

### Backend (`backend/`)
- `main.go`: entrypoint, env setup, server launch.
- `internal/api/`: routing and handlers for:
  - `GET /api/images` (list)
  - `GET /api/images/:id` (bytes)
  - `POST /api/images` (upload)
  - `POST /api/images/:id/reorder`
  - `GET /api/dirs`
  - `GET /api/path`
  - `GET /api/updates` (SSE)
  - `GET/POST /api/speakers`
  - `GET/POST /api/images/:id/dialog`
  - `GET /api/images/:id/description`
- `internal/storage/`: metadata, EXIF, filename/time helpers.
- `images/`: default and sample image dirs.
- `certs/`: self-signed certs (used by frontend dev server).

### Frontend (`frontend/`)
- `src/`: React components, contexts, hooks, services, and utilities.
- `vite.config.ts`: HTTPS dev server (port 5800), proxies `/api` & `/images` to `BACKEND_URL`.
- `src/services/api.ts`: fetch wrappers for backend endpoints.
- `e2e/` & `playwright.config.ts`: Playwright tests and config.

## 4. Configuration & Environment
### Backend Environment Variables
| Name          | Default       | Purpose                                |
|---------------|---------------|----------------------------------------|
| IMAGE_DIR     | `images`      | Base image directory                   |
| DEFAULT_PATH  | ``            | Initial subdirectory path              |
| SERVER_HOST   | `127.0.0.1`   | Host to bind                           |
| SERVER_PORT   | `5700`        | Port for HTTP server                   |

### Frontend Environment Variables
| Name             | Default                      | Purpose                                    |
|------------------|------------------------------|--------------------------------------------|
| BACKEND_URL      | `https://localhost:5700`      | Proxy target for `/api` & `/images`        |
| VITE_API_BASE_URL| *(optional)*                | Client‐side API base URL (absolute calls)   |
| VITE_WS_URL      | *(optional)*                | SSE/WebSocket URL for updates               |

> Note: Vite exposes only `VITE_` prefixed vars to client via `import.meta.env`.

## 5. Running Locally
### Backend
```bash
cd backend
go mod tidy
# For tests in restricted envs:
mkdir -p .cache/go-build tmpdir
export GOCACHE=$(pwd)/.cache/go-build TMPDIR=$(pwd)/tmpdir GOTMPDIR=$(pwd)/tmpdir
go run main.go         # https://127.0.0.1:5700
go test ./...          # unit tests
```

### Frontend
```bash
cd frontend
npm install            # or yarn/pnpm
npm run dev            # https://localhost:5800
npm test               # Vitest
```

### End-to-End
```bash
npx playwright test --ignore-certificate-errors
```

## 6. Docker Compose
```bash
docker-compose up              # starts backend (5700), frontend (5800)
# E2E (optional):
docker-compose up --exit-code-from e2e frontend e2e
```
Services:
- **backend**: Go + reflex hot-reload on 5700
- **frontend**: Vite HTTPS dev server on 5800
- **e2e**: Playwright runner (if enabled)

## 7. AI Development Workflow
### Exploration
- Use `ls`, `grep -R`, and running tests to understand code.

### Patching
1. Draft minimal `apply_patch` diffs:
   ```bash
   apply_patch << 'EOF'
   *** Begin Patch
   *** Update File: path/to/file
   @@ -old,+new @@
   -oldLine
   +newLine
   *** End Patch
   EOF
   ```
2. Run all tests: `go test`, `npm test`, `npx playwright test`.

### Best Practices
- Fix root causes; avoid broad refactors.
- Preserve existing tests and workflows.
- Parameterize ports/URLs; avoid hardcoding.
- Document all non-obvious changes.

### Constraints
- Ask clarifying questions if needed.
- No new heavy dependencies or license headers.

<!-- EOF: AI assistant guide -->
