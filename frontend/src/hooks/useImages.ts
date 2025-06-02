import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { getImages, getImageDialogs, type ImageMeta } from '../services/api';
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

  const imagesKey: QueryKey = ['images', path];
  const dialogsKey: QueryKey = ['dialogs', path];

  const imagesQuery = useQuery<ImageMeta[], Error>({
    queryKey: imagesKey,
    queryFn: () => getImages(path),
  });
  const dialogsQuery = useQuery<Record<string, string[]>, Error>({
    queryKey: dialogsKey,
    queryFn: () => getImageDialogs(path),
  });

  useSSE('/api/updates', () => {
    void queryClient.invalidateQueries(imagesKey);
    void queryClient.invalidateQueries(dialogsKey);
  });

  return {
    images: imagesQuery.data ?? [],
    dialogs: dialogsQuery.data ?? {},
    refresh: imagesQuery.refetch,
    refreshDialogs: dialogsQuery.refetch,
    setImages: (updater: ImageMeta[] | ((old?: ImageMeta[]) => ImageMeta[])) =>
      queryClient.setQueryData<ImageMeta[]>(imagesKey, updater),
  };
}