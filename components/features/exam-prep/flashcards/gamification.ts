export type FlashcardGameMode = "normal" | "rapid" | "survival" | "mastery";

export type FlashcardRating = "easy" | "medium" | "hard" | "again";

export interface FlashcardModeDefinition {
  id: FlashcardGameMode;
  label: string;
  shortLabel: string;
  description: string;
  xpMultiplier: number;
  fixedTimerSeconds: number | null;
  autoFailOnMistake: boolean;
}

export const flashcardModes: FlashcardModeDefinition[] = [
  {
    id: "normal",
    label: "Normal Mode",
    shortLabel: "Normal",
    description: "Balanced pace with spaced repetition and steady XP growth.",
    xpMultiplier: 1,
    fixedTimerSeconds: null,
    autoFailOnMistake: false,
  },
  {
    id: "rapid",
    label: "Rapid Mode",
    shortLabel: "Rapid",
    description: "60-second speed run with XP multiplier.",
    xpMultiplier: 1.4,
    fixedTimerSeconds: 60,
    autoFailOnMistake: false,
  },
  {
    id: "survival",
    label: "Survival Mode",
    shortLabel: "Survival",
    description: "High tension: one mistake ends the run.",
    xpMultiplier: 1.8,
    fixedTimerSeconds: null,
    autoFailOnMistake: true,
  },
  {
    id: "mastery",
    label: "Mastery Mode",
    shortLabel: "Mastery",
    description: "Focuses difficult or failed cards until they improve.",
    xpMultiplier: 1.25,
    fixedTimerSeconds: null,
    autoFailOnMistake: false,
  },
];

export const flashcardModeMap: Record<FlashcardGameMode, FlashcardModeDefinition> = {
  normal: flashcardModes[0],
  rapid: flashcardModes[1],
  survival: flashcardModes[2],
  mastery: flashcardModes[3],
};

export interface FlashcardCardState {
  easeFactor: number;
  intervalDays: number;
  repetition: number;
  masteryScore: number;
  lapses: number;
  dueAt: string;
  lastReviewedAt: string;
}

export interface FlashcardDailyHistory {
  date: string;
  reviewed: number;
  correct: number;
  xp: number;
}

export interface FlashcardTopicStat {
  topicId: string;
  topicName: string;
  reviewed: number;
  difficult: number;
  failed: number;
}

export interface FlashcardPlayerProfile {
  xp: number;
  totalCardsReviewed: number;
  masteredCards: number;
  dailyStreak: number;
  lastStudyDate: string | null;
  achievementIds: string[];
  cardStates: Record<string, FlashcardCardState>;
  dailyHistory: FlashcardDailyHistory[];
  topicStats: Record<string, FlashcardTopicStat>;
}

export interface FlashcardSessionMetrics {
  reviewed: number;
  easy: number;
  medium: number;
  hard: number;
  again: number;
  bestStreak: number;
  xpEarned: number;
}

export interface FlashcardAchievement {
  id: string;
  title: string;
  description: string;
}

