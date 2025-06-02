import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSpeakers, setSpeakers, SpeakerMeta } from '../services/api';

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
  const queryClient = useQueryClient();
  const defaults: SpeakerMeta = { speaker_colors: { 0: '#000000' }, speaker_names: { 0: 'Narrator' } };
  const {
    data = defaults,
    isLoading,
    error,
  } = useQuery<SpeakerMeta, Error>({
    queryKey: ['speakers'],
    queryFn: getSpeakers,
    initialData: defaults,
  });
  const saveMutation = useMutation({
    mutationFn: setSpeakers,
    onSuccess: () => queryClient.invalidateQueries(['speakers']),
  });
  const { speaker_colors: colors, speaker_names: names } = data;

  const updateColor = (id: number, color: string) => {
    const newColors = { ...colors, [id]: color };
    saveMutation.mutate({ speaker_colors: newColors, speaker_names: names });
  };

  const updateName = (id: number, name: string) => {
    const newNames = { ...names, [id]: name };
    saveMutation.mutate({ speaker_colors: colors, speaker_names: newNames });
  };

  const removeSpeaker = (id: number) => {
    const newNames = { ...names };
    delete newNames[id];
    const newColors = { ...colors };
    delete newColors[id];
    saveMutation.mutate({ speaker_colors: newColors, speaker_names: newNames });
  };

  const addSpeaker = () => {
    const ids = Object.keys(names).map((k) => Number(k));
    const next = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    const newNames = { ...names, [next]: `Speaker ${next}` };
    const newColors = { ...colors, [next]: '#000000' };
    saveMutation.mutate({ speaker_colors: newColors, speaker_names: newNames });
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