// Types for SD-Forge API endpoints

/**
 * Parameters for text-to-image generation.
 */
export interface Txt2ImgParams {
  prompt: string;
  negative_prompt?: string;
  steps?: number;
  cfg_scale?: number;
  width?: number;
  height?: number;
  seed?: number;
}

/**
 * Parameters for image-to-image editing (inpainting).
 */
export interface Img2ImgParams {
  init_images: string[]; // base64 images
  mask?: string;        // base64 PNG mask: white areas to edit
  prompt: string;
  negative_prompt?: string;
  steps?: number;
  cfg_scale?: number;
  denoising_strength?: number;
}

/**
 * Rectangle region definition for region-based editing.
 */
export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
  prompt: string;
}

/**
 * Parameters for region-based sequential editing.
 */
export interface RegionEditParams {
  image: string;     // base64 of the full canvas
  regions: Region[]; // list of region edits
  steps?: number;
  cfg_scale?: number;
  denoising_strength?: number;
}

/**
 * Response containing generated or edited images.
 */
export interface ImageResponse {
  images: string[];               // base64-encoded images
  parameters: Record<string, any>; // response metadata
  info: string;                   // debug or info string
}

/**
 * Progress update from SD-Forge.
 */
export interface ProgressResponse {
  current_image: string; // base64 of the current preview image
  progress: number;      // 0.0 to 1.0
  eta_relative: number;  // estimated seconds remaining
}

/**
 * History entry for previous versions of an image.
 */
export interface HistoryEntry {
  timestamp: string; // RFC3339Nano
  url: string;       // URL or base64 for thumbnail
}
/**
 * Parameters for a single-image Extras operation.
 */
export interface ExtrasParams {
  operation: string;
  image: string;
}

/**
 * Parameters for batch Extras operations.
 */
export interface ExtrasBatchParams {
  operations: string[];
  images: string[];
}

/**
 * Information about an available SD model.
 */
export interface ModelInfo {
  name: string;
}

/**
 * Request to switch SD model.
 */
export interface SwitchModelParams {
  model: string;
}

/**
 * Information about an available LoRA.
 */
export interface LoraInfo {
  name: string;
}