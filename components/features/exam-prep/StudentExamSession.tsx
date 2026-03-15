"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  eduQuestionRequestsApi,
  type EduQuestionRequest,
  type GeneratedExamQuestion,
  type QuestionBatchResponse,
} from "@/lib/api/eduQuestionRequests";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Lightbulb,
} from "lucide-react";

interface StudentExamSessionProps {
  request: EduQuestionRequest;
  initialBatch: QuestionBatchResponse;
  onExit: () => void;
}

interface SessionSummary {
  answeredCount: number;
  totalQuestions: number;
}

const BATCH_POLL_INTERVAL_MS = 900;
const BATCH_POLL_MAX_ATTEMPTS = 14;

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const flattenQuestions = (pages: Record<number, GeneratedExamQuestion[]>) =>
  Object.values(pages)
    .flat()
    .sort((a, b) => a.order - b.order);

export function StudentExamSession({ request, initialBatch, onExit }: StudentExamSessionProps) {
  const [questionPages, setQuestionPages] = useState<Record<number, GeneratedExamQuestion[]>>({
    [initialBatch.page]: initialBatch.data,
  });
  const [batchState, setBatchState] = useState({
    pageSize: initialBatch.perPage,
    totalQuestions: initialBatch.totalQuestions,
    totalPages: initialBatch.totalPages,
    readyThroughPage: initialBatch.readyThroughPage,
    isGenerating: initialBatch.isGenerating,
  });
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});
  const [savingAnswerById, setSavingAnswerById] = useState<Record<string, boolean>>({});
  const [hintLoadingById, setHintLoadingById] = useState<Record<string, boolean>>({});
  const [isWaitingForBatch, setIsWaitingForBatch] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(request.time_limit);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [reviewQuestions, setReviewQuestions] = useState<GeneratedExamQuestion[]>([]);
  const [isExitPromptOpen, setIsExitPromptOpen] = useState(false);
  const [isSubmitPromptOpen, setIsSubmitPromptOpen] = useState(false);

  const currentPage = Math.ceil(currentQuestionNumber / batchState.pageSize);
  const currentIndexInPage = (currentQuestionNumber - 1) % batchState.pageSize;
  const currentQuestion = questionPages[currentPage]?.[currentIndexInPage] ?? null;
  const subjectLabel = currentQuestion?.subjectName ?? request.course_name ?? "Selected Subject";

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value.trim().length > 0).length,
    [answers]
  );

  const questionNumbers = useMemo(
    () => Array.from({ length: batchState.totalQuestions }, (_, index) => index + 1),
    [batchState.totalQuestions]
  );

  const isQuestionLoaded = useCallback(
    (questionNumber: number) => {
      const page = Math.ceil(questionNumber / batchState.pageSize);
      const indexInPage = (questionNumber - 1) % batchState.pageSize;
      return Boolean(questionPages[page]?.[indexInPage]);
    },
    [batchState.pageSize, questionPages]
  );

  const getQuestionByNumber = useCallback(
    (questionNumber: number) => {
      const page = Math.ceil(questionNumber / batchState.pageSize);
      const indexInPage = (questionNumber - 1) % batchState.pageSize;
      return questionPages[page]?.[indexInPage] ?? null;
    },
    [batchState.pageSize, questionPages]
  );

  const setAnswer = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }, []);

  const toggleHint = useCallback((questionId: string) => {
    setRevealedHints((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  }, []);

  const persistAnswerForQuestion = useCallback(
    async (question: GeneratedExamQuestion | null) => {
      if (!question) {
        return;
      }

      const answer = answers[question.id];
      if (!answer) {
        return;
      }

      if (savedAnswers[question.id] === answer || savingAnswerById[question.id]) {
        return;
      }

      setSavingAnswerById((prev) => ({ ...prev, [question.id]: true }));

      try {
        const questionId = question.questionId ?? question.id;
        await eduQuestionRequestsApi.saveQuestionAnswer({
          organisationId: request.organisation_id,
          requestId: request.id,
          questionId,
          answer,
          endUserType: "Student",
          useMock: false,
        });
        setSavedAnswers((prev) => ({ ...prev, [question.id]: answer }));
      } catch {
        toast.error("Could not save that answer. We'll keep it locally.");
      } finally {
        setSavingAnswerById((prev) => ({ ...prev, [question.id]: false }));
      }
    },
    [answers, request.id, request.organisation_id, savedAnswers, savingAnswerById]
  );

  const setQuestionHint = useCallback((questionId: string, hint: string) => {
    setQuestionPages((prev) => {
      const next: Record<number, GeneratedExamQuestion[]> = {};
      Object.entries(prev).forEach(([pageKey, pageQuestions]) => {
        next[Number(pageKey)] = pageQuestions.map((question) =>
          question.id === questionId ? { ...question, hint } : question
        );
      });
      return next;
    });
  }, []);

  const requestHintForQuestion = useCallback(
    async (question: GeneratedExamQuestion) => {
      if (hintLoadingById[question.id]) {
        return;
      }

      setHintLoadingById((prev) => ({ ...prev, [question.id]: true }));
      try {
        const questionId = question.questionId ?? question.id;
        const hint = await eduQuestionRequestsApi.requestQuestionHint({
          organisationId: request.organisation_id,
          requestId: request.id,
          questionId,
          endUserType: "Student",
          useMock: false,
        });

        if (hint) {
          setQuestionHint(question.id, hint);
          setRevealedHints((prev) => ({ ...prev, [question.id]: true }));
        } else {
          toast.error("No hint available yet.");
        }
      } catch {
        toast.error("Could not load a hint. Try again.");
      } finally {
        setHintLoadingById((prev) => ({ ...prev, [question.id]: false }));
      }
    },
    [hintLoadingById, request.id, request.organisation_id, setQuestionHint]
  );

  const loadPage = useCallback(
    async (page: number, waitUntilReady: boolean) => {
      const alreadyLoaded = questionPages[page];
      if (alreadyLoaded && alreadyLoaded.length > 0) {
        return alreadyLoaded;
      }

      let attemptsLeft = waitUntilReady ? BATCH_POLL_MAX_ATTEMPTS : 1;

      while (attemptsLeft > 0) {
        const batch = await eduQuestionRequestsApi.getQuestionBatch({
          organisationId: request.organisation_id,
          requestId: request.id,
          page,
          perPage: batchState.pageSize,
          endUserType: "Student",
          totalQuestions: request.number,
          subjectId: request.course_uuid,
          subjectName: request.course_name,
          useMock: false,
        });

        setBatchState({
          pageSize: batch.perPage,
          totalQuestions: batch.totalQuestions,
          totalPages: batch.totalPages,
          readyThroughPage: batch.readyThroughPage,
          isGenerating: batch.isGenerating,
        });

        if (batch.isReady && batch.data.length > 0) {
          setQuestionPages((prev) => ({
            ...prev,
            [batch.page]: batch.data,
          }));
          return batch.data;
        }

        attemptsLeft -= 1;
        if (!waitUntilReady || attemptsLeft <= 0) {
          return null;
        }

        await sleep(BATCH_POLL_INTERVAL_MS);
      }

      return null;
    },
    [batchState.pageSize, questionPages, request.id]
  );

  const ensureAllQuestionsLoaded = useCallback(async () => {
    const pagesToLoad: number[] = [];
    for (let page = 1; page <= batchState.totalPages; page += 1) {
      const loadedPage = questionPages[page];
      if (!loadedPage || loadedPage.length === 0) {
        pagesToLoad.push(page);
      }
    }

    if (pagesToLoad.length === 0) {
      return flattenQuestions(questionPages);
    }

    const loadedResults = await Promise.all(
      pagesToLoad.map((page) => loadPage(page, true))
    );

    const merged: Record<number, GeneratedExamQuestion[]> = {
      ...questionPages,
    };

    pagesToLoad.forEach((page, index) => {
      const pageData = loadedResults[index];
      if (pageData && pageData.length > 0) {
        merged[page] = pageData;
      }
    });

    return flattenQuestions(merged);
  }, [batchState.totalPages, loadPage, questionPages]);

  const submitExam = useCallback(
    async (reason: "manual" | "timeout") => {
      if (summary || isSubmittingExam) {
        return;
      }

      await persistAnswerForQuestion(currentQuestion);
      setIsSubmittingExam(true);

      try {
        const allQuestions = await ensureAllQuestionsLoaded();
        const answeredEntries = Object.entries(answers).filter(
          ([, value]) => value.trim().length > 0
        );

        setReviewQuestions(allQuestions);
        setSummary({
          answeredCount: answeredEntries.length,
          totalQuestions: batchState.totalQuestions,
        });

        if (reason === "timeout") {
          toast.error("Time is up. Test submitted automatically.");
          return;
        }

        toast.success("Test submitted.");
      } catch {
        toast.error("Could not submit exam. Please try again.");
      } finally {
        setIsSubmittingExam(false);
      }
    },
    [answers, batchState.totalQuestions, ensureAllQuestionsLoaded, isSubmittingExam, summary]
  );

  useEffect(() => {
    if (secondsLeft === null || summary || isSubmittingExam) {
      return;
    }

    if (secondsLeft <= 0) {
      void submitExam("timeout");
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((value) => (value === null ? null : Math.max(value - 1, 0)));
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isSubmittingExam, secondsLeft, submitExam, summary]);

  useEffect(() => {
    if (summary || isSubmittingExam) {
      return;
    }

    let cancelled = false;
    let inFlight = false;

    const prefetchUpcomingPage = async () => {
      if (cancelled || inFlight) {
        return;
      }

      const nextMissingPage = Array.from(
        { length: batchState.totalPages },
        (_, index) => index + 1
      ).find((page) => !questionPages[page]?.length);

      if (!nextMissingPage) {
        return;
      }

      inFlight = true;
      try {
        await loadPage(nextMissingPage, true);
      } finally {
        inFlight = false;
      }
    };

    void prefetchUpcomingPage();
    const intervalId = window.setInterval(() => {
      void prefetchUpcomingPage();
    }, BATCH_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [batchState.totalPages, isSubmittingExam, loadPage, questionPages, summary]);

  const handlePrevious = () => {
    if (currentQuestionNumber <= 1 || isWaitingForBatch || isSubmittingExam) {
      return;
    }
    void persistAnswerForQuestion(currentQuestion);
    setCurrentQuestionNumber((prev) => prev - 1);
  };

  const handleNext = async () => {
    if (isWaitingForBatch || isSubmittingExam) {
      return;
    }

    void persistAnswerForQuestion(currentQuestion);

    if (currentQuestionNumber >= batchState.totalQuestions) {
      setIsSubmitPromptOpen(true);
      return;
    }

    const nextQuestionNumber = currentQuestionNumber + 1;
    if (isQuestionLoaded(nextQuestionNumber)) {
      setCurrentQuestionNumber(nextQuestionNumber);
      return;
    }

    setIsWaitingForBatch(true);
    const nextPage = Math.ceil(nextQuestionNumber / batchState.pageSize);
    const loadedQuestions = await loadPage(nextPage, true);
    setIsWaitingForBatch(false);

    if (!loadedQuestions) {
      toast.error("Next batch is still generating. Please try again.");
      return;
    }

    setCurrentQuestionNumber(nextQuestionNumber);
  };

  const jumpToQuestion = async (questionNumber: number) => {
    if (isWaitingForBatch || summary || isSubmittingExam) {
      return;
    }

    console.log('current question:', currentQuestion);


    void persistAnswerForQuestion(currentQuestion);

    if (isQuestionLoaded(questionNumber)) {
      setCurrentQuestionNumber(questionNumber);
      return;
    }

    setIsWaitingForBatch(true);
    const targetPage = Math.ceil(questionNumber / batchState.pageSize);
    const loadedQuestions = await loadPage(targetPage, true);
    setIsWaitingForBatch(false);

    if (!loadedQuestions) {
      toast.error("That batch is still generating. Try again shortly.");
      return;
    }

    setCurrentQuestionNumber(questionNumber);
  };

  if (summary) {
    const submittedCount = Object.entries(answers).filter(
      ([questionId, answer]) => answer.trim().length > 0 && savedAnswers[questionId] === answer
    ).length;

    return (
      <div className="space-y-4">
        <Card className="border-borderColorPrimary bg-backgroundSecondary">
          <CardHeader>
            <Badge variant="secondary" className="w-fit px-2 py-0.5 text-[10px]">
              TEST COMPLETE
            </Badge>
            <CardTitle className="mt-2 text-xl">Exam Submitted</CardTitle>
            <CardDescription>{request.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Answered</p>
                <p className="text-lg font-semibold">
                  {summary.answeredCount}/{summary.totalQuestions}
                </p>
              </div>
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Submitted</p>
                <p className="text-lg font-semibold">{submittedCount}</p>
              </div>
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-semibold">Awaiting grading</p>
              </div>
            </div>

            <Button onClick={onExit} className="w-full">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Back to Exam/Test Prep Menu
            </Button>
          </CardContent>
        </Card>

        <Card className="border-borderColorPrimary bg-backgroundSecondary">
          <CardHeader>
            <CardTitle className="text-lg">Answer Review</CardTitle>
            <CardDescription>
              Read-only review of your responses. Results will appear after grading.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewQuestions.map((question) => {
              const selectedRaw = answers[question.id];
              const selectedOption = question.options.find((option) => option.id === selectedRaw) ?? null;

              return (
                <div
                  key={question.id}
                  className="rounded-lg border border-borderColorPrimary bg-background px-3 py-3"
                >
                  <p className="text-xs text-muted-foreground">Question {question.order}</p>
                  <p className="mt-1 text-sm">{question.prompt}</p>

                  {question.kind === "mcq" ? (
                    <div className="mt-2 space-y-1">
                      {question.options.map((option) => {
                        const isSelected = selectedRaw === option.id;

                        return (
                          <div
                            key={option.id}
                            className={cn(
                              "rounded-md border px-2 py-1.5 text-xs",
                              isSelected && "border-primary/70 bg-secondary/70"
                            )}
                          >
                            <span className="font-medium">{option.id}.</span> {option.text}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-2 rounded-md border border-borderColorPrimary px-2 py-2 text-xs">
                      {selectedRaw?.trim() ? selectedRaw : "No response submitted."}
                    </div>
                  )}

                  <div className="mt-2 text-xs text-muted-foreground">
                    {question.kind === "mcq" ? (
                      <>
                        Your answer: {selectedOption ? `${selectedOption.id}` : "Not answered"} | Status:{" "}
                        {selectedRaw ? "Submitted" : "Not answered"}
                      </>
                    ) : (
                      <>Response recorded.</>
                    )}
                  </div>

                  {request.allows_explanation ? (
                    <div className="mt-2 rounded-md border border-borderColorPrimary bg-secondary/40 px-2 py-2">
                      <p className="text-xs font-medium">Explanation</p>
                      <p className="text-xs text-muted-foreground">
                        {question.explanation ?? "Explanation not available for this item."}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-borderColorPrimary bg-muted/80">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="mt-2 text-lg font-semibold">{request.title} - ({subjectLabel})</h2>
              <p className="text-base text-muted-foreground font-semibold">
                Question {currentQuestionNumber}
              </p>
            </div>
          <div className="flex flex-wrap items-center gap-2">
              {secondsLeft !== null && (
                <Badge variant="outline" className="px-2 py-1 text-sm">
                  <Clock3 className="mr-1 h-3.5 w-3.5" />
                  {formatTime(secondsLeft)}
                </Badge>
              )}
              {currentQuestion && answers[currentQuestion.id] ? (
                <Badge variant="secondary" className="px-2 py-1 text-xs">
                  {savingAnswerById[currentQuestion.id]
                    ? "Saving answer..."
                    : savedAnswers[currentQuestion.id] === answers[currentQuestion.id]
                      ? "Answer submitted"
                      : "Answer not submitted"}
                </Badge>
              ) : null}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsExitPromptOpen(true)}
                disabled={isSubmittingExam}
              >
                End Test
              </Button>
            </div>
          </div>
          {/* <Progress
            value={(currentQuestionNumber / Math.max(batchState.totalQuestions, 1)) * 100}
            className="mt-3 h-1"
          /> */}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.75fr_1fr]">
        <Card className="border-borderColorPrimary bg-muted/80">
          <CardHeader className="px-6 py-2">
            <CardTitle className="text-lg sr-only">Question {currentQuestionNumber}</CardTitle>
            <CardDescription>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmittingExam ? (
              <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-borderColorPrimary bg-background">
                <div className="text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                  Submitting exam and preparing review...
                </div>
              </div>
            ) : isWaitingForBatch || !currentQuestion ? (
              <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-borderColorPrimary bg-background">
                <div className="text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                  Loading next question batch...
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg py-0">
                  <p className="mt-1 text-base leading-6">{currentQuestion.prompt}</p>
                </div>

                {currentQuestion.kind === "mcq" ? (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option) => {
                      const selected = answers[currentQuestion.id] === option.id;
                      return (
                        <Button
                          key={option.id}
                          variant={selected ? 'success2' : 'outline2'}
                          onClick={() => setAnswer(currentQuestion.id, option.id)}
                          className={cn(
                            "w-full justify-start"
                          )}
                        >
                          <span className="mr-2 font-semibold">{option.id}.</span>
                          <span className="text-sm">{option.text}</span>
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <Textarea
                    value={answers[currentQuestion.id] ?? ""}
                    onChange={(event) => setAnswer(currentQuestion.id, event.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[120px] focus-visible:outline-none border border-borderColorPrimary"
                  />
                )}

                {request.hints_count && request.hints_count > 0 && currentQuestion ? (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentQuestion.hint) {
                          toggleHint(currentQuestion.id);
                          return;
                        }
                        void requestHintForQuestion(currentQuestion);
                      }}
                      disabled={hintLoadingById[currentQuestion.id]}
                    >
                      <Lightbulb className="mr-2 h-4 w-4" />
                      {hintLoadingById[currentQuestion.id]
                        ? "Loading hint..."
                        : revealedHints[currentQuestion.id]
                          ? "Hide Hint"
                          : "Hint"}
                    </Button>
                    {revealedHints[currentQuestion.id] && currentQuestion.hint ? (
                      <Alert className="border-borderColorPrimary bg-background">
                        <AlertTitle>Hint</AlertTitle>
                        <AlertDescription className="whitespace-pre-line">
                          {currentQuestion.hint}
                        </AlertDescription>
                      </Alert>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestionNumber === 1 || isWaitingForBatch || isSubmittingExam}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
              variant={currentQuestionNumber >= batchState.totalQuestions ? "success2" : "default"}
              onClick={handleNext} disabled={isWaitingForBatch || isSubmittingExam}>
                {currentQuestionNumber >= batchState.totalQuestions ? "Submit Test" : "Next"}
                {currentQuestionNumber >= batchState.totalQuestions ? (
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowRight className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-borderColorPrimary bg-backgroundSecondary">
          <CardHeader>
            <CardTitle className="text-lg"></CardTitle>
            <CardDescription>
              {answeredCount} answered of {batchState.totalQuestions}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {questionNumbers.map((questionNumber) => {
                const loaded = isQuestionLoaded(questionNumber);
                const question = getQuestionByNumber(questionNumber);
                const answered = question ? Boolean(answers[question.id]?.trim()) : false;
                const submitted = question
                  ? Boolean(savedAnswers[question.id] && savedAnswers[question.id] === answers[question.id])
                  : false;
                const isSaving = question ? Boolean(savingAnswerById[question.id]) : false;
                const active = questionNumber === currentQuestionNumber;

                return (
                  <Button
                    key={questionNumber}
                    variant={active ? 'default' : 'outline2'}
                    onClick={() => jumpToQuestion(questionNumber)}
                    disabled={!loaded || isWaitingForBatch || isSubmittingExam}
                    className={cn(
                      "rounded-md border-2 border-borderColorPrimary text-xs font-medium",
                      submitted && !active && "border-emerald-500/70 bg-emerald-500/15",
                      answered && !submitted && !active && "border-amber-400/60 bg-amber-500/10",
                      isSaving && "border-sky-400/60 bg-sky-500/10",
                      !loaded && "cursor-not-allowed border-dashed text-muted-foreground"
                    )}
                  >
                    <span className="flex items-center justify-center gap-1">
                      {loaded ? questionNumber : "..."}
                      {submitted ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      ) : isSaving ? (
                        <Loader2 className="h-3 w-3 animate-spin text-sky-500" />
                      ) : null}
                    </span>
                  </Button>
                );
              })}
            </div>

            {batchState.isGenerating ? (
              <div className="rounded-lg italic text-xs text-muted-foreground mt-4">
                <ArrowRight className="mr-1 inline h-3.5 w-3.5" />
                Loading questions.
              </div>
            ) : (
              <div className="rounded-lg italic text-xs text-muted-foreground mt-4">
                you can jump to any question by clicking on the question number.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isExitPromptOpen} onOpenChange={setIsExitPromptOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>End Test?</DialogTitle>
            <DialogDescription>
              Are you sure you want to end the test? You can always start a new test, but your current progress will be lost.
            </DialogDescription>
          </DialogHeader>
          {secondsLeft !== null ? (
            <div className="rounded-lg border border-borderColorPrimary bg-muted/40 px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Time remaining</p>
              <p className="text-2xl font-semibold">{formatTime(secondsLeft)}</p>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsExitPromptOpen(false)}>
              Stay
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsExitPromptOpen(false);
                onExit();
              }}
            >
              End
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubmitPromptOpen} onOpenChange={setIsSubmitPromptOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Test?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit the test? This will finalize your answers and you won&apos;t be able to make any changes.
            </DialogDescription>
          </DialogHeader>
          {secondsLeft !== null ? (
            <div className="rounded-lg border border-borderColorPrimary bg-muted/40 px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Time remaining</p>
              <p className="text-2xl font-semibold">{formatTime(secondsLeft)}</p>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsSubmitPromptOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="success2"
              onClick={() => {
                setIsSubmitPromptOpen(false);
                void submitExam("manual");
              }}
              disabled={isSubmittingExam}
            >
              Submit Test
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
