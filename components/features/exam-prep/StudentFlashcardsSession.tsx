"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  eduQuestionRequestsApi,
  type EduQuestionRequest,
  type GeneratedExamQuestion,
  type QuestionBatchResponse,
} from "@/lib/api/eduQuestionRequests";
import {
  CheckCircle2,
  Lightbulb,
  Loader2,
  RotateCcw,
} from "lucide-react";
import {
  applySm2Rating,
  calculateDailyStreak,
  createDefaultCardState,
  createDefaultProfile,
  evaluateNewAchievements,
  flashcardAchievements,
  getBaseXpForRating,
  getRetentionScore,
  getTodayKey,
  isCardDueSoon,
  resolveLevelProgress,
  resolveStreakLevel,
  upsertDailyHistory,
  type FlashcardCardState,
  type FlashcardPlayerProfile,
  type FlashcardRating,
  type FlashcardSessionMetrics,
} from "./flashcards/gamification";

interface StudentFlashcardsSessionProps {
  request: EduQuestionRequest;
  initialBatch: QuestionBatchResponse;
  onExit: () => void;
}

interface SessionSummary {
  xpEarned: number;
  accuracy: number;
  bestStreak: number;
  known: number;
  stillLearning: number;
  retry: number;
  dueForReview: number;
  retention: number;
  levelBefore: number;
  levelAfter: number;
  unlockedBadges: string[];
}

const PROFILE_STORAGE_KEY = "exam-prep-flashcard-profile-v2";
const BATCH_POLL_INTERVAL_MS = 900;
const BATCH_POLL_MAX_ATTEMPTS = 14;

const baseMetrics: FlashcardSessionMetrics = {
  reviewed: 0,
  easy: 0,
  medium: 0,
  hard: 0,
  again: 0,
  bestStreak: 0,
  xpEarned: 0,
};

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

const flattenPages = (pages: Record<number, GeneratedExamQuestion[]>) =>
  Object.values(pages)
    .flat()
    .sort((a, b) => a.order - b.order);

const parseProfile = (): FlashcardPlayerProfile => {
  if (typeof window === "undefined") {
    return createDefaultProfile();
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      return createDefaultProfile();
    }

    const parsed = JSON.parse(raw) as Partial<FlashcardPlayerProfile>;
    return {
      ...createDefaultProfile(),
      ...parsed,
      achievementIds: Array.isArray(parsed.achievementIds) ? parsed.achievementIds : [],
      cardStates:
        parsed.cardStates && typeof parsed.cardStates === "object"
          ? (parsed.cardStates as Record<string, FlashcardCardState>)
          : {},
      dailyHistory: Array.isArray(parsed.dailyHistory) ? parsed.dailyHistory : [],
      topicStats:
        parsed.topicStats && typeof parsed.topicStats === "object"
          ? parsed.topicStats
          : {},
    };
  } catch {
    return createDefaultProfile();
  }
};

