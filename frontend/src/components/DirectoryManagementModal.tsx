import React, { useState } from 'react';

interface DirectoryManagementModalProps {
  onClose: () => void;
  path: string;
  onReinit: () => Promise<void>;
}

const DirectoryManagementModal: React.FC<DirectoryManagementModalProps> = ({ onClose, path, onReinit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReinit = async () => {
    setError(null);
    setLoading(true);
    try {
      await onReinit();
    } catch (e: any) {
      setError(e.message || 'Error reinitializing directory');
      return;
    } finally {
      setLoading(false);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Directory Management</h2>
        <p>Path: {path || '/'}</p>
        {error && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{error}</div>}
        <button onClick={handleReinit} disabled={loading} style={{ marginBottom: '0.5rem' }}>
          {loading ? 'Processing...' : 'Reinitialize Filenames'}
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default DirectoryManagementModal;