"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useOrgSessionStore, useSidebarStore } from "@/stores";
import { useLessonNoteDraftStore } from "@/stores/lessonNoteDraftStore";
import { lessonNotesApi } from "@/lib/api/lessonNotes";
import { LessonNoteEditor } from "@/components/features/lesson-notes/LessonNoteEditor";
import type { LessonNoteData } from "@/components/features/lesson-notes/types";
import type { LessonNoteBody, LessonNoteBodyHeader, LessonNoteResponse } from "@/lib/api/lessonNotes";

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

const normalizeBody = (body: LessonNoteResponse["body"]): LessonNoteBody | null => {
  if (!body) return null;
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as LessonNoteBody;
    } catch {
      return null;
    }
  }
  if (typeof body === "object") {
    return body as LessonNoteBody;
  }
  return null;
};

const mapLessonNoteResponse = (response: LessonNoteResponse): LessonNoteData => {
  const meetingDays = response.meeting_days ?? [];
  const headerBody = normalizeBody(response.body)?.header;
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
      classGroup: headerBody?.class ?? "",
      subject: headerBody?.subject ?? "",
      weekNumber: headerBody?.week_number ?? "",
      weekEnding: headerBody?.week_ending ??  "",
      classSize: headerBody?.class_size ?? "",
      duration: headerBody?.duration ?? "",
      teacherName: headerBody?.teacher_name ?? "",
      school: headerBody?.school ?? "",
      district: headerBody?.district ?? "",
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
  const { orgId } = useOrgSessionStore();
  const takeDraft = useLessonNoteDraftStore((state) => state.takeDraft);
  const lessonId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [lessonNote, setLessonNote] = useState<LessonNoteResponse | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isGeneratingHeader, setIsGeneratingHeader] = useState(false);

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
    console.log(lessonNote, 'Raw lesson note response');
    if (!lessonNote) return null;
    console.log(mapLessonNoteResponse(lessonNote), 'Mapped lesson note');
    return mapLessonNoteResponse(lessonNote);
  }, [lessonNote]);

  const handleGenerateHeader = async () => {
    if (!lessonNote) return;
    if (!orgId) {
      toast.error("Organisation not found. Please refresh.");
      return;
    }

    setIsGeneratingHeader(true);
    try {
      const updated = await lessonNotesApi.generateSection({
        organisationId: orgId,
        noteId: lessonNote.id,
        section: "header",
      });
      setLessonNote((prev) => {
        if (!prev) return updated;
        const prevBody = normalizeBody(prev.body);
        const updatedBody = normalizeBody(updated.body);
        const nextHeader = updatedBody?.header;
        return {
          ...prev,
          body: {
            ...(prevBody ?? {}),
            ...(updatedBody ?? {}),
            header: nextHeader ?? prevBody?.header,
          },
        };
      });
      toast.success("Header generated successfully.");
    } catch {
      toast.error("Failed to generate header.");
    } finally {
      setIsGeneratingHeader(false);
    }
  };

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
                We couldn&apos;t find this lesson note yet. Please generate a new lesson note from the form.
              </p>
              <Button className="mt-4" variant="outline" onClick={() => router.push("/lesson-notes")}>
                Back to Lesson Notes
              </Button>
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
            <LessonNoteEditor
              initialNote={noteData}
              onBack={() => router.push("/lesson-notes")}
              onGenerateHeader={handleGenerateHeader}
              isGeneratingHeader={isGeneratingHeader}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
