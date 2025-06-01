import { useState, useEffect } from 'react';
import { ProgressResponse, getProgress } from '../services/api';

/**
 * Polls the /api/v1/progress endpoint at 1s intervals.
 * @param skipCurrent skip current image preview
 */
export function useProgress(skipCurrent: boolean = false) {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const signal = controller.signal;

    async function poll() {
      try {
        const res = await getProgress(skipCurrent);
        if (!mounted || signal.aborted) return;
        setData(res);
      } catch (e) {
        if (!mounted || signal.aborted) return;
        setError(e as Error);
      } finally {
        if (!mounted || signal.aborted) return;
        setLoading(false);
      }
    }
    poll();
    const id = setInterval(poll, 1000);
    return () => {
      mounted = false;
      controller.abort();
      clearInterval(id);
    };
  }, [skipCurrent]);
  return { data, error, loading };
}