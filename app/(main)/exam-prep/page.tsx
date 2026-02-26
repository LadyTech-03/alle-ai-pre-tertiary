"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore, useSidebarStore } from "@/stores";
import { projectApi } from "@/lib/api/project";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader, GraduationCap, BrainCircuit, Users } from "lucide-react";
import { StudentExamPrep } from "@/components/features/exam-prep/StudentExamPrep";
import { TeacherExamPrep } from "@/components/features/exam-prep/TeacherExamPrep";
import type { SubjectOption, UserRole } from "@/components/features/exam-prep/types";

const fallbackSubjects: SubjectOption[] = [
  { id: "english", name: "English Language", description: "Grammar, writing and comprehension", color: "#0ea5e9" },
  { id: "math", name: "Mathematics", description: "Numeracy and problem-solving", color: "#22c55e" },
  { id: "science", name: "Integrated Science", description: "Core science concepts", color: "#f59e0b" },
  { id: "social", name: "Social Studies", description: "Civic and contextual understanding", color: "#f97316" },
];

export default function ExamPrepPage() {
  const router = useRouter();
  const { isOpen } = useSidebarStore();
  const { projects, setProjects, setLoading, isLoading } = useProjectStore();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [role, setRole] = useState<UserRole>("student");

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
                      Toggle between Student and Teacher interfaces. Backend wiring comes later.
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
              <StudentExamPrep subjects={subjects} />
            ) : (
              <TeacherExamPrep subjects={subjects} />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
