import React, { useState, useRef } from 'react';
import { RegionEditParams, Region, ImageResponse } from '../../types/forge';
import { regionEdit } from '../../services/api';
import ProgressModal from './ProgressModal';

interface RegionEditorProps {
  initImage: string;
  onComplete?: (resp: ImageResponse) => void;
  onCancel?: () => void;
}

const RegionEditor: React.FC<RegionEditorProps> = ({ initImage, onComplete, onCancel }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [current, setCurrent] = useState<Region | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  // Convert client coords to image-relative
  const toImageCoords = (clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (!img) return { x: 0, y: 0 };
    const rect = img.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * img.naturalWidth;
    const y = ((clientY - rect.top) / rect.height) * img.naturalHeight;
    return { x, y };
  };

  const handleDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const start = toImageCoords(e.clientX, e.clientY);
    setCurrent({ x: start.x, y: start.y, width: 0, height: 0, prompt: '' });
    setDrawing(true);
  };
  const handleMove = (e: React.MouseEvent) => {
    if (!drawing || !current) return;
    const pt = toImageCoords(e.clientX, e.clientY);
    setCurrent({ ...current, width: pt.x - current.x, height: pt.y - current.y, prompt: current.prompt });
  };
  const handleUp = () => {
    if (current) setRegions((r) => [...r, current]);
    setCurrent(null);
    setDrawing(false);
  };

  const handleApply = () => {
    const params: RegionEditParams = { image: initImage, regions };
    setShowProgress(true);
    regionEdit(params)
      .then((resp) => onComplete?.(resp))
      .catch((e) => console.error(e))
      .finally(() => setShowProgress(false));
  };

  return (
    <div className="forge-panel region-editor">
      <h2>Region Editor</h2>
      <div
        style={{ position: 'relative', display: 'inline-block' }}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
      >
        <img ref={imgRef} src={initImage} alt="Original" style={{ display: 'block', maxWidth: '100%' }} />
        {regions.map((r, i) => (
          <div key={i}
            style={{
              position: 'absolute',
              border: '2px solid red',
              left: `${(r.x / imgRef.current!.naturalWidth)*100}%`,
              top: `${(r.y / imgRef.current!.naturalHeight)*100}%`,
              width: `${(r.width / imgRef.current!.naturalWidth)*100}%`,
              height: `${(r.height / imgRef.current!.naturalHeight)*100}%`,
            }} />
        ))}
        {current && (
          <div
            style={{
              position: 'absolute',
              border: '2px dashed blue',
              left: `${(current.x / imgRef.current!.naturalWidth)*100}%`,
              top: `${(current.y / imgRef.current!.naturalHeight)*100}%`,
              width: `${(current.width / imgRef.current!.naturalWidth)*100}%`,
              height: `${(current.height / imgRef.current!.naturalHeight)*100}%`,
            }} />
        )}
      </div>
      <div style={{ marginTop: '1rem' }}>
        {regions.map((r, i) => (
          <div key={i} style={{ marginBottom: '0.5rem' }}>
            <label>Prompt for region {i+1}:</label>
            <input
              type="text"
              value={r.prompt}
              onChange={(e) => {
                const rs = [...regions];
                rs[i] = { ...rs[i], prompt: e.target.value };
                setRegions(rs);
              }}
            />
          </div>
        ))}
      </div>
      <button onClick={handleApply} disabled={showProgress || regions.length===0}>Apply Regions</button>
      <button onClick={onCancel} disabled={showProgress}>Cancel</button>
      {showProgress && <ProgressModal skipCurrent={false} onCancel={() => setShowProgress(false)} />}
    </div>
  );
};

export default RegionEditor;
