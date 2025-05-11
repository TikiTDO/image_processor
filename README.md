# Image Processor

This repository contains a Go-based backend and a React + TypeScript frontend for loading, displaying, and reordering a directory of images. Reordering is persisted to disk via a simple metadata file.

## Directory Structure
- backend/: Go HTTP server (Gin), image API, and static image serving
- frontend/: React + TypeScript UI using Vite and dnd-kit for drag-and-drop

## Backend Setup
1. Install Go (>= 1.18).
2. cd backend
3. Ensure Go can write to your system temp directory (default: `/tmp`) for build caches.
4. Run `go mod tidy` to fetch dependencies.
5. Place your `.jpg`, `.jpeg`, and `.png` files into the `backend/images/` directory (it will be created automatically on first run).
6. Run the server (HTTPS with HTTP/3 support):
   ```sh
   # Optionally override listening address and port (defaults: 0.0.0.0 and 5700)
   # export SERVER_HOST=127.0.0.1 SERVER_PORT=5700
   go run main.go
   ```
   The server listens on the configured address and port using TLS:
   - HTTPS (HTTP/1.1 & HTTP/2) at https://localhost:5700
   - HTTP/3 (QUIC) negotiated automatically by compatible clients over UDP port 5700
   > Note: You may need to trust the self-signed certificate in your browser or client.
7. Run tests:
   Go by default writes build artifacts to `/tmp`. If you encounter a "permission denied" error when running tests (common in restricted or containerized environments), override the temp directory:
   ```sh
   mkdir -p tmpdir
   export TMPDIR=$(pwd)/tmpdir GOTMPDIR=$(pwd)/tmpdir
   go test ./...
   ```

## Frontend Setup
1. Ensure Node.js and npm are installed.
2. cd frontend
3. Run `npm install` (or `pnpm install` / `yarn install`) to install dependencies.
4. Run the development server:
   ```sh
   npm run dev
   ```
   The dev server runs at http://localhost:5800, proxying `/api` and `/images` to the backend.
5. Run tests:
   ```sh
   npm test
   # or to watch files:
   npm run test:watch
   ```

### Local Development Bootstrap

If you’d like to bootstrap all local development tooling—Git pre-commit hooks (with Python venv and yamllint) and frontend dependencies—run:
```sh
bash scripts/setup-dev.sh
```

Open http://localhost:5800 in your browser to start dragging and reordering images.

## Docker Compose Setup

If you have Docker and Docker Compose installed, you can run both the backend and frontend in development mode with a single command:

```sh
docker-compose up
```
You can also run the end-to-end Playwright tests in Docker by bringing up the frontend and e2e services together:

```sh
# This will build the e2e test image, start the frontend service, and run tests
docker-compose up --exit-code-from e2e frontend e2e
```
> Note: The backend service uses **reflex** to watch for changes in `.go` files and will automatically rebuild and restart when you modify backend code.