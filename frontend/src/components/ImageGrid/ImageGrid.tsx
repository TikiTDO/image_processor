import React, { Fragment, useRef, useState } from 'react';
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
import { ImageMeta } from '../../services/api';
import { useReorderImageMutation } from '../../api';

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
  /** When true, hover-plus overlay is enabled and onAddImage will handle clicks */
  addMode?: boolean;
  /** Called when Add overlay is clicked: position index to insert new image */
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
  addMode = false,
  onAddImage,
  dialogPreviewMap,
}) => {
  const isDragging = useRef(false);
  // Hover state for Add Mode overlays
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredSide, setHoveredSide] = useState<'before' | 'after' | null>(null);
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

  const reorderMutation = useReorderImageMutation();
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
      // Call generated reorder mutation, handle errors
      reorderMutation.mutate(
        { id: active.id as string, prev_id: prev, next_id: next, path },
        {
          onError: (err: any) => {
            console.error('Error reordering image:', err);
            alert(`Failed to reorder image: ${err}`);
            onReorderError && onReorderError();
          }
        }
      );
    }
  };

  // Reset hover overlay when exiting add mode
  React.useEffect(() => {
    if (!addMode) {
      setHoveredIndex(null);
      setHoveredSide(null);
    }
  }, [addMode]);
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
          {images.map((img, idx) => (
            <div
              key={img.id}
              style={{ position: 'relative' }}
              onMouseMove={(e) => {
                if (!addMode || !onAddImage) return;
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                const relX = e.clientX - rect.left;
                const side: 'before' | 'after' = relX < rect.width / 2 ? 'before' : 'after';
                setHoveredIndex(idx);
                setHoveredSide(side);
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                setHoveredSide(null);
              }}
            >
              <SortableItem
                id={img.id}
                url={img.url}
                size={zoomLevel}
                dialogLine={dialogPreviewMap?.[img.id] || ''}
                onClick={() => { if (!isDragging.current) onItemClick(img.id); }}
                onRemove={() => onRemoveImage && onRemoveImage(img.id)}
                onHide={() => onHideImage && onHideImage(img.id)}
              />
              {addMode && onAddImage && hoveredIndex === idx && hoveredSide === 'before' && (
                <div
                  className="add-overlay add-before"
                  onClick={() => onAddImage(idx)}
                />
              )}
              {addMode && onAddImage && hoveredIndex === idx && hoveredSide === 'after' && (
                <div
                  className="add-overlay add-after"
                  onClick={() => onAddImage(idx + 1)}
                />
              )}
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default ImageGrid;