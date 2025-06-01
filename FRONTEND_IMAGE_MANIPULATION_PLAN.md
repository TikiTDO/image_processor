# Frontend Image Manipulation & Editing UI Plan

This document outlines the required frontend features, components, and workflows needed to
integrate the SD-Forge image generation and editing endpoints into our React application.

## 1. API Client Extensions
- In `src/services/api.ts`, add functions corresponding to each new endpoint:
  - `txt2img(params: Txt2ImgParams): Promise<ImageResponse>`
  - `img2img(params: Img2ImgParams): Promise<ImageResponse>`
  - `extras(params: ExtrasParams): Promise<ImageResponse>`
  - `extrasBatch(params: ExtrasBatchParams): Promise<ImageResponse[]>`
  - `regionEdit(params: RegionEditParams): Promise<ImageResponse>`
  - `getProgress(skipCurrent?: boolean): Promise<ProgressResponse>`
  - `getModels(): Promise<ModelInfo[]>`
  - `switchModel(params: SwitchModelParams): Promise<SwitchModelResponse>`
  - `getLoras(): Promise<LoraInfo[]>`
  - `ping(): Promise<void>`

## 2. React Hooks & Context
- Create a `useForge` context or discrete hooks to wrap API calls and manage shared state:
  - `useTxt2Img`, `useImg2Img`, `useExtras`, `useRegionEdit` for mutations
  - `useProgress` polling hook for live updates
  - `useModels`, `useLoras` for listing and selecting models/LoRAs

## 3. UI Components
- ### Interaction Modes
- **Add Mode**: in the gallery or grid, click the "+" slot between two images to open a generate dialog (Txt2ImgPanel) pre-scoped to that position.
- **View/Edit Mode**: when inspecting a single image in a lightbox, toggle to Edit Mode to:
  - **Full Img2Img**: apply global edits with new prompts/settings.
  - **Infill Mode**: draw or upload a mask overlay to confine edits to masked regions.
  - **Region Config**: open RegionEditor to define multiple rectangles, each with its own prompt for sequential edits.
  - **Extras**: access ExtrasPanel for post-processing (GFPGAN, depth net, IP-Adapter) on the current image.
-
- ### Panels & Components
- **Txt2ImgPanel**: fields for prompt, negative prompt, dimensions, steps, CFG scale, seed; Generate button; displays result images in a grid or lightbox.
- **Img2ImgPanel**: shows the image under edit; mask drawing/upload tools; prompt and denoising strength inputs; Apply button.
- **ExtrasPanel**: lists extra operations; options per operation; Run button; side-by-side before/after outputs.
- **RegionEditor**: canvas overlay with draggable/resizable rectangles; per-region prompt inputs; Apply Regions button; live preview.
- **ProgressModal**: shows a progress bar, live base64 preview of the current image in the queue, percentage, ETA; Cancel button.
- **ModelSelector** & **LoraSelector**: dropdowns or modals for selecting and switching models/LoRAs.

## 4. Integration Points
- Add an **AI Tools** menu or sidebar with entries: "Add Image", "Edit Image", "Regions", "Extras".
- In **ImageGrid**, render a "+" slot between every two images in Add Mode; clicking it opens the Txt2ImgPanel for that index.
- In **Lightbox**, when viewing a single image, show Edit controls:
  - "Full Edit" → launches Img2ImgPanel
  - "Infill" → launches Img2ImgPanel with mask tools visible
  - "Regions" → opens RegionEditor
  - "Extras" → loads ExtrasPanel
- On new image generation in Add Mode, the backend will name and timestamp the file to slot into FS ordering; grid should refresh via SSE or polling.
- On editing/replacing an image, save the new version alongside previous versions in its metadata directory; lightbox should expose a **History** view of timestamps/versions.

## 5. State Management & User Flow
- On user action:
  - Open ProgressModal, call the relevant mutation hook, and start polling `/api/v1/progress` for live previews.
  - Update the modal with interim base64 previews, progress percentage, and ETA.
- On success:
  - **Add Mode**: new image file is created and ordered in the FS—refresh ImageGrid (via SSE or polling) to display at its new slot.
  - **Edit Modes** (Img2Img, Infill, Regions, Extras): new version is saved in the image’s metadata directory alongside existing versions.
    • Lightbox History: expose a version selector or timeline showing available timestamps; selecting a version updates the displayed image.
- On completion: close ProgressModal (or allow leaving open to view history); show a toast or notification confirming success.
- On error: display clear error message in modal and allow retry, parameter adjustment, or cancel.

## 6. Styling & Accessibility
- Reuse existing CSS variables and theme styles (kebab-case class names).
- Ensure all controls and modals are keyboard-accessible with ARIA labels.
- For canvas/mask tools, support responsive and touch interactions.

## 7. Testing Strategy
- **Unit tests**: Vitest for hooks and API client mocks; validate form controls and state transitions.
- **E2E tests**: Playwright flows for generating images, applying inpainting/region edits, model switching, and progress UI.

## 8. Future Enhancements
- Evaluate React Query for caching and automatic retries.
- Add undo/redo and history for region-based edits.
- Support freeform brush masks and advanced mask editing tools.
- Enable sharing or exporting generated images.

*End of Frontend UI Plan*