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

## 4. Environment & Configuration
Create a `.env` file at the root or set environment variables directly:
```env
# Backend
IMAGE_DIR=images          # Base images directory
DEFAULT_PATH=             # Initial subdirectory path (empty = root)

# Frontend (Vite)
VITE_API_BASE_URL=http://localhost:5700/api
VITE_WS_URL=http://localhost:5700/api/updates
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
npm install
npm run dev               # http://localhost:5800
npm test                  # Vitest
```

**End-to-End (E2E)**
```bash
npx playwright test
# or via Docker Compose
docker-compose up --exit-code-from e2e frontend e2e
```

## 6. AI Constraints & Best Practices
**Do**
- Ask clarifying questions when requirements are ambiguous.
- Explore code (`ls`, `grep -R`, etc.) before proposing changes.
- Draft minimal patches with `apply_patch` and clear summaries.
- Run all relevant tests (`go test`, `npm test`, `npx playwright test`) before finalizing.

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