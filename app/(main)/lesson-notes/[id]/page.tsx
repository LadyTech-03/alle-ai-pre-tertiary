"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/stores";
import { useLessonNoteDraftStore } from "@/stores/lessonNoteDraftStore";
import { LessonNoteEditor } from "@/components/features/lesson-notes/LessonNoteEditor";
import type { LessonNoteData } from "@/components/features/lesson-notes/types";
import type { LessonNoteResponse } from "@/lib/api/lessonNotes";

const addDays = (value?: string | null, days = 0) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const next = new Date(parsed.getTime() + days * 24 * 60 * 60 * 1000);
  return next.toISOString().split("T")[0];
};

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const mapLessonNoteResponse = (response: LessonNoteResponse): LessonNoteData => {
  const meetingDays = response.meeting_days ?? [];
  const plans = meetingDays.length
    ? meetingDays.map((day) => ({
        day: toTitleCase(day.day),
        strand: "",
        subStrand: "",
        phases: {
          starter: "",
          main: "",
          keyPoints: "",
          contentDetails: "",
          reflection: "",
        },
      }))
    : [
        {
          day: "Monday",
          strand: "",
          subStrand: "",
          phases: {
            starter: "",
            main: "",
            keyPoints: "",
            contentDetails: "",
            reflection: "",
          },
        },
      ];

  return {
    id: response.id,
    title: response.title ?? "Lesson Note",
    header: {
      classGroup: response.class_group ?? "",
      subject: response.course_uuid ?? "Selected Subject",
      weekNumber: response.edu_academic_period_id ? String(response.edu_academic_period_id) : "",
      weekEnding: response.week_start ? addDays(response.week_start, 6) : "",
      classSize: "",
      duration: meetingDays[0]?.duration ?? "",
      teacherName: "",
      school: "",
      district: "",
    },
    curriculumLinks: {
      strands: [],
      subStrands: [],
      contentStandards: [],
      indicators: [],
    },
    resources: {
      references: [],
      teachingLearningMaterials: [],
    },
    coreCompetencies: [],
    dailyPlans: plans,
  };
};

export default function LessonNoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isOpen } = useSidebarStore();
  const takeDraft = useLessonNoteDraftStore((state) => state.takeDraft);
  const lessonId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [lessonNote, setLessonNote] = useState<LessonNoteResponse | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!lessonId) {
      setIsHydrated(true);
      return;
    }

    const draft = takeDraft(String(lessonId));
    if (draft) {
      setLessonNote(draft);
    }
    setIsHydrated(true);
  }, [lessonId, takeDraft]);

  const noteData = useMemo(() => {
    if (!lessonNote) return null;
    return mapLessonNoteResponse(lessonNote);
  }, [lessonNote]);

  if (!isHydrated) {
    return null;
  }

  if (!noteData) {
    return (
      <div className={`flex flex-col min-h-[calc(100vh-3.5rem)] transition-all duration-300 ${isOpen ? "pl-40" : "pl-0"}`}>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                We couldn't find this lesson note yet. Please generate a new lesson note from the form.
              </p>
              <Button className="mt-4" variant="outline" onClick={() => router.push("/lesson-notes")}>Back to Lesson Notes</Button>
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-[calc(100vh-3.5rem)] transition-all duration-300 ${isOpen ? "pl-40" : "pl-0"}`}>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 pb-20">
            <LessonNoteEditor initialNote={noteData} onBack={() => router.push("/lesson-notes")} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
