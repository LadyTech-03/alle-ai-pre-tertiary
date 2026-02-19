"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProjectStore, useHistoryStore, useModelsStore, useSidebarStore } from "@/stores";
import { projectApi } from "@/lib/api/project";
import { historyApi } from "@/lib/api/history";
import { modelsApi } from "@/lib/api/models";
import {
  Loader,
  MessageSquare,
  FileText,
  FolderOpen,
  LayoutGrid,
  List,
  GraduationCap,
  BrainCircuit,
  Trophy,
  FileQuestion,
  ClipboardList,
  Users,
  ShieldCheck,
  Rocket,
  Wand2,
  Clock3,
} from "lucide-react";
import { BsFolder2Open } from "react-icons/bs";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import GreetingMessage from "@/components/features/GreetingMessage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

type ExamRole = "student" | "teacher";
type StudentExamType = "flashcards" | "theory" | "mcq";
type StudentDifficulty = "adaptive" | "easy" | "medium" | "hard";
type TeacherTemplate = "checkpoint" | "mock" | "intervention";

interface ExamSubjectOption {
  id: string;
  name: string;
  description: string;
  color?: string;
}

type TeacherQuestionMix = {
  mcq: boolean;
  theory: boolean;
  flashcards: boolean;
};

const preferredOrder = [
  "gpt-4-5",
  "o3-mini",
  "deepseek-r1",
  "grok-2-vision",
  "o1",
  "claude-3-5-sonnet",
  "llama-3-1-70b-instruct",
  "gpt-4o",
  "claude-3-sonnet",
  "grok-2",
  "gemini-1-5-pro",
  "llama-3-70b-instruct",
  "deepseek-v3",
  "mixtral-8x7b-instruct",
  "gpt-4",
  "o1-mini",
  "phi-4",
];

const fallbackExamSubjects: ExamSubjectOption[] = [
  { id: "english", name: "English Language", description: "Reading, grammar and writing", color: "#0ea5e9" },
  { id: "math", name: "Mathematics", description: "Numeracy and problem solving", color: "#22c55e" },
  { id: "science", name: "Integrated Science", description: "Theory and applied concepts", color: "#f59e0b" },
  { id: "social", name: "Social Studies", description: "Civic and contextual reasoning", color: "#f97316" },
];

const studentTrackOptions = [
  { id: "flashcards" as const, label: "Flash Cards", icon: Trophy, note: "Gamified memory drills" },
  { id: "theory" as const, label: "Theory", icon: BrainCircuit, note: "Long-form explanations" },
  { id: "mcq" as const, label: "MCQ/Objectives", icon: FileQuestion, note: "Timed objective rounds" },
];

const teacherTemplateOptions = [
  { id: "checkpoint" as const, label: "Weekly Checkpoint", icon: ClipboardList },
  { id: "mock" as const, label: "Mock Examination", icon: ShieldCheck },
  { id: "intervention" as const, label: "Intervention Pack", icon: BrainCircuit },
];

