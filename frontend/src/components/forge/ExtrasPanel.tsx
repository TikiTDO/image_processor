import React, { useState } from 'react';
import { ImageResponse } from '../../types/forge';
import { extras } from '../../services/api';
import ProgressModal from './ProgressModal';

interface ExtrasPanelProps {
  initImage: string; // base64 image
  onComplete?: (resp: ImageResponse) => void;
  onCancel?: () => void;
}

const ExtrasPanel: React.FC<ExtrasPanelProps> = ({ initImage, onComplete, onCancel }) => {
  const [operation, setOperation] = useState<string>('GFPGAN');
  const [showProgress, setShowProgress] = useState<boolean>(false);

  const handleRun = () => {
    setShowProgress(true);
    extras({ operation, image: initImage })
      .then((resp) => onComplete?.(resp))
      .catch((e) => console.error('Error running extras:', e))
      .finally(() => setShowProgress(false));
  };

  return (
    <div className="forge-panel extras-panel">
      <h2>Extras</h2>
      <img src={initImage} alt="Original" style={{ maxWidth: '100%', marginBottom: '1rem' }} />
      <select value={operation} onChange={(e) => setOperation(e.target.value)}>
        <option value="GFPGAN">GFPGAN</option>
        <option value="IP-Adapter">IP-Adapter</option>
        <option value="Depth">Depth Control Net</option>
      </select>
      {/* Additional options per operation could go here */}
      <button onClick={handleRun} disabled={showProgress}>
        Run
      </button>
      <button onClick={onCancel} disabled={showProgress}>
        Cancel
      </button>
      {showProgress && <ProgressModal skipCurrent={false} onCancel={() => setShowProgress(false)} />}
    </div>
  );
};

export default ExtrasPanel;