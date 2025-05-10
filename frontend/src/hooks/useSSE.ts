import { useEffect } from 'react';

/**
 * Custom hook to subscribe to a Server-Sent Events endpoint.
 * @param url The SSE endpoint URL.
 * @param onMessage Callback invoked with the event data string when an "update" event is received.
 */
export function useSSE(url: string, onMessage: (data: string) => void): void {
  useEffect(() => {
    if (typeof EventSource === 'undefined') {
      // SSE not supported or in test environment
      return;
    }
    let es: EventSource;
    try {
      es = new EventSource(url);
    } catch (e) {
      console.error('Failed to create EventSource:', e);
      return;
    }
    const handler = (e: MessageEvent) => {
      onMessage(e.data);
    };
    es.addEventListener('update', handler as any);
    es.onerror = (err) => {
      console.error('SSE error:', err);
      es.close();
    };
    return () => {
      es.removeEventListener('update', handler as any);
      es.close();
    };
  }, [url, onMessage]);
}