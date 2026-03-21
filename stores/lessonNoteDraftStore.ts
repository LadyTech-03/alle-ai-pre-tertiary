import { create } from "zustand";
import type { LessonNoteResponse } from "@/lib/api/lessonNotes";

interface LessonNoteDraftStore {
  drafts: Record<string, LessonNoteResponse>;
  setDraft: (noteId: string, draft: LessonNoteResponse) => void;
  takeDraft: (noteId: string) => LessonNoteResponse | null;
  clearDraft: (noteId: string) => void;
}

export const useLessonNoteDraftStore = create<LessonNoteDraftStore>((set, get) => ({
  drafts: {},
  setDraft: (noteId, draft) =>
    set((state) => ({
      drafts: {
        ...state.drafts,
        [noteId]: draft,
      },
    })),
  takeDraft: (noteId) => {
    const draft = get().drafts[noteId] ?? null;
    if (draft) {
      set((state) => {
        const next = { ...state.drafts };
        delete next[noteId];
        return { drafts: next };
      });
    }
    return draft;
  },
  clearDraft: (noteId) =>
    set((state) => {
      const next = { ...state.drafts };
      delete next[noteId];
      return { drafts: next };
    }),
}));
