import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryObserverResult } from '@tanstack/react-query';
import { getImages, getImageDialogs, ImageMeta } from '../services/api';
import { useSSE } from './useSSE';

/**
 * Hook to manage images list and dialogs cache for a given directory path.
 * NOTE: Ensure ImageMeta and dialog types here match the backend /api/images and /api/dialogs endpoints.
 */
export function useImages(
  path: string
): {
  images: ImageMeta[];
  dialogs: Record<string, string[]>;
  refresh: () => Promise<QueryObserverResult<ImageMeta[], Error>>;
  refreshDialogs: () => Promise<QueryObserverResult<Record<string, string[]>, Error>>;
  setImages: (
    updater: ImageMeta[] | ((old?: ImageMeta[]) => ImageMeta[])
  ) => void;
} {
  const queryClient = useQueryClient();

  const {
    data: images = [],
    refetch: refetchImages,
  } = useQuery<ImageMeta[], Error>(
    ['images', path],
    () => getImages(path),
    { keepPreviousData: true }
  );

  const {
    data: dialogs = {},
    refetch: refetchDialogs,
  } = useQuery<Record<string, string[]>, Error>(
    ['dialogs', path],
    () => getImageDialogs(path)
  );

  // Invalidate queries on server-sent events updates
  useSSE('/api/updates', () => {
    queryClient.invalidateQueries(['images', path]);
    queryClient.invalidateQueries(['dialogs', path]);
  });

  return {
    images,
    dialogs,
    refresh: refetchImages,
    refreshDialogs: refetchDialogs,
    // Allow manual override or updater function for optimistic updates
    setImages: (
      updater: ImageMeta[] | ((old: ImageMeta[] | undefined) => ImageMeta[])
    ) => queryClient.setQueryData<ImageMeta[]>(['images', path], updater),
  };
}