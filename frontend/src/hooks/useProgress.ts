import { useGetProgressQuery, ProgressResponse } from '../api';

/**
 * Hook to fetch SD-Forge progress data with automatic 1s polling.
 * NOTE: Keep ProgressResponse in sync with backend /api/v1/progress response shape.
 * @param skipCurrent skip current image preview
 * @returns { data, error, loading } where:
 *   - data: latest ProgressResponse or null
 *   - error: Error object or null
 *   - loading: boolean indicating initial fetch status
 */
export function useProgress(
  skipCurrent: boolean = false
): { data: ProgressResponse | null; error: Error | null; loading: boolean } {
  const {
    data = null,
    error = null,
    isLoading: loading,
  } = useGetProgressQuery(
    { skipCurrent },
    { refetchInterval: 1000, keepPreviousData: true }
  );
  return { data, error, loading };
}