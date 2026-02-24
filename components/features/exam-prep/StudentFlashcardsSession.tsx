"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  eduQuestionRequestsApi,
  type EduQuestionRequest,
  type GeneratedExamQuestion,
  type QuestionBatchResponse,
} from "@/lib/api/eduQuestionRequests";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Heart,
  Lightbulb,
  Loader2,
  Trophy,
} from "lucide-react";

interface StudentFlashcardsSessionProps {
  request: EduQuestionRequest;
  initialBatch: QuestionBatchResponse;
  rules: FlashcardSessionRules;
  onExit: () => void;
}

type FlashcardOutcome = "know" | "almost" | "again";

interface RoundSummary {
  score: number;
  bestStreak: number;
  masteredCount: number;
  needsReviewCount: number;
  totalCards: number;
}

export interface FlashcardSessionRules {
  roundSize: number;
  lives: number;
  shuffle: boolean;
  timerMinutes: number | null;
}

const BATCH_POLL_INTERVAL_MS = 900;
const BATCH_POLL_MAX_ATTEMPTS = 14;

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const shuffleNumbers = (values: number[]) => {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const flattenQuestions = (pages: Record<number, GeneratedExamQuestion[]>) =>
  Object.values(pages)
    .flat()
    .sort((a, b) => a.order - b.order);

export function StudentFlashcardsSession({
  request,
  initialBatch,
  rules,
  onExit,
}: StudentFlashcardsSessionProps) {
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
  const [deckQueue, setDeckQueue] = useState<number[]>(() => {
    const baseQueue = Array.from({ length: initialBatch.totalQuestions }, (_, index) => index + 1);
    return rules.shuffle ? shuffleNumbers(baseQueue) : baseQueue;
  });
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isWaitingForBatch, setIsWaitingForBatch] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [livesLeft, setLivesLeft] = useState(rules.lives);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(request.time_limit);
  const [outcomes, setOutcomes] = useState<Record<string, FlashcardOutcome>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [summary, setSummary] = useState<RoundSummary | null>(null);
  const [reviewQuestions, setReviewQuestions] = useState<GeneratedExamQuestion[]>([]);

  const currentQuestionNumber = deckQueue[currentTurn] ?? null;
  const currentPage = currentQuestionNumber
    ? Math.ceil(currentQuestionNumber / batchState.pageSize)
    : 1;
  const currentIndexInPage = currentQuestionNumber
    ? (currentQuestionNumber - 1) % batchState.pageSize
    : 0;
  const currentQuestion = currentQuestionNumber
    ? questionPages[currentPage]?.[currentIndexInPage] ?? null
    : null;
  const cardsRemaining = Math.max(deckQueue.length - currentTurn, 0);
  const progressValue = (currentTurn / Math.max(deckQueue.length, 1)) * 100;

  const isQuestionLoaded = useCallback(
    (questionNumber: number) => {
      const page = Math.ceil(questionNumber / batchState.pageSize);
      const indexInPage = (questionNumber - 1) % batchState.pageSize;
      return Boolean(questionPages[page]?.[indexInPage]);
    },
    [batchState.pageSize, questionPages]
  );

  const loadPage = useCallback(
    async (page: number, waitUntilReady: boolean) => {
      const alreadyLoaded = questionPages[page];
      if (alreadyLoaded?.length) {
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
      if (!questionPages[page]?.length) {
        pagesToLoad.push(page);
      }
    }

    if (pagesToLoad.length === 0) {
      return flattenQuestions(questionPages);
    }

    const loadedResults = await Promise.all(pagesToLoad.map((page) => loadPage(page, true)));
    const merged: Record<number, GeneratedExamQuestion[]> = { ...questionPages };

    pagesToLoad.forEach((page, index) => {
      const loadedPage = loadedResults[index];
      if (loadedPage?.length) {
        merged[page] = loadedPage;
      }
    });

    return flattenQuestions(merged);
  }, [batchState.totalPages, loadPage, questionPages]);

  const finishRound = useCallback(
    async (reason: "complete" | "timeout" | "lives") => {
      if (summary || isFinishing) {
        return;
      }
      setIsFinishing(true);

      try {
        const questions = await ensureAllQuestionsLoaded();
        setReviewQuestions(questions);

        const masteredCount = Object.values(outcomes).filter((value) => value === "know").length;
        const needsReviewCount = Object.values(outcomes).filter((value) => value === "again").length;

        setSummary({
          score,
          bestStreak,
          masteredCount,
          needsReviewCount,
          totalCards: questions.length,
        });

        if (reason === "timeout") {
          toast.error("Time is up. Round ended automatically.");
          return;
        }
        if (reason === "lives") {
          toast.error("No lives left. Round ended.");
          return;
        }

        toast.success("Round completed.");
      } catch {
        toast.error("Could not complete round. Try again.");
      } finally {
        setIsFinishing(false);
      }
    },
    [bestStreak, ensureAllQuestionsLoaded, isFinishing, outcomes, score, summary]
  );

  useEffect(() => {
    if (summary || isFinishing || secondsLeft === null) {
      return;
    }

    if (secondsLeft <= 0) {
      void finishRound("timeout");
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((value) => (value === null ? null : Math.max(value - 1, 0)));
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [finishRound, isFinishing, secondsLeft, summary]);

  useEffect(() => {
    if (summary || isFinishing || currentQuestionNumber === null) {
      return;
    }

    if (isQuestionLoaded(currentQuestionNumber)) {
      setIsWaitingForBatch(false);
      return;
    }

    let cancelled = false;
    setIsWaitingForBatch(true);
    const page = Math.ceil(currentQuestionNumber / batchState.pageSize);
    void loadPage(page, true).finally(() => {
      if (!cancelled) {
        setIsWaitingForBatch(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [batchState.pageSize, currentQuestionNumber, isFinishing, isQuestionLoaded, loadPage, summary]);

  useEffect(() => {
    if (summary || isFinishing) {
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
  }, [batchState.totalPages, isFinishing, loadPage, questionPages, summary]);

  const handleOutcome = (outcome: FlashcardOutcome) => {
    if (!currentQuestion || !currentQuestionNumber || summary || isFinishing || isWaitingForBatch) {
      return;
    }

    const questionId = currentQuestion.id;
    setOutcomes((prev) => ({ ...prev, [questionId]: outcome }));
    setRevealedHints((prev) => ({ ...prev, [questionId]: false }));

    let nextLives = livesLeft;
    let targetQueueLength = deckQueue.length;

    if (outcome === "know") {
      const points = 10 + streak * 2;
      const nextStreak = streak + 1;
      setScore((prev) => prev + points);
      setStreak(nextStreak);
      setBestStreak((prev) => Math.max(prev, nextStreak));
    } else if (outcome === "almost") {
      setScore((prev) => prev + 5);
      setStreak(0);
    } else {
      nextLives = Math.max(livesLeft - 1, 0);
      setLivesLeft(nextLives);
      setStreak(0);
      if (nextLives > 0) {
        setDeckQueue((prev) => [...prev, currentQuestionNumber]);
        targetQueueLength += 1;
      }
    }

    const nextTurn = currentTurn + 1;
    setCurrentTurn(nextTurn);
    setIsFlipped(false);

    if (nextLives <= 0) {
      void finishRound("lives");
      return;
    }
    if (nextTurn >= targetQueueLength) {
      void finishRound("complete");
    }
  };

  const questionNumbers = useMemo(
    () => Array.from({ length: batchState.totalQuestions }, (_, index) => index + 1),
    [batchState.totalQuestions]
  );

  if (summary) {
    return (
      <div className="space-y-4">
        <Card className="border-borderColorPrimary bg-backgroundSecondary">
          <CardHeader>
            <Badge variant="secondary" className="w-fit px-2 py-0.5 text-[10px]">
              ROUND COMPLETE
            </Badge>
            <CardTitle className="mt-2 text-xl">Flashcards Result</CardTitle>
            <CardDescription>{request.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-lg font-semibold">{summary.score}</p>
              </div>
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Best Streak</p>
                <p className="text-lg font-semibold">{summary.bestStreak}</p>
              </div>
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Mastered</p>
                <p className="text-lg font-semibold">{summary.masteredCount}</p>
              </div>
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Needs Review</p>
                <p className="text-lg font-semibold">{summary.needsReviewCount}</p>
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
            <CardTitle className="text-lg">Read-only Review</CardTitle>
            <CardDescription>
              Your final card outcomes
              {request.allows_explanation ? " with explanations." : "."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewQuestions.map((question) => {
              const outcome = outcomes[question.id];
              return (
                <div
                  key={question.id}
                  className="rounded-lg border border-borderColorPrimary bg-background px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">Card {question.order}</p>
                    <Badge variant="secondary" className="px-2 py-0 text-[10px] uppercase">
                      {outcome ?? "unanswered"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm">{question.prompt}</p>
                  {request.allows_explanation && question.explanation ? (
                    <div className="mt-2 rounded-md border border-borderColorPrimary bg-secondary/40 px-2 py-2">
                      <p className="text-xs font-medium">Explanation</p>
                      <p className="text-xs text-muted-foreground">{question.explanation}</p>
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
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
            <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Score</p>
              <p className="text-sm font-semibold">{score}</p>
            </div>
            <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Streak</p>
              <p className="text-sm font-semibold">{streak}</p>
            </div>
            <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Best</p>
              <p className="text-sm font-semibold">{bestStreak}</p>
            </div>
            <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Lives</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: rules.lives }, (_, index) => (
                  <Heart
                    key={`${index + 1}`}
                    className={cn(
                      "h-4 w-4",
                      index < livesLeft ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Cards Left</p>
              <p className="text-sm font-semibold">{cardsRemaining}</p>
            </div>
            <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Timer</p>
              <p className="text-sm font-semibold">
                {secondsLeft === null ? "Untimed" : formatTime(secondsLeft)}
              </p>
            </div>
          </div>
          <Progress value={progressValue} className="mt-3 h-2" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.75fr_1fr]">
        <Card className="border-borderColorPrimary bg-backgroundSecondary">
          <CardHeader>
            <CardTitle className="text-lg">Flash Card</CardTitle>
            <CardDescription>
              Turn {currentTurn + 1} of {deckQueue.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFinishing ? (
              <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-borderColorPrimary bg-background">
                <div className="text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                  Wrapping up round...
                </div>
              </div>
            ) : isWaitingForBatch || !currentQuestion ? (
              <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-borderColorPrimary bg-background">
                <div className="text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                  Preparing next card...
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-borderColorPrimary bg-background p-4">
                  <p className="text-xs text-muted-foreground">
                    {isFlipped ? "Back of Card" : "Front of Card"}
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    {isFlipped
                      ? currentQuestion.explanation ?? "Think through the concept before choosing your outcome."
                      : currentQuestion.prompt}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsFlipped((prev) => !prev)}>
                    {isFlipped ? "Show Prompt" : "Flip Card"}
                  </Button>
                  {request.hints_count && request.hints_count > 0 && currentQuestion.hint ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setRevealedHints((prev) => ({
                          ...prev,
                          [currentQuestion.id]: !prev[currentQuestion.id],
                        }))
                      }
                    >
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Hint
                    </Button>
                  ) : null}
                </div>

                {revealedHints[currentQuestion.id] ? (
                  <Alert className="border-borderColorPrimary bg-background">
                    <AlertTitle>Hint</AlertTitle>
                    <AlertDescription>{currentQuestion.hint}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="grid gap-2 sm:grid-cols-3">
                  <Button type="button" disabled={!isFlipped} onClick={() => handleOutcome("know")}>
                    <Trophy className="mr-2 h-4 w-4" />
                    I Knew It
                  </Button>
                  <Button type="button" variant="outline" disabled={!isFlipped} onClick={() => handleOutcome("almost")}>
                    Almost
                  </Button>
                  <Button type="button" variant="outline" disabled={!isFlipped} onClick={() => handleOutcome("again")}>
                    Review Again
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onExit}
                disabled={isFinishing}
              >
                Exit Flashcards
              </Button>
              <Button type="button" variant="outline" onClick={() => void finishRound("complete")} disabled={isFinishing}>
                Finish Round
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-borderColorPrimary bg-backgroundSecondary">
          <CardHeader>
            <CardTitle className="text-lg">Deck Progress</CardTitle>
            <CardDescription>
              Background generation: {batchState.readyThroughPage}/{batchState.totalPages} batches ready
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {questionNumbers.map((number) => {
                const loaded = isQuestionLoaded(number);
                const page = Math.ceil(number / batchState.pageSize);
                const indexInPage = (number - 1) % batchState.pageSize;
                const question = questionPages[page]?.[indexInPage];
                const outcome = question ? outcomes[question.id] : undefined;
                const isCurrent = number === currentQuestionNumber;

                return (
                  <div
                    key={number}
                    className={cn(
                      "h-8 rounded-md border text-center text-xs leading-8",
                      isCurrent && "border-primary bg-secondary",
                      outcome === "know" && "border-primary/70",
                      outcome === "again" && "border-destructive/40",
                      !loaded && "border-dashed text-muted-foreground"
                    )}
                  >
                    {loaded ? number : "..."}
                  </div>
                );
              })}
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={() => setIsFlipped((prev) => !prev)} disabled={isWaitingForBatch || isFinishing || !currentQuestion}>
              {isFlipped ? "Show Front" : "Show Back"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