const studentDifficultyLabels: Record<StudentDifficulty, string> = {
  adaptive: "Adaptive",
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentProject, projects, setCurrentProject, setProjects, setLoading, isLoading } =
    useProjectStore();
  const { setHistory, setLoading: setHistoryLoading } = useHistoryStore();
  const { chatModels, setChatModels, setLoading: setModelsLoading } = useModelsStore();
  const { isOpen } = useSidebarStore();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const isExamPrepMode = searchParams.get("mode") === "exam-prep";

  const [examRole, setExamRole] = useState<ExamRole>("student");

  const [studentExamType, setStudentExamType] = useState<StudentExamType>("flashcards");
  const [studentDifficulty, setStudentDifficulty] = useState<StudentDifficulty>("adaptive");
  const [studentQuestionCount, setStudentQuestionCount] = useState<number[]>([20]);
  const [studentDuration, setStudentDuration] = useState<number[]>([30]);
  const [studentSubjects, setStudentSubjects] = useState<string[]>([]);
  const [studentTimedMode, setStudentTimedMode] = useState(true);
  const [studentHints, setStudentHints] = useState(true);
  const [studentExplanations, setStudentExplanations] = useState(true);

  const [teacherTemplate, setTeacherTemplate] = useState<TeacherTemplate>("checkpoint");
  const [teacherTitle, setTeacherTitle] = useState("Basic 7 Revision Set");
  const [teacherInstructions, setTeacherInstructions] = useState(
    "Answer all questions. Show your working where necessary."
  );
  const [teacherQuestions, setTeacherQuestions] = useState<number[]>([25]);
  const [teacherDuration, setTeacherDuration] = useState<number[]>([45]);
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);
  const [teacherQuestionMix, setTeacherQuestionMix] = useState<TeacherQuestionMix>({
    mcq: true,
    theory: true,
    flashcards: false,
  });
  const [teacherShuffle, setTeacherShuffle] = useState(true);
  const [teacherAllowRetry, setTeacherAllowRetry] = useState(false);
  const [teacherPublishNow, setTeacherPublishNow] = useState(false);

  const examSubjects = useMemo<ExamSubjectOption[]>(() => {
    if (projects.length > 0) {
      return projects.map((project) => ({
        id: project.uuid,
        name: project.name,
        description: project.description || "Topic-targeted revision set",
        color: project.color,
      }));
    }
    return fallbackExamSubjects;
  }, [projects]);

  useEffect(() => {
    if (examSubjects.length === 0) return;
    if (studentSubjects.length === 0) {
      setStudentSubjects(examSubjects.slice(0, Math.min(3, examSubjects.length)).map((s) => s.id));
    }
    if (teacherSubjects.length === 0) {
      setTeacherSubjects(examSubjects.slice(0, Math.min(2, examSubjects.length)).map((s) => s.id));
    }
  }, [examSubjects, studentSubjects.length, teacherSubjects.length]);

  useEffect(() => {
    const loadChatModels = async () => {
      if (chatModels && chatModels.length > 0) return;
      setModelsLoading(true);
      try {
        const models = await modelsApi.getModels("chat");
        const sortedChatModels = models.sort((a, b) => {
          const indexA = preferredOrder.indexOf(a.model_uid);
          const indexB = preferredOrder.indexOf(b.model_uid);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return 0;
        });
        setChatModels(sortedChatModels);
      } catch (err: any) {
        // Silently fail
      } finally {
        setModelsLoading(false);
      }
    };
    loadChatModels();
  }, [chatModels, setChatModels, setModelsLoading]);

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
          const formattedProjects = projectsData.map((project) => {
            const formattedProject = {
              id: project.id.toString(),
              uuid: project.uuid.toString(),
              name: project.name,
              description: project.description || "",
              files: [],
              histories: [],
              instructions: project.instructions || "",
              createdAt: project.created_at ? new Date(project.created_at) : new Date(),
              color: project.color_code || undefined,
            };

            if ((project as any).history && Array.isArray((project as any).history)) {
              formattedProject.histories = (project as any).history.map((h: any) => ({
                id: h.uuid,
                session: h.uuid,
                title: h.title || "New Chat",
                type: "chat" as const,
                created_at: h.created_at,
                updated_at: h.updated_at,
              }));
            }
            return formattedProject;
          });
          setProjects(formattedProjects);

          for (const project of formattedProjects) {
            if (!project.histories || project.histories.length === 0) {
              try {
                const conversations = await projectApi.getProjectConversations(project.uuid);
                if (Array.isArray(conversations) && conversations.length > 0) {
                  const formattedConversations = conversations.map((conv) => ({
                    id: conv.session,
                    session: conv.session,
                    title: conv.title,
                    type: "chat" as const,
                    created_at: conv.created_at,
                    updated_at: conv.updated_at,
                  }));
                  const { updateProject } = useProjectStore.getState();
                  updateProject(project.uuid, { histories: formattedConversations });
                }
              } catch (err: any) {
                // Continue with other projects even if one fails
              }
            }
          }
        }
      } catch (error: any) {
        // Silently fail
      } finally {
        setLoading(false);
        setIsInitialLoading(false);
      }
    };
    loadProjects();
  }, [projects.length, setProjects, setLoading]);

  useEffect(() => {
    const loadHistory = async () => {
      const { getHistoryByType } = useHistoryStore.getState();
      const chatHistory = getHistoryByType("chat");
      if (chatHistory && chatHistory.length > 0) return;
      setHistoryLoading(true);
      try {
        const response = await historyApi.getHistory("chat");
        setHistory(response.data);
      } catch (err: any) {
        // Silently fail
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, [setHistory, setHistoryLoading]);

  useEffect(() => {
    if (isExamPrepMode) return;
    if (currentProject && !isInitialLoading) {
      router.push(`/project/${currentProject.uuid}`);
    }
  }, [currentProject, router, isInitialLoading, isExamPrepMode]);

  const handleProjectClick = (project: typeof projects[0]) => {
    setCurrentProject(project);
    router.push(`/project/${project.uuid}`);
  };

  const toggleId = (ids: string[], id: string, setter: (next: string[]) => void) => {
    setter(ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  };

  const enabledTeacherMix = Object.values(teacherQuestionMix).filter(Boolean).length;

  if (isInitialLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isExamPrepMode) {
    return (
      <div className={`flex flex-col min-h-[calc(100vh-3.5rem)] transition-all duration-300 ${isOpen ? "pl-40" : "pl-0"}`}>
        <div className="relative flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,0.12),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.12),transparent_35%)]" />
          <ScrollArea className="h-full">
            <div className="relative mx-auto w-full max-w-6xl px-4 py-8 pb-20">
              <Card className="mb-5 border-borderColorPrimary/80 bg-backgroundSecondary/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <Badge className="px-2 py-1 text-[10px]" variant="success">
                        EXAM PREP
                      </Badge>
                      <h1 className="mt-2 text-2xl font-semibold flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-emerald-300" />
                        Student + Teacher Prep Interfaces
                      </h1>
                      <p className="text-sm text-muted-foreground mt-1">
                        UI-only mode with local state toggles. Backend wiring can be plugged in later.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex rounded-xl border border-borderColorPrimary bg-background/70 p-1">
                        <Button
                          size="sm"
                          variant={examRole === "student" ? "secondary" : "ghost"}
                          className={cn("h-8", examRole === "student" && "bg-emerald-500/15 text-emerald-200")}
                          onClick={() => setExamRole("student")}
                        >
                          <BrainCircuit className="mr-2 h-4 w-4" />
                          Student
                        </Button>
                        <Button
                          size="sm"
                          variant={examRole === "teacher" ? "secondary" : "ghost"}
                          className={cn("h-8", examRole === "teacher" && "bg-sky-500/15 text-sky-200")}
                          onClick={() => setExamRole("teacher")}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Teacher
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" className="h-8" onClick={() => router.push("/project")}>
                        Subject Directory
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {examRole === "student" ? (
                <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
                  <Card className="border-borderColorPrimary/80 bg-backgroundSecondary/60">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Student Practice Setup</CardTitle>
                      <CardDescription>Choose exam type, difficulty, volume and game controls.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-3 md:grid-cols-3">
                        {studentTrackOptions.map((track) => {
                          const Icon = track.icon;
                          const active = studentExamType === track.id;
                          return (
                            <button
                              key={track.id}
                              type="button"
                              onClick={() => setStudentExamType(track.id)}
                              className={cn(
                                "rounded-xl border p-4 text-left transition-colors",
                                active
                                  ? "border-emerald-400/40 bg-emerald-500/10"
                                  : "border-borderColorPrimary bg-background/50 hover:bg-secondary/60"
                              )}
                            >
                              <Icon className="h-4 w-4 mb-2" />
                              <p className="text-sm font-semibold">{track.label}</p>
                              <p className="text-xs text-muted-foreground mt-1">{track.note}</p>
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-2">
                        <Label>Subjects</Label>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {examSubjects.map((subject) => (
                            <button
                              key={subject.id}
                              type="button"
                              onClick={() => toggleId(studentSubjects, subject.id, setStudentSubjects)}
                              className={cn(
                                "rounded-lg border px-3 py-2 text-left",
                                studentSubjects.includes(subject.id)
                                  ? "border-emerald-400/50 bg-emerald-500/10"
                                  : "border-borderColorPrimary bg-background/50"
                              )}
                            >
                              <p className="text-sm font-medium">{subject.name}</p>
                              <p className="text-xs text-muted-foreground">{subject.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 rounded-lg border border-borderColorPrimary bg-background/50 p-3">
                          <Label className="text-xs text-muted-foreground">Difficulty</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {(Object.keys(studentDifficultyLabels) as StudentDifficulty[]).map((difficulty) => (
                              <Button
                                key={difficulty}
                                size="sm"
                                variant={studentDifficulty === difficulty ? "secondary" : "outline"}
                                onClick={() => setStudentDifficulty(difficulty)}
                              >
                                {studentDifficultyLabels[difficulty]}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2 rounded-lg border border-borderColorPrimary bg-background/50 p-3">
                          <Label className="text-xs text-muted-foreground">Question Focus</Label>
                          <Select defaultValue="mixed">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mixed">Mixed Topics</SelectItem>
                              <SelectItem value="weak">Weak Topics First</SelectItem>
                              <SelectItem value="recent">Recent Lessons</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4 rounded-lg border border-borderColorPrimary bg-background/50 p-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Questions</span>
                            <span>{studentQuestionCount[0]}</span>
                          </div>
                          <Slider min={5} max={60} step={5} value={studentQuestionCount} onValueChange={setStudentQuestionCount} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Duration</span>
                            <span>{studentTimedMode ? `${studentDuration[0]}m` : "Untimed"}</span>
                          </div>
                          <Slider min={10} max={120} step={5} value={studentDuration} disabled={!studentTimedMode} onValueChange={setStudentDuration} />
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="rounded-lg border border-borderColorPrimary bg-background/50 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm">Timed Mode</p>
                            <Switch checked={studentTimedMode} onCheckedChange={setStudentTimedMode} />
                          </div>
                        </div>
                        <div className="rounded-lg border border-borderColorPrimary bg-background/50 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm">Hints</p>
                            <Switch checked={studentHints} onCheckedChange={setStudentHints} />
                          </div>
                        </div>
                        <div className="rounded-lg border border-borderColorPrimary bg-background/50 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm">Explanations</p>
                            <Switch checked={studentExplanations} onCheckedChange={setStudentExplanations} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-borderColorPrimary/80 bg-gradient-to-br from-emerald-500/10 via-backgroundSecondary to-sky-500/10">
                    <CardHeader>
                      <CardTitle className="text-lg">Session Blueprint</CardTitle>
                      <CardDescription>Preview before launch.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-borderColorPrimary bg-background/60 p-3">
                          <p className="text-xs text-muted-foreground">Questions</p>
                          <p className="text-xl font-semibold">{studentQuestionCount[0]}</p>
                        </div>
                        <div className="rounded-lg border border-borderColorPrimary bg-background/60 p-3">
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-xl font-semibold">{studentTimedMode ? `${studentDuration[0]}m` : "Untimed"}</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Selected Subjects</p>
                        <div className="flex flex-wrap gap-2">
                          {studentSubjects.map((subjectId) => {
                            const subject = examSubjects.find((item) => item.id === subjectId);
                            if (!subject) return null;
                            return (
                              <Badge key={subject.id} variant="secondary" className="px-2 py-1 text-[11px]">
                                {subject.name}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      <Button className="w-full bg-emerald-500 text-black hover:bg-emerald-400">
                        <Rocket className="mr-2 h-4 w-4" />
                        Start Exam Prep
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
                  <Card className="border-borderColorPrimary/80 bg-backgroundSecondary/60">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Teacher Question Builder</CardTitle>
                      <CardDescription>Set questions for students with full exam controls.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-3 md:grid-cols-3">
                        {teacherTemplateOptions.map((template) => {
                          const Icon = template.icon;
                          const active = teacherTemplate === template.id;
                          return (
                            <button
                              key={template.id}
                              type="button"
                              onClick={() => setTeacherTemplate(template.id)}
                              className={cn(
                                "rounded-xl border p-4 text-left transition-colors",
                                active
                                  ? "border-sky-400/40 bg-sky-500/10"
                                  : "border-borderColorPrimary bg-background/50 hover:bg-secondary/60"
                              )}
                            >
                              <Icon className="h-4 w-4 mb-2" />
                              <p className="text-sm font-semibold">{template.label}</p>
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher-title">Exam Title</Label>
                        <Input id="teacher-title" value={teacherTitle} onChange={(e) => setTeacherTitle(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="teacher-instructions">Instructions</Label>
                        <Textarea id="teacher-instructions" value={teacherInstructions} onChange={(e) => setTeacherInstructions(e.target.value)} className="min-h-[90px]" />
                      </div>

                      <div className="space-y-2">
                        <Label>Subjects</Label>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {examSubjects.map((subject) => (
                            <button
                              key={subject.id}
                              type="button"
                              onClick={() => toggleId(teacherSubjects, subject.id, setTeacherSubjects)}
                              className={cn(
                                "rounded-lg border px-3 py-2 text-left",
                                teacherSubjects.includes(subject.id)
                                  ? "border-sky-400/50 bg-sky-500/10"
                                  : "border-borderColorPrimary bg-background/50"
                              )}
                            >
                              <p className="text-sm font-medium">{subject.name}</p>
                              <p className="text-xs text-muted-foreground">{subject.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 rounded-lg border border-borderColorPrimary bg-background/50 p-3">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Questions</span>
                            <span>{teacherQuestions[0]}</span>
                          </div>
                          <Slider min={10} max={80} step={5} value={teacherQuestions} onValueChange={setTeacherQuestions} />
                        </div>
                        <div className="space-y-2 rounded-lg border border-borderColorPrimary bg-background/50 p-3">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Duration</span>
                            <span>{teacherDuration[0]}m</span>
                          </div>
                          <Slider min={20} max={180} step={5} value={teacherDuration} onValueChange={setTeacherDuration} />
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-3">
                        <label className="flex items-center gap-2 rounded-lg border border-borderColorPrimary bg-background/50 p-3">
                          <Checkbox checked={teacherQuestionMix.mcq} onCheckedChange={(checked) => setTeacherQuestionMix((prev) => ({ ...prev, mcq: Boolean(checked) }))} />
                          <span className="text-sm">MCQ</span>
                        </label>
                        <label className="flex items-center gap-2 rounded-lg border border-borderColorPrimary bg-background/50 p-3">
                          <Checkbox checked={teacherQuestionMix.theory} onCheckedChange={(checked) => setTeacherQuestionMix((prev) => ({ ...prev, theory: Boolean(checked) }))} />
                          <span className="text-sm">Theory</span>
                        </label>
                        <label className="flex items-center gap-2 rounded-lg border border-borderColorPrimary bg-background/50 p-3">
                          <Checkbox checked={teacherQuestionMix.flashcards} onCheckedChange={(checked) => setTeacherQuestionMix((prev) => ({ ...prev, flashcards: Boolean(checked) }))} />
                          <span className="text-sm">Flashcards</span>
                        </label>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="rounded-lg border border-borderColorPrimary bg-background/50 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm">Shuffle</p>
                            <Switch checked={teacherShuffle} onCheckedChange={setTeacherShuffle} />
                          </div>
                        </div>
                        <div className="rounded-lg border border-borderColorPrimary bg-background/50 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm">Allow Retry</p>
                            <Switch checked={teacherAllowRetry} onCheckedChange={setTeacherAllowRetry} />
                          </div>
                        </div>
                        <div className="rounded-lg border border-borderColorPrimary bg-background/50 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm">Publish Now</p>
                            <Switch checked={teacherPublishNow} onCheckedChange={setTeacherPublishNow} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-borderColorPrimary/80 bg-gradient-to-br from-sky-500/10 via-backgroundSecondary to-cyan-500/10">
                    <CardHeader>
                      <CardTitle className="text-lg">Assignment Preview</CardTitle>
                      <CardDescription>Quick rollout summary for teachers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-lg border border-borderColorPrimary bg-background/60 p-3">
                        <p className="text-xs text-muted-foreground">Title</p>
                        <p className="text-sm font-semibold">{teacherTitle || "Untitled Exam"}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-borderColorPrimary bg-background/60 p-3">
                          <p className="text-xs text-muted-foreground">Questions</p>
                          <p className="text-xl font-semibold">{teacherQuestions[0]}</p>
                        </div>
                        <div className="rounded-lg border border-borderColorPrimary bg-background/60 p-3">
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-xl font-semibold">{teacherDuration[0]}m</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Question formats enabled: {enabledTeacherMix}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock3 className="h-3.5 w-3.5" />
                        Release: {teacherPublishNow ? "Immediate" : "Manual"}
                      </p>
                      <Button className="w-full bg-sky-500 text-black hover:bg-sky-400">
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Questions
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

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full p-4 mb-4 bg-muted inline-flex items-center justify-center">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold mb-2">No Subjects yet for this class</h1>
          <p className="text-sm text-muted-foreground">
            Contact your administrator to create subjects for your class.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-[calc(100vh-3.5rem)] transition-all duration-300 ${isOpen ? "pl-40" : "pl-0"}`}>
      <div className="flex-1 relative overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
            <div className="w-full max-w-5xl mb-8">
              <GreetingMessage questionText="Select a Subject to continue" />
            </div>

            <div className="w-full max-w-4xl mb-6 flex items-center justify-end">
              <div className="flex items-center gap-2 border border-borderColorPrimary rounded-lg p-1">
                <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="h-8">
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="h-8">
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="w-full max-w-5xl pb-24">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {projects.map((project) => {
                    const conversationCount = project.histories?.length || 0;
                    const fileCount = project.files?.length || 0;
                    const projectColor = project.color || "";

                    return (
                      <div
                        key={project.uuid}
                        onClick={() => handleProjectClick(project)}
                        className="group bg-backgroundSecondary border border-border rounded-lg overflow-hidden cursor-pointer transition-all hover:border-borderColorPrimary hover:shadow-sm"
                      >
                        <div className="h-1 w-full" />
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="shrink-0">
                              <BsFolder2Open className="size-8" style={{ color: projectColor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{project.name}</h3>
                              {project.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{project.description}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pt-3 border-t border-borderColorPrimary text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{conversationCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>{fileCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => {
                    const conversationCount = project.histories?.length || 0;
                    const fileCount = project.files?.length || 0;
                    const projectColor = project.color || "";

                    return (
                      <div
                        key={project.uuid}
                        onClick={() => handleProjectClick(project)}
                        className="group bg-backgroundSecondary rounded-lg overflow-hidden cursor-pointer transition-all hover:border-borderColorPrimary hover:shadow-sm"
                      >
                        <div className="flex items-center">
                          <div className="w-1 h-full self-stretch" style={{ backgroundColor: projectColor }} />
                          <div className="flex items-center gap-4 p-4 flex-1">
                            <div className="shrink-0">
                              <BsFolder2Open className="h-5 w-5" style={{ color: projectColor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-foreground truncate">{project.name}</h3>
                              {project.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{project.description}</p>}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                              <div className="flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>{conversationCount}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5" />
                                <span>{fileCount}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
