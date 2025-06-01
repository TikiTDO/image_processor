import React from 'react';
import { useProgress } from '../../hooks/useProgress';

interface ProgressModalProps {
  /** If true, skip current image preview frames */
  skipCurrent?: boolean;
  /** Called when user clicks Cancel */
  onCancel?: () => void;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ skipCurrent = false, onCancel }) => {
  const { data, error, loading } = useProgress(skipCurrent);
  return (
    <div className="modal-overlay">
      <div className="modal-content progress-modal">
        <h2>Processing...</h2>
        {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
        {data && (
          <img
            src={data.current_image}
            alt="Progress preview"
            style={{ maxWidth: '100%', marginBottom: '1rem' }}
          />
        )}
        <div>Progress: {loading ? '0%' : `${Math.round((data?.progress || 0) * 100)}%`}</div>
        <div>ETA: {loading ? '—' : `${data?.eta_relative?.toFixed(1)}s`}</div>
        <button onClick={onCancel} style={{ marginTop: '1rem' }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ProgressModal;