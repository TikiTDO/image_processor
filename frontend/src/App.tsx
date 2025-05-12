import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './App.css';
import { useSSE } from './hooks/useSSE';
import { SpeakerProvider, useSpeakerContext } from './context/SpeakerContext';
import PathPicker from './components/PathPicker';
import ZoomControls from './components/ZoomControls';
import ImageGrid from './components/ImageGrid';
import SpeakerConfigModal from './components/SpeakerConfigModal';
import ErrorOverlay from './components/ErrorOverlay';
import {
  getImages,
  uploadImages,
  setImageDialog,
  getImageDescription,
  getImageDialogs,
  ImageMeta,
  getDefaultPath,
} from './services/api';

// Simple debounce util
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const AppContent: React.FC = () => {
  const [images, setImages] = useState<ImageMeta[]>([]);
  // Zoom level persisted in sessionStorage, seeded from localStorage
  const STORAGE_ZOOM_KEY = 'zoomLevel';
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    const session = sessionStorage.getItem(STORAGE_ZOOM_KEY);
    if (session !== null) {
      const v = parseInt(session, 10);
      if (!isNaN(v)) return v;
    }
    const local = localStorage.getItem(STORAGE_ZOOM_KEY);
    if (local !== null) {
      const v = parseInt(local, 10);
      if (!isNaN(v)) return v;
    }
    return 100;
  });
  const zoomPresets = [100, 150, 200, 250, 300, 400, 500, 600, 700, 800];
  // Path persisted in sessionStorage, seeded from localStorage
  const STORAGE_PATH_KEY = 'path';
  const [path, setPath] = useState<string>(() => {
    const session = sessionStorage.getItem(STORAGE_PATH_KEY);
    if (session !== null) return session;
    const local = localStorage.getItem(STORAGE_PATH_KEY);
    if (local !== null) return local;
    return '';
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDialog, setSelectedDialog] = useState<string[]>([]);
  const [rawDescription, setRawDescription] = useState<string>('');
  const [descMode, setDescMode] = useState<'text' | 'dialog'>('text');
  const [showSpeakerConfig, setShowSpeakerConfig] = useState(false);
  // Global edit mode: when true, all dialog panels are editable
  const [editMode, setEditMode] = useState<boolean>(false);
  // Cache of dialogs for all images: id -> dialog lines
  const [dialogMap, setDialogMap] = useState<Record<string, string[]>>({});
  // Hidden images state
  const [hiddenIDs, setHiddenIDs] = useState<string[]>([]);
  const [showHiddenModal, setShowHiddenModal] = useState(false);
  // Compute visible images (filter out hidden)
  const visibleImages = images.filter((img) => !hiddenIDs.includes(img.id));
  const { colors: speakerColors, names: speakerNames } = useSpeakerContext();
  const suppressClicks = useRef(false);
  // Handlers to navigate lightbox images
  const goPrev = () => {
    if (!selectedId) return;
    const idx = images.findIndex((img) => img.id === selectedId);
    if (idx > 0) setSelectedId(images[idx - 1].id);
  };
  const goNext = () => {
    if (!selectedId) return;
    const idx = images.findIndex((img) => img.id === selectedId);
    if (idx >= 0 && idx < images.length - 1) setSelectedId(images[idx + 1].id);
  };
  // Keyboard navigation for lightbox
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selectedId) return;
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        goPrev();
      } else if (e.key === 'ArrowRight') {
        goNext();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, images]);
  // Cache buster map: increment to force image refetch for specific IDs
  const [bustMap, setBustMap] = useState<Record<string, number>>({});
  // Debounced save for dialog edits (1s)
  const saveDialogDebounced = useMemo(
    () => debounce((dlg: string[]) => {
      if (selectedId) {
        setImageDialog(selectedId, dlg, path).catch((err) =>
          console.error('Error saving dialog:', err)
        );
      }
    }, 1000),
    [selectedId, path]
  );

  const fetchImages = useCallback(() => {
    getImages(path)
      .then(setImages)
      .catch((err) => console.error('Error fetching images:', err));
  }, [path]);

  useEffect(() => {
    fetchImages();
  }, [path]);
  // On mount, if no persisted path, fetch server default path
  useEffect(() => {
    if (path === '') {
      getDefaultPath()
        .then((p) => setPath(p || ''))
        .catch((err) => console.error('Error fetching default path:', err));
    }
  }, []);
  // Subscribe to backend update events and refresh images (debounced)
  const debouncedFetchImages = useMemo(() => debounce(fetchImages, 100), [fetchImages]);
  useSSE('/api/updates', debouncedFetchImages);
  // Load all dialogs in one request when path changes
  useEffect(() => {
    getImageDialogs(path)
      .then((map) => setDialogMap(map))
      .catch((err) => console.error('Error fetching dialogs:', err));
  }, [path]);
  // Persist path to sessionStorage and localStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem(STORAGE_PATH_KEY, path);
    localStorage.setItem(STORAGE_PATH_KEY, path);
  }, [path]);
  // Persist zoom level
  useEffect(() => {
    sessionStorage.setItem(STORAGE_ZOOM_KEY, zoomLevel.toString());
    localStorage.setItem(STORAGE_ZOOM_KEY, zoomLevel.toString());
  }, [zoomLevel]);

  // Remove and hide image handlers
  const removeImage = async (id: string) => {
    const query = path ? `?path=${encodeURIComponent(path)}` : '';
    try {
      const res = await fetch(`/api/images/${encodeURIComponent(id)}${query}`, { method: 'DELETE' });
      if (!res.ok) console.error('Delete failed:', res.status);
    } catch (err) {
      console.error('Error deleting image:', err);
    }
    fetchImages();
  };
  const hideImage = (id: string) => {
    setHiddenIDs((prev) => [...prev, id]);
  };
  const toggleLightbox = (id: string) => {
    if (suppressClicks.current) return;
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const closeLightbox = () => {
    if (suppressClicks.current) return;
    setSelectedId(null);
    suppressClicks.current = true;
    setTimeout(() => {
      suppressClicks.current = false;
    }, 300);
  };

  useEffect(() => {
    if (selectedId) {
      const dlg = dialogMap[selectedId];
      if (dlg && dlg.length > 0) {
        setSelectedDialog(dlg);
        setDescMode('dialog');
      } else {
        // No existing dialog: clear any previous dialog display
        setSelectedDialog([]);
        setDescMode('dialog');
      }
    } else {
      setSelectedDialog([]);
      setRawDescription('');
      setDescMode('text');
    }
  }, [selectedId, dialogMap, path]);

  // Derive preview map for first dialog line per image
  const dialogPreviewMap = useMemo<Record<string, string>>(() => {
    const pm: Record<string, string> = {};
    images.forEach((img) => {
      const lines = dialogMap[img.id] || [];
      pm[img.id] = lines.length > 0 ? lines[0] : '';
    });
    return pm;
  }, [dialogMap, images]);

  const handleFileDrop = async (files: FileList) => {
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith('image/')
    );
    if (!imageFiles.length) return;
    await uploadImages(path, imageFiles);
    fetchImages();
  };

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) handleFileDrop(e.dataTransfer.files);
    };
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [path]);

  return (
    <div className="app-container">
      <div className="controls">
        <ZoomControls
          zoomLevel={zoomLevel}
          zoomPresets={zoomPresets}
          onZoomChange={setZoomLevel}
        />
        <PathPicker path={path} onChange={setPath} />
        {/* Speaker configuration button: shows speaker names in their colors */}
        <button
          className="speaker-config-btn"
          onClick={() => setShowSpeakerConfig(true)}
        >
          {Object.entries(speakerNames).map(([key, name]) => (
            <span
              key={key}
              style={{ color: speakerColors[Number(key)] || '#000', margin: '0 0.5rem' }}
            >
              {name}
            </span>
          ))}
        </button>
        {/* Toggle global edit mode */}
        <button
          className="edit-mode-btn"
          onClick={() => setEditMode((v) => !v)}
        >
          {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        </button>
        <button
          className="edit-mode-btn"
          onClick={() => setShowHiddenModal(true)}
        >
          Hidden Images ({hiddenIDs.length})
        </button>
      </div>
      <ImageGrid
        images={visibleImages}
        zoomLevel={zoomLevel}
        path={path}
        bustMap={bustMap}
        dialogPreviewMap={dialogPreviewMap}
        // Optimistic reorder: update local state immediately
        onReorderComplete={(movedId, prevId, nextId) => {
          setImages((prevImgs) => {
            const imgs = [...prevImgs];
            const oldIndex = imgs.findIndex((img) => img.id === movedId);
            if (oldIndex === -1) return prevImgs;
            const [moved] = imgs.splice(oldIndex, 1);
            let insertAt = 0;
            if (prevId) {
              const p = imgs.findIndex((img) => img.id === prevId);
              insertAt = p + 1;
            } else if (nextId) {
              insertAt = imgs.findIndex((img) => img.id === nextId);
            } else {
              insertAt = imgs.length;
            }
            imgs.splice(insertAt, 0, moved);
            return imgs;
          });
          setBustMap((old) => {
            const next = { ...old };
            next[movedId] = (old[movedId] || 0) + 1;
            if (prevId) next[prevId] = (old[prevId] || 0) + 1;
            if (nextId) next[nextId] = (old[nextId] || 0) + 1;
            return next;
          });
        }}
        // On API failure: revert by refetching from server
        onReorderError={() => {
          alert('Reorder failed, reverting.');
          fetchImages();
        }}
        onItemClick={toggleLightbox}
        onRemoveImage={removeImage}
        onHideImage={hideImage}
      />
      {showSpeakerConfig && (
        <SpeakerConfigModal onClose={() => setShowSpeakerConfig(false)} />
      )}
      {selectedId && (
        <div
          className="lightbox"
          onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
          onTouchEnd={(e) => { e.stopPropagation(); closeLightbox(); }}
        >
          <button
            className="lightbox-nav prev"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            onTouchEnd={(e) => { e.stopPropagation(); goPrev(); }}
          >
            ◀
          </button>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const sel = images.find((img) => img.id === selectedId);
              const bust = sel ? (bustMap[sel.id] || 0) : 0;
              const src = sel ? `${sel.url}?t=${encodeURIComponent(sel.timestamp)}&b=${bust}` : '';
              return <img key={src} src={src} alt={selectedId || 'Enlarged'} />;
            })()}
            {descMode === 'text' ? (
              <div className="description-panel">
                <pre className="description-text">{rawDescription}</pre>
                <button
                  className="dialog-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    const initDialog = rawDescription ? [rawDescription] : [];
                    setSelectedDialog(initDialog);
                    setImageDialog(selectedId, initDialog, path);
                    setDescMode('dialog');
                  }}
                >
                  Switch to dialog mode
                </button>
              </div>
            ) : (
              <div className="dialog-sidebar">
                {/* Global edit mode: show edit fields when enabled, otherwise read-only */}
                {!editMode ? (
                  <div className="dialog-read">
                    {selectedDialog.map((line, idx) => {
                      const parts = line.split(':');
                      const speakerId = Number(parts[0]);
                      const text = parts.slice(1).join(':');
                      return (
                        <div key={idx} className="dialog-line">
                          {speakerId !== 0 && (
                            <span className="speaker-name" style={{ color: speakerColors[speakerId] || '#000' }}>
                              {speakerNames[speakerId] || ''}
                            </span>
                          )}
                      <span
                        className="dialog-text"
                        style={{ color: speakerColors[speakerId] || '#000' }}
                      >
                        {text}
                      </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="dialog-edit">
                    {selectedDialog.map((line, idx) => {
                      const parts = line.split(':');
                      const speakerId = Number(parts[0]);
                      const text = parts.slice(1).join(':');
                      return (
                        <div key={idx} className="dialog-edit-card">
                          <div className="dialog-edit-card-header">
                            {Object.entries(speakerNames).map(([key, name]) => {
                              const id = Number(key);
                              const isSelected = id === speakerId;
                              return (
                                <button
                                  key={key}
                                  className={`speaker-button${isSelected ? ' selected' : ''}`}
                                  style={{ backgroundColor: speakerColors[id] || '#ccc' }}
                                  onClick={() => {
                                    const newDialog = [...selectedDialog];
                                    newDialog[idx] = `${id}:${text}`;
                                    setSelectedDialog(newDialog);
                                    saveDialogDebounced(newDialog);
                                  }}
                                >
                                  {name}
                                </button>
                              );
                            })}
                          </div>
                          <div className="dialog-edit-card-body">
                            <textarea
                              className="dialog-textarea"
                              value={text}
                              onChange={(e) => {
                                const newText = e.target.value;
                                const newDialog = [...selectedDialog];
                                newDialog[idx] = `${speakerId}:${newText}`;
                                setSelectedDialog(newDialog);
                                saveDialogDebounced(newDialog);
                              }}
                              onInput={(e) => {
                                const t = e.currentTarget;
                                t.style.height = 'auto';
                                t.style.height = t.scrollHeight + 'px';
                              }}
                              style={{ height: 'auto', overflow: 'hidden', resize: 'none', width: '100%' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newDialog = [...selectedDialog, '0:'];
                        setSelectedDialog(newDialog);
                        saveDialogDebounced(newDialog);
                      }}
                    >
                      + Add Line
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            className="lightbox-nav next"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            onTouchEnd={(e) => { e.stopPropagation(); goNext(); }}
          >
            ▶
          </button>
        </div>
      )}
      {/* Hidden Images Modal */}
      {showHiddenModal && (
        <div
          className="hidden-modal-overlay"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
          onClick={() => setShowHiddenModal(false)}
        >
          <div
            className="hidden-modal"
            style={{ background: '#fff', padding: '1rem', margin: '5% auto', maxWidth: '400px', borderRadius: '4px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Hidden Images</h2>
            {hiddenIDs.length > 0 ? (
              hiddenIDs.map((hid) => {
                const meta = images.find((img) => img.id === hid);
                return (
                  <div key={hid} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <img
                      src={meta?.url}
                      alt={hid}
                      style={{ width: 50, height: 50, objectFit: 'cover', marginRight: '0.5rem' }}
                    />
                    <span style={{ flexGrow: 1 }}>{hid}</span>
                    <button onClick={() => setHiddenIDs((prev) => prev.filter((id) => id !== hid))}>
                      Unhide
                    </button>
                  </div>
                );
              })
            ) : (
              <p>No hidden images.</p>
            )}
            <button onClick={() => setShowHiddenModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [globalError, setGlobalError] = useState<Error | null>(null);
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      e.preventDefault();
      const err = e.error instanceof Error ? e.error : new Error(e.message);
      // Defer setting global error to avoid state updates during render phase
      setTimeout(() => setGlobalError(err), 0);
    };
    const handleRejection = (e: PromiseRejectionEvent) => {
      e.preventDefault();
      const err = e.reason instanceof Error ? e.reason : new Error(String(e.reason));
      // Defer setting global error to avoid state updates during render phase
      setTimeout(() => setGlobalError(err), 0);
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);
  if (globalError) {
    return <ErrorOverlay error={globalError} />;
  }
  return (
    <SpeakerProvider>
      <AppContent />
    </SpeakerProvider>
  );
};

export default App;