"use client";

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Trophy,
  BrainCircuit,
  FileQuestion,
  Sparkles,
  Info,
  Loader2,
  Clock3,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useOrgSessionStore } from "@/stores";
import {
  eduQuestionRequestsApi,
  type CreateMockQuestionSessionResponse,
  type QuestionRequestType,
} from "@/lib/api/eduQuestionRequests";
import type { StudentDifficulty, StudentExamMode, SubjectOption } from "./types";
import { StudentExamSession } from "./StudentExamSession";
import { StudentFlashcardsSession, type FlashcardSessionRules } from "./StudentFlashcardsSession";

const studentModeValues = ["flashcards", "theory", "mcq"] as const;
const difficultyValues = ["adaptive", "easy", "medium", "hard"] as const;
const focusValues = ["mixed", "weak", "recent"] as const;
const questionCountValues = ["5", "10", "15", "20", "25", "30", "40", "50", "60"] as const;
const durationValues = ["10", "15", "20", "30", "45", "60", "90", "120"] as const;
const flashcardRoundValues = ["10", "15", "20", "30"] as const;
const flashcardLivesValues = ["2", "3", "5"] as const;
const flashcardTimerValues = ["none", "5", "10", "15", "20"] as const;

const studentPrepSchema = z.object({
  examMode: z.string(),
  difficulty: z.string(),
  focus: z.string(),
  questionCount: z.string(),
  durationMinutes: z.string(),
  subjects: z.array(z.string()).min(1, "Select at least one subject"),
  timedMode: z.boolean(),
  hintsEnabled: z.boolean(),
  explanationsEnabled: z.boolean(),
  flashcardRoundSize: z.string(),
  flashcardLives: z.string(),
  flashcardTimer: z.string(),
  flashcardShuffle: z.boolean(),
}).superRefine((data, ctx) => {
  const mode = data.examMode as StudentExamMode;
  if (!studentModeValues.includes(mode)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["examMode"],
      message: "Select an exam type",
    });
    return;
  }

  if (mode === "flashcards") {
    if (!flashcardRoundValues.includes(data.flashcardRoundSize as (typeof flashcardRoundValues)[number])) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["flashcardRoundSize"],
        message: "Select round size",
      });
    }
    if (!flashcardLivesValues.includes(data.flashcardLives as (typeof flashcardLivesValues)[number])) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["flashcardLives"],
        message: "Select lives",
      });
    }
    if (!flashcardTimerValues.includes(data.flashcardTimer as (typeof flashcardTimerValues)[number])) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["flashcardTimer"],
        message: "Select round timer",
      });
    }
    return;
  }

  if (!difficultyValues.includes(data.difficulty as StudentDifficulty)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["difficulty"],
      message: "Select difficulty",
    });
  }

  if (!focusValues.includes(data.focus as (typeof focusValues)[number])) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["focus"],
      message: "Select focus area",
    });
  }

  if (!questionCountValues.includes(data.questionCount as (typeof questionCountValues)[number])) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["questionCount"],
      message: "Select number of questions",
    });
  }

  const durationIsValid =
    data.durationMinutes === "none" ||
    durationValues.includes(data.durationMinutes as (typeof durationValues)[number]);

  if (!durationIsValid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["durationMinutes"],
      message: "Select duration",
    });
  }

  if (data.timedMode && data.durationMinutes === "none") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["durationMinutes"],
      message: "Select a duration or disable timed mode",
    });
  }
});

type StudentPrepFormValues = z.infer<typeof studentPrepSchema>;

interface StudentExamPrepProps {
  subjects: SubjectOption[];
}

interface PreparedSession {
  mode: StudentExamMode;
  session: CreateMockQuestionSessionResponse;
  flashcardRules?: FlashcardSessionRules;
}

const modeDetails: Array<{ id: StudentExamMode; label: string; icon: ComponentType<{ className?: string }>; note: string }> = [
  {
    id: "flashcards",
    label: "Flash Cards",
    icon: Trophy,
    note: "Round-based memory challenge with score, streak and lives.",
  },
  {
    id: "theory",
    label: "Theory",
    icon: BrainCircuit,
    note: "Written-response questions for explanation and structured thinking.",
  },
  {
    id: "mcq",
    label: "MCQ/Objectives",
    icon: FileQuestion,
    note: "Objective multiple-choice questions for speed and accuracy practice.",
  },
];

