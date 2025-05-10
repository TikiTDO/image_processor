import React from 'react';

interface ZoomControlsProps {
  zoomLevel: number;
  zoomPresets: number[];
  onZoomChange: (newZoom: number) => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ zoomLevel, zoomPresets, onZoomChange }) => {
  const size = Math.min(Math.max(zoomLevel * 0.2, 30), 60);
  const btnStyle: React.CSSProperties = {
    width: size,
    height: size,
    fontSize: size * 0.5,
  };

  return (
    <>
      <button
        className="zoom-btn"
        style={btnStyle}
        onClick={() => onZoomChange(Math.max(zoomPresets[0], zoomLevel - 25))}
        aria-label="Zoom out"
      >
        &minus;
      </button>
      <button
        className="zoom-btn"
        style={btnStyle}
        onClick={() => onZoomChange(Math.min(zoomPresets[zoomPresets.length - 1], zoomLevel + 25))}
        aria-label="Zoom in"
      >
        +
      </button>
      <select
        className="zoom-select"
        value={zoomLevel}
        onChange={(e) => onZoomChange(Number(e.target.value))}
        aria-label="Zoom level"
      >
        {zoomPresets.map((z) => (
          <option key={z} value={z}>
            {z}px
          </option>
        ))}
      </select>
    </>
  );
};

export default ZoomControls;