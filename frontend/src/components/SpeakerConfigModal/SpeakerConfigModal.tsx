import React from 'react';
import { useSpeakerContext } from '../../context/SpeakerContext';

interface SpeakerConfigModalProps {
  onClose: () => void;
}

const SpeakerConfigModal: React.FC<SpeakerConfigModalProps> = ({ onClose }) => {
  const { colors, names, updateColor, updateName, addSpeaker, removeSpeaker } =
    useSpeakerContext();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Speaker Configuration</h2>
        <div>
          {Object.entries(names).map(([key, name]) => {
            const id = Number(key);
            return (
              <div
                key={id}
                style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updateName(id, e.target.value)}
                  style={{ flex: 1, marginRight: '0.5rem' }}
                />
                <input
                  type="color"
                  value={colors[id] || '#000000'}
                  onChange={(e) => updateColor(id, e.target.value)}
                  style={{ marginRight: '0.5rem' }}
                />
                {id !== 0 && (
                  <button onClick={() => removeSpeaker(id)}>Remove</button>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={addSpeaker} style={{ marginRight: '1rem' }}>
          + Add Speaker
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SpeakerConfigModal;