import { create } from "zustand";

interface ActiveSectionStore {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const useActiveSectionStore = create<ActiveSectionStore>((set) => ({
  activeSection: "introduction", 
  setActiveSection: (section) => set({ activeSection: section }),
}));
