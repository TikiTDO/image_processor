<!-- AI_README.md: Comprehensive guide for the AI assistant on the Image Processor project -->
# AI Assistant Guide: Image Processor Project

This document equips the AI assistant with everything needed to navigate, understand, and modify the Image Processor codebase. It includes architecture overviews, directory structure, development workflows, storage conventions, and AI-specific coding guidelines.

---

## 1. Base Prompt & Goals
- **Base Prompt**: See `BASE_PROMPT.md` for the foundational system instructions.
- **Primary Objective**: Enable the AI to propose, draft, and apply precise, minimal changes that adhere to project conventions, pass all tests, and commit the changes into git.
  
### Recent Refactors
- backend: centralized configuration in `main.go` via a `Config` struct and `loadConfig` helper
- backend: embedded static frontend build into Go binary using `embed.FS`, updated dev/prod routing
- frontend: introduced `useImages` hook for image list, dialogs cache, and SSE-driven refresh
- frontend: extracted header UI into a `HeaderControls` component with sticky layout
- frontend: added Scroll-to-Top button, dark-mode styling for header buttons, and narrator name default styling
- frontend: refactored `ImageGrid` reorder to use hook-driven refresh and preserved console error logging

---

## 2. High-Level Architecture

### Backend (Go + Gin + HTTP/3)
- Entrypoint: `backend/main.go`
- Router & Handlers: `backend/internal/api/`
  • `router.go`: route definitions (images, dialogs, reorder, speakers, dirs)
  • `handlers.go`: implementations, delegates to `storage`
- Storage Layer: `backend/internal/storage/`
  • `metadata.go`: JSON metadata migration and per-ID entry APIs
  • `dialog.go`: dialog entry load/save/move/delete with SHA256-hashed IDs
  • `filetime.go` & `exif.go`: fallback timestamp extraction
- Image Files: `backend/images/` (default), configurable via `IMAGE_DIR`

### Frontend (React + TypeScript + Vite)
- Sources: `frontend/src/`
- UI Components & Styling:
  • SortableItem (`components/SortableItem`): separates content (`.item`, image, dialog-preview) from ordering handle (`.drag-handle`).
    - `.item` wrapper holds image, dialog preview (`.dialog-preview`), and action buttons.
    - `.drag-handle` (separate button) triggers dnd-kit sorting; prevents accidental drags on image content.
  • ImageGrid (`components/ImageGrid`): grid layout with drag-and-drop context via dnd-kit; fetches dialog previews.
  • ZoomControls (`components/ZoomControls`): uses `.zoom-btn`, `.zoom-number-btn`, and `.zoom-menu` classes.
    - Minus/plus buttons adjust zoom by preset step (e.g., 50px).
    - Central button toggles an anchored slider menu; outside clicks close it.
    - Theme-aware styling with CSS variables/text-stroke for contrast.
  • Styling Conventions:
    - CSS classes in `kebab-case`; scoped per component.
    - Prefer theme-aware variables and media queries (`prefers-color-scheme`).
    - Use `text-stroke` and `text-shadow` for legibility on colored backgrounds.
    - Avoid inline styles except for dynamic positioning; prefer CSS transitions and flex layouts.
- Key features: drag-and-drop (dnd-kit), lightbox, dialogs, speaker settings
- API client: `src/services/api.ts`
- Dev server: `vite.config.ts` (HTTPS, proxies `/api` & `/images` to backend)
- E2E Tests: `frontend/e2e/`, configured in `playwright.config.ts`

### Orchestration & Dev Tools
- `docker-compose.yml`: backend (5700), frontend (5800), optional e2e service
- `scripts/setup-dev.sh`: bootstraps pre-commit hooks, linters, Node dependencies
- Certificates: `backend/certs/` for HTTPS & HTTP/3

---

## 3. Directory Structure Summary

Root
- AI_README.md            ← This AI-focused guide
- BASE_PROMPT.md          ← AI base prompt
- README.md               ← Human quickstart
- docker-compose.yml      ← Dev containers
- scripts/                ← setup & utility scripts

