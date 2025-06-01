import React, { useState } from 'react';
import { Txt2ImgParams, ImageResponse } from '../../types/forge';
import { txt2img } from '../../services/api';
import ProgressModal from './ProgressModal';

interface Txt2ImgPanelProps {
  onComplete?: (resp: ImageResponse) => void;
  onCancel?: () => void;
}

const Txt2ImgPanel: React.FC<Txt2ImgPanelProps> = ({ onComplete, onCancel }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [steps, setSteps] = useState<number>(50);
  const [cfgScale, setCfgScale] = useState<number>(7.5);
  const [width, setWidth] = useState<number>(512);
  const [height, setHeight] = useState<number>(512);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [showProgress, setShowProgress] = useState<boolean>(false);

  const handleGenerate = () => {
    const params: Txt2ImgParams = {
      prompt,
      negative_prompt: negativePrompt || undefined,
      steps,
      cfg_scale: cfgScale,
      width,
      height,
      seed,
    };
    setShowProgress(true);
    txt2img(params)
      .then((resp) => onComplete?.(resp))
      .catch((e) => console.error('Error generating image:', e))
      .finally(() => setShowProgress(false));
  };

  return (
    <div className="forge-panel txt2img-panel">
      <h2>Text-to-Image Generation</h2>
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
        <label>Steps:</label>
        <input
          type="number"
          min={1}
          max={200}
          value={steps}
          onChange={(e) => setSteps(Number(e.target.value))}
        />
      </div>
      <div>
        <label>CFG Scale:</label>
        <input
          type="number"
          step={0.1}
          min={1}
          max={30}
          value={cfgScale}
          onChange={(e) => setCfgScale(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Width:</label>
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Height:</label>
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Seed (optional):</label>
        <input
          type="number"
          value={seed ?? ''}
          onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>
      <button onClick={handleGenerate} disabled={showProgress}>
        Generate
      </button>
      <button onClick={onCancel} disabled={showProgress}>
        Cancel
      </button>
      {showProgress && <ProgressModal skipCurrent={false} onCancel={() => setShowProgress(false)} />}
    </div>
  );
};

export default Txt2ImgPanel;