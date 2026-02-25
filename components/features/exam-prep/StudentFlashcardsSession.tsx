"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  eduQuestionRequestsApi,
  type EduQuestionRequest,
  type GeneratedExamQuestion,
  type QuestionBatchResponse,
} from "@/lib/api/eduQuestionRequests";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Heart,
  Lightbulb,
  Loader2,
  Volume2,
  VolumeX,
  XCircle,
  Zap,
} from "lucide-react";
import {
  applySm2Rating,
  calculateDailyStreak,
  createDefaultCardState,
  createDefaultProfile,
  estimateFlashcardDurationMinutes,
  evaluateNewAchievements,
  flashcardAchievements,
  flashcardModeMap,
  getBaseXpForRating,
  getRetentionScore,
  getTodayKey,
  isCardDueSoon,
  resolveLevelProgress,
  resolveStreakLevel,
  upsertDailyHistory,
  type FlashcardCardState,
  type FlashcardGameMode,
  type FlashcardPlayerProfile,
  type FlashcardRating,
  type FlashcardSessionMetrics,
} from "./flashcards/gamification";

const STORAGE_KEY = "exam-prep-flashcard-profile-v1";
const BATCH_POLL_INTERVAL_MS = 900;
const BATCH_POLL_MAX_ATTEMPTS = 14;

type RoundReason = "complete" | "timeout" | "mistake" | "manual";

interface StudentFlashcardsSessionProps {
  request: EduQuestionRequest;
  initialBatch: QuestionBatchResponse;
  rules: FlashcardSessionRules;
  onExit: () => void;
}

interface RoundSummary {
  reason: RoundReason;
  xpEarned: number;
  accuracy: number;
  bestStreak: number;
  mastered: number;
  dueForReview: number;
  levelBefore: number;
  levelAfter: number;
  unlockedBadges: string[];
}

export interface FlashcardSessionRules {
  mode: FlashcardGameMode;
  roundSize: number;
  lives: number;
  shuffle: boolean;
  timerMinutes: number | null;
}

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

