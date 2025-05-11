import React from 'react';
import { useSpeakerContext } from '../../context/SpeakerContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface SortableItemProps {
  id: string;
  url: string;
  size: number;
  /** First dialog line in format "<speakerId>:<text>" */
  dialogLine?: string;
  onClick?: () => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, url, size, dialogLine, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  // Parse dialogLine into speakerId and text for preview
  const { colors } = useSpeakerContext();
  let previewText = '';
  let previewColor = '';
  if (dialogLine) {
    const parts = dialogLine.split(':');
    const speakerId = Number(parts[0]);
    previewText = parts.slice(1).join(':');
    previewColor = colors[speakerId] || '#000';
  }
  const style: React.CSSProperties = {
    width: `${size}px`,
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} className="item">
      {/* Drag handle: click or press to reorder */}
      <div
        className="drag-handle"
        {...attributes}
        {...listeners}
      >
        {isDragging ? '✋' : '☰'}
      </div>
      {/* Image click opens lightbox */}
      <img
        src={url}
        alt={id}
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick();
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          onClick && onClick();
        }}
      />
      <div className="filename">{id}</div>
      {/* Preview first dialog line with speaker-specific color */}
      {dialogLine && (
        <div
          className="dialog-preview"
          style={{ color: previewColor }}
        >
          {previewText}
        </div>
      )}
    </div>
  );
};

export default SortableItem;