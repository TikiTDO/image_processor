import { useState, useEffect, useCallback } from 'react';
import { getImages, getImageDialogs, ImageMeta } from '../services/api';
import { useSSE } from './useSSE';

// Hook to manage images list and dialogs cache for a given path
export function useImages(path: string) {
  const [images, setImages] = useState<ImageMeta[]>([]);
  const [dialogs, setDialogs] = useState<Record<string, string[]>>({});

  const fetchImages = useCallback(() => {
    getImages(path)
      .then(setImages)
      .catch((err) => console.error('Error fetching images:', err));
  }, [path]);

  // Initial fetch and on path change
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Subscribe to server-sent updates
  useSSE('/api/updates', fetchImages);

  // Fetch all dialogs for images in this path
  useEffect(() => {
    getImageDialogs(path)
      .then(setDialogs)
      .catch((err) => console.error('Error fetching dialogs:', err));
  }, [path]);

  return { images, dialogs, refresh: fetchImages, setImages };
}