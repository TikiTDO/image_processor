import { useQueryClient } from '@tanstack/react-query';
import { useGetImagesQuery, useGetDialogsQuery, ImageMeta } from '../api';
import { useSSE } from './useSSE';

/**
 * Hook to manage images list and dialogs cache for a given directory path.
 * NOTE: Ensure ImageMeta and dialog types here match the backend /api/images and /api/dialogs endpoints.
 */
/**
 * Hook to fetch image metadata and dialogs for a given path using generated React Query hooks.
 * Ensure the OpenAPI spec remains in sync with the backend endpoints.
 */
export function useImages(path: string) {
  const queryClient = useQueryClient();

  const imagesQuery = useGetImagesQuery({ path }, { keepPreviousData: true });
  const dialogsQuery = useGetDialogsQuery({ path });

  // Invalidate generated queries on SSE updates
  useSSE('/api/updates', () => {
    queryClient.invalidateQueries(imagesQuery.queryKey);
    queryClient.invalidateQueries(dialogsQuery.queryKey);
  });

  return {
    images: imagesQuery.data ?? [],
    dialogs: dialogsQuery.data?.dialogs ?? {},
    refresh: imagesQuery.refetch,
    refreshDialogs: dialogsQuery.refetch,
    // Allow optimistic updates by setting new data
    setImages: (updater: ImageMeta[] | ((old?: ImageMeta[]) => ImageMeta[])) =>
      queryClient.setQueryData(imagesQuery.queryKey, updater),
  };
}