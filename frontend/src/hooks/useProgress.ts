import { useQuery } from '@tanstack/react-query';
import { ProgressResponse, getProgress } from '../services/api';

/**
 * Hook to fetch progress data with automatic polling.
 * @param skipCurrent skip current image preview
 */
export function useProgress(skipCurrent: boolean = false) {
  const query = useQuery<ProgressResponse, Error>(
    ['progress', skipCurrent],
    () => getProgress(skipCurrent),
    {
      refetchInterval: 1000,
      keepPreviousData: true,
    }
  );
  return {
    data: query.data || null,
    error: query.error || null,
    loading: query.isLoading,
  };
}