export function StudentFlashcardsSession({
  request,
  initialBatch,
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
  const [deckQueue, setDeckQueue] = useState<number[]>(
    Array.from({ length: initialBatch.totalQuestions }, (_, index) => index + 1)
  );
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(request.time_limit);
  const [showHintById, setShowHintById] = useState<Record<string, boolean>>({});
  const [ratings, setRatings] = useState<Record<string, FlashcardRating>>({});
  const [answered, setAnswered] = useState<Record<string, true>>({});
  const [metrics, setMetrics] = useState<FlashcardSessionMetrics>(baseMetrics);
  const [sessionXp, setSessionXp] = useState(0);
  const [lastXpGain, setLastXpGain] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [reviewQuestions, setReviewQuestions] = useState<GeneratedExamQuestion[]>([]);
  const [profile, setProfile] = useState<FlashcardPlayerProfile>(() => parseProfile());

  const profileRef = useRef(profile);

  const currentQuestionNumber = deckQueue[currentTurn] ?? null;
  const page = currentQuestionNumber ? Math.ceil(currentQuestionNumber / batchState.pageSize) : 1;
  const indexInPage = currentQuestionNumber ? (currentQuestionNumber - 1) % batchState.pageSize : 0;
  const currentQuestion = currentQuestionNumber ? questionPages[page]?.[indexInPage] ?? null : null;

  const knownCount = metrics.easy + metrics.medium;
  const stillLearningCount = metrics.hard;
  const retryCount = metrics.again;
  const levelProgress = resolveLevelProgress(profile.xp + sessionXp);
  const deckProgress = (currentTurn / Math.max(deckQueue.length, 1)) * 100;
  const dueForReview = useMemo(
    () => Object.values(profile.cardStates).filter((item) => isCardDueSoon(item, 24)).length,
    [profile.cardStates]
  );
  const retention = useMemo(() => getRetentionScore(profile.cardStates), [profile.cardStates]);

  const persistProfile = useCallback((nextProfile: FlashcardPlayerProfile) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    }
  }, []);

  const isQuestionLoaded = useCallback(
    (questionNumber: number) => {
      const localPage = Math.ceil(questionNumber / batchState.pageSize);
      const localIndex = (questionNumber - 1) % batchState.pageSize;
      return Boolean(questionPages[localPage]?.[localIndex]);
    },
    [batchState.pageSize, questionPages]
  );

  const loadPage = useCallback(
    async (nextPage: number, waitUntilReady: boolean) => {
      if (questionPages[nextPage]?.length) {
        return questionPages[nextPage];
      }

      let attempts = waitUntilReady ? BATCH_POLL_MAX_ATTEMPTS : 1;
      while (attempts > 0) {
        const batch = await eduQuestionRequestsApi.getQuestionBatch({
          requestId: request.id,
          page: nextPage,
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
          setQuestionPages((prev) => ({ ...prev, [batch.page]: batch.data }));
          return batch.data;
        }

        attempts -= 1;
        if (!waitUntilReady || attempts <= 0) {
          return null;
        }

        await sleep(BATCH_POLL_INTERVAL_MS);
      }

      return null;
    },
    [batchState.pageSize, questionPages, request.id]
  );

  const ensureAllLoaded = useCallback(async () => {
    const missingPages: number[] = [];
    for (let nextPage = 1; nextPage <= batchState.totalPages; nextPage += 1) {
      if (!questionPages[nextPage]?.length) {
        missingPages.push(nextPage);
      }
    }

    const merged: Record<number, GeneratedExamQuestion[]> = { ...questionPages };
    if (missingPages.length > 0) {
      const loadedPages = await Promise.all(
        missingPages.map((nextPage) => loadPage(nextPage, true))
      );
      missingPages.forEach((nextPage, index) => {
        const loaded = loadedPages[index];
        if (loaded?.length) {
          merged[nextPage] = loaded;
        }
      });
    }

    return flattenPages(merged);
  }, [batchState.totalPages, loadPage, questionPages]);

  const finishSession = useCallback(async () => {
    if (summary || isFinishing) {
      return;
    }
    setIsFinishing(true);

    try {
      const allQuestions = await ensureAllLoaded();
      setReviewQuestions(allQuestions);

      const perfectBonus = metrics.reviewed > 0 && metrics.again === 0 ? 30 : 0;
      const xpEarned = metrics.xpEarned + perfectBonus;
      const currentProfile = profileRef.current;
      const levelBefore = resolveLevelProgress(currentProfile.xp).level;

      const nextBase: FlashcardPlayerProfile = {
        ...currentProfile,
        xp: currentProfile.xp + xpEarned,
        dailyStreak: calculateDailyStreak(
          currentProfile.lastStudyDate,
          getTodayKey(),
          currentProfile.dailyStreak
        ),
        lastStudyDate: getTodayKey(),
        dailyHistory: upsertDailyHistory(currentProfile.dailyHistory, {
          date: getTodayKey(),
          reviewed: metrics.reviewed,
          correct: metrics.easy + metrics.medium + metrics.hard,
          xp: xpEarned,
        }),
        masteredCards: Object.values(currentProfile.cardStates).filter(
          (item) => item.masteryScore >= 85
        ).length,
      };

      const achievement = evaluateNewAchievements(nextBase, { ...metrics, xpEarned });
      const nextProfile = {
        ...nextBase,
        achievementIds: achievement.achievementIds,
      };

      setProfile(nextProfile);
      profileRef.current = nextProfile;
      persistProfile(nextProfile);

      const totalAnswered = Object.keys(answered).length;
      const accuracy =
        totalAnswered > 0
          ? Math.round(((metrics.easy + metrics.medium + metrics.hard) / totalAnswered) * 100)
          : 0;

      setSummary({
        xpEarned,
        accuracy,
        bestStreak,
        known: knownCount,
        stillLearning: stillLearningCount,
        retry: retryCount,
        dueForReview: Object.values(nextProfile.cardStates).filter((item) =>
          isCardDueSoon(item, 24)
        ).length,
        retention: getRetentionScore(nextProfile.cardStates),
        levelBefore,
        levelAfter: resolveLevelProgress(nextProfile.xp).level,
        unlockedBadges: achievement.unlocked,
      });

      toast.success("Flashcard session complete.");
    } catch {
      toast.error("Could not finish flashcard session.");
    } finally {
      setIsFinishing(false);
    }
  }, [answered, bestStreak, ensureAllLoaded, isFinishing, knownCount, metrics, persistProfile, retryCount, stillLearningCount, summary]);

  const applyAction = useCallback(
    (action: "retry" | "know" | "learning") => {
      if (!currentQuestion || currentQuestionNumber === null || summary || isFinishing || isWaiting) {
        return;
      }

      const rating: FlashcardRating =
        action === "retry" ? "again" : action === "know" ? "easy" : "hard";
      const nextStreak = rating === "again" ? 0 : streak + 1;
      const streakBonus = resolveStreakLevel(nextStreak) * 5;
      const baseXp = getBaseXpForRating(rating);
      const gainedXp = rating === "again" ? 0 : baseXp + streakBonus;

      setStreak(nextStreak);
      setBestStreak((prev) => Math.max(prev, nextStreak));
      setSessionXp((prev) => prev + gainedXp);
      setLastXpGain(gainedXp);
      setRatings((prev) => ({ ...prev, [currentQuestion.id]: rating }));
      setAnswered((prev) => ({ ...prev, [currentQuestion.id]: true }));
      setMetrics((prev) => ({
        reviewed: prev.reviewed + 1,
        easy: prev.easy + (rating === "easy" ? 1 : 0),
        medium: prev.medium,
        hard: prev.hard + (rating === "hard" ? 1 : 0),
        again: prev.again + (rating === "again" ? 1 : 0),
        bestStreak: Math.max(prev.bestStreak, nextStreak),
        xpEarned: prev.xpEarned + gainedXp,
      }));

      setProfile((prev) => {
        const now = new Date();
        const previousCard = prev.cardStates[currentQuestion.id] ?? createDefaultCardState(now);
        const nextCard = applySm2Rating(previousCard, rating, now);
        const nextProfile = {
          ...prev,
          totalCardsReviewed: prev.totalCardsReviewed + 1,
          cardStates: { ...prev.cardStates, [currentQuestion.id]: nextCard },
        };
        profileRef.current = nextProfile;
        persistProfile(nextProfile);
        return nextProfile;
      });

      setShowHintById((prev) => ({ ...prev, [currentQuestion.id]: false }));

      let queueLength = deckQueue.length;
      if (action === "retry") {
        setDeckQueue((prev) => [...prev, currentQuestionNumber]);
        queueLength += 1;
      }

      const nextTurn = currentTurn + 1;
      setCurrentTurn(nextTurn);
      setIsFlipped(false);

      if (nextTurn >= queueLength) {
        void finishSession();
      }
    },
    [currentQuestion, currentQuestionNumber, currentTurn, deckQueue.length, finishSession, isFinishing, isWaiting, persistProfile, streak, summary]
  );

  useEffect(() => {
    if (summary || isFinishing || secondsLeft === null) {
      return;
    }

    if (secondsLeft <= 0) {
      void finishSession();
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((prev) => (prev === null ? null : Math.max(prev - 1, 0)));
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [finishSession, isFinishing, secondsLeft, summary]);

  useEffect(() => {
    if (summary || isFinishing || currentQuestionNumber === null) {
      return;
    }

    if (isQuestionLoaded(currentQuestionNumber)) {
      setIsWaiting(false);
      return;
    }

    let cancelled = false;
    setIsWaiting(true);
    const nextPage = Math.ceil(currentQuestionNumber / batchState.pageSize);
    void loadPage(nextPage, true).finally(() => {
      if (!cancelled) {
        setIsWaiting(false);
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
    const prefetch = async () => {
      if (cancelled || inFlight) {
        return;
      }

      const missingPage = Array.from(
        { length: batchState.totalPages },
        (_, index) => index + 1
      ).find((nextPage) => !questionPages[nextPage]?.length);

      if (!missingPage) {
        return;
      }

      inFlight = true;
      try {
        await loadPage(missingPage, true);
      } finally {
        inFlight = false;
      }
    };

    void prefetch();
    const interval = window.setInterval(() => void prefetch(), BATCH_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [batchState.totalPages, isFinishing, loadPage, questionPages, summary]);

  const summaryBadges = summary
    ? flashcardAchievements.filter((item) => summary.unlockedBadges.includes(item.id))
    : [];

  if (summary) {
    return (
      <div className="space-y-4">
        <Card className="border-borderColorPrimary bg-backgroundSecondary">
          <CardHeader>
            <Badge variant="secondary" className="w-fit px-2 py-0.5 text-[10px]">
              FLASHCARD SUMMARY
            </Badge>
            <CardTitle className="mt-2 text-xl">Session Complete</CardTitle>
            <CardDescription>
              {summary.levelAfter > summary.levelBefore ? "Memory Level Increased!" : "Nice work. Keep going."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">XP</p>
                <p className="text-lg font-semibold">{summary.xpEarned}</p>
              </div>
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Accuracy</p>
                <p className="text-lg font-semibold">{summary.accuracy}%</p>
              </div>
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Best Streak</p>
                <p className="text-lg font-semibold">{summary.bestStreak}</p>
              </div>
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Retention</p>
                <p className="text-lg font-semibold">{summary.retention}%</p>
              </div>
            </div>

            <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2 text-xs text-muted-foreground">
              <p>🤓 I know this: {summary.known}</p>
              <p>📚 Still learning: {summary.stillLearning}</p>
              <p>↩️ Retry: {summary.retry}</p>
              <p>Due for review: {summary.dueForReview}</p>
            </div>

            {summaryBadges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {summaryBadges.map((badge) => (
                  <Badge key={badge.id} variant="secondary" className="px-2 py-1 text-[11px]">
                    {badge.title}
                  </Badge>
                ))}
              </div>
            ) : null}

            <Button className="w-full" onClick={onExit}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Back to Setup
            </Button>
          </CardContent>
        </Card>

        <Card className="border-borderColorPrimary bg-backgroundSecondary">
          <CardHeader>
            <CardTitle className="text-lg">Read-only Review</CardTitle>
            <CardDescription>Ratings and explanations after submission.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewQuestions.map((question) => (
              <div key={question.id} className="rounded-lg border border-borderColorPrimary bg-background px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Card {question.order}</p>
                  <Badge variant="secondary" className="px-2 py-0 text-[10px] uppercase">
                    {ratings[question.id] ?? "unanswered"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-medium">{question.prompt}</p>
                {request.allows_explanation && question.explanation ? (
                  <div className="mt-2 rounded-md border border-borderColorPrimary bg-secondary/40 px-2 py-2">
                    <p className="text-xs font-medium">Explanation</p>
                    <p className="text-xs text-muted-foreground">{question.explanation}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-borderColorPrimary bg-backgroundSecondary">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl">{request.title} Flashcards</CardTitle>
              <CardDescription className="mt-1">Exam code: {request.id}</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {Math.min(currentTurn + 1, deckQueue.length)}/{deckQueue.length}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
              <p className="text-xs text-muted-foreground">📚 Still learning</p>
              <p className="text-lg font-semibold">{stillLearningCount + retryCount}</p>
            </div>
            <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
              <p className="text-xs text-muted-foreground">🤓 Know</p>
              <p className="text-lg font-semibold">{knownCount}</p>
            </div>
          </div>
          <Progress value={deckProgress} className="h-1.5" />
          <Progress value={levelProgress.percent} className="h-1.5" indicatorClassName="bg-emerald-500" />
        </CardContent>
      </Card>

      <Card className="border-borderColorPrimary bg-backgroundSecondary">
        <CardContent className="p-4">
          {isFinishing ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-borderColorPrimary bg-background">
              <div className="text-center text-sm text-muted-foreground">
                <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                Wrapping up session...
              </div>
            </div>
          ) : isWaiting || !currentQuestion ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-borderColorPrimary bg-background">
              <div className="text-center text-sm text-muted-foreground">
                <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                Loading flashcard...
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setIsFlipped((prev) => !prev)}
                className="relative w-full rounded-xl border border-borderColorPrimary bg-background p-6 text-left"
              >
                <div className="mb-4 flex items-center justify-between border-b border-borderColorPrimary pb-3">
                  <p className="text-sm font-medium">{isFlipped ? "Back" : "Front"}</p>
                  <p className="text-sm text-muted-foreground">{currentQuestion.subjectName}</p>
                </div>

                <div className="flex min-h-[230px] items-center justify-center">
                  <p className="max-w-3xl text-center text-2xl font-semibold leading-10">
                    {isFlipped
                      ? currentQuestion.explanation ?? "Think through the concept and practical use."
                      : currentQuestion.prompt}
                  </p>
                </div>

                <div className="mt-4 rounded-lg bg-secondary/50 px-3 py-2 text-center text-sm text-muted-foreground">
                  Click anywhere on the card to flip
                </div>
              </button>

              {request.hints_count && request.hints_count > 0 && currentQuestion.hint ? (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setShowHintById((prev) => ({
                        ...prev,
                        [currentQuestion.id]: !prev[currentQuestion.id],
                      }))
                    }
                  >
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Hint
                  </Button>
                </div>
              ) : null}

              {showHintById[currentQuestion.id] ? (
                <Alert className="border-borderColorPrimary bg-background">
                  <AlertTitle>Hint</AlertTitle>
                  <AlertDescription>{currentQuestion.hint}</AlertDescription>
                </Alert>
              ) : null}

              <div className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-full border border-borderColorPrimary bg-background p-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-full"
                  disabled={!isFlipped}
                  onClick={() => applyAction("retry")}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  ↩️ Again/Retry
                </Button>
                <Button
                  type="button"
                  className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={!isFlipped}
                  onClick={() => applyAction("know")}
                >
                  🤓 I know this
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 rounded-full"
                  disabled={!isFlipped}
                  onClick={() => applyAction("learning")}
                >
                  📚 Still learning
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-borderColorPrimary bg-backgroundSecondary">
        <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <span>XP: {sessionXp}</span>
            <span>Best streak: {bestStreak}</span>
            <span>Due for review: {dueForReview}</span>
            <span>Retention: {retention}%</span>
            <span>{secondsLeft === null ? "Untimed" : `Timer: ${formatTime(secondsLeft)}`}</span>
            {lastXpGain > 0 ? <span className="text-emerald-500">+{lastXpGain} XP</span> : null}
          </div>
          <Button type="button" variant="outline" onClick={() => void finishSession()}>
            Finish Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
