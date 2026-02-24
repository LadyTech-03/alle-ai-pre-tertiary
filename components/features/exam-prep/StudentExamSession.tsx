"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  gradableCount: number;
  correctCount: number;
  scorePercent: number | null;
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
  const [isWaitingForBatch, setIsWaitingForBatch] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(request.time_limit);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [reviewQuestions, setReviewQuestions] = useState<GeneratedExamQuestion[]>([]);

  const currentPage = Math.ceil(currentQuestionNumber / batchState.pageSize);
  const currentIndexInPage = (currentQuestionNumber - 1) % batchState.pageSize;
  const currentQuestion = questionPages[currentPage]?.[currentIndexInPage] ?? null;

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

  const loadPage = useCallback(
    async (page: number, waitUntilReady: boolean) => {
      const alreadyLoaded = questionPages[page];
      if (alreadyLoaded && alreadyLoaded.length > 0) {
        return alreadyLoaded;
      }

      let attemptsLeft = waitUntilReady ? BATCH_POLL_MAX_ATTEMPTS : 1;

      while (attemptsLeft > 0) {
        const batch = await eduQuestionRequestsApi.getQuestionBatch({
          requestId: request.id,
          page,
          perPage: batchState.pageSize,
          endUserType: "Student",
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

      setIsSubmittingExam(true);

      try {
        const allQuestions = await ensureAllQuestionsLoaded();
        const questionMap = new Map(allQuestions.map((question) => [question.id, question]));
        const answeredEntries = Object.entries(answers).filter(
          ([, value]) => value.trim().length > 0
        );
        const gradableEntries = answeredEntries.filter(([questionId]) => {
          const question = questionMap.get(questionId);
          return question?.kind === "mcq";
        });
        const correctCount = gradableEntries.filter(([questionId, answer]) => {
          const question = questionMap.get(questionId);
          return question?.correctOptionId === answer;
        }).length;
        const scorePercent =
          gradableEntries.length > 0
            ? Math.round((correctCount / gradableEntries.length) * 100)
            : null;

        setReviewQuestions(allQuestions);
        setSummary({
          answeredCount: answeredEntries.length,
          totalQuestions: batchState.totalQuestions,
          gradableCount: gradableEntries.length,
          correctCount,
          scorePercent,
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
        await loadPage(nextMissingPage, false);
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
    setCurrentQuestionNumber((prev) => prev - 1);
  };

  const handleNext = async () => {
    if (isWaitingForBatch || isSubmittingExam) {
      return;
    }

    if (currentQuestionNumber >= batchState.totalQuestions) {
      await submitExam("manual");
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
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Answered</p>
                <p className="text-lg font-semibold">
                  {summary.answeredCount}/{summary.totalQuestions}
                </p>
              </div>
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">MCQ Graded</p>
                <p className="text-lg font-semibold">{summary.gradableCount}</p>
              </div>
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Correct</p>
                <p className="text-lg font-semibold">{summary.correctCount}</p>
              </div>
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-lg font-semibold">
                  {summary.scorePercent === null ? "N/A" : `${summary.scorePercent}%`}
                </p>
              </div>
            </div>

            <Button onClick={onExit} className="w-full">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Back to Setup
            </Button>
          </CardContent>
        </Card>

        <Card className="border-borderColorPrimary bg-backgroundSecondary">
          <CardHeader>
            <CardTitle className="text-lg">Answer Review</CardTitle>
            <CardDescription>
              Read-only review of your responses
              {request.allows_explanation ? " with explanations." : "."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewQuestions.map((question) => {
              const selectedRaw = answers[question.id];
              const selectedOption = question.options.find((option) => option.id === selectedRaw) ?? null;
              const isMcqCorrect = question.kind === "mcq" && selectedRaw === question.correctOptionId;

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
                        const isCorrectOption = option.id === question.correctOptionId;

                        return (
                          <div
                            key={option.id}
                            className={cn(
                              "rounded-md border px-2 py-1.5 text-xs",
                              isCorrectOption && "border-primary/70 bg-secondary/70",
                              isSelected && !isCorrectOption && "border-destructive/40 bg-destructive/10"
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
                        {selectedRaw ? (isMcqCorrect ? "Correct" : "Incorrect") : "Not answered"}
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
      <Card className="border-borderColorPrimary bg-backgroundSecondary">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="mt-2 text-lg font-semibold">{request.title}</h2>
              <p className="text-xs text-muted-foreground">
                Question {currentQuestionNumber} of {batchState.totalQuestions}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {secondsLeft !== null && (
                <Badge variant="outline" className="px-2 py-1 text-[11px]">
                  <Clock3 className="mr-1 h-3.5 w-3.5" />
                  {formatTime(secondsLeft)}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={onExit} disabled={isSubmittingExam}>
                Exit Session
              </Button>
            </div>
          </div>
          <Progress
            value={(currentQuestionNumber / Math.max(batchState.totalQuestions, 1)) * 100}
            className="mt-3 h-2"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.75fr_1fr]">
        <Card className="border-borderColorPrimary bg-backgroundSecondary">
          <CardHeader>
            <CardTitle className="text-lg">Question {currentQuestionNumber}</CardTitle>
            <CardDescription>
              Batch {currentPage} of {batchState.totalPages}
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
                <div className="rounded-lg border border-borderColorPrimary bg-background px-4 py-3">
                  <p className="text-xs text-muted-foreground">{currentQuestion.subjectName}</p>
                  <p className="mt-1 text-sm leading-6">{currentQuestion.prompt}</p>
                </div>

                {currentQuestion.kind === "mcq" ? (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option) => {
                      const selected = answers[currentQuestion.id] === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setAnswer(currentQuestion.id, option.id)}
                          className={cn(
                            "w-full rounded-lg border px-3 py-2 text-left",
                            selected
                              ? "border-primary bg-secondary"
                              : "border-borderColorPrimary bg-background"
                          )}
                        >
                          <span className="mr-2 font-semibold">{option.id}.</span>
                          <span className="text-sm">{option.text}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <Textarea
                    value={answers[currentQuestion.id] ?? ""}
                    onChange={(event) => setAnswer(currentQuestion.id, event.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[120px]"
                  />
                )}

                {request.hints_count && request.hints_count > 0 && currentQuestion.hint ? (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleHint(currentQuestion.id)}
                    >
                      <Lightbulb className="mr-2 h-4 w-4" />
                      {revealedHints[currentQuestion.id] ? "Hide Hint" : "Hint"}
                    </Button>
                    {revealedHints[currentQuestion.id] ? (
                      <Alert className="border-borderColorPrimary bg-background">
                        <AlertTitle>Hint</AlertTitle>
                        <AlertDescription>{currentQuestion.hint}</AlertDescription>
                      </Alert>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionNumber === 1 || isWaitingForBatch || isSubmittingExam}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button onClick={handleNext} disabled={isWaitingForBatch || isSubmittingExam}>
                {currentQuestionNumber >= batchState.totalQuestions ? "Submit Test" : "Next Question"}
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
            <CardTitle className="text-lg">Progress</CardTitle>
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
                const active = questionNumber === currentQuestionNumber;

                return (
                  <button
                    key={questionNumber}
                    type="button"
                    onClick={() => jumpToQuestion(questionNumber)}
                    disabled={!loaded || isWaitingForBatch || isSubmittingExam}
                    className={cn(
                      "h-8 rounded-md border text-xs font-medium",
                      active && "border-primary bg-secondary",
                      answered && !active && "border-primary/60",
                      !loaded && "cursor-not-allowed border-dashed text-muted-foreground"
                    )}
                  >
                    {loaded ? questionNumber : "..."}
                  </button>
                );
              })}
            </div>

            {batchState.isGenerating ? (
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2 text-xs text-muted-foreground">
                <ArrowRight className="mr-1 inline h-3.5 w-3.5" />
                Remaining batches are generating in the background and are prefetched automatically.
              </div>
            ) : (
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2 text-xs text-muted-foreground">
                you can jump to any question by clicking on the question number in the progress grid.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
