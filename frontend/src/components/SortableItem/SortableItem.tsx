import React, { useState, useRef, useEffect } from 'react';
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
  /** Called when Remove Image is selected */
  onRemove?: () => void;
  /** Called when Hide Image is selected */
  onHide?: () => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, url, size, dialogLine, onClick, onRemove, onHide }) => {
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
  // Press interactions: click, long-press, context menu
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const closeMenus = () => { setMenuVisible(false); setModalVisible(false); };
  const pressHandlers = usePress({
    onClick: (e) => {
      e.preventDefault();
      closeMenus();
      onClick && onClick();
    },
    onLongPress: (e) => {
      e.preventDefault();
      setMenuPos({ x: e.clientX, y: e.clientY });
      setMenuVisible(true);
    },
    onContextMenu: (e) => {
      e.preventDefault();
      setMenuPos({ x: e.clientX, y: e.clientY });
      setMenuVisible(true);
    },
  });
  // Close context menu when clicking outside
  useEffect(() => {
    if (!menuVisible) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuVisible]);
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="item"
      {...attributes}
      {...listeners}
      {...pressHandlers}
    >
      {/* Edit icon for accessibility */}
      <button
        className="edit-icon"
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick();
        }}
        aria-label="Edit image"
      >✎</button>
      {/* Image */}
      <img
        src={url}
        alt={id}
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
      {/* Context menu dropdown */}
      {menuVisible && (
        <div
          ref={menuRef}
          className="context-menu"
          style={{ position: 'fixed', top: menuPos.y, left: menuPos.x, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', padding: '4px 0', zIndex: 1000 }}
        >
          <button className="context-menu-item" onClick={() => { onRemove && onRemove(); closeMenus(); }}>Remove Image</button>
          <button className="context-menu-item" onClick={() => { onHide && onHide(); closeMenus(); }}>Hide Image</button>
        </div>
      )}
      {/* Modal for long press */}
      {modalVisible && (
        <div
          className="modal-overlay"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
          onClick={closeMenus}
        >
          <div
            className="modal-content"
            style={{ background: '#fff', padding: '1rem', margin: '10% auto', maxWidth: '300px', borderRadius: '4px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => { onRemove && onRemove(); closeMenus(); }}>Remove Image</button>
            <button onClick={() => { onHide && onHide(); closeMenus(); }}>Hide Image</button>
            <button onClick={closeMenus}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortableItem;