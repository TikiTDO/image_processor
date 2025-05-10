import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSpeakers, setSpeakers } from '../services/api';

export interface SpeakerContextType {
  colors: Record<number, string>;
  names: Record<number, string>;
  updateColor: (id: number, color: string) => void;
  updateName: (id: number, name: string) => void;
  addSpeaker: () => void;
  removeSpeaker: (id: number) => void;
}

const SpeakerContext = createContext<SpeakerContextType | undefined>(undefined);

interface SpeakerProviderProps {
  children: ReactNode;
}

export const SpeakerProvider: React.FC<SpeakerProviderProps> = ({ children }) => {
  const [colors, setColors] = useState<Record<number, string>>({});
  const [names, setNames] = useState<Record<number, string>>({});

  // Load initial speaker data from server; initialize server if empty
  useEffect(() => {
    const defaults = { speaker_colors: { 0: '#000000' }, speaker_names: { 0: 'Narrator' } };
    getSpeakers()
      .then((meta) => {
        const { speaker_colors, speaker_names } = meta;
        if (speaker_colors && Object.keys(speaker_colors).length > 0) {
          setColors(speaker_colors);
        } else {
          setColors(defaults.speaker_colors);
        }
        if (speaker_names && Object.keys(speaker_names).length > 0) {
          setNames(speaker_names);
        } else {
          setNames(defaults.speaker_names);
        }
        // If server had no data, write defaults
        if (
          (!speaker_colors || Object.keys(speaker_colors).length === 0) ||
          (!speaker_names || Object.keys(speaker_names).length === 0)
        ) {
          setSpeakers(defaults).catch((err) => console.error('Error initializing speaker data:', err));
        }
      })
      .catch((err) => console.error('Error loading speaker data:', err));
  }, []);

  const updateColor = (id: number, color: string) => {
    const newColors = { ...colors, [id]: color };
    setColors(newColors);
    setSpeakers({ speaker_colors: newColors, speaker_names: names }).catch((err) =>
      console.error('Error saving speaker data:', err)
    );
  };

  const updateName = (id: number, name: string) => {
    const newNames = { ...names, [id]: name };
    setNames(newNames);
    setSpeakers({ speaker_colors: colors, speaker_names: newNames }).catch((err) =>
      console.error('Error saving speaker data:', err)
    );
  };

  const removeSpeaker = (id: number) => {
    const newNames = { ...names };
    delete newNames[id];
    const newColors = { ...colors };
    delete newColors[id];
    setNames(newNames);
    setColors(newColors);
    setSpeakers({ speaker_colors: newColors, speaker_names: newNames }).catch((err) =>
      console.error('Error saving speaker data:', err)
    );
  };

  const addSpeaker = () => {
    const ids = Object.keys(names).map((k) => Number(k));
    const next = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    const newNames = { ...names, [next]: `Speaker ${next}` };
    const newColors = { ...colors, [next]: '#000000' };
    setNames(newNames);
    setColors(newColors);
    setSpeakers({ speaker_colors: newColors, speaker_names: newNames }).catch((err) =>
      console.error('Error saving speaker data:', err)
    );
  };

  return (
    <SpeakerContext.Provider
      value={{ colors, names, updateColor, updateName, addSpeaker, removeSpeaker }}
    >
      {children}
    </SpeakerContext.Provider>
  );
};

export function useSpeakerContext(): SpeakerContextType {
  const context = useContext(SpeakerContext);
  if (!context) {
    throw new Error('useSpeakerContext must be used within SpeakerProvider');
  }
  return context;
}