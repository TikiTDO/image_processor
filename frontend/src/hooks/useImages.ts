import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DefaultService, type ImageMeta } from '../api';
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

  const imagesKey = ['images', path] as const;
  const dialogsKey = ['dialogs', path] as const;

  const imagesQuery = useQuery(imagesKey, () => DefaultService.getImages(path));
  const dialogsQuery = useQuery(dialogsKey, () => DefaultService.getDialogs(path));

  useSSE('/api/updates', () => {
    void queryClient.invalidateQueries(imagesKey);
    void queryClient.invalidateQueries(dialogsKey);
  });

  return {
    images: imagesQuery.data ?? [],
    dialogs: dialogsQuery.data?.dialogs ?? {},
    refresh: imagesQuery.refetch,
    refreshDialogs: dialogsQuery.refetch,
    setImages: (updater: ImageMeta[] | ((old?: ImageMeta[]) => ImageMeta[])) =>
      queryClient.setQueryData(imagesKey, updater),
  };
}