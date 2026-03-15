"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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
  Info,
  Loader2,
  Clock3,
  AlertTriangle,
  ShieldCheck,
  TimerOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useOrgSessionStore } from "@/stores";
import { useExamSessionDraftStore } from "@/stores/examSessionDraftStore";
import {
  eduQuestionRequestsApi,
  type QuestionRequestType,
} from "@/lib/api/eduQuestionRequests";
import type { StudentDifficulty, StudentExamMode, SubjectOption } from "./types";

const DEFAULT_BATCH_SIZE = 10;
const QUESTION_MIN = 5;
const QUESTION_MAX = 60;
const QUESTION_STEP = 5;
const DURATION_MIN = 10;
const DURATION_MAX = 120;
const DURATION_STEP = 5;
const DURATION_PRESETS = [15, 30, 45, 60, 90];
const studentModeValues = ["flashcards", "theory", "mcq"] as const;
const difficultyValues = ["adaptive", "easy", "medium", "hard"] as const;
const focusValues = ["mixed", "weak", "recent"] as const;

const studentPrepSchema = z.object({
  examMode: z.string(),
  // difficulty: z.string(),
  // focus: z.string(),
  questionCount: z.coerce.number().int().min(QUESTION_MIN).max(QUESTION_MAX),
  durationMinutes: z.coerce.number().int().min(DURATION_MIN).max(DURATION_MAX),
  subjectId: z.string().min(1, "Select a subject"),
  timedMode: z.boolean(),
  hintsCount: z.coerce.number().int().min(0).max(60),
  explanationsEnabled: z.boolean(),
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

  // if (!difficultyValues.includes(data.difficulty as StudentDifficulty)) {
  //   ctx.addIssue({
  //     code: z.ZodIssueCode.custom,
  //     path: ["difficulty"],
  //     message: "Select difficulty",
  //   });
  // }

  // if (!focusValues.includes(data.focus as (typeof focusValues)[number])) {
  //   ctx.addIssue({
  //     code: z.ZodIssueCode.custom,
  //     path: ["focus"],
  //     message: "Select focus area",
  //   });
  // }

  const questionCount = Number(data.questionCount);
  if (!Number.isNaN(questionCount) && data.hintsCount > questionCount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["hintsCount"],
      message: "Hints cannot exceed number of questions",
    });
  }

  if (
    data.timedMode &&
    (Number.isNaN(data.durationMinutes) ||
      data.durationMinutes < DURATION_MIN ||
      data.durationMinutes > DURATION_MAX)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["durationMinutes"],
      message: "Select a valid duration or disable timed mode",
    });
  }
});

type StudentPrepFormValues = z.infer<typeof studentPrepSchema>;

interface StudentExamPrepProps {
  subjects: SubjectOption[];
}

interface PendingExamConfig {
  mode: StudentExamMode;
  modeLabel: string;
  subject: SubjectOption;
  questionCount: number;
  durationSeconds: number | null;
  hintsCount: number;
  allowsExplanation: boolean;
}

const modeDetails: Array<{ id: StudentExamMode; label: string; icon: ComponentType<{ className?: string }>; note: string }> = [
  {
    id: "flashcards",
    label: "Flash Cards",
    icon: Trophy,
    note: "Click-to-flip cards to test recall with simple progress tracking.",
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
    return "No limit";
  }
  const totalMinutes = Math.max(1, Math.floor(seconds / 60));
  return `${totalMinutes} minutes`;
};

