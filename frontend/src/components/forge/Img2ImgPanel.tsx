import React, { useState } from 'react';
import { Img2ImgParams, ImageResponse } from '../../types/forge';
import { img2img } from '../../services/api';
import ProgressModal from './ProgressModal';

interface Img2ImgPanelProps {
  initImage: string; // base64 image
  /** show mask drawing tools */
  infill?: boolean;
  onComplete?: (resp: ImageResponse) => void;
  onCancel?: () => void;
}

const Img2ImgPanel: React.FC<Img2ImgPanelProps> = ({ initImage, infill = false, onComplete, onCancel }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [strength, setStrength] = useState<number>(0.75);
  const [steps, setSteps] = useState<number>(50);
  const [cfgScale, setCfgScale] = useState<number>(7.5);
  const [mask, setMask] = useState<string | undefined>(undefined);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const maskCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [showProgress, setShowProgress] = useState<boolean>(false);

  const handleApply = () => {
    const params: Img2ImgParams = {
      init_images: [initImage],
      mask,
      prompt,
      negative_prompt: negativePrompt || undefined,
      steps,
      cfg_scale: cfgScale,
      denoising_strength: strength,
    };
    setShowProgress(true);
    img2img(params)
      .then((resp) => onComplete?.(resp))
      .catch((e) => console.error('Error editing image:', e))
      .finally(() => setShowProgress(false));
  };

  React.useEffect(() => {
    const img = imgRef.current;
    const canvas = maskCanvasRef.current;
    if (infill && img && canvas) {
      // set canvas size to image natural size
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }
  }, [infill, initImage]);

  // Drawing handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!infill) return;
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    setDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = 'white'; ctx.lineWidth = 20; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drawing) return;
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };
  const handlePointerUp = () => {
    if (!infill) return;
    setDrawing(false);
    const canvas = maskCanvasRef.current;
    if (canvas) {
      setMask(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="forge-panel img2img-panel">
      <h2>Image-to-Image Editing</h2>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
        <img
          ref={imgRef}
          src={initImage}
          alt="Original"
          style={{ display: 'block', maxWidth: '100%' }}
        />
        {infill && (
          <canvas
            ref={maskCanvasRef}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        )}
      </div>
      <textarea
        placeholder="Prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <textarea
        placeholder="Negative Prompt (optional)"
        value={negativePrompt}
        onChange={(e) => setNegativePrompt(e.target.value)}
      />
      <div>
        <label>Strength:</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={strength}
          onChange={(e) => setStrength(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Steps:</label>
        <input
          type="number"
          value={steps}
          onChange={(e) => setSteps(Number(e.target.value))}
        />
      </div>
      <button onClick={handleApply} disabled={showProgress}>
        Apply
      </button>
      <button onClick={onCancel} disabled={showProgress}>
        Cancel
      </button>
      {showProgress && <ProgressModal skipCurrent={false} onCancel={() => setShowProgress(false)} />}
    </div>
  );
};

export default Img2ImgPanel;