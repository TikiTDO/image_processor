import { fetchJson } from '../utils/fetchJson';

// Metadata for an image
export interface ImageMeta {
  id: string;
  url: string;
  timestamp: string;
}

/**
 * Upload image files via multipart/form-data.
 * Files are appended in order to respect the dropped file sequence.
 * @param path Optional subdirectory path under which to upload.
 * @param files Array of File objects to upload.
 */
export async function uploadImages(
  path?: string,
  files?: File[]
): Promise<void> {
  if (!files || files.length === 0) return;
  const query = path ? `?path=${encodeURIComponent(path)}` : '';
  const form = new FormData();
  files.forEach((file) => form.append('files', file));
  try {
    const response = await fetch(`/api/images${query}`, {
      method: 'POST',
      body: form,
    });
    if (!response.ok) {
      console.error(`Upload failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Error uploading images:', error);
  }
}

// Directory entry info from backend
export interface DirEntry {
  name: string;
  image_count: number;
  dir_count: number;
}

/**
 * Fetch list of images, optionally filtered by path.
 * @param path Optional subdirectory path.
 */
export async function getImages(path?: string): Promise<ImageMeta[]> {
  const url = '/api/images' + (path ? `?path=${encodeURIComponent(path)}` : '');
  return fetchJson<ImageMeta[]>(url, []);
}

/**
 * Fetch list of subdirectories for a given path.
 * @param path Optional subdirectory path.
 */
export async function getDirs(path?: string): Promise<DirEntry[]> {
  const url = '/api/dirs' + (path ? `?path=${encodeURIComponent(path)}` : '');
  return fetchJson<DirEntry[]>(url, []);
}

/**
 * Reorder an image by sending its new neighbors to backend.
 * @param id Image ID being moved.
 * @param prevId ID of previous image or null.
 * @param nextId ID of next image or null.
 * @param path Optional path parameter.
 */
export async function reorderImage(
  id: string,
  prevId: string | null,
  nextId: string | null,
  path?: string
): Promise<void> {
  const query = path ? `?path=${encodeURIComponent(path)}` : '';
  try {
    await fetch(`/api/images/${id}/reorder${query}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prev_id: prevId, next_id: nextId }),
    });
  } catch (error) {
    console.error('Error updating order:', error);
  }
}
// Fetch dialog entries for an image
export async function getImageDialog(id: string, path?: string): Promise<string[]> {
  const query = path ? `?path=${encodeURIComponent(path)}` : '';
  const res = await fetchJson<{dialog: string[]}>(
    `/api/images/${encodeURIComponent(id)}/dialog${query}`, { dialog: [] }
  );
  return res.dialog;
}
// Save dialog entries for an image
export async function setImageDialog(id: string, dialog: string[], path?: string): Promise<void> {
  const query = path ? `?path=${encodeURIComponent(path)}` : '';
  await fetch(`/api/images/${encodeURIComponent(id)}/dialog${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dialog }),
  });
}
// Fetch raw description (EXIF ImageDescription) for an image
export async function getImageDescription(id: string, path?: string): Promise<string> {
  const query = path ? `?path=${encodeURIComponent(path)}` : '';
  try {
    const res = await fetch(`/api/images/${encodeURIComponent(id)}/description${query}`);
    if (!res.ok) return '';
    const data = await res.json();
    return data.description || '';
  } catch (e) {
    console.error('Error fetching image description:', e);
    return '';
  }
}
// Fetch combined speaker colors and names
export interface SpeakerMeta {
  speaker_colors: Record<number, string>;
  speaker_names: Record<number, string>;
}
/**
 * Fetch speaker configuration (colors and names) from server.
 */
export async function getSpeakers(): Promise<SpeakerMeta> {
  return fetchJson<SpeakerMeta>('/api/speakers', { speaker_colors: {}, speaker_names: {} });
}
/**
 * Save speaker configuration (colors and names) to server.
 */
export async function setSpeakers(meta: SpeakerMeta): Promise<void> {
  await fetch('/api/speakers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(meta),
  });
}
/**
 * Fetch the default image path (root or subdirectory) to initialize UI.
 */
export async function getDefaultPath(): Promise<string> {
  const res = await fetchJson<{ path: string }>('/api/path', { path: '' });
  return res.path;
}
// Fetch dialog entries for all images in the given path (bulk).
export async function getImageDialogs(path?: string): Promise<Record<string, string[]>> {
  const query = path ? `?path=${encodeURIComponent(path)}` : '';
  const res = await fetchJson<{ dialogs: Record<string, string[]> }>(
    `/api/dialogs${query}`,
    { dialogs: {} }
  );
  return res.dialogs;
}