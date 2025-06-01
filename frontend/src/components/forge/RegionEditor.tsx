import React, { useState } from 'react';
import { RegionEditParams, Region, ImageResponse } from '../../types/forge';
import { regionEdit } from '../../services/api';
import ProgressModal from './ProgressModal';

interface RegionEditorProps {
  initImage: string;
  onComplete?: (resp: ImageResponse) => void;
  onCancel?: () => void;
}

const RegionEditor: React.FC<RegionEditorProps> = ({ initImage, onComplete, onCancel }) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [showProgress, setShowProgress] = useState<boolean>(false);

  const handleApply = () => {
    const params: RegionEditParams = { image: initImage, regions };
    setShowProgress(true);
    regionEdit(params)
      .then((resp) => onComplete?.(resp))
      .catch((e) => console.error('Error editing regions:', e))
      .finally(() => setShowProgress(false));
  };

  return (
    <div className="forge-panel region-editor">
      <h2>Region Editor</h2>
      {/* TODO: canvas overlay to draw/resize regions */}
      <button onClick={handleApply} disabled={showProgress}>
        Apply Regions
      </button>
      <button onClick={onCancel} disabled={showProgress}>
        Cancel
      </button>
      {showProgress && <ProgressModal skipCurrent={false} onCancel={() => setShowProgress(false)} />}
    </div>
  );
};

export default RegionEditor;