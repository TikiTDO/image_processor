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

  // Add-mode overlay index
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
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
        <div
          className="grid"
          ref={gridRef}
          onMouseMove={(e) => {
            if (!addMode || !onAddImage) return;
            const rect = gridRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = e.clientX - rect.left;
            const cell = zoomLevel + 10; // item size + gap
            let idx = Math.floor(x / cell) + 1;
            if (idx < 0) idx = 0;
            if (idx > images.length) idx = images.length;
            setHoverIndex(idx);
          }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {images.map((img) => (
            <SortableItem
              key={`${img.id}-${img.timestamp}`}
              id={img.id}
              url={img.url}
              size={zoomLevel}
              dialogLine={dialogPreviewMap?.[img.id] || ''}
              onClick={() => { if (!isDragging.current) onItemClick(img.id); }}
              onRemove={() => onRemoveImage && onRemoveImage(img.id)}
              onHide={() => onHideImage && onHideImage(img.id)}
            />
          ))}
          {addMode && hoverIndex !== null && (
            <div
              className="add-slot"                
              style={{
                position: 'absolute',
                top: 0,
                left: `${hoverIndex * (zoomLevel + 10) - zoomLevel / 2}px`,
                width: zoomLevel,
                height: zoomLevel,
                pointerEvents: 'none',
              }}
            >
              <div
                className="add-circle"
                style={{ pointerEvents: 'auto', position: 'relative', top: '50%', transform: 'translateY(-50%)' }}
                onClick={() => onAddImage(hoverIndex)}
              />
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default ImageGrid;