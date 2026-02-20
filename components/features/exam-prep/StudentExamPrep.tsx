"use client";

import { useMemo } from "react";
import type { ComponentType } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Trophy, BrainCircuit, FileQuestion, Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { StudentDifficulty, StudentExamMode, SubjectOption } from "./types";

const studentModeValues = ["flashcards", "theory", "mcq"] as const;
const difficultyValues = ["adaptive", "easy", "medium", "hard"] as const;
const focusValues = ["mixed", "weak", "recent"] as const;
const questionCountValues = ["5", "10", "15", "20", "25", "30", "40", "50", "60"] as const;
const durationValues = ["10", "15", "20", "30", "45", "60", "90", "120"] as const;

const studentPrepSchema = z
  .object({
    examMode: z.string().refine((value) => studentModeValues.includes(value as StudentExamMode), {
      message: "Select an exam type",
    }),
    difficulty: z
      .string()
      .refine((value) => difficultyValues.includes(value as StudentDifficulty), {
        message: "Select difficulty",
      }),
    focus: z.string().refine((value) => focusValues.includes(value as (typeof focusValues)[number]), {
      message: "Select focus area",
    }),
    questionCount: z
      .string()
      .refine((value) => questionCountValues.includes(value as (typeof questionCountValues)[number]), {
        message: "Select number of questions",
      }),
    durationMinutes: z
      .string()
      .refine(
        (value) =>
          value === "none" || durationValues.includes(value as (typeof durationValues)[number]),
        {
          message: "Select duration",
        }
      ),
    subjects: z.array(z.string()).min(1, "Select at least one subject"),
    timedMode: z.boolean(),
    hintsEnabled: z.boolean(),
    explanationsEnabled: z.boolean(),
  })
  .superRefine((data, ctx) => {
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

const modeDetails: Array<{ id: StudentExamMode; label: string; icon: ComponentType<{ className?: string }>; note: string }> = [
  { id: "flashcards", label: "Flash Cards", icon: Trophy, note: "Gamified recall rounds" },
  { id: "theory", label: "Theory", icon: BrainCircuit, note: "Deep answer practice" },
  { id: "mcq", label: "MCQ/Objectives", icon: FileQuestion, note: "Timed objective sets" },
];

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

export function StudentExamPrep({ subjects }: StudentExamPrepProps) {
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
    },
  });

  const values = form.watch();

  const selectedSubjects = useMemo(
    () => subjects.filter((subject) => values.subjects.includes(subject.id)),
    [subjects, values.subjects]
  );

  const completedRequiredFields = [
    values.examMode,
    values.difficulty,
    values.focus,
    values.questionCount,
    values.subjects.length > 0 ? "subjects" : "",
  ].filter(Boolean).length + (values.timedMode ? (values.durationMinutes !== "none" ? 1 : 0) : 0);

  const requiredFieldCount = values.timedMode ? 6 : 5;

  const onSubmit = (payload: StudentPrepFormValues) => {
    const finalPayload = {
      ...payload,
      questionCount: Number(payload.questionCount),
      durationMinutes: payload.durationMinutes === "none" ? null : Number(payload.durationMinutes),
    };

    toast.success("Session validated", {
      description:
        finalPayload.durationMinutes === null
          ? `${finalPayload.questionCount} questions in untimed mode.`
          : `${finalPayload.questionCount} questions in ${finalPayload.durationMinutes} minutes.`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <Card className="border-borderColorPrimary bg-backgroundSecondary">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Student Practice Setup</CardTitle>
            <CardDescription>
              Required fields start empty. Complete setup to enable a valid session.
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
                            <p className="text-sm font-semibold mt-2">{mode.label}</p>
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
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
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
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
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

            <div className="grid gap-2 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="timedMode"
                render={({ field }) => (
                  <FormItem className="rounded-lg border border-borderColorPrimary bg-background p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-sm">Timed Mode</Label>
                      <Switch
                        checked={field.value}
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
                    ? values.durationMinutes
                      ? values.durationMinutes !== "none"
                        ? `${values.durationMinutes} min`
                        : "Not selected"
                      : "Not selected"
                    : "Untimed"}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
              <p className="text-xs text-muted-foreground">Focus Area</p>
              <p className="text-sm font-semibold">
                {values.focus
                  ? focusLabels[values.focus as (typeof focusValues)[number]]
                  : "Not selected"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Selected Subjects</p>
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

            <Button type="submit" className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Start Practice
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
