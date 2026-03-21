"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useOrgSessionStore, useProjectStore, useSidebarStore } from "@/stores";
import { useLessonNoteDraftStore } from "@/stores/lessonNoteDraftStore";
import { projectApi } from "@/lib/api/project";
import { lessonNotesApi, type LessonMeetingDay } from "@/lib/api/lessonNotes";

interface SubjectOption {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

const fallbackSubjects: SubjectOption[] = [
  { id: "english", name: "English Language", description: "Grammar, writing and comprehension" },
  { id: "math", name: "Mathematics", description: "Numeracy and problem-solving" },
  { id: "science", name: "Integrated Science", description: "Core science concepts" },
  { id: "social", name: "Social Studies", description: "Civic and contextual understanding" },
];

const dayOptions = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const durationUnits = [
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
] as const;
type DurationUnit = (typeof durationUnits)[number]["value"];
interface MeetingDayRow {
  day: string;
  durationValue: string;
}

export default function LessonNotesPage() {
  const router = useRouter();
  const { isOpen } = useSidebarStore();
  const { orgId } = useOrgSessionStore();
  const setDraft = useLessonNoteDraftStore((state) => state.setDraft);
  const { projects, setProjects, setLoading, isLoading } = useProjectStore();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [meetingDays, setMeetingDays] = useState<MeetingDayRow[]>([
    { day: "monday", durationValue: "2" },
  ]);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("hours");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjects = useMemo<SubjectOption[]>(() => {
    if (projects.length > 0) {
      return projects.map((project) => ({
        id: project.uuid,
        name: project.name,
        description: project.description || "Lesson note subject",
        color: project.color,
      }));
    }
    return fallbackSubjects;
  }, [projects]);

  const selectedSubject = subjects.find((subject) => subject.id === subjectId) ?? null;

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
      } catch {
        // UI-only fallback
      } finally {
        setLoading(false);
        setIsInitialLoading(false);
      }
    };

    loadProjects();
  }, [projects.length, setLoading, setProjects]);

  const updateMeetingDay = (index: number, next: Partial<MeetingDayRow>) => {
    setMeetingDays((prev) =>
      prev.map((entry, idx) => (idx === index ? { ...entry, ...next } : entry))
    );
  };

  const addMeetingDay = () => {
    setMeetingDays((prev) => [...prev, { day: "monday", durationValue: "" }]);
  };

  const removeMeetingDay = (index: number) => {
    setMeetingDays((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    if (!subjectId) {
      toast.error("Select a subject.");
      return;
    }
    const cleanedMeetingDays: LessonMeetingDay[] = meetingDays
      .filter((entry) => entry.day.trim().length > 0 && entry.durationValue.trim().length > 0)
      .map((entry) => ({
        day: entry.day,
        duration: `${entry.durationValue} ${durationUnit === "hours" ? "Hours" : "Minutes"}`,
      }));

    if (cleanedMeetingDays.length === 0) {
      toast.error("Add at least one meeting day and duration.");
      return;
    }

    if (!orgId) {
      toast.error("Organisation not found. Please refresh.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await lessonNotesApi.createLessonNote({
        organisationId: orgId,
        courseUuid: subjectId,
        title: title.trim().length > 0 ? title.trim() : undefined,
        meetingDays: cleanedMeetingDays,
      });
      setDraft(String(response.id), response);
      toast.success("Lesson note request created.");
      router.push(`/lesson-notes/${response.id}`);
    } catch {
      toast.error("Failed to create lesson note.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="mx-auto w-full max-w-5xl px-4 py-8 pb-20">
            <Card className="border-borderColorPrimary bg-backgroundSecondary">
              <CardHeader>
                <CardTitle className="text-xl">Lesson Notes</CardTitle>
                <CardDescription>
                  Generate lesson notes by subject and meeting schedule.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Subject</Label>
                    <Select value={subjectId || undefined} onValueChange={setSubjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Title (optional)</Label>
                    <Input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder={selectedSubject ? `${selectedSubject.name} lesson notes` : "Lesson notes title"}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Meeting Days</Label>
                    <p className="text-xs text-muted-foreground">Add the timetable for this subject.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-lg border border-borderColorPrimary bg-background p-1">
                      {durationUnits.map((unit) => (
                        <Button
                          key={unit.value}
                          type="button"
                          size="sm"
                          variant={durationUnit === unit.value ? "secondary" : "ghost"}
                          onClick={() => setDurationUnit(unit.value)}
                          className="h-7 px-3"
                        >
                          {unit.label}
                        </Button>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={addMeetingDay}>
                      Add Day
                    </Button>
                  </div>
                </div>

              <div className="overflow-hidden rounded-lg border border-borderColorPrimary">
                <div className="grid grid-cols-[1fr_140px_80px] gap-2 border-b border-borderColorPrimary bg-muted/50 px-3 py-2 text-[11px] uppercase text-muted-foreground">
                  <span>Day</span>
                  <span>Duration</span>
                  <span className="text-right">Action</span>
                </div>
                <div className="divide-y divide-borderColorPrimary/60">
                  {meetingDays.map((entry, index) => (
                    <div key={`${entry.day}-${index}`} className="grid grid-cols-[1fr_140px_80px] items-center gap-2 px-3 py-2">
                      <Select
                        value={entry.day}
                        onValueChange={(value) => updateMeetingDay(index, { day: value })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {dayOptions.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={entry.durationValue}
                        onChange={(event) => {
                          const nextValue = event.target.value.replace(/\D/g, "");
                          updateMeetingDay(index, { durationValue: nextValue });
                        }}
                        placeholder={durationUnit === "hours" ? "Hours" : "Minutes"}
                        className="h-9"
                      />

                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeMeetingDay(index)}
                          disabled={meetingDays.length === 1}
                          className="h-8"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" onClick={() => router.push("/project")}>
                    Subjects
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Create Lesson Note"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}











