"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardList, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionMix, SubjectOption } from "./types";

interface TeacherExamPrepProps {
  subjects: SubjectOption[];
}

export function TeacherExamPrep({ subjects }: TeacherExamPrepProps) {
  const [teacherTitle, setTeacherTitle] = useState("Basic 7 Revision Pack");
  const [teacherInstructions, setTeacherInstructions] = useState(
    "Answer all questions and show your working where necessary."
  );
  const [teacherQuestions, setTeacherQuestions] = useState<number[]>([25]);
  const [teacherDuration, setTeacherDuration] = useState<number[]>([45]);
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);
  const [teacherQuestionMix, setTeacherQuestionMix] = useState<QuestionMix>({
    mcq: true,
    theory: true,
    flashcards: false,
  });
  const [teacherShuffle, setTeacherShuffle] = useState(true);
  const [teacherAllowRetry, setTeacherAllowRetry] = useState(false);
  const [teacherPublishNow, setTeacherPublishNow] = useState(false);

  const activeTeacherFormats = Object.values(teacherQuestionMix).filter(Boolean).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
      <Card className="border-borderColorPrimary bg-backgroundSecondary">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Teacher Question Builder</CardTitle>
          <CardDescription>Create and assign exam prep packs to students.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="exam-title">Exam Title</Label>
            <Input
              id="exam-title"
              value={teacherTitle}
              onChange={(event) => setTeacherTitle(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-inst">Instructions</Label>
            <Textarea
              id="exam-inst"
              value={teacherInstructions}
              onChange={(event) => setTeacherInstructions(event.target.value)}
              className="min-h-[96px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Subjects</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {subjects.map((subject) => {
                const selected = teacherSubjects.includes(subject.id);
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => {
                      setTeacherSubjects((prev) =>
                        prev.includes(subject.id)
                          ? prev.filter((id) => id !== subject.id)
                          : [...prev, subject.id]
                      );
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-borderColorPrimary bg-background p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Questions</span>
                <span>{teacherQuestions[0]}</span>
              </div>
              <Slider min={10} max={80} step={5} value={teacherQuestions} onValueChange={setTeacherQuestions} />
            </div>
            <div className="space-y-2 rounded-lg border border-borderColorPrimary bg-background p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Duration</span>
                <span>{teacherDuration[0]}m</span>
              </div>
              <Slider min={20} max={180} step={5} value={teacherDuration} onValueChange={setTeacherDuration} />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <label className="flex items-center gap-2 rounded-lg border border-borderColorPrimary bg-background p-3">
              <Checkbox
                checked={teacherQuestionMix.mcq}
                onCheckedChange={(checked) =>
                  setTeacherQuestionMix((prev) => ({ ...prev, mcq: Boolean(checked) }))
                }
              />
              <span className="text-sm">MCQ</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-borderColorPrimary bg-background p-3">
              <Checkbox
                checked={teacherQuestionMix.theory}
                onCheckedChange={(checked) =>
                  setTeacherQuestionMix((prev) => ({ ...prev, theory: Boolean(checked) }))
                }
              />
              <span className="text-sm">Theory</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-borderColorPrimary bg-background p-3">
              <Checkbox
                checked={teacherQuestionMix.flashcards}
                onCheckedChange={(checked) =>
                  setTeacherQuestionMix((prev) => ({ ...prev, flashcards: Boolean(checked) }))
                }
              />
              <span className="text-sm">Flashcards</span>
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm">Shuffle</p>
                <Switch checked={teacherShuffle} onCheckedChange={setTeacherShuffle} />
              </div>
            </div>
            <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm">Allow Retry</p>
                <Switch checked={teacherAllowRetry} onCheckedChange={setTeacherAllowRetry} />
              </div>
            </div>
            <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm">Publish Now</p>
                <Switch checked={teacherPublishNow} onCheckedChange={setTeacherPublishNow} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-borderColorPrimary bg-backgroundSecondary">
        <CardHeader>
          <CardTitle className="text-lg">Assignment Preview</CardTitle>
          <CardDescription>Release summary.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
            <p className="text-xs text-muted-foreground">Title</p>
            <p className="text-sm font-semibold">{teacherTitle || "Untitled Exam"}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
              <p className="text-xs text-muted-foreground">Questions</p>
              <p className="text-xl font-semibold">{teacherQuestions[0]}</p>
            </div>
            <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-xl font-semibold">{teacherDuration[0]}m</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Enabled formats: {activeTeacherFormats}</p>
          <Button className="w-full">
            <ClipboardList className="mr-2 h-4 w-4" />
            Generate Question Pack
          </Button>
          <Button variant="outline" className="w-full">
            <Wand2 className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
