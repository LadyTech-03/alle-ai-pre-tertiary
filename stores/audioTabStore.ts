import { create } from 'zustand';

type AudioTabType = 'tts' | 'stt' | 'ag';

interface AudioTabState {
  activeTab: AudioTabType;
  setActiveTab: (tab: AudioTabType) => void;
}

export const useAudioTabStore = create<AudioTabState>((set) => ({
  activeTab: 'tts', // Default to Text-to-Speech
  setActiveTab: (tab) => set({ activeTab: tab }),
}));