backend/
- main.go                 ← Server startup & config
- internal/api/           ← HTTP router & handlers
- internal/storage/       ← Metadata, dialogs, timestamps, EXIF
- images/                 ← Image storage (subdirs possible)
- certs/                  ← TLS key & cert
- tests, tmpdir, go.mod, go.sum, …

frontend/
- src/                    ← React components, hooks, services
- e2e/                    ← Playwright end-to-end tests
- vite.config.ts          ← Dev server & proxy settings
- package.json, tsconfig.json, …

---

## 4. Storage Layout

Images reside under `IMAGE_DIR` (default `backend/images`). For each image the backend maintains a metadata directory based on the file's SHA‑256 hash:

```
metadata/
  └── <prefix>/                ← first 2 characters of the hash
       └── <fullhash>/         ← full hex digest
            ├── image          ← symlink to the original image
            ├── timestamp.json ← RFC3339Nano string
            └── dialog.json    ← JSON array of strings
```

Legacy `metadata.json` and `dialogs/` files are migrated on demand.

---

## 5. Common Commands & Workflows

### Backend
```bash
cd backend
go mod tidy
# Run server (HTTPS & HTTP/3) with default behavior (API only):
IMAGE_DIR=images go run main.go

# Development mode: proxy all HTTP and WebSocket requests to the frontend dev server
# (default https://localhost:5800, override with DEV_SERVER_URL)
DEV_SERVER_URL=https://localhost:5800 IMAGE_DIR=images go run main.go -mode=dev

# Production mode: serve pre-built static frontend assets (default dir frontend/dist,
# override with STATIC_DIR)
STATIC_DIR=../frontend/dist IMAGE_DIR=images go run main.go -mode=prod

# Build frontend static assets for production
../scripts/build-static.sh

# Tests (if temp-dir issues):
mkdir -p tmpdir
export TMPDIR=$(pwd)/tmpdir GOTMPDIR=$(pwd)/tmpdir
go test ./...
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # https://localhost:5800
npm test          # Vitest unit tests
```

### End-to-End
```bash
npx playwright test --ignore-certificate-errors
```

### Docker Compose
```bash
docker-compose up          # backend, frontend
docker-compose up --exit-code-from e2e frontend e2e  # run E2E
```

---

## 6. AI Patching & Coding Guidelines

1. **Explore**: use `ls`, `grep -R`, `go test`, `npm test`, `npx playwright test` to understand code and verify changes.
2. **Draft Patches**: use `apply_patch` blocks with minimal, targeted diffs:
   ```bash
   apply_patch << 'EOF'
   *** Begin Patch
   *** Update File: path/to/file.go
   @@ -oldLineStart,oldCount +newLineStart,newCount @@
   -oldCode()
   +newCode()
   *** End Patch
   EOF
   ```
3. **Testing**: after any backend change, run `go test ./...`. After frontend change, run `npm test`. For E2E, run `npx playwright test`.
4. **Root-Cause Fixes**: address the source of issues, not just symptoms. Preserve existing behavior and tests unless intentional change.
5. **No New Dependencies**: avoid adding heavy libraries. Leverage stdlib and existing modules.
6. **Ask When Unsure**: request clarification if internal logic is unclear or tests break unexpectedly.
7. **Commit to git**: When you are ready so submit your code for review, commit. You should explicitly author your commits as `AI Coder` at `ai@sereth.com`.

---

## 7. Next Steps
1. **Extend Storage Model**: add `annotations.json` to accommodate future AI-generated metadata.
2. **Componentize UI**: extract Lightbox (`<Lightbox>`) and dialog sidebar (`<DialogSidebar>`) into reusable components and hooks.
3. **Styling System**: migrate to CSS Modules or styled-components for component-scoped styles and maintainable theming.
4. **Typed API Client**: evaluate using a generated TypeScript client or a data-fetching library (e.g., React Query) for robust, type-safe API interactions.
5. **Build Orchestration**: introduce a Makefile or npm script to automate `scripts/build-static.sh` prior to Go builds and unify the build pipeline.

---
## 8. Image Manipulation Plan
- A zero-Python plan for full image generation and editing (txt2img, img2img/infill, IP-Adapter, depth net, region prompts, model & LoRA management) is detailed in `IMAGE_MANIPULATION_PLAN.md`.
---
*End of AI Assistant Guide*
