"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useOrgSessionStore, useSidebarStore } from "@/stores";
import { useExamSessionDraftStore } from "@/stores/examSessionDraftStore";
import {
  eduQuestionRequestsApi,
  type EduQuestionRequest,
  type QuestionBatchResponse,
  type QuestionRequestType,
} from "@/lib/api/eduQuestionRequests";
import { StudentExamSession } from "@/components/features/exam-prep/StudentExamSession";
import { StudentFlashcardsSession } from "@/components/features/exam-prep/StudentFlashcardsSession";
import type { StudentExamMode } from "@/components/features/exam-prep/types";

interface StoredSession {
  mode: StudentExamMode;
  request: EduQuestionRequest;
  initialBatch: QuestionBatchResponse;
}

const DEFAULT_BATCH_SIZE = 10;

const requestTypeToMode = (type: QuestionRequestType): StudentExamMode => {
  if (type === "flashcards") return "flashcards";
  if (type === "theory") return "theory";
  return "mcq";
};

export default function ExamPrepSessionPage() {
  const router = useRouter();
  const params = useParams();
  const { isOpen } = useSidebarStore();
  const { orgId } = useOrgSessionStore();
  const takeDraft = useExamSessionDraftStore((state) => state.takeDraft);
  const activeOrgId = orgId ?? "1";
  const requestId = Array.isArray(params?.requestId)
    ? params.requestId[0]
    : params?.requestId;

  const [session, setSession] = useState<StoredSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      setErrorMessage("Missing exam session id.");
      setIsLoading(false);
      return;
    }

    if (session && String(session.request.id) === String(requestId)) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSession(null);

    const draft = takeDraft(String(requestId));
    if (draft) {
      setSession(draft);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const hydrateSession = async () => {
      try {
        const request = await eduQuestionRequestsApi.getQuestionRequest({
          organisationId: activeOrgId,
          requestId,
          endUserType: "Student",
          useMock: false,
        });

        const requestWithSubject: EduQuestionRequest = {
          ...request,
          course_name: request.course_name,
        };

        const initialBatch = await eduQuestionRequestsApi.getQuestionBatch({
          organisationId: activeOrgId,
          requestId: request.id,
          page: 1,
          perPage: DEFAULT_BATCH_SIZE,
          endUserType: "Student",
          totalQuestions: request.number,
          subjectId: request.course_uuid,
          subjectName: requestWithSubject.course_name ?? "Selected Subject",
          useMock: false,
        });

        if (!cancelled) {
          setSession({
            mode: requestTypeToMode(request.type),
            request: requestWithSubject,
            initialBatch,
          });
          setIsLoading(false);
          setErrorMessage(null);
        }
      } catch {
        if (!cancelled) {
          setErrorMessage("We couldn't load this exam session yet. Please try again shortly.");
          setIsLoading(false);
        }
      }
    };

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [activeOrgId, requestId, session, takeDraft]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-sm text-muted-foreground">
          <p>{errorMessage ?? "Unable to load this session."}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => router.push("/exam-prep")}
          >
            Back to Exam Prep
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-[calc(100vh-3.5rem)] transition-all duration-300 ${isOpen ? "pl-40" : "pl-0"}`}>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 pb-20">
            {session.mode === "flashcards" ? (
              <StudentFlashcardsSession
                request={session.request}
                initialBatch={session.initialBatch}
                onExit={() => router.push("/exam-prep")}
              />
            ) : (
              <StudentExamSession
                request={session.request}
                initialBatch={session.initialBatch}
                onExit={() => router.push("/exam-prep")}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
