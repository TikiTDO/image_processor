import React from 'react';

interface ErrorOverlayProps {
  error: Error;
}

const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ error }) => {
  return (
    <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <h2>Unexpected Error</h2>
        <pre style={{ whiteSpace: 'pre-wrap', margin: '1rem 0' }}>
          {error.message}
        </pre>
        <button onClick={() => window.location.reload()}>Restart</button>
      </div>
    </div>
  );
};

export default ErrorOverlay;