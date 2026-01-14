import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AudioTabType = 'tts' | 'stt' | 'ag';

interface AudioCategorySelectionState {
  tts: string | null;
  stt: string | null;
  ag: string | null;
  setCategoryModel: (category: AudioTabType, model: string | null) => void;
  getCategoryModel: (category: AudioTabType) => string | null;
}

export const useAudioCategorySelectionStore = create<AudioCategorySelectionState>()(
  persist(
    (set, get) => ({
      tts: null,
      stt: null,
      ag: null,
      setCategoryModel: (category, model) => set({ [category]: model }),
      getCategoryModel: (category) => get()[category],
    }),
    {
      name: 'audio-category-selection-store',
    }
  )
);