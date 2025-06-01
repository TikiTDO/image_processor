 # Frontend Improvements Proposal

 This document tracks proposed refactors and enhancements to the frontend for improved maintainability, consistency, and developer experience. Each section represents a discrete improvement and its current status.

 ## Adopt a Data-Fetching Library
 **Status**: In Progress
 **Description**: Replace ad-hoc `useEffect`/`fetch` patterns (e.g., `useImages`, `PathPicker`, `useProgress`) with a dedicated data-fetching library that offers:
   - Built-in caching and deduplication
   - Stale-while-revalidate and polling support
   - Explicit loading and error states
   - Manual cache invalidation (e.g., on SSE or mutation events)

### Decision
 After evaluating our options, we have selected **React Query (TanStack Query)** because:
   - Declarative `useQuery`/`useMutation` hooks with built-in loading and error states
   - Automated caching, background refetching, and polling (`refetchInterval`)
   - Manual cache invalidation for SSE/mutations via `queryClient.invalidateQueries`
   - Excellent TypeScript support and DevTools for debugging

 **Not Selected**:
   - SWR: minimal but requires manual polling/invalidation and lacks built-in mutation cache handling
   - RTK Query: powerful but introduces Redux boilerplate without existing Redux usage
   - Custom `useFetch`: insufficient feature set compared to well-tested libraries

### Progress Tracker
 - [x] React Query installation & setup
 - [x] `useProgress` migration
 - [x] `useImages` migration
 - [x] `PathPicker` migration
 - [x] Dialog queries & mutations
 - [x] Default path query
 - [x] Speaker config queries & mutations
 - [ ] Other API queries/mutations
 - [ ] Code cleanup (remove legacy hooks)

### Next Phase: OpenAPI-Driven Codegen Pipeline
We will introduce an OpenAPI-based process to auto-generate TypeScript types and React Query hooks from the backend API spec, eliminating manual typing and syncing overhead.

#### Proposed Steps
 - [ ] Define and maintain an up-to-date OpenAPI (Swagger) specification for all `/api` endpoints.
 - [ ] Add a codegen configuration (e.g., OpenAPI Generator or `openapi-typescript-codegen`) to generate:
     - TypeScript interfaces for request and response payloads.
     - React Query hooks (via the `typescript-react-query` generator) for each endpoint.
 - [ ] Commit generated types/hooks to `frontend/src/api/` (or similar) and import them in place of manual services.
 - [ ] Refactor existing data-fetching to use generated hooks for images, dialogs, speakers, progress, etc.
 - [ ] Automate codegen execution in `package.json` scripts and CI (e.g., `npm run generate:api`).
 - [ ] Update documentation to describe how to regenerate types/hooks after backend changes.

#### Stage Tracker
 - [ ] OpenAPI spec drafted and reviewed.
 - [ ] Codegen toolchain installed and configured.
 - [ ] Initial codegen run (types & hooks generated).
 - [ ] Integration of generated hooks in core components.
 - [ ] CI pipeline updated to run codegen on changes.

 ## Extract a Generic Data-Fetching Hook or Switch to React Query
 **Status**: Proposed
 **Description**: Create a `useFetch` or `useData` hook to unify loading/error boilerplate, or fully adopt React Query's `useQuery` API for consistency.

 ## Normalize Modals and Dropdowns into Shared Components
 **Status**: Proposed
 **Description**: Introduce generic `<Modal>` and `<Dropdown>` components with built-in outside-click and escape-to-close behavior. Refactor `DirectoryManagementModal`, `SpeakerConfigModal`, and context menus to use these primitives.

 ## Extract Context-Menu / Long-Press Menu into Reusable Hook & Component
 **Status**: Proposed
 **Description**: Leverage the existing `usePress` hook and encapsulate context-menu UI in a `<ContextMenu>` component to replace bespoke logic in `SortableItem`.

 ## Clean Up services/api.ts
 **Status**: Proposed
 **Description**: Merge duplicate imports, split core vs. Forge endpoints into `api.ts` and `forgeApi.ts`, and factor out common URL/query-param builders (e.g., a `withPath` helper).

 ## Move Inline Styles into CSS or CSS Modules
 **Status**: Proposed
 **Description**: Eliminate scattered `style` props in favor of CSS classes, CSS Modules, or a CSS-in-JS solution to improve theming and reduce inline overrides.

 ## Consolidate Form Controls in Forge Panels
 **Status**: Proposed
 **Description**: Extract shared form field components (inputs, selects, sliders) or adopt a form library (e.g., `react-hook-form`) to reduce boilerplate in `Txt2ImgPanel`, `Img2ImgPanel`, `RegionEditor`, etc.

 ## Introduce CSS Modules or CSS-in-JS for Component-Scoped Styling
 **Status**: Proposed
 **Description**: Migrate existing global CSS to a scoped styling solution to avoid collisions and simplify style maintenance.

 ## Add Shared Click-Outside and Escape-to-Close Hooks
 **Status**: Proposed
 **Description**: Provide a reusable hook (e.g., `useClickOutside`) to handle dropdown/modal closing on outside click or ESC key, replacing inline event handlers.

 ## Evaluate Global State Solution for Images/Dialogs
 **Status**: Proposed
 **Description**: Consider adopting a global state store (Context, Zustand, or similar) for images and dialog data if prop drilling becomes cumbersome.

 ## Create a UI Toolkit Folder for Common Widgets
 **Status**: Proposed
 **Description**: Establish a `ui/` directory containing shared components such as `Modal`, `Dropdown`, `SegmentedControl`, `ContextMenu`, and others for reuse across the frontend.