import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DirEntry, getDirs } from '../../services/api';

interface PathPickerProps {
  path: string;
  onChange: (newPath: string) => void;
}

const PathPicker: React.FC<PathPickerProps> = ({ path, onChange }) => {
  const [open, setOpen] = useState(false);
  const queryKey = ['dirs', path];
  const {
    data: entries,
    isLoading: loading,
    error,
  } = useQuery<DirEntry[], Error>(queryKey, () => getDirs(path), { enabled: open, initialData: [] });
  const ref = useRef<HTMLDivElement>(null);

  // React Query handles fetching when 'open' becomes true

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const upOne = () => {
    const parts = path.split('/');
    parts.pop();
    onChange(parts.join('/'));
    // keep dropdown open for further navigation
  };

  return (
    <div className="path-picker" ref={ref}>
      <button className="path-btn" onClick={() => setOpen((o) => !o)}>
        {path || '/'} ▾
      </button>
      {open && (
        <div className="path-dropdown">
          <ul>
            {path && <li key="up" onClick={upOne}>..</li>}
            {loading && <li key="loading">Loading...</li>}
            {!loading && error && (
              <li key="error" className="error">{error.message}</li>
            )}
            {!loading && !error && entries.map((d) => (
              <li
                key={d.name}
                onClick={() => {
                  const newPath = path ? `${path}/${d.name}` : d.name;
                  onChange(newPath);
                  // keep dropdown open for further navigation
                }}
              >
                {d.name} ({d.image_count} images, {d.dir_count} dirs)
              </li>
            ))}
            {!loading && !error && entries.length === 0 && (
              <li key="empty">No subdirectories</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PathPicker;