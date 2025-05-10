# AI Assistant Guide for the Image Processor Project
<!-- New AI guide begins here -->
## 1. Intent & Base Prompt
- **BASE_PROMPT.md**: official starting prompt.
- **Goal**: Provide high-level guidance so the AI can explore, propose, and apply changes confidently.

## 2. Project Overview
See [README.md](./README.md) for full details. In brief:
- **Backend**: Go (Gin) server for image APIs and static files.
- **Frontend**: React + TypeScript (Vite) UI with drag-and-drop and zoom.
- **Orchestration**: `docker-compose.yml` for local dev and E2E tests.
- **Theme Consistency**: It should work in both dark and light mode

## 3. Code Structure
**backend/**
- `main.go`: entrypoint and router.
- `internal/api/`: HTTP handlers, routing, SSE watcher.
- `internal/storage/`: metadata, EXIF, file-time helpers.
- `images/`: sample image directory with `metadata.json`.

**frontend/**
- `src/`: React components, context, services, utilities.
- `public/`: static assets (e.g., `dialog.json`).
- `e2e/`, `playwright.config.ts`: Playwright tests and config.

**root/**
 - `docker-compose.yml`: defines `backend`, `frontend`, and `e2e` services.
 - `BASE_PROMPT.md`: AI base prompt.
 - `README.md`: human-focused instructions.

## 3.1. Image API
We now serve images by hash-based identifiers rather than raw filenames. Each image returned by `GET /api/images` includes:
  - `id`: the SHA-256 hash of its filename (used as a stable identifier).
  - `url`: an endpoint to fetch the binary image data.
Filenames on disk continue to include timestamp prefixes (and may change on reordering), but the `id` remains consistent across renames.

### Key Endpoints
- `GET /api/images` (optional query `?path=<subdir>`)
  • Returns JSON list of images in the directory:
    ```json
    [
      { "id": "<hash>", "url": "/api/images/<hash>?path=<subdir>", "timestamp": "<RFC3339>" },
      ...
    ]
    ```
- `GET /api/images/:id` (optional query `?path=<subdir>`)
  • Serves the raw image bytes for the given `id` (hash).
 - `POST /api/images/:id/reorder` (optional query `?path=<subdir>`)
  • Reorders the image (the underlying filename/timestamp prefix may change).

Note: All endpoints (API, static images, SSE) now run over HTTPS (TLS) by default.

## 3.2. HTTPS & HTTP/3 (QUIC)
- The backend auto-generates a self-signed certificate into `backend/certs/` on startup.
- Docker Compose exposes both TCP and UDP on port 5700:
  • TCP 5700: HTTP/1.1 and HTTP/2 over TLS
  • UDP 5700: HTTP/3 (QUIC) support
- The development frontend mounts the same certs and serves over HTTPS (https://localhost:5800).
- Frontend proxies `/api` and `/images` to the backend’s HTTPS endpoint; the Vite config is set with `secure: false` to accept the self-signed cert.

## 4. Environment & Configuration
Create a `.env` file at the root or set environment variables directly:
```env
# Backend
IMAGE_DIR=images          # Base images directory
DEFAULT_PATH=             # Initial subdirectory path (empty = root)
SERVER_HOST=0.0.0.0       # Address for server to listen on (default)
SERVER_PORT=5700          # Port for server to listen on (default)

# Frontend (Vite)
VITE_API_BASE_URL=https://localhost:5700/api  # use HTTPS for all API calls
VITE_WS_URL=https://localhost:5700/api/updates  # SSE over HTTPS

// Ensure local Node/NPM match project engines:
NODE_VERSION=22.x       # Frontend requires Node 22.x
NPM_VERSION=11.3.x      # npm enforced via .npmrc (engine-strict)
```

## 5. Running & Testing
**Backend**
```bash
cd backend
go mod tidy
go run main.go            # http://localhost:5700
# Run unit tests; if /tmp or default cache is not writable, override build dirs:
mkdir -p .cache/go-build tmpdir
export GOCACHE=$(pwd)/.cache/go-build TMPDIR=$(pwd)/tmpdir GOTMPDIR=$(pwd)/tmpdir
go test ./...             # run unit tests
```

**Frontend**
```bash
cd frontend
npm install               # requires Node 22.x and npm 11.3.x
npm run dev               # https://localhost:5800 (accept untrusted self-signed cert)
npm test                  # Vitest
```

**End-to-End (E2E)**
```bash
npx playwright test --ignore-certificate-errors   # tests against HTTPS dev server
```
or via Docker Compose:
```bash
docker-compose up --exit-code-from frontend frontend
```

## 6. AI Constraints & Best Practices
**Do**
- Ask clarifying questions when requirements are ambiguous.
- Explore code (`ls`, `grep -R`, etc.) before proposing changes.
- Draft minimal patches with `apply_patch` and clear summaries.
- Run all relevant tests (`go test`, `npm test`, `npx playwright test`) before finalizing.
- When proposing external dependencies, check what the latest version are, and whether there are any known security issues

**Don’t**
- Introduce large refactors without approval.
- Break existing tests or IDE/CI workflows.
- Add new licenses or heavy dependencies without need.
- Hardcode environment-specific values.

## 7. Patch Workflow Example
1. **Explore**
   ```bash
   ls backend/internal/api
   grep -R "reorder" -n backend
   ```
2. **Draft Patch**
   ```bash
   apply_patch << 'EOF'
   *** Begin Patch
   *** Update File: backend/internal/api/handlers.go
   @@ -123,7 +123,7 @@ func reorderHandler(c *gin.Context) {
        // ...
-   -    doSomethingWrong()
+   +    doSomethingBetter()
   }
   *** End Patch
   EOF
   ```
3. **Run Tests**
   ```bash
   cd backend && go test ./...
   cd frontend && npm test
   npx playwright test
   ```
4. **Document**: Summarize changes and confirm tests are passing.

## 8. Troubleshooting
- **Hot-reload issues**: restart `npm run dev` after renames.
- **metadata.json parse errors**: validate JSON or fix ordering via UI.
- **SSE disconnect**: check `VITE_WS_URL` and CORS.
- **Missing `IMAGE_DIR`**: ensure env var is set or directory exists.

## 9. CI & Deployment (Future)
While no CI is currently configured, ensure changes satisfy:
```
# Backend
go test ./...

# Frontend
npm install && npm run lint && npm run build

# E2E
npx playwright test
```
<!-- New AI guide ends here -->