export function StudentExamPrep({ subjects }: StudentExamPrepProps) {
  const router = useRouter();
  const { orgId } = useOrgSessionStore();
  const setDraft = useExamSessionDraftStore((state) => state.setDraft);
  const activeOrgId = orgId ?? "1";
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [pendingConfig, setPendingConfig] = useState<PendingExamConfig | null>(null);
  const [pendingTitle, setPendingTitle] = useState("");
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const form = useForm<StudentPrepFormValues>({
    resolver: zodResolver(studentPrepSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      examMode: "",
      // difficulty: "",
      // focus: "",
      questionCount: 20,
      durationMinutes: 30,
      subjectId: "",
      timedMode: false,
      hintsCount: 0,
      explanationsEnabled: false,
    },
  });

  const values = form.watch();
  const isFlashcardsMode = values.examMode === "flashcards";
  const resolvedQuestionCount = Number.isFinite(values.questionCount)
    ? values.questionCount
    : QUESTION_MAX;
  const maxHintsAllowed = Math.min(resolvedQuestionCount, QUESTION_MAX);
  const resolvedDuration = Number.isFinite(values.durationMinutes)
    ? values.durationMinutes
    : 30;

  const onSubmit = (payload: StudentPrepFormValues) => {
    const selectedSubjectMeta = subjects.find((subject) => subject.id === payload.subjectId);

    if (!selectedSubjectMeta) {
      toast.error("Select a subject.");
      return;
    }

    const mode = payload.examMode as StudentExamMode;
    const modeLabel = modeDetails.find((item) => item.id === mode)?.label ?? "Practice";

    const questionCount = payload.questionCount;
    const durationMinutes = payload.timedMode ? payload.durationMinutes : null;

    setPendingConfig({
      mode,
      modeLabel,
      subject: selectedSubjectMeta,
      questionCount,
      durationSeconds: durationMinutes === null ? null : durationMinutes * 60,
      hintsCount: payload.hintsCount,
      allowsExplanation: payload.explanationsEnabled,
    });
    setPendingTitle(`${selectedSubjectMeta.name} Quiz`);
    setIsInstructionsOpen(true);
  };

  const handleBeginExam = async () => {
    if (!pendingConfig) {
      return;
    }

    const trimmedTitle = pendingTitle.trim();
    if (!trimmedTitle) {
      toast.error("Add a title for this test.");
      return;
    }

    try {
      setIsCreatingRequest(true);
      const cappedHintLimit = Math.min(
        Math.max(pendingConfig.hintsCount, 0),
        pendingConfig.questionCount
      );
      const safeHintLimit = cappedHintLimit === 0 ? null : cappedHintLimit;
      const request = await eduQuestionRequestsApi.createQuestionRequest({
        organisationId: activeOrgId,
        title: trimmedTitle,
        courseUuid: pendingConfig.subject.id,
        number: pendingConfig.questionCount,
        type: modeToRequestType[pendingConfig.mode],
        hintLimit: safeHintLimit,
        timeLimitSeconds: pendingConfig.durationSeconds,
        allowsExplanation: pendingConfig.allowsExplanation,
        courseFiles: null,
        additionalNote: null,
        topics: null,
        useMock: false,
      });

      const requestWithSubject = {
        ...request,
        course_name: pendingConfig.subject.name,
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

      setDraft(String(request.id), {
        mode: pendingConfig.mode,
        request: requestWithSubject,
        initialBatch,
      });

      router.push(`/exam-prep/${request.id}`);

      setPendingConfig(null);
      setPendingTitle("");
      setIsInstructionsOpen(false);
    } catch {
      toast.error("Failed to start practice. Try again.");
    } finally {
      setIsCreatingRequest(false);
    }
  };

  const handleInstructionModalChange = (open: boolean) => {
    setIsInstructionsOpen(open);
    if (!open) {
      setPendingConfig(null);
      setPendingTitle("");
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <Card className="border-borderColorPrimary bg-muted/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Prepare for your Exam/Test</CardTitle>
              <CardDescription>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="examMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs">Select Exam/Test Type</FormLabel>
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
                                "flex items-center justify-between rounded-lg border p-4 text-left border-borderColorPrimary",
                                active
                                  ? " bg-backgroundSecondary"
                                  : "hover:bg-accent"
                              )}
                            >
                              <p className="text-sm font-semibold">{mode.label}</p>
                              <div className="flex items-start justify-between gap-2">
                                {/* <Icon className="h-4 w-4" /> */}
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
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs">Subject</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 lg:grid-cols-2">
                {/* <FormField
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
                /> */}
                {/* <FormField
                  control={form.control}
                  name="focus"
                  render={({ field }) => (
                    <FormItem className="rounded-lg">
                      <FormLabel className="text-xs text-muted-foreground">Choose Focus Area</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
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
                /> */}

                <FormField
                  control={form.control}
                  name="questionCount"
                  render={({ field }) => {
                    const displayValue = Number.isFinite(field.value) ? field.value : QUESTION_MIN;
                    return (
                      <FormItem className="space-y-3 rounded-lg border border-borderColorPrimary bg-background p-4">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-xs text-muted-foreground">Number of questions</FormLabel>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold">
                            {displayValue}
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            min={QUESTION_MIN}
                            max={QUESTION_MAX}
                            step={QUESTION_STEP}
                            value={[displayValue]}
                            onValueChange={([value]) => {
                              field.onChange(value);
                              if (form.getValues("hintsCount") > value) {
                                form.setValue("hintsCount", value, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }
                            }}
                          />
                        </FormControl>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{QUESTION_MIN}</span>
                          <span>{QUESTION_MAX}</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <div
                  className={cn(
                    "space-y-4 rounded-lg border p-4 transition-colors",
                    values.timedMode
                      ? "border-primary/50 bg-primary/5"
                      : "border-borderColorPrimary bg-background"
                  )}
                >
                  <FormField
                    control={form.control}
                    name="timedMode"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <FormLabel className="text-xs text-muted-foreground">Time limit</FormLabel>
                            <p className="text-sm font-semibold">
                              {field.value ? `${resolvedDuration} minutes` : "Untimed session"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">
                              {field.value ? "Timed" : "Untimed"}
                            </span>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (checked) {
                                  form.setValue("durationMinutes", resolvedDuration, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                }
                              }}
                            />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <Slider
                            min={DURATION_MIN}
                            max={DURATION_MAX}
                            step={DURATION_STEP}
                            value={[Number.isFinite(field.value) ? field.value : DURATION_MIN]}
                            onValueChange={([value]) => {
                              field.onChange(value);
                              if (!values.timedMode) {
                                form.setValue("timedMode", true, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }
                            }}
                            disabled={!values.timedMode}
                          />
                        </FormControl>
                        <div className="flex flex-wrap gap-2">
                          {DURATION_PRESETS.map((preset) => (
                            <Button
                              key={preset}
                              type="button"
                              size="sm"
                              variant={
                                resolvedDuration === preset && values.timedMode ? "secondary" : "outline"
                              }
                              onClick={() => {
                                field.onChange(preset);
                                form.setValue("timedMode", true, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }}
                            >
                              {preset}m
                            </Button>
                          ))}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Slide or tap a preset to set your time. Disable for untimed sessions.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <FormField
                  control={form.control}
                  name="hintsCount"
                  render={({ field }) => {
                    const hintValue = Number.isFinite(field.value) ? field.value : 0;
                    return (
                      <FormItem
                        className={cn(
                          "space-y-3 rounded-lg border p-4 transition-colors",
                          hintValue > 0
                            ? "border-amber-500/40 bg-amber-500/5"
                            : "border-borderColorPrimary bg-background"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <FormLabel className="text-xs text-muted-foreground">Hints</FormLabel>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              max={maxHintsAllowed}
                              value={hintValue}
                              onChange={(event) => {
                                const nextValue = event.target.valueAsNumber;
                                const safeValue = Number.isNaN(nextValue)
                                  ? 0
                                  : Math.min(nextValue, maxHintsAllowed);
                                field.onChange(safeValue);
                              }}
                              className="h-8 w-16 text-center"
                            />
                            <span className="text-[11px] text-muted-foreground">
                              max {maxHintsAllowed}
                            </span>
                          </div>
                        </div>
                        <FormControl>
                          <Slider
                            min={0}
                            max={maxHintsAllowed}
                            step={1}
                            value={[hintValue]}
                            onValueChange={([value]) => field.onChange(value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="explanationsEnabled"
                  render={({ field }) => (
                    <FormItem
                      className={cn(
                        "rounded-lg border p-4 transition-colors",
                        field.value
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : "border-borderColorPrimary bg-background"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <FormLabel className="text-sm">Explanations</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Show solution breakdowns after submission.
                          </p>
                        </div>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isCreatingRequest}>
                {isCreatingRequest ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    {isFlashcardsMode ? "Begin Test" : "Begin Test"}
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
            <DialogTitle>Test Instructions</DialogTitle>
            <DialogDescription>
            </DialogDescription>
          </DialogHeader>

          {pendingConfig ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                <Label className="text-xs text-muted-foreground">Test Title</Label>
                <Input
                  value={pendingTitle}
                  onChange={(event) => setPendingTitle(event.target.value)}
                  className="mt-2 h-9"
                  placeholder="Personal Quiz 1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">Exam Type</p>
                  <p className="text-sm font-semibold">
                    {pendingConfig.modeLabel}
                  </p>
                </div>
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">Subject</p>
                  <p className="text-sm font-semibold">{pendingConfig.subject.name}</p>
                </div>
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">Questions</p>
                  <p className="text-sm font-semibold">{pendingConfig.questionCount}</p>
                </div>
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-semibold">
                    {formatSessionDuration(pendingConfig.durationSeconds)}
                  </p>
                </div>
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">Hints</p>
                  <p className="text-sm font-semibold">{pendingConfig.hintsCount}</p>
                </div>
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">Explanations</p>
                  <p className="text-sm font-semibold">
                    {pendingConfig.allowsExplanation ? "Enabled" : "Off"}
                  </p>
                </div>
              </div>

              {pendingConfig.mode === "flashcards" && (
                <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Flashcard Flow</p>
                  <p className="mt-1">Click card to flip between front and back.</p>
                  <p>Progress updates as you go; results is displayed at the end of the test</p>
                </div>
              )}

              <div className="rounded-lg border border-borderColorPrimary bg-background px-3 py-2 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Before You Begin</p>
                <ul className="mt-2 space-y-1 list-none">
                  <li>
                    {pendingConfig.durationSeconds ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        Timed sessions auto-submit at 00:00.
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <TimerOff className="h-3.5 w-3.5" />
                        Untimed sessions do not auto-submit
                      </span>
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
                      You&apos;ll be able to view your results after submission
                      {pendingConfig.allowsExplanation ? " with explanations." : "."}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleInstructionModalChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBeginExam}
              disabled={!pendingConfig || isCreatingRequest || !pendingTitle.trim()}
            >
              {isCreatingRequest ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Begin"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
