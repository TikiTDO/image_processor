import React, { useState, useRef, useEffect } from 'react';
import { useSpeakerContext } from '../../context/SpeakerContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// import press hook (replaced by custom pointer handlers) removed

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
  // Configure sortable drag behavior via a handle
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
  // Context menu and long-press state
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const closeMenus = () => { setMenuVisible(false); setModalVisible(false); };
  // Long-press detection for touch
  const LONG_DELAY = 600;
  const MOVE_THRESHOLD = 5;
  const touchStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const longPressTimer = useRef<number | undefined>(undefined);
  const longPressTriggered = useRef(false);
  const handleImgTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    longPressTriggered.current = false;
    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true;
      setModalVisible(true);
    }, LONG_DELAY);
  };
  const handleImgTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;
    if (Math.hypot(dx, dy) > MOVE_THRESHOLD && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };
  const handleImgTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!longPressTriggered.current) {
      onClick && onClick();
    }
    longPressTriggered.current = false;
  };
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuVisible(true);
  };
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
    >
      {/* Drag handle: visual indicator for reordering (drag anywhere) */}
      <button
        className="drag-handle"
        aria-label="Drag to reorder"
      >≡</button>
      {/* Edit icon for accessibility */}
      <button
        className="edit-icon"
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick();
        }}
        aria-label="Edit image"
      >✎</button>
      {/* Image: drag via container, handle click, context-menu, long-press */}
      <img
        src={url}
        alt={id}
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick();
          closeMenus();
        }}
        onContextMenu={handleContextMenu}
        onTouchStart={handleImgTouchStart}
        onTouchMove={handleImgTouchMove}
        onTouchEnd={handleImgTouchEnd}
      />
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