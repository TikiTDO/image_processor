import React from 'react';
import ZoomControls from './ZoomControls';
import PathPicker from './PathPicker';

export interface HeaderControlsProps {
  zoomLevel: number;
  zoomPresets: number[];
  onZoomChange: (newZoom: number) => void;
  path: string;
  onPathChange: (path: string) => void;
  speakerNames: Record<string, string>;
  speakerColors: Record<number, string>;
  onShowSpeakerConfig: () => void;
  editMode: boolean;
  onToggleEditMode: () => void;
  hiddenCount: number;
  onShowHidden: () => void;
  /** Total number of images in current directory */
  imageCount: number;
  /** Show directory management modal */
  onShowDirManagement: () => void;
  /** Current theme: 'system', 'light', 'dark' */
  theme: 'system' | 'light' | 'dark';
  /** Toggle theme between system, dark, light */
  onToggleTheme: () => void;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({
  zoomLevel,
  zoomPresets,
  onZoomChange,
  path,
  onPathChange,
  speakerNames,
  speakerColors,
  onShowSpeakerConfig,
  editMode,
  onToggleEditMode,
  hiddenCount,
  onShowHidden,
  imageCount,
  onShowDirManagement,
  theme,
  onToggleTheme,
}) => (
  <div className="controls">
    <ZoomControls
      zoomLevel={zoomLevel}
      zoomPresets={zoomPresets}
      onZoomChange={onZoomChange}
    />
    <PathPicker path={path} onChange={onPathChange} />
    <button className="speaker-config-btn" onClick={onShowSpeakerConfig}>
      {Object.entries(speakerNames).map(([key, name]) => {
        const id = Number(key);
        const isNarrator = id === 0;
        return (
          <span
            key={key}
            className={isNarrator ? 'narrator-name' : ''}
            style={!isNarrator ? { color: speakerColors[id] || '#000', margin: '0 0.5rem' } : { margin: '0 0.5rem' }}
          >
            {name}
          </span>
        );
      })}
    </button>
    <button className="edit-mode-btn" onClick={onToggleEditMode}>
      {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
    </button>
    <button className="edit-mode-btn" onClick={onShowHidden}>
      Hidden Images ({hiddenCount})
    </button>
    <button className="image-count-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      {imageCount} Images
    </button>
    <button className="image-count-btn" onClick={onShowDirManagement}>
      Manage Directory
    </button>
    <button className="theme-toggle-btn" onClick={onToggleTheme} title={`Theme: ${theme}`}>
      {theme === 'system' ? '🖥️' : theme === 'light' ? '☀️' : '🌙'}
    </button>
  </div>
);

export default HeaderControls;