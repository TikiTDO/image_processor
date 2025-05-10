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
import { ImageMeta, reorderImage } from '../../services/api';
import { getImageDialog } from '../../services/api';

interface ImageGridProps {
  images: ImageMeta[];
  zoomLevel: number;
  path: string;
  /** Optional cache buster map for image reloads */
  bustMap?: Record<string, number>;
  /** Callback after reorder: movedId, prevNeighborId, nextNeighborId */
  onReorderComplete: (movedId: string, prevId: string | null, nextId: string | null) => void;
  onItemClick: (id: string) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  zoomLevel,
  path,
  bustMap,
  onReorderComplete,
  onItemClick,
}) => {
  const isDragging = useRef(false);
  // Map from image ID to its first dialog line (e.g. "0:Hello")
  const [dialogMap, setDialogMap] = useState<Record<string, string>>({});
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor)
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

  // Fetch the first dialog line for each image to display in the grid
  useEffect(() => {
    // Reset map when images or path change
    setDialogMap({});
    images.forEach((img) => {
      getImageDialog(img.id, path)
        .then((dlg) => {
          const line = dlg && dlg.length > 0 ? dlg[0] : '';
          setDialogMap((prev) => ({ ...prev, [img.id]: line }));
        })
        .catch((err) => {
          console.error('Error fetching dialog preview:', err);
        });
    });
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
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default ImageGrid;