const shuffle = (values: number[]) => {
  const cloned = [...values];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
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
    const raw = window.localStorage.getItem(STORAGE_KEY);
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
  rules,
  onExit,
}: StudentFlashcardsSessionProps) {
  const mode = flashcardModeMap[rules.mode];
  const initialTimer =
    mode.fixedTimerSeconds ??
    (rules.timerMinutes !== null
      ? rules.timerMinutes * 60
      : request.time_limit ??
        estimateFlashcardDurationMinutes(rules.mode, rules.roundSize, rules.timerMinutes) * 60);

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
    const start = Array.from(
      { length: Math.min(initialBatch.totalQuestions, rules.roundSize) },
      (_, index) => index + 1
    );
    return rules.shuffle ? shuffle(start) : start;
  });
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isPreparingMastery, setIsPreparingMastery] = useState(rules.mode === "mastery");
  const [isFinishing, setIsFinishing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(initialTimer);
  const [livesLeft, setLivesLeft] = useState(rules.mode === "survival" ? 1 : rules.lives);
  const [sessionXp, setSessionXp] = useState(0);
  const [lastXp, setLastXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [metrics, setMetrics] = useState<FlashcardSessionMetrics>(baseMetrics);
  const [ratings, setRatings] = useState<Record<string, FlashcardRating>>({});
  const [attempted, setAttempted] = useState<Record<string, true>>({});
  const [showHintById, setShowHintById] = useState<Record<string, boolean>>({});
  const [summary, setSummary] = useState<RoundSummary | null>(null);
  const [reviewQuestions, setReviewQuestions] = useState<GeneratedExamQuestion[]>([]);
  const [profile, setProfile] = useState<FlashcardPlayerProfile>(() => parseProfile());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [focusMode, setFocusMode] = useState(false);

  const audioRef = useRef<AudioContext | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const profileRef = useRef(profile);

  const currentQuestionNumber = deckQueue[currentTurn] ?? null;
  const page = currentQuestionNumber ? Math.ceil(currentQuestionNumber / batchState.pageSize) : 1;
  const indexInPage = currentQuestionNumber ? (currentQuestionNumber - 1) % batchState.pageSize : 0;
  const currentQuestion = currentQuestionNumber ? questionPages[page]?.[indexInPage] ?? null : null;
  const dueForReview = useMemo(
    () => Object.values(profile.cardStates).filter((card) => isCardDueSoon(card, 24)).length,
    [profile.cardStates]
  );
  const retention = useMemo(() => getRetentionScore(profile.cardStates), [profile.cardStates]);
  const todayKey = getTodayKey();
  const todayStudy = useMemo(
    () => profile.dailyHistory.find((entry) => entry.date === todayKey),
    [profile.dailyHistory, todayKey]
  );
  const weeklyStats = useMemo(() => {
    const today = new Date(`${todayKey}T00:00:00.000Z`).getTime();
    const history = profile.dailyHistory.filter((entry) => {
      const entryDate = new Date(`${entry.date}T00:00:00.000Z`).getTime();
      const diffDays = Math.round((today - entryDate) / (24 * 60 * 60 * 1000));
      return diffDays >= 0 && diffDays < 7;
    });
    const reviewed = history.reduce((sum, entry) => sum + entry.reviewed, 0);
    const correct = history.reduce((sum, entry) => sum + entry.correct, 0);
    const xp = history.reduce((sum, entry) => sum + entry.xp, 0);
    return {
      reviewed,
      accuracy: reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0,
      xp,
    };
  }, [profile.dailyHistory, todayKey]);
  const difficultTopics = useMemo(
    () =>
      Object.values(profile.topicStats)
        .sort((a, b) => b.failed * 2 + b.difficult - (a.failed * 2 + a.difficult))
        .slice(0, 3),
    [profile.topicStats]
  );
  const streakCalendar = useMemo(() => {
    const today = new Date(`${todayKey}T00:00:00.000Z`);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setUTCDate(today.getUTCDate() - (6 - index));
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
        date.getUTCDate()
      ).padStart(2, "0")}`;
      const reviewed = profile.dailyHistory.find((entry) => entry.date === key)?.reviewed ?? 0;
      return {
        key,
        reviewed,
        label: date.toLocaleDateString(undefined, { weekday: "short" }),
      };
    });
  }, [profile.dailyHistory, todayKey]);
  const level = useMemo(() => resolveLevelProgress(profile.xp + sessionXp), [profile.xp, sessionXp]);
  const progress = (currentTurn / Math.max(deckQueue.length, 1)) * 100;

  const persistProfile = useCallback((next: FlashcardPlayerProfile) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const isLoaded = useCallback(
    (questionNumber: number) => {
      const localPage = Math.ceil(questionNumber / batchState.pageSize);
      const localIndex = (questionNumber - 1) % batchState.pageSize;
      return Boolean(questionPages[localPage]?.[localIndex]);
    },
    [batchState.pageSize, questionPages]
  );

  const getQuestionByNumber = useCallback(
    (questionNumber: number) => {
      const localPage = Math.ceil(questionNumber / batchState.pageSize);
      const localIndex = (questionNumber - 1) % batchState.pageSize;
      return questionPages[localPage]?.[localIndex] ?? null;
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
    const missing: number[] = [];
    for (let nextPage = 1; nextPage <= batchState.totalPages; nextPage += 1) {
      if (!questionPages[nextPage]?.length) {
        missing.push(nextPage);
      }
    }
    const merged: Record<number, GeneratedExamQuestion[]> = { ...questionPages };
    if (missing.length > 0) {
      const loaded = await Promise.all(missing.map((nextPage) => loadPage(nextPage, true)));
      missing.forEach((nextPage, index) => {
        const pageData = loaded[index];
        if (pageData?.length) {
          merged[nextPage] = pageData;
        }
      });
    }
    return flattenPages(merged);
  }, [batchState.totalPages, loadPage, questionPages]);

  const playTone = useCallback(
    (kind: "flip" | "good" | "bad") => {
      if (!soundEnabled || typeof window === "undefined") {
        return;
      }
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) {
          return;
        }
        if (!audioRef.current) {
          audioRef.current = new AudioCtx();
        }
        const context = audioRef.current;
        if (!context) {
          return;
        }
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = kind === "good" ? 580 : kind === "bad" ? 220 : 410;
        gainNode.gain.value = 0.03;
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.08);
      } catch {
        // best effort
      }
    },
    [soundEnabled]
  );

  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (!hapticsEnabled || typeof navigator === "undefined" || !("vibrate" in navigator)) {
        return;
      }
      navigator.vibrate(pattern);
    },
    [hapticsEnabled]
  );

  const finishRound = useCallback(
    async (reason: RoundReason) => {
      if (summary || isFinishing) {
        return;
      }
      setIsFinishing(true);

      try {
        const questions = await ensureAllLoaded();
        setReviewQuestions(questions);

        const perfectBonus = metrics.reviewed > 0 && metrics.again === 0 ? Math.round(40 * mode.xpMultiplier) : 0;
        const xpEarned = metrics.xpEarned + perfectBonus;
        const currentProfile = profileRef.current;
        const levelBefore = resolveLevelProgress(currentProfile.xp).level;

        const nextBase: FlashcardPlayerProfile = {
          ...currentProfile,
          xp: currentProfile.xp + xpEarned,
          dailyStreak: calculateDailyStreak(currentProfile.lastStudyDate, getTodayKey(), currentProfile.dailyStreak),
          lastStudyDate: getTodayKey(),
          dailyHistory: upsertDailyHistory(currentProfile.dailyHistory, {
            date: getTodayKey(),
            reviewed: metrics.reviewed,
            correct: metrics.easy + metrics.medium + metrics.hard,
            xp: xpEarned,
          }),
          masteredCards: Object.values(currentProfile.cardStates).filter((card) => card.masteryScore >= 85).length,
        };

        const achievement = evaluateNewAchievements(nextBase, { ...metrics, xpEarned });
        const nextProfile = { ...nextBase, achievementIds: achievement.achievementIds };
        setProfile(nextProfile);
        profileRef.current = nextProfile;
        persistProfile(nextProfile);

        const answered = Object.keys(attempted).length;
        const mastered = questions.filter((question) => {
          if (!attempted[question.id]) {
            return false;
          }
          return (nextProfile.cardStates[question.id]?.masteryScore ?? 0) >= 85;
        }).length;

        setSummary({
          reason,
          xpEarned,
          accuracy: answered > 0 ? Math.round(((metrics.easy + metrics.medium + metrics.hard) / answered) * 100) : 0,
          bestStreak,
          mastered,
          dueForReview: Object.values(nextProfile.cardStates).filter((card) => isCardDueSoon(card, 24)).length,
          levelBefore,
          levelAfter: resolveLevelProgress(nextProfile.xp).level,
          unlockedBadges: achievement.unlocked,
        });

        if (reason === "timeout") {
          toast.error("Time is up. Session ended.");
        } else if (reason === "mistake") {
          toast.error("Session ended after a mistake.");
        } else {
          toast.success("Session complete.");
        }
      } catch {
        toast.error("Could not finish session.");
      } finally {
        setIsFinishing(false);
      }
    },
    [attempted, bestStreak, ensureAllLoaded, isFinishing, metrics, mode.xpMultiplier, persistProfile, summary]
  );

  const applyRating = useCallback(
    (rating: FlashcardRating, input: "button" | "swipe") => {
      if (!currentQuestion || currentQuestionNumber === null || isFinishing || summary || isPreparingMastery) {
        return;
      }

      const nextStreak = rating === "again" ? 0 : streak + 1;
      const streakBonus = resolveStreakLevel(nextStreak) * 5;
      const baseXp = getBaseXpForRating(rating);
      const gainedXp = rating === "again" ? 0 : Math.round((baseXp + streakBonus) * mode.xpMultiplier);

      setStreak(nextStreak);
      setBestStreak((prev) => Math.max(prev, nextStreak));
      setSessionXp((prev) => prev + gainedXp);
      setLastXp(gainedXp);
      setRatings((prev) => ({ ...prev, [currentQuestion.id]: rating }));
      setAttempted((prev) => ({ ...prev, [currentQuestion.id]: true }));
      setMetrics((prev) => ({
        reviewed: prev.reviewed + 1,
        easy: prev.easy + (rating === "easy" ? 1 : 0),
        medium: prev.medium + (rating === "medium" ? 1 : 0),
        hard: prev.hard + (rating === "hard" ? 1 : 0),
        again: prev.again + (rating === "again" ? 1 : 0),
        bestStreak: Math.max(prev.bestStreak, nextStreak),
        xpEarned: prev.xpEarned + gainedXp,
      }));
      setShowHintById((prev) => ({ ...prev, [currentQuestion.id]: false }));

      setProfile((prev) => {
        const now = new Date();
        const existing = prev.cardStates[currentQuestion.id] ?? createDefaultCardState(now);
        const nextState = applySm2Rating(existing, rating, now);
        const nextProfile = {
          ...prev,
          totalCardsReviewed: prev.totalCardsReviewed + 1,
          cardStates: { ...prev.cardStates, [currentQuestion.id]: nextState },
          topicStats: {
            ...prev.topicStats,
            [currentQuestion.subjectId]: {
              topicId: currentQuestion.subjectId,
              topicName: currentQuestion.subjectName,
              reviewed: (prev.topicStats[currentQuestion.subjectId]?.reviewed ?? 0) + 1,
              difficult: (prev.topicStats[currentQuestion.subjectId]?.difficult ?? 0) + (rating === "hard" ? 1 : 0),
              failed: (prev.topicStats[currentQuestion.subjectId]?.failed ?? 0) + (rating === "again" ? 1 : 0),
            },
          },
        };
        profileRef.current = nextProfile;
        persistProfile(nextProfile);
        return nextProfile;
      });

      if (rating === "again") {
        playTone("bad");
        vibrate(input === "swipe" ? [20, 40, 20] : 26);
      } else {
        playTone("good");
        vibrate(10);
      }

      let queueSize = deckQueue.length;
      let nextLives = livesLeft;
      if (rating === "again") {
        if (rules.mode === "rapid") {
          // rapid mode keeps moving
        } else if (mode.autoFailOnMistake) {
          setLivesLeft(0);
          void finishRound("mistake");
          return;
        } else {
          nextLives = Math.max(0, livesLeft - 1);
          setLivesLeft(nextLives);
          if (nextLives > 0) {
            setDeckQueue((prev) => [...prev, currentQuestionNumber]);
            queueSize += 1;
          }
        }
      } else if (rules.mode === "mastery" && rating === "hard") {
        setDeckQueue((prev) => [...prev, currentQuestionNumber]);
        queueSize += 1;
      }

      const nextTurn = currentTurn + 1;
      setCurrentTurn(nextTurn);
      setIsFlipped(false);

      if (nextLives <= 0) {
        void finishRound("mistake");
        return;
      }
      if (nextTurn >= queueSize) {
        void finishRound("complete");
      }
    },
    [currentQuestion, currentQuestionNumber, currentTurn, deckQueue.length, finishRound, isFinishing, isPreparingMastery, livesLeft, mode.autoFailOnMistake, mode.xpMultiplier, persistProfile, playTone, rules.mode, streak, summary, vibrate]
  );

  useEffect(() => {
    profileRef.current = profile;
    persistProfile(profile);
  }, [persistProfile, profile]);

  useEffect(() => {
    if (summary || isFinishing || secondsLeft === null) {
      return;
    }
    if (secondsLeft <= 0) {
      void finishRound("timeout");
      return;
    }
    const timer = window.setTimeout(() => {
      setSecondsLeft((prev) => (prev === null ? null : Math.max(prev - 1, 0)));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [finishRound, isFinishing, secondsLeft, summary]);

  useEffect(() => {
    if (summary || isFinishing || currentQuestionNumber === null || isPreparingMastery) {
      return;
    }
    if (isLoaded(currentQuestionNumber)) {
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
  }, [batchState.pageSize, currentQuestionNumber, isFinishing, isLoaded, isPreparingMastery, loadPage, summary]);

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
      const missing = Array.from({ length: batchState.totalPages }, (_, index) => index + 1).find(
        (nextPage) => !questionPages[nextPage]?.length
      );
      if (!missing) {
        return;
      }
      inFlight = true;
      try {
        await loadPage(missing, true);
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

  useEffect(() => {
    if (rules.mode !== "mastery") {
      return;
    }
    let cancelled = false;
    setIsPreparingMastery(true);
    void ensureAllLoaded()
      .then((questions) => {
        if (cancelled) {
          return;
        }
        const weak = questions.filter((question) => {
          const state = profileRef.current.cardStates[question.id];
          if (!state) {
            return false;
          }
          return state.masteryScore < 80 || state.lapses > 0 || isCardDueSoon(state, 24);
        });
        const source = weak.length > 0 ? weak : questions;
        const selected = source.slice(0, Math.min(source.length, rules.roundSize)).map((item) => item.order);
        setDeckQueue(rules.shuffle ? shuffle(selected) : selected);
        setCurrentTurn(0);
      })
      .catch(() => toast.error("Could not prepare mastery deck."))
      .finally(() => {
        if (!cancelled) {
          setIsPreparingMastery(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ensureAllLoaded, rules.mode, rules.roundSize, rules.shuffle]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start || !currentQuestion || isFinishing || summary) {
      return;
    }
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const threshold = 44;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) {
      if (!isFlipped) {
        setIsFlipped(true);
        playTone("flip");
      }
      return;
    }
    if (!isFlipped) {
      setIsFlipped(true);
      playTone("flip");
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      applyRating(dx > 0 ? "medium" : "again", "swipe");
      return;
    }
    applyRating(dy < 0 ? "hard" : "easy", "swipe");
  };

  const summaryBadges = summary
    ? flashcardAchievements.filter((badge) => summary.unlockedBadges.includes(badge.id))
    : [];
  const questionNumbers = Array.from({ length: batchState.totalQuestions }, (_, index) => index + 1);
  const streakWarning = useMemo(() => {
    if (!profile.lastStudyDate || profile.dailyStreak <= 0) {
      return null;
    }
    const today = getTodayKey();
    const previousMs = new Date(`${profile.lastStudyDate}T00:00:00.000Z`).getTime();
    const todayMs = new Date(`${today}T00:00:00.000Z`).getTime();
    const diffDays = Math.round((todayMs - previousMs) / (24 * 60 * 60 * 1000));
    if (diffDays === 1) {
      return `Study today to protect your ${profile.dailyStreak}-day streak.`;
    }
    return null;
  }, [profile.dailyStreak, profile.lastStudyDate]);

  if (summary) {
    return (
      <div className="space-y-4">
        <Card className="border-borderColorPrimary bg-backgroundSecondary">
          <CardHeader>
            <Badge variant="secondary" className="w-fit px-2 py-0.5 text-[10px]">
              SESSION COMPLETE
            </Badge>
            <CardTitle className="mt-2 text-xl">Flashcard Session Summary</CardTitle>
            <CardDescription>
              {summary.levelAfter > summary.levelBefore ? "Memory Level Increased!" : "Review complete."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">XP Earned</p>
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
                <p className="text-xs text-muted-foreground">Mastered</p>
                <p className="text-lg font-semibold">{summary.mastered}</p>
              </div>
            </div>
            <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2 text-xs text-muted-foreground">
              <p>Cards due for review: {summary.dueForReview}</p>
              <p>
                Level: {summary.levelBefore} to {summary.levelAfter}
              </p>
              <p>
                {summary.levelAfter > summary.levelBefore
                  ? "You are in the top 20% this week."
                  : "Keep your daily streak active for faster retention."}
              </p>
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
            <CardDescription>Final ratings and optional explanations.</CardDescription>
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
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">{mode.label.toUpperCase()}</Badge>
              {streak >= 5 ? (
                <Badge className="animate-pulse px-2 py-0.5 text-[10px]">
                  <Zap className="mr-1 h-3 w-3" />
                  HOT STREAK
                </Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                <span className="inline-flex items-center gap-1">
                  {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                  Sound
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={hapticsEnabled} onCheckedChange={setHapticsEnabled} />
                <span>Vibration</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={focusMode} onCheckedChange={setFocusMode} />
                <span>Focus</span>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
            <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
              <p className="text-[11px] text-muted-foreground">XP</p>
              <p className="text-sm font-semibold">{sessionXp}</p>
              <p className="text-[11px] text-emerald-500">{lastXp > 0 ? `+${lastXp}` : "-"}</p>
            </div>
            <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Level</p>
              <p className="text-sm font-semibold">{level.level}</p>
              <p className="text-[11px] text-muted-foreground">{level.xpInLevel}/{level.xpToNext}</p>
            </div>
            <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Streak</p>
              <p className="text-sm font-semibold">{streak}</p>
            </div>
            <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Lives</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: rules.mode === "survival" ? 1 : Math.max(1, rules.lives) }, (_, index) => (
                  <Heart key={index} className={cn("h-4 w-4", index < livesLeft ? "fill-rose-500 text-rose-500" : "text-muted-foreground")} />
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Cards Left</p>
              <p className="text-sm font-semibold">{Math.max(deckQueue.length - currentTurn, 0)}</p>
            </div>
            <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
              <p className="text-[11px] text-muted-foreground">Timer</p>
              <p className="text-sm font-semibold">{secondsLeft === null ? "Untimed" : formatTime(secondsLeft)}</p>
            </div>
          </div>
          <Progress value={level.percent} className="mt-3 h-1.5" />
          <Progress value={progress} className="mt-1 h-1.5" indicatorClassName="bg-emerald-500" />
        </CardContent>
      </Card>

      {streakWarning ? (
        <Alert className="border-borderColorPrimary bg-backgroundSecondary">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Streak Reminder</AlertTitle>
          <AlertDescription>{streakWarning}</AlertDescription>
        </Alert>
      ) : null}

      <div className={cn("grid gap-4", focusMode ? "lg:grid-cols-1" : "lg:grid-cols-[1.7fr_1fr]")}>
        <Card className="border-borderColorPrimary bg-backgroundSecondary">
          <CardHeader>
            <CardTitle className="text-lg">Flash Card</CardTitle>
            <CardDescription>Swipe Right/Left/Up/Down for Medium/Again/Hard/Easy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isFinishing ? (
              <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-borderColorPrimary bg-background">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : isPreparingMastery ? (
              <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-borderColorPrimary bg-background text-sm text-muted-foreground">
                Preparing mastery deck...
              </div>
            ) : isWaiting || !currentQuestion ? (
              <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-borderColorPrimary bg-background text-sm text-muted-foreground">
                Loading card...
              </div>
            ) : (
              <>
                <div className="relative min-h-[260px] [perspective:1200px]" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
                  <div className={cn("absolute inset-0 rounded-xl border border-borderColorPrimary transition-transform duration-500 [transform-style:preserve-3d]", isFlipped && "[transform:rotateY(180deg)]")}>
                    <div className="absolute inset-0 rounded-xl bg-white p-6 dark:bg-zinc-950 [backface-visibility:hidden]">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Front of Card</p>
                      <p className="mt-4 text-lg font-semibold leading-8">{currentQuestion.prompt}</p>
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-background p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Back of Card</p>
                      <p className="mt-4 text-base font-semibold leading-7">
                        {currentQuestion.explanation ?? "Define the concept and apply one use case."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => { setIsFlipped((prev) => !prev); playTone("flip"); }}>
                    {isFlipped ? "Show Prompt" : "Reveal Answer"}
                  </Button>
                  {request.hints_count && request.hints_count > 0 && currentQuestion.hint ? (
                    <Button type="button" variant="outline" onClick={() => setShowHintById((prev) => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))}>
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Hint
                    </Button>
                  ) : null}
                  <Button type="button" variant="outline" className="ml-auto" onClick={() => void finishRound("manual")}>
                    End Session
                  </Button>
                </div>

                {showHintById[currentQuestion.id] ? (
                  <Alert className="border-borderColorPrimary bg-background">
                    <AlertTitle>Hint</AlertTitle>
                    <AlertDescription>{currentQuestion.hint}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <Button type="button" disabled={!isFlipped} onClick={() => applyRating("easy", "button")}>Easy</Button>
                  <Button type="button" variant="outline" disabled={!isFlipped} onClick={() => applyRating("medium", "button")}>Medium</Button>
                  <Button type="button" variant="outline" disabled={!isFlipped} onClick={() => applyRating("hard", "button")}>Hard</Button>
                  <Button type="button" variant="outline" disabled={!isFlipped} onClick={() => applyRating("again", "button")}>Again</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {!focusMode ? (
          <Card className="border-borderColorPrimary bg-backgroundSecondary">
            <CardHeader>
              <CardTitle className="text-lg">Dashboard</CardTitle>
              <CardDescription>Due review, retention, and achievements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">Reviewed Today</p>
                  <p className="text-sm font-semibold">{todayStudy?.reviewed ?? 0}</p>
                </div>
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">7-Day Accuracy</p>
                  <p className="text-sm font-semibold">{weeklyStats.accuracy}%</p>
                </div>
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">7-Day XP Growth</p>
                  <p className="text-sm font-semibold">{weeklyStats.xp}</p>
                </div>
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">Daily Streak</p>
                  <p className="text-sm font-semibold">{profile.dailyStreak} days</p>
                </div>
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">Due for Review</p>
                  <p className="text-sm font-semibold">{dueForReview}</p>
                </div>
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">Retention</p>
                  <p className="text-sm font-semibold">{retention}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Streak Calendar</p>
                <div className="grid grid-cols-7 gap-1">
                  {streakCalendar.map((day) => (
                    <div
                      key={day.key}
                      className={cn(
                        "rounded-md border px-1 py-2 text-center text-[10px]",
                        day.reviewed > 0
                          ? "border-primary/60 bg-secondary"
                          : "border-borderColorPrimary bg-background"
                      )}
                    >
                      <p>{day.label}</p>
                      <p className="mt-1 font-semibold">{day.reviewed}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {questionNumbers.map((number) => {
                  const loaded = isLoaded(number);
                  const question = getQuestionByNumber(number);
                  const rating = question ? ratings[question.id] : undefined;
                  const active = number === currentQuestionNumber;
                  return (
                    <div
                      key={number}
                      className={cn(
                        "h-8 rounded-md border text-center text-xs leading-8",
                        active && "border-primary bg-secondary",
                        rating === "again" && "border-destructive/50",
                        rating === "hard" && "border-amber-500/50",
                        rating === "medium" && "border-emerald-500/50",
                        rating === "easy" && "border-sky-500/50",
                        !loaded && "border-dashed text-muted-foreground"
                      )}
                    >
                      {loaded ? number : "..."}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Most Difficult Topics</p>
                {difficultTopics.length > 0 ? (
                  difficultTopics.map((topic) => (
                    <div key={topic.topicId} className="rounded-md border border-borderColorPrimary bg-background px-2 py-2 text-xs">
                      <p className="font-medium">{topic.topicName}</p>
                      <p className="text-muted-foreground">
                        Failed: {topic.failed} | Hard: {topic.difficult}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No difficulty trends yet.</p>
                )}
              </div>

              <div className="space-y-2">
                {flashcardAchievements.map((badge) => {
                  const earned = profile.achievementIds.includes(badge.id);
                  return (
                    <div key={badge.id} className={cn("rounded-md border px-2 py-2 text-xs", earned ? "border-primary/50 bg-secondary" : "border-borderColorPrimary bg-background")}>
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{badge.title}</p>
                        {earned ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                      </div>
                      <p className="text-muted-foreground">{badge.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card className="border-borderColorPrimary bg-backgroundSecondary">
        <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {secondsLeft === null ? "Untimed" : "Auto-submit at 00:00"}
            </span>
            {mode.autoFailOnMistake ? (
              <span className="inline-flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                One mistake ends session.
              </span>
            ) : null}
          </div>
          <Button type="button" variant="outline" onClick={onExit}>
            Exit Flashcards
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
