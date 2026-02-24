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
  const [isWaitingForBatch, setIsWaitingForBatch] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(request.time_limit);
  const [summary, setSummary] = useState<SessionSummary | null>(null);

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

  const submitExam = useCallback(
    (reason: "manual" | "timeout") => {
      if (summary) {
        return;
      }

      const allLoadedQuestions = Object.values(questionPages).flat();
      const questionMap = new Map(allLoadedQuestions.map((question) => [question.id, question]));
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
        gradableEntries.length > 0 ? Math.round((correctCount / gradableEntries.length) * 100) : null;

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
    },
    [answers, batchState.totalQuestions, questionPages, summary]
  );

  useEffect(() => {
    if (secondsLeft === null || summary) {
      return;
    }

    if (secondsLeft <= 0) {
      submitExam("timeout");
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((value) => (value === null ? null : Math.max(value - 1, 0)));
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [secondsLeft, submitExam, summary]);

  const handlePrevious = () => {
    if (currentQuestionNumber <= 1 || isWaitingForBatch) {
      return;
    }
    setCurrentQuestionNumber((prev) => prev - 1);
  };

  const handleNext = async () => {
    if (isWaitingForBatch) {
      return;
    }

    if (currentQuestionNumber >= batchState.totalQuestions) {
      submitExam("manual");
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
    if (isWaitingForBatch || summary) {
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
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-borderColorPrimary bg-backgroundSecondary">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">
                LIVE EXAM
              </Badge>
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
              <Badge variant={batchState.isGenerating ? "outline" : "secondary"} className="px-2 py-1 text-[11px]">
                {batchState.isGenerating
                  ? `Generating batches ${batchState.readyThroughPage}/${batchState.totalPages}`
                  : "All batches ready"}
              </Badge>
              <Button variant="outline" size="sm" onClick={onExit}>
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
            {isWaitingForBatch || !currentQuestion ? (
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

                {currentQuestion.hint && (
                  <Alert className="border-borderColorPrimary bg-background">
                    <AlertTitle>Hint</AlertTitle>
                    <AlertDescription>{currentQuestion.hint}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionNumber === 1 || isWaitingForBatch}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button onClick={handleNext} disabled={isWaitingForBatch}>
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
                    disabled={!loaded || isWaitingForBatch}
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
                More batches are generating. Click next to continue as they become available.
              </div>
            ) : (
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2 text-xs text-muted-foreground">
                All batches are ready. You can jump to any question.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
