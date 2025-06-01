# Frontend Image Manipulation Detailed Implementation Plan

This document breaks down the concrete steps, files, and components needed to implement
the SD-Forge–powered image generation and editing features in our React frontend.

## 1. Project Setup
- Ensure dependencies:
  - Install any needed drawing libraries (e.g. `react-canvas-draw` or use HTML Canvas API).
  - Add typings for base64 images if necessary.
  - Ensure `.env` support for `VITE_API_BASE_URL`.

## 2. API Types & Client (`src/services/api.ts`, `src/types/forge.ts`)
1. Create `src/types/forge.ts`:
   ```ts
   export interface Txt2ImgParams { prompt: string; negative_prompt?: string; steps?: number; cfg_scale?: number; width?: number; height?: number; seed?: number; }
   export interface Img2ImgParams { init_images: string[]; mask?: string; prompt: string; negative_prompt?: string; steps?: number; cfg_scale?: number; denoising_strength?: number; }
   export interface ImageResponse { images: string[]; parameters: Record<string, any>; info: string; }
   export interface ProgressResponse { current_image: string; progress: number; eta_relative: number; }
   // ... extras, models, loras, region requests
   ```
2. In `src/services/api.ts`, for each new endpoint:
   ```ts
   export async function txt2img(params: Txt2ImgParams): Promise<ImageResponse> {
     const resp = await fetch(`${API}/api/v1/txt2img`, { method: 'POST', headers: {...}, body: JSON.stringify(params) });
     return resp.json();
   }
   ```
   - Repeat for `img2img`, `regionEdit`, `extras`, etc.
   - `getProgress(skipCurrent?: boolean)` → `GET /api/v1/progress?skip_current_image=`
   - `getModels()` → `GET /api/v1/models`
   - `switchModel()` → `POST /api/v1/models/switch`
   - `getLoras()` → `GET /api/v1/loras`
   - `ping()` → `GET /api/v1/ping`

## 3. Hooks & State Management (`src/hooks/useForge.ts`)
1. Create context `ForgeContext` to store global API state (optional).
2. Implement custom hooks using `useState` and `useEffect` or React Query:
   - `useTxt2Img`: returns `mutate` function and `status`.
   - `useImg2Img`, `useExtras`, `useRegionEdit` similarly.
   - `useProgress(skip: boolean)`: polls `getProgress()` every second, returns `{ data, error, isLoading }`.
   - `useModels`, `useLoras`: fetch lists on mount.

## 4. UI Skeleton & Panels
1. Create directory `src/components/forge/`.
2. Add component scaffolds:
   - `Txt2ImgPanel.tsx`
   - `Img2ImgPanel.tsx`
   - `ExtrasPanel.tsx`
   - `RegionEditor.tsx` (wraps a `<canvas>` for rectangle selection)
   - `ProgressModal.tsx`
   - `ModelSelector.tsx`, `LoraSelector.tsx`
3. Each panel:
   - Accepts props for image index or image ID.
   - Renders form fields and calls corresponding hooks on submit.
   - Uses a shared `Modal` component for overlay.

## 5. ImageGrid Integration (`src/components/ImageGrid.tsx`)
1. In Add Mode, inject a clickable "+" slot between images:
   - On click, open `Txt2ImgPanel` with `insertIndex`.
2. After submission, listen to SSE `/api/updates` or re-fetch images.

## 6. Lightbox & Edit Controls (`src/components/Lightbox.tsx`)
1. When viewing, show buttons:
   - "Full Edit" → open `Img2ImgPanel` with `init_images=[current]`.
   - "Infill" → same panel, mask tool enabled.
   - "Regions" → open `RegionEditor`.
   - "Extras" → open `ExtrasPanel`.
2. Maintain selected version; pass `imageID` prop to panels.

## 7. RegionEditor Implementation
1. Use HTML Canvas to:
   - Draw background image.
   - Let user draw, move, resize rectangles.
   - Maintain an array of `{ x, y, width, height, prompt }`.
2. On Apply, generate a PNG mask for each region, then call `regionEdit` with base64 data.

## 8. Mask Drawing for Infill
1. In `Img2ImgPanel`, overlay a canvas for freehand drawing:
   - Black=keep, white=mask.
   - On submit, export mask as base64 PNG, send in `mask` field.

## 9. ProgressModal & Feedback
1. Create `ProgressModal` component:
   - Consumes `useProgress` hook.
   - Displays `<img src={current_image} />`, `<ProgressBar value={progress} />`, ETA.
   - Cancel button aborts fetch (use `AbortController`).

## 10. History & Versioning
1. Build a `HistoryPanel` in Lightbox:
   - Fetch `/api/dialogs` or a new `/api/v1/history?imageID=` endpoint.
   - List timestamps and thumbnails.
   - On select, load that version URL (`/api/images/:id?version=`) or fetch as base64.

## 11. Styling & Theming
- Follow existing CSS conventions: kebab-case, CSS variables, theme-aware colors.
- Ensure mobile responsiveness; test touch interactions for canvas.

## 12. Testing Plan
- **Unit**: Vitest to mock `api` functions and test hooks and components.
- **Integration**: Component tests for panels with `msw` to stub endpoints.
- **E2E**: Playwright flows simulating Add, Edit, Infill, Region, Extras, History, Progress.

---
# Task Breakdown & Timeline (example)
- Week 1: API client & types, basic `Txt2ImgPanel`. Hook and service tests.
- Week 2: Img2Img & Infill, ProgressModal, unit tests.
- Week 3: RegionEditor, ExtrasPanel, HistoryPanel, integration tests.
- Week 4: Model/Lora selectors, polishing, E2E tests, accessibility audit.