import React, { useState, useEffect } from 'react';
import { getHistory } from '../../services/api';
import { HistoryEntry } from '../../types/forge';

interface HistoryPanelProps {
  imageID: string;
  onSelect: (entry: HistoryEntry) => void;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ imageID, onSelect, onClose }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHistory(imageID)
      .then(setHistory)
      .catch((e) => setError(e.message));
  }, [imageID]);

  return (
    <div className="history-panel">
      <h3>History for {imageID}</h3>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {history.length === 0 && <div>No history available.</div>}
      {history.map((h, idx) => (
        <div key={idx} className="history-entry" style={{ marginBottom: '0.5rem', cursor: 'pointer' }}>
          <img src={h.url} alt={h.timestamp} style={{ width: 80, height: 80, objectFit: 'cover', marginRight: 8 }} />
          <span onClick={() => onSelect(h)}>{h.timestamp}</span>
        </div>
      ))}
      <button onClick={onClose} style={{ marginTop: '1rem' }}>Close</button>
    </div>
  );
};

export default HistoryPanel;