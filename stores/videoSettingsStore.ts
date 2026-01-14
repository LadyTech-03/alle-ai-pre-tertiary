import { create } from 'zustand';

interface VideoSettings {
  aspectRatio: "16:9" | "1:1" | "9:16";
  quality: "480p" | "720p" | "1080p";
  duration: number;
  display: "column" | "grid" | "carousel";
}

interface VideoSettingsState {
  settings: VideoSettings;
  setSettings: (settings: Partial<VideoSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: VideoSettings = {
  aspectRatio: "16:9",
  quality: "720p",
  duration: 10,
  display: "grid",
};

export const useVideoSettingsStore = create<VideoSettingsState>((set) => ({
  settings: defaultSettings,
  setSettings: (newSettings) => set((state) => ({ 
    settings: { ...state.settings, ...newSettings } 
  })),
  resetSettings: () => set({ settings: defaultSettings }),
}));