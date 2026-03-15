import { create } from "zustand";
import type { EduQuestionRequest, QuestionBatchResponse } from "@/lib/api/eduQuestionRequests";
import type { StudentExamMode } from "@/components/features/exam-prep/types";

interface ExamSessionDraft {
  mode: StudentExamMode;
  request: EduQuestionRequest;
  initialBatch: QuestionBatchResponse;
}

interface ExamSessionDraftStore {
  drafts: Record<string, ExamSessionDraft>;
  setDraft: (requestId: string, draft: ExamSessionDraft) => void;
  takeDraft: (requestId: string) => ExamSessionDraft | null;
  clearDraft: (requestId: string) => void;
}

export const useExamSessionDraftStore = create<ExamSessionDraftStore>((set, get) => ({
  drafts: {},
  setDraft: (requestId, draft) =>
    set((state) => ({
      drafts: {
        ...state.drafts,
        [requestId]: draft,
      },
    })),
  takeDraft: (requestId) => {
    const draft = get().drafts[requestId] ?? null;
    if (draft) {
      set((state) => {
        const next = { ...state.drafts };
        delete next[requestId];
        return { drafts: next };
      });
    }
    return draft;
  },
  clearDraft: (requestId) =>
    set((state) => {
      const next = { ...state.drafts };
      delete next[requestId];
      return { drafts: next };
    }),
}));
