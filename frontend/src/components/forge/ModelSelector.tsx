import React, { useEffect, useState } from 'react';
import { getModels, switchModel } from '../../services/api';
import { ModelInfo, SwitchModelParams } from '../../types/forge';

interface ModelSelectorProps {
  onClose?: () => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ onClose }) => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    getModels().then(setModels);
  }, []);

  const handleSwitch = () => {
    const params: SwitchModelParams = { model: selected };
    switchModel(params).then(() => onClose && onClose());
  };

  return (
    <div className="forge-panel model-selector">
      <h2>Model Selector</h2>
      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        {models.map((m) => (
          <option key={m.name} value={m.name}>{m.name}</option>
        ))}
      </select>
      <button onClick={handleSwitch}>Switch</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default ModelSelector;