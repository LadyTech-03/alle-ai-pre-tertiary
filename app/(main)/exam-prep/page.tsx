"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore, useSidebarStore } from "@/stores";
import { projectApi } from "@/lib/api/project";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, GraduationCap, BrainCircuit, Users, Trophy, FileQuestion, ClipboardList, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type UserRole = "student" | "teacher";
type StudentExamMode = "flashcards" | "theory" | "mcq";
type StudentDifficulty = "adaptive" | "easy" | "medium" | "hard";

type SubjectOption = {
  id: string;
  name: string;
  description: string;
  color?: string;
};

type QuestionMix = {
  mcq: boolean;
  theory: boolean;
  flashcards: boolean;
};

const fallbackSubjects: SubjectOption[] = [
  { id: "english", name: "English Language", description: "Grammar, writing and comprehension", color: "#0ea5e9" },
  { id: "math", name: "Mathematics", description: "Numeracy and problem-solving", color: "#22c55e" },
  { id: "science", name: "Integrated Science", description: "Core science concepts", color: "#f59e0b" },
  { id: "social", name: "Social Studies", description: "Civic and contextual understanding", color: "#f97316" },
];

const studentModes: Array<{ id: StudentExamMode; label: string; icon: ComponentType<{ className?: string }>; note: string }> = [
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

export default function ExamPrepPage() {
  const router = useRouter();
  const { isOpen } = useSidebarStore();
  const { projects, setProjects, setLoading, isLoading } = useProjectStore();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [role, setRole] = useState<UserRole>("student");

  const [studentMode, setStudentMode] = useState<StudentExamMode>("flashcards");
  const [studentDifficulty, setStudentDifficulty] = useState<StudentDifficulty>("adaptive");
  const [studentQuestions, setStudentQuestions] = useState<number[]>([20]);
  const [studentDuration, setStudentDuration] = useState<number[]>([35]);
  const [studentSubjects, setStudentSubjects] = useState<string[]>([]);
  const [studentTimed, setStudentTimed] = useState(true);
  const [studentHints, setStudentHints] = useState(true);
  const [studentExplanations, setStudentExplanations] = useState(true);

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

  const subjects = useMemo<SubjectOption[]>(() => {
    if (projects.length > 0) {
      return projects.map((project) => ({
        id: project.uuid,
        name: project.name,
        description: project.description || "Topic-focused revision",
        color: project.color,
      }));
    }
    return fallbackSubjects;
  }, [projects]);

  useEffect(() => {
    const loadProjects = async () => {
      if (projects.length > 0) {
        setIsInitialLoading(false);
        return;
      }

      setLoading(true);
      try {
        const projectsData = await projectApi.getProjects();

        if (Array.isArray(projectsData) && projectsData.length > 0) {
          const formattedProjects = projectsData.map((project) => ({
            id: project.id.toString(),
            uuid: project.uuid.toString(),
            name: project.name,
            description: project.description || "",
            files: [],
            histories: [],
            instructions: project.instructions || "",
            createdAt: project.created_at ? new Date(project.created_at) : new Date(),
            color: project.color_code || undefined,
          }));
          setProjects(formattedProjects);
        }
      } catch (error: any) {
        // Silently fail for UI-only mode
      } finally {
        setLoading(false);
        setIsInitialLoading(false);
      }
    };

    loadProjects();
  }, [projects.length, setLoading, setProjects]);

  useEffect(() => {
    if (subjects.length === 0) return;

    if (studentSubjects.length === 0) {
      setStudentSubjects(subjects.slice(0, Math.min(3, subjects.length)).map((subject) => subject.id));
    }

    if (teacherSubjects.length === 0) {
      setTeacherSubjects(subjects.slice(0, Math.min(2, subjects.length)).map((subject) => subject.id));
    }
  }, [subjects, studentSubjects.length, teacherSubjects.length]);

  const toggleIds = (target: string, setter: Dispatch<SetStateAction<string[]>>) => {
    setter((prev) => (prev.includes(target) ? prev.filter((id) => id !== target) : [...prev, target]));
  };

  const activeTeacherFormats = Object.values(teacherQuestionMix).filter(Boolean).length;

  if (isInitialLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-[calc(100vh-3.5rem)] transition-all duration-300 ${isOpen ? "pl-40" : "pl-0"}`}>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 pb-20">
            <Card className="mb-5 border-borderColorPrimary bg-backgroundSecondary">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <Badge variant="secondary" className="px-2 py-1 text-[10px]">EXAM PREP</Badge>
                    <h1 className="mt-2 text-2xl font-semibold flex items-center gap-2">
                      <GraduationCap className="h-6 w-6" />
                      Exam Prep Workspace
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Toggle between Student and Teacher experiences using local state only.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-lg border border-borderColorPrimary bg-background p-1">
                      <Button
                        size="sm"
                        variant={role === "student" ? "secondary" : "ghost"}
                        onClick={() => setRole("student")}
                        className="h-8"
                      >
                        <BrainCircuit className="mr-2 h-4 w-4" />
                        Student
                      </Button>
                      <Button
                        size="sm"
                        variant={role === "teacher" ? "secondary" : "ghost"}
                        onClick={() => setRole("teacher")}
                        className="h-8"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Teacher
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="h-8" onClick={() => router.push("/project")}>Subjects</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {role === "student" ? (
              <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
                <Card className="border-borderColorPrimary bg-backgroundSecondary">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Student Practice Setup</CardTitle>
                    <CardDescription>
                      Build an exam prep session with mode, difficulty, timing and support controls.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-3 md:grid-cols-3">
                      {studentModes.map((mode) => {
                        const Icon = mode.icon;
                        const active = studentMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setStudentMode(mode.id)}
                            className={cn(
                              "rounded-lg border p-4 text-left",
                              active
                                ? "border-primary bg-secondary"
                                : "border-borderColorPrimary bg-background hover:bg-secondary/60"
                            )}
                          >
                            <Icon className="h-4 w-4 mb-2" />
                            <p className="text-sm font-semibold">{mode.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{mode.note}</p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <Label>Subjects</Label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {subjects.map((subject) => {
                          const selected = studentSubjects.includes(subject.id);
                          return (
                            <button
                              key={subject.id}
                              type="button"
                              onClick={() => toggleIds(subject.id, setStudentSubjects)}
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
                        <Label className="text-xs text-muted-foreground">Difficulty</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {(Object.keys(difficultyLabels) as StudentDifficulty[]).map((difficulty) => (
                            <Button
                              key={difficulty}
                              size="sm"
                              variant={studentDifficulty === difficulty ? "secondary" : "outline"}
                              onClick={() => setStudentDifficulty(difficulty)}
                            >
                              {difficultyLabels[difficulty]}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 rounded-lg border border-borderColorPrimary bg-background p-3">
                        <Label className="text-xs text-muted-foreground">Focus</Label>
                        <Select defaultValue="mixed">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mixed">Mixed Topics</SelectItem>
                            <SelectItem value="weak">Weak Topics First</SelectItem>
                            <SelectItem value="recent">Recent Topics</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-lg border border-borderColorPrimary bg-background p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Questions</span>
                          <span>{studentQuestions[0]}</span>
                        </div>
                        <Slider min={5} max={60} step={5} value={studentQuestions} onValueChange={setStudentQuestions} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Duration</span>
                          <span>{studentTimed ? `${studentDuration[0]}m` : "Untimed"}</span>
                        </div>
                        <Slider min={10} max={120} step={5} disabled={!studentTimed} value={studentDuration} onValueChange={setStudentDuration} />
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm">Timed Mode</p>
                          <Switch checked={studentTimed} onCheckedChange={setStudentTimed} />
                        </div>
                      </div>
                      <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm">Hints</p>
                          <Switch checked={studentHints} onCheckedChange={setStudentHints} />
                        </div>
                      </div>
                      <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm">Explanations</p>
                          <Switch checked={studentExplanations} onCheckedChange={setStudentExplanations} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-borderColorPrimary bg-backgroundSecondary">
                  <CardHeader>
                    <CardTitle className="text-lg">Session Preview</CardTitle>
                    <CardDescription>Configuration summary before launch.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
                        <p className="text-xs text-muted-foreground">Questions</p>
                        <p className="text-xl font-semibold">{studentQuestions[0]}</p>
                      </div>
                      <div className="rounded-lg border border-borderColorPrimary bg-background p-3">
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-xl font-semibold">{studentTimed ? `${studentDuration[0]}m` : "Untimed"}</p>
                      </div>
                    </div>
                    <Button className="w-full">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start Practice
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
                <Card className="border-borderColorPrimary bg-backgroundSecondary">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Teacher Question Builder</CardTitle>
                    <CardDescription>Create and assign exam prep packs to students.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="exam-title">Exam Title</Label>
                      <Input id="exam-title" value={teacherTitle} onChange={(event) => setTeacherTitle(event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exam-inst">Instructions</Label>
                      <Textarea id="exam-inst" value={teacherInstructions} onChange={(event) => setTeacherInstructions(event.target.value)} className="min-h-[96px]" />
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
                              onClick={() => toggleIds(subject.id, setTeacherSubjects)}
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
                        <Checkbox checked={teacherQuestionMix.mcq} onCheckedChange={(checked) => setTeacherQuestionMix((prev) => ({ ...prev, mcq: Boolean(checked) }))} />
                        <span className="text-sm">MCQ</span>
                      </label>
                      <label className="flex items-center gap-2 rounded-lg border border-borderColorPrimary bg-background p-3">
                        <Checkbox checked={teacherQuestionMix.theory} onCheckedChange={(checked) => setTeacherQuestionMix((prev) => ({ ...prev, theory: Boolean(checked) }))} />
                        <span className="text-sm">Theory</span>
                      </label>
                      <label className="flex items-center gap-2 rounded-lg border border-borderColorPrimary bg-background p-3">
                        <Checkbox checked={teacherQuestionMix.flashcards} onCheckedChange={(checked) => setTeacherQuestionMix((prev) => ({ ...prev, flashcards: Boolean(checked) }))} />
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
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
