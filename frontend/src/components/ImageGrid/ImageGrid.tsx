import React, { useRef, useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import SortableItem from '../SortableItem';
import { ImageMeta, reorderImage, getImageDialogs } from '../../services/api';

interface ImageGridProps {
  images: ImageMeta[];
  zoomLevel: number;
  path: string;
  /** Optional cache buster map for image reloads */
  bustMap?: Record<string, number>;
  /** Callback after reorder: movedId, prevNeighborId, nextNeighborId */
  onReorderComplete: (movedId: string, prevId: string | null, nextId: string | null) => void;
  onItemClick: (id: string) => void;
  /** Called when Remove Image is selected */
  onRemoveImage?: (id: string) => void;
  /** Called when Hide Image is selected */
  onHideImage?: (id: string) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  zoomLevel,
  path,
  bustMap,
  onReorderComplete,
  onItemClick,
  onRemoveImage,
  onHideImage,
}) => {
  const isDragging = useRef(false);
  // Map from image ID to its first dialog line (e.g. "0:Hello"), loaded via bulk API
  const [dialogMap, setDialogMap] = useState<Record<string, string>>({});
  const sensors = useSensors(
    // Pointer sensor for mouse and pen input, with minimum drag distance
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    // Touch sensor for touch input, with a small delay before activation to avoid conflicts with tap
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      const newImages = arrayMove(images, oldIndex, newIndex);
      // Calculate neighbor IDs
      const prev = newIndex > 0 ? newImages[newIndex - 1].id : null;
      const next =
        newIndex < newImages.length - 1 ? newImages[newIndex + 1].id : null;
      reorderImage(active.id, prev, next, path).finally(() => {
        onReorderComplete(active.id as string, prev, next);
      });
    }
  };

  // Fetch dialog previews for all images in one request
  useEffect(() => {
    getImageDialogs(path)
      .then((map) => {
        const preview: Record<string, string> = {};
        images.forEach((img) => {
          const lines = map[img.id] || [];
          preview[img.id] = lines.length > 0 ? lines[0] : '';
        });
        setDialogMap(preview);
      })
      .catch((err) => console.error('Error fetching dialog previews:', err));
  }, [images, path]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={() => {
        isDragging.current = true;
      }}
      onDragEnd={(event) => {
        handleDragEnd(event);
        setTimeout(() => {
          isDragging.current = false;
        }, 0);
      }}
      onDragCancel={() => {
        isDragging.current = false;
      }}
    >
      <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
        <div className="grid">
          {images.map((img) => {
            // Use hash-based URL; cache invalidation via hash change without extra params
            const key = `${img.id}-${img.timestamp}`;
            const url = img.url;
            return (
              <SortableItem
                key={key}
                id={img.id}
                url={url}
                size={zoomLevel}
                dialogLine={dialogMap[img.id]}
                onClick={() => {
                  if (isDragging.current) return;
                  onItemClick(img.id);
                }}
                onRemove={() => onRemoveImage && onRemoveImage(img.id)}
                onHide={() => onHideImage && onHideImage(img.id)}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default ImageGrid;