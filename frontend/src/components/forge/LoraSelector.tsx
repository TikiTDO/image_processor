import React, { useEffect, useState } from 'react';
import { getLoras } from '../../services/api';
import { LoraInfo } from '../../types/forge';

interface LoraSelectorProps {
  onClose?: () => void;
}

const LoraSelector: React.FC<LoraSelectorProps> = ({ onClose }) => {
  const [loras, setLoras] = useState<LoraInfo[]>([]);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    getLoras().then(setLoras);
  }, []);

  const handleSelect = () => {
    // No switch endpoint necessary; selection can be passed as param to operations
    onClose && onClose();
  };

  return (
    <div className="forge-panel lora-selector">
      <h2>LoRA Selector</h2>
      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        {loras.map((l) => (
          <option key={l.name} value={l.name}>{l.name}</option>
        ))}
      </select>
      <button onClick={handleSelect}>Select</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default LoraSelector;