const modeToRequestType: Record<StudentExamMode, QuestionRequestType> = {
  flashcards: "flashcards",
  theory: "theory",
  mcq: "mcqs",
};

const difficultyLabels: Record<StudentDifficulty, string> = {
  adaptive: "Adaptive",
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const focusLabels: Record<(typeof focusValues)[number], string> = {
  mixed: "Mixed Topics",
  weak: "Weak Topics First",
  recent: "Recent Topics",
};

const formatSessionDuration = (seconds: number | null) => {
  if (seconds === null) {
    return "Untimed";
  }
  const totalMinutes = Math.max(1, Math.floor(seconds / 60));
  return `${totalMinutes} minutes`;
};

const formatFlashcardTimer = (value: string) => {
  if (!value || value === "none") {
    return "Untimed";
  }
  return `${value} minutes`;
};

export function StudentExamPrep({ subjects }: StudentExamPrepProps) {
  const { orgId } = useOrgSessionStore();
  const activeOrgId = orgId ?? "1";
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingSession, setPendingSession] = useState<PreparedSession | null>(null);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<PreparedSession | null>(null);

  const form = useForm<StudentPrepFormValues>({
    resolver: zodResolver(studentPrepSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      examMode: "",
      difficulty: "",
      focus: "",
      questionCount: "",
      durationMinutes: "none",
      subjects: [],
      timedMode: false,
      hintsEnabled: false,
      explanationsEnabled: false,
      flashcardRoundSize: "",
      flashcardLives: "",
      flashcardTimer: "none",
      flashcardShuffle: true,
    },
  });

  const values = form.watch();
  const isFlashcardsMode = values.examMode === "flashcards";

  const selectedSubjects = useMemo(
    () => subjects.filter((subject) => values.subjects.includes(subject.id)),
    [subjects, values.subjects]
  );

  const completedRequiredFields = isFlashcardsMode
    ? [
        values.examMode,
        values.subjects.length > 0 ? "subjects" : "",
        values.flashcardRoundSize,
        values.flashcardLives,
        values.flashcardTimer,
      ].filter(Boolean).length
    : [
        values.examMode,
        values.difficulty,
        values.focus,
        values.questionCount,
        values.subjects.length > 0 ? "subjects" : "",
      ].filter(Boolean).length + (values.timedMode ? (values.durationMinutes !== "none" ? 1 : 0) : 0);

  const requiredFieldCount = isFlashcardsMode ? 5 : (values.timedMode ? 6 : 5);

  const onSubmit = async (payload: StudentPrepFormValues) => {
    const selectedSubjectMeta = subjects
      .filter((subject) => payload.subjects.includes(subject.id))
      .map((subject) => ({ id: subject.id, name: subject.name }));

    if (selectedSubjectMeta.length === 0) {
      toast.error("Select at least one subject.");
      return;
    }

    const mode = payload.examMode as StudentExamMode;
    const modeLabel = modeDetails.find((item) => item.id === mode)?.label ?? "Practice";

    try {
      setIsGenerating(true);
      if (mode === "flashcards") {
        const flashcardRules: FlashcardSessionRules = {
          roundSize: Number(payload.flashcardRoundSize),
          lives: Number(payload.flashcardLives),
          shuffle: payload.flashcardShuffle,
          timerMinutes: payload.flashcardTimer === "none" ? null : Number(payload.flashcardTimer),
        };

        const session = await eduQuestionRequestsApi.createMockQuestionSession({
          organisationId: activeOrgId,
          title: `${modeLabel} Round`,
          type: modeToRequestType[mode],
          difficulty: "adaptive",
          number: flashcardRules.roundSize,
          timeLimitSeconds:
            flashcardRules.timerMinutes === null ? null : flashcardRules.timerMinutes * 60,
          allowsExplanation: payload.explanationsEnabled,
          hintsCount: payload.hintsEnabled ? 3 : 0,
          focus: "mixed",
          subjects: selectedSubjectMeta,
          additionalNote: `Flashcards round with ${flashcardRules.lives} lives and ${flashcardRules.shuffle ? "shuffle on" : "shuffle off"}.`,
          batchSize: 5,
        });

        setPendingSession({
          mode,
          session,
          flashcardRules,
        });
      } else {
        const questionCount = Number(payload.questionCount);
        const durationMinutes =
          payload.durationMinutes === "none" ? null : Number(payload.durationMinutes);

        const session = await eduQuestionRequestsApi.createMockQuestionSession({
          organisationId: activeOrgId,
          title: `${modeLabel} Practice`,
          type: modeToRequestType[mode],
          difficulty: payload.difficulty,
          number: questionCount,
          timeLimitSeconds: durationMinutes === null ? null : durationMinutes * 60,
          allowsExplanation: payload.explanationsEnabled,
          hintsCount: payload.hintsEnabled ? 3 : 0,
          focus: payload.focus,
          subjects: selectedSubjectMeta,
          additionalNote: `Focus: ${focusLabels[payload.focus as (typeof focusValues)[number]]}.`,
          batchSize: 5,
        });

        setPendingSession({
          mode,
          session,
        });
      }

      setIsInstructionsOpen(true);
      toast.success("Questions are ready", {
        description: "Review instructions, then begin the session.",
      });
    } catch {
      toast.error("Failed to start practice. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBeginExam = () => {
    if (!pendingSession) {
      return;
    }
    setActiveSession(pendingSession);
    setPendingSession(null);
    setIsInstructionsOpen(false);
  };

  const handleInstructionModalChange = (open: boolean) => {
    setIsInstructionsOpen(open);
    if (!open) {
      setPendingSession(null);
    }
  };

  if (activeSession) {
    if (activeSession.mode === "flashcards" && activeSession.flashcardRules) {
      return (
        <StudentFlashcardsSession
          request={activeSession.session.request}
          initialBatch={activeSession.session.firstBatch}
          rules={activeSession.flashcardRules}
          onExit={() => setActiveSession(null)}
        />
      );
    }

    return (
      <StudentExamSession
        request={activeSession.session.request}
        initialBatch={activeSession.session.firstBatch}
        onExit={() => setActiveSession(null)}
      />
    );
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          <Card className="border-borderColorPrimary bg-backgroundSecondary">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Student Practice Setup</CardTitle>
              <CardDescription>
                Required fields start empty. Choose an exam type to configure session rules.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="examMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Type</FormLabel>
                    <div className="grid gap-3 md:grid-cols-3">
                      <TooltipProvider>
                        {modeDetails.map((mode) => {
                          const Icon = mode.icon;
                          const active = field.value === mode.id;

                          return (
                            <div
                              key={mode.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => field.onChange(mode.id)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  field.onChange(mode.id);
                                }
                              }}
                              className={cn(
                                "rounded-lg border p-4 text-left",
                                active
                                  ? "border-primary bg-secondary"
                                  : "border-borderColorPrimary bg-background hover:bg-secondary/60"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <Icon className="h-4 w-4" />
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={(event) => event.stopPropagation()}
                                      className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground"
                                      aria-label={`Info: ${mode.label}`}
                                    >
                                      <Info className="h-3.5 w-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[220px] text-xs">
                                    {mode.note}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="mt-2 text-sm font-semibold">{mode.label}</p>
                            </div>
                          );
                        })}
                      </TooltipProvider>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subjects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subjects</FormLabel>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {subjects.map((subject) => {
                        const selected = field.value.includes(subject.id);

                        return (
                          <button
                            key={subject.id}
                            type="button"
                            onClick={() => {
                              const next = selected
                                ? field.value.filter((id) => id !== subject.id)
                                : [...field.value, subject.id];
                              field.onChange(next);
                            }}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-left",
                              selected
                                ? "border-primary bg-secondary"
                                : "border-borderColorPrimary bg-background"
                            )}
                          >
                            <p className="text-sm font-medium">{subject.name}</p>
                            <p className="text-xs text-muted-foreground">{subject.description}</p>
                          </button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isFlashcardsMode ? (
                <div className="space-y-4 rounded-lg border border-borderColorPrimary bg-background p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Flashcards Rules</p>
                    <Badge variant="secondary" className="px-2 py-0 text-[10px]">
                      GAMIFIED
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Flashcards use round rules. Standard exam controls are disabled for this mode.
                  </p>

                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="flashcardRoundSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Cards in Round</FormLabel>
                          <Select value={field.value || undefined} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select cards" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {flashcardRoundValues.map((value) => (
                                <SelectItem key={value} value={value}>
                                  {value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="flashcardLives"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Lives</FormLabel>
                          <Select value={field.value || undefined} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select lives" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {flashcardLivesValues.map((value) => (
                                <SelectItem key={value} value={value}>
                                  {value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="flashcardTimer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Round Timer</FormLabel>
                          <Select value={field.value || undefined} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select timer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Untimed</SelectItem>
                              {flashcardTimerValues
                                .filter((item) => item !== "none")
                                .map((value) => (
                                  <SelectItem key={value} value={value}>
                                    {value} min
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="flashcardShuffle"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-borderColorPrimary bg-background p-3">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-sm">Shuffle Deck</Label>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              ) : null}

              <div className={cn("space-y-4", isFlashcardsMode && "pointer-events-none opacity-60")}>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-borderColorPrimary bg-background p-3">
                        <FormLabel className="text-xs text-muted-foreground">Difficulty</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {(Object.keys(difficultyLabels) as StudentDifficulty[]).map((difficulty) => (
                            <Button
                              key={difficulty}
                              type="button"
                              size="sm"
                              disabled={isFlashcardsMode}
                              variant={field.value === difficulty ? "secondary" : "outline"}
                              onClick={() => field.onChange(difficulty)}
                            >
                              {difficultyLabels[difficulty]}
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="focus"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-borderColorPrimary bg-background p-3">
                        <FormLabel className="text-xs text-muted-foreground">Focus</FormLabel>
                        <Select
                          value={field.value || undefined}
                          onValueChange={field.onChange}
                          disabled={isFlashcardsMode}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select focus area" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mixed">Mixed Topics</SelectItem>
                            <SelectItem value="weak">Weak Topics First</SelectItem>
                            <SelectItem value="recent">Recent Topics</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="questionCount"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-borderColorPrimary bg-background p-3">
                        <FormLabel className="text-xs text-muted-foreground">Number of Questions</FormLabel>
                        <Select
                          value={field.value || undefined}
                          onValueChange={field.onChange}
                          disabled={isFlashcardsMode}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select question count" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {questionCountValues.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-borderColorPrimary bg-background p-3">
                        <FormLabel className="text-xs text-muted-foreground">Duration (minutes)</FormLabel>
                        <Select
                          value={field.value || undefined}
                          disabled={isFlashcardsMode}
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("timedMode", value !== "none", {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No time limit (Untimed)</SelectItem>
                            {durationValues.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="timedMode"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border border-borderColorPrimary bg-background p-3">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-sm">Timed Mode</Label>
                        <Switch
                          checked={field.value}
                          disabled={isFlashcardsMode}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (!checked) {
                              form.setValue("durationMinutes", "none", {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              return;
                            }
                            if (form.getValues("durationMinutes") === "none") {
                              form.setValue("durationMinutes", "30", {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                            }
                          }}
                        />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="hintsEnabled"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border border-borderColorPrimary bg-background p-3">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-sm">Hints</Label>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="explanationsEnabled"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border border-borderColorPrimary bg-background p-3">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-sm">Explanations</Label>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-borderColorPrimary bg-backgroundSecondary">
            <CardHeader>
              <CardTitle className="text-lg">Session Preview</CardTitle>
              <CardDescription>
                Live summary of student selections ({completedRequiredFields}/{requiredFieldCount} required fields complete).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
                  <p className="text-xs text-muted-foreground">Mode</p>
                  <p className="text-sm font-semibold">
                    {values.examMode
                      ? modeDetails.find((mode) => mode.id === values.examMode)?.label
                      : "Not selected"}
                  </p>
                </div>
                <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
                  <p className="text-xs text-muted-foreground">Hints</p>
                  <p className="text-sm font-semibold">{values.hintsEnabled ? "Enabled" : "Disabled"}</p>
                </div>
                {isFlashcardsMode ? (
                  <>
                    <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
                      <p className="text-xs text-muted-foreground">Round Size</p>
                      <p className="text-sm font-semibold">
                        {values.flashcardRoundSize ? `${values.flashcardRoundSize} cards` : "Not selected"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
                      <p className="text-xs text-muted-foreground">Lives</p>
                      <p className="text-sm font-semibold">
                        {values.flashcardLives ? values.flashcardLives : "Not selected"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
                      <p className="text-xs text-muted-foreground">Round Timer</p>
                      <p className="text-sm font-semibold">{formatFlashcardTimer(values.flashcardTimer)}</p>
                    </div>
                    <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
                      <p className="text-xs text-muted-foreground">Shuffle</p>
                      <p className="text-sm font-semibold">{values.flashcardShuffle ? "On" : "Off"}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
                      <p className="text-xs text-muted-foreground">Difficulty</p>
                      <p className="text-sm font-semibold">
                        {values.difficulty
                          ? difficultyLabels[values.difficulty as StudentDifficulty]
                          : "Not selected"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
                      <p className="text-xs text-muted-foreground">Questions</p>
                      <p className="text-sm font-semibold">
                        {values.questionCount ? values.questionCount : "Not selected"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-semibold">
                        {values.timedMode
                          ? values.durationMinutes !== "none"
                            ? `${values.durationMinutes} min`
                            : "Not selected"
                          : "Untimed"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
                      <p className="text-xs text-muted-foreground">Focus</p>
                      <p className="text-sm font-semibold">
                        {values.focus
                          ? focusLabels[values.focus as (typeof focusValues)[number]]
                          : "Not selected"}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div>
                <p className="mb-2 text-xs text-muted-foreground">Selected Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSubjects.length > 0 ? (
                    selectedSubjects.map((subject) => (
                      <Badge key={subject.id} variant="secondary" className="px-2 py-1 text-[11px]">
                        {subject.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No subject selected</span>
                  )}
                </div>
              </div>

              {form.formState.submitCount > 0 && !form.formState.isValid && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  Complete all required fields before starting a practice session.
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isFlashcardsMode ? "Prepare Flashcard Round" : "Start Practice"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>

      <Dialog open={isInstructionsOpen} onOpenChange={handleInstructionModalChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Session Instructions</DialogTitle>
            <DialogDescription>
              Confirm the rules before you begin.
            </DialogDescription>
          </DialogHeader>

          {pendingSession ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">Mode</p>
                  <p className="text-sm font-semibold">
                    {modeDetails.find((mode) => mode.id === pendingSession.mode)?.label}
                  </p>
                </div>
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-semibold">
                    {formatSessionDuration(pendingSession.session.request.time_limit)}
                  </p>
                </div>
              </div>

              {pendingSession.mode === "flashcards" && pendingSession.flashcardRules ? (
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Flashcard Rules</p>
                  <p className="mt-1">Cards: {pendingSession.flashcardRules.roundSize}</p>
                  <p>Lives: {pendingSession.flashcardRules.lives}</p>
                  <p>Shuffle: {pendingSession.flashcardRules.shuffle ? "On" : "Off"}</p>
                  <p>Scoring: Know = +10 (+streak bonus), Almost = +5, Again = 0 and requeue.</p>
                </div>
              ) : (
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Standard Exam Rules</p>
                  <p className="mt-1">First batch is available immediately.</p>
                  <p>Other batches continue generating and are prefetched in the background.</p>
                  <p>Submit at the end or when timer expires.</p>
                </div>
              )}

              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Before You Begin</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>
                    {pendingSession.session.request.time_limit ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        Timed sessions auto-submit at 00:00.
                      </span>
                    ) : (
                      "Untimed sessions do not auto-submit."
                    )}
                  </li>
                  <li>
                    <span className="inline-flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Do not refresh or close this page during the session.
                    </span>
                  </li>
                  <li>
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      After submission, review is read-only
                      {pendingSession.session.request.allows_explanation ? " with explanations." : "."}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleInstructionModalChange(false)}>
              Back to Setup
            </Button>
            <Button type="button" onClick={handleBeginExam} disabled={!pendingSession}>
              Begin Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
