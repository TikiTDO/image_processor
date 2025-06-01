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
  /** UI mode: 'view', 'dialog', or 'image' */
  mode: 'view' | 'dialog' | 'image';
  /** Change UI mode */
  onModeChange: (mode: 'view' | 'dialog' | 'image') => void;
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
  mode,
  onModeChange,
  hiddenCount,
  onShowHidden,
  imageCount,
  onShowDirManagement,
  theme,
  onToggleTheme,
}) => (
  <div className={`controls mode-${mode}`}>
    <ZoomControls
      zoomLevel={zoomLevel}
      zoomPresets={zoomPresets}
      onZoomChange={onZoomChange}
    />
    <PathPicker path={path} onChange={onPathChange} />
    <button onClick={onShowSpeakerConfig}>
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
    <div className="segmented-control">
      <button className={mode === 'view' ? 'active' : ''} onClick={() => onModeChange('view')}>
        View
      </button>
      <button className={mode === 'dialog' ? 'active' : ''} onClick={() => onModeChange('dialog')}>
        Edit Dialogs
      </button>
      <button className={mode === 'image' ? 'active' : ''} onClick={() => onModeChange('image')}>
        Edit Images
      </button>
    </div>
    <button onClick={onShowHidden}>
      Hidden Images ({hiddenCount})
    </button>
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      {imageCount} Images
    </button>
    <button onClick={onShowDirManagement}>
      Manage Directory
    </button>
    <button className="theme-toggle-btn" onClick={onToggleTheme} title={`Theme: ${theme}`}>
      {theme === 'system' ? '🖥️' : theme === 'light' ? '☀️' : '🌙'}
    </button>
  </div>
);

export default HeaderControls;