import React, { useState, useEffect, useRef } from 'react';
import './ZoomControls.css';
interface ZoomControlsProps {
  zoomLevel: number;
  zoomPresets: number[];
  onZoomChange: (newZoom: number) => void;
}


const ZoomControls: React.FC<ZoomControlsProps> = ({ zoomLevel, zoomPresets, onZoomChange }) => {
  // Static button size is controlled via CSS; remove dynamic inline sizing

  // Zoom controls: circle buttons and central slider
  const minZoom = zoomPresets[0];
  const maxZoom = zoomPresets[zoomPresets.length - 1];
  // Increment zoom by preset difference (e.g., 50px)
  const step = zoomPresets[1] - zoomPresets[0] || 50;
  // state for slider menu visibility
  const [menuVisible, setMenuVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // close menu on outside click
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setMenuVisible(false);
      }
    };
    if (menuVisible) {
      document.addEventListener('mousedown', handleDocClick);
      return () => document.removeEventListener('mousedown', handleDocClick);
    }
  }, [menuVisible]);
  return (
    <div className="zoom-controls" ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        className="zoom-btn"
        onClick={() => onZoomChange(Math.max(minZoom, zoomLevel - step))}
        aria-label="Zoom out"
      >
        &minus;
      </button>
      <button
        className="zoom-number-btn"
        onClick={(e) => { e.stopPropagation(); setMenuVisible((v) => !v); }}
        aria-label="Select zoom level"
      >
        {zoomLevel}%
      </button>
      <button
        className="zoom-btn"
        onClick={() => onZoomChange(Math.min(maxZoom, zoomLevel + step))}
        aria-label="Zoom in"
      >
        +
      </button>
      {menuVisible && (
        <div className="zoom-menu">
          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            step={step}
            value={zoomLevel}
            onChange={(e) => onZoomChange(Number(e.target.value))}
          />
        </div>
      )}
    </div>
  );
};

export default ZoomControls;