export const flashcardAchievements: FlashcardAchievement[] = [
  {
    id: "first_100_cards",
    title: "First 100 Cards Reviewed",
    description: "Reviewed at least 100 cards in total.",
  },
  {
    id: "streak_7_days",
    title: "7-Day Streak",
    description: "Studied 7 consecutive days.",
  },
  {
    id: "streak_30_days",
    title: "30-Day Streak",
    description: "Studied 30 consecutive days.",
  },
  {
    id: "xp_500",
    title: "500 XP Earned",
    description: "Reached 500 total XP.",
  },
  {
    id: "mastered_50_cards",
    title: "Mastered 50 Cards",
    description: "Reached mastery on at least 50 cards.",
  },
  {
    id: "no_mistake_session",
    title: "No Mistake Session",
    description: "Completed a session with zero 'Again' ratings.",
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeDate = (value: Date) =>
  `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(
    value.getUTCDate()
  ).padStart(2, "0")}`;

export const getTodayKey = () => normalizeDate(new Date());

const plusDays = (source: Date, days: number) => {
  const next = new Date(source);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const plusMinutes = (source: Date, minutes: number) => new Date(source.getTime() + minutes * 60 * 1000);

const getLevelXpRequirement = (level: number) => 120 + (level - 1) * 45;

export const resolveLevelProgress = (totalXp: number) => {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));
  let required = getLevelXpRequirement(level);

  while (remaining >= required) {
    remaining -= required;
    level += 1;
    required = getLevelXpRequirement(level);
  }

  const percent = required === 0 ? 0 : Math.round((remaining / required) * 100);
  return {
    level,
    xpInLevel: remaining,
    xpToNext: required,
    percent,
  };
};

const getQualityFromRating = (rating: FlashcardRating) => {
  if (rating === "easy") {
    return 5;
  }
  if (rating === "medium") {
    return 4;
  }
  if (rating === "hard") {
    return 3;
  }
  return 1;
};

export const createDefaultCardState = (now: Date = new Date()): FlashcardCardState => ({
  easeFactor: 2.5,
  intervalDays: 0,
  repetition: 0,
  masteryScore: 0,
  lapses: 0,
  dueAt: now.toISOString(),
  lastReviewedAt: now.toISOString(),
});

export const applySm2Rating = (
  previous: FlashcardCardState,
  rating: FlashcardRating,
  now: Date = new Date()
): FlashcardCardState => {
  if (rating === "again") {
    const nextDueAt = plusMinutes(now, 10).toISOString();
    return {
      ...previous,
      repetition: 0,
      intervalDays: 0,
      masteryScore: clamp(previous.masteryScore - 14, 0, 100),
      lapses: previous.lapses + 1,
      dueAt: nextDueAt,
      lastReviewedAt: now.toISOString(),
    };
  }

  const quality = getQualityFromRating(rating);
  const qualityDiff = 5 - quality;
  const nextEaseFactor = clamp(
    previous.easeFactor + (0.1 - qualityDiff * (0.08 + qualityDiff * 0.02)),
    1.3,
    2.8
  );

  let repetition = previous.repetition + 1;
  let intervalDays = 1;

  if (repetition === 1) {
    intervalDays = quality >= 4 ? 2 : 1;
  } else if (repetition === 2) {
    intervalDays = quality >= 4 ? 6 : 3;
  } else {
    const base = Math.round(previous.intervalDays * nextEaseFactor);
    if (rating === "hard") {
      intervalDays = Math.max(1, Math.round(base * 0.6));
    } else if (rating === "medium") {
      intervalDays = Math.max(2, base);
    } else {
      intervalDays = Math.max(4, Math.round(base * 1.2));
    }
  }

  const masteryDelta = rating === "easy" ? 12 : rating === "medium" ? 8 : 4;
  return {
    easeFactor: nextEaseFactor,
    intervalDays,
    repetition,
    masteryScore: clamp(previous.masteryScore + masteryDelta, 0, 100),
    lapses: previous.lapses,
    dueAt: plusDays(now, intervalDays).toISOString(),
    lastReviewedAt: now.toISOString(),
  };
};

export const isCardDueSoon = (cardState: FlashcardCardState, withinHours: number) => {
  const dueMs = new Date(cardState.dueAt).getTime();
  const nowMs = Date.now();
  const thresholdMs = withinHours * 60 * 60 * 1000;
  return dueMs <= nowMs + thresholdMs;
};

export const getBaseXpForRating = (rating: FlashcardRating) => {
  if (rating === "easy") {
    return 15;
  }
  if (rating === "medium") {
    return 10;
  }
  if (rating === "hard") {
    return 5;
  }
  return 0;
};

export const resolveStreakLevel = (streakCount: number) => Math.max(0, Math.floor(streakCount / 3));

export const estimateFlashcardXpPreview = (mode: FlashcardGameMode, roundSize: number) => {
  const multiplier = flashcardModeMap[mode].xpMultiplier;
  const baseline = roundSize * 10;
  const streakBonusEstimate = Math.floor(roundSize / 4) * 5;
  return Math.round((baseline + streakBonusEstimate) * multiplier);
};

export const estimateFlashcardDurationMinutes = (
  mode: FlashcardGameMode,
  roundSize: number,
  customTimerMinutes: number | null
) => {
  if (mode === "rapid") {
    return 1;
  }
  if (customTimerMinutes !== null) {
    return customTimerMinutes;
  }
  const averagePerCardSeconds = mode === "survival" ? 16 : mode === "mastery" ? 36 : 28;
  return Math.max(1, Math.ceil((roundSize * averagePerCardSeconds) / 60));
};

export const createDefaultProfile = (): FlashcardPlayerProfile => ({
  xp: 0,
  totalCardsReviewed: 0,
  masteredCards: 0,
  dailyStreak: 0,
  lastStudyDate: null,
  achievementIds: [],
  cardStates: {},
  dailyHistory: [],
  topicStats: {},
});

export const upsertDailyHistory = (
  history: FlashcardDailyHistory[],
  entry: FlashcardDailyHistory
): FlashcardDailyHistory[] => {
  const index = history.findIndex((item) => item.date === entry.date);
  if (index === -1) {
    return [...history, entry].slice(-45);
  }

  const cloned = [...history];
  const existing = cloned[index];
  cloned[index] = {
    date: entry.date,
    reviewed: existing.reviewed + entry.reviewed,
    correct: existing.correct + entry.correct,
    xp: existing.xp + entry.xp,
  };
  return cloned.slice(-45);
};

export const calculateDailyStreak = (previousDate: string | null, today: string, current: number) => {
  if (!previousDate) {
    return 1;
  }

  const previousMs = new Date(`${previousDate}T00:00:00.000Z`).getTime();
  const todayMs = new Date(`${today}T00:00:00.000Z`).getTime();
  const diffDays = Math.round((todayMs - previousMs) / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) {
    return current;
  }
  if (diffDays === 1) {
    return current + 1;
  }
  return 1;
};

export const getRetentionScore = (cardStates: Record<string, FlashcardCardState>) => {
  const values = Object.values(cardStates);
  if (values.length === 0) {
    return 0;
  }
  const total = values.reduce((sum, card) => sum + card.masteryScore, 0);
  return Math.round(total / values.length);
};

export const evaluateNewAchievements = (
  profile: FlashcardPlayerProfile,
  session: FlashcardSessionMetrics
) => {
  const earned = new Set(profile.achievementIds);
  const unlocked: string[] = [];

  const maybeUnlock = (id: string, condition: boolean) => {
    if (!condition || earned.has(id)) {
      return;
    }
    earned.add(id);
    unlocked.push(id);
  };

  maybeUnlock("first_100_cards", profile.totalCardsReviewed >= 100);
  maybeUnlock("streak_7_days", profile.dailyStreak >= 7);
  maybeUnlock("streak_30_days", profile.dailyStreak >= 30);
  maybeUnlock("xp_500", profile.xp >= 500);
  maybeUnlock("mastered_50_cards", profile.masteredCards >= 50);
  maybeUnlock("no_mistake_session", session.reviewed > 0 && session.again === 0);

  return {
    achievementIds: Array.from(earned),
    unlocked,
  };
};

export const formatCalendarDay = (date: string) => {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return parsed.toLocaleDateString(undefined, { weekday: "short" });
};

