import React, { Fragment, useRef, useState, useEffect } from 'react';
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

interface ImageGridProps {
  images: ImageMeta[];
  zoomLevel: number;
  path: string;
  /** Optional cache buster map for image reloads */
  bustMap?: Record<string, number>;
  /** Callback after a successful reorder operation (optimistic update) */
  onReorderComplete: (movedId: string, prevId: string | null, nextId: string | null) => void;
  /** Callback when reorder API fails: parent should revert state */
  onReorderError?: () => void;
  onItemClick: (id: string) => void;
  /** Called when Remove Image is selected */
  onRemoveImage?: (id: string) => void;
  /** Called when Hide Image is selected */
  onHideImage?: (id: string) => void;
  /** Called when Add slot is clicked: position index to insert new image */
  onAddImage?: (index: number) => void;
  /** Optional map of first dialog preview per image ID */
  dialogPreviewMap?: Record<string, string>;
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
  onAddImage,
  dialogPreviewMap,
}) => {
  const isDragging = useRef(false);
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
      // Determine neighbor IDs
      const tempImages = arrayMove(images, oldIndex, newIndex);
      const prev = newIndex > 0 ? tempImages[newIndex - 1].id : null;
      const next = newIndex < tempImages.length - 1 ? tempImages[newIndex + 1].id : null;
      // Optimistic UI update
      onReorderComplete(active.id as string, prev, next);
      // Call reorder API, handle errors
      reorderImage(active.id as string, prev, next, path).catch((err) => {
        console.error('Error reordering image:', err);
        alert(`Failed to reorder image: ${err}`);
        onReorderError && onReorderError();
      });
    }
  };

  // Previews for first dialog line provided by parent (if any)

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
          {images.map((img, idx) => {
            const key = `${img.id}-${img.timestamp}`;
            const previewLine = dialogPreviewMap?.[img.id] || '';
            return (
              <Fragment key={key}>
                <SortableItem
                  id={img.id}
                  url={img.url}
                  size={zoomLevel}
                  dialogLine={previewLine}
                  onClick={() => {
                    if (isDragging.current) return;
                    onItemClick(img.id);
                  }}
                  onRemove={() => onRemoveImage && onRemoveImage(img.id)}
                  onHide={() => onHideImage && onHideImage(img.id)}
                />
                {onAddImage && idx < images.length - 1 && (
                  <div
                    className="add-slot"
                    style={{ width: zoomLevel, height: zoomLevel }}
                    onClick={() => onAddImage(idx + 1)}
                  >
                    +
                  </div>
                )}
              </Fragment>
            );
          })}
          {onAddImage && images.length > 0 && (
            <div
              className="add-slot"
              style={{ width: zoomLevel, height: zoomLevel }}
              onClick={() => onAddImage(images.length)}
            >
              +
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default ImageGrid;