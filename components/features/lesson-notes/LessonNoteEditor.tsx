"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LessonNoteCurriculumSection } from "./LessonNoteCurriculumSection";
import { LessonNoteDailyPlansTable } from "./LessonNoteDailyPlansTable";
import { LessonNoteHeaderTable } from "./LessonNoteHeaderTable";
import { LessonNoteResourcesSection } from "./LessonNoteResourcesSection";
import {
  LessonNoteCurriculumLinks,
  LessonNoteData,
  LessonNoteDailyPlan,
  LessonNoteHeaderData,
  LessonNoteResources,
} from "./types";

interface LessonNoteEditorProps {
  initialNote: LessonNoteData;
  onBack?: () => void;
}

export function LessonNoteEditor({ initialNote, onBack }: LessonNoteEditorProps) {
  const [note, setNote] = useState<LessonNoteData>(initialNote);

  const updateHeader = (key: keyof LessonNoteHeaderData, value: string) => {
    setNote((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        [key]: value,
      },
    }));
  };

  const updateCurriculum = (key: keyof LessonNoteCurriculumLinks, value: string[]) => {
    setNote((prev) => ({
      ...prev,
      curriculumLinks: {
        ...prev.curriculumLinks,
        [key]: value,
      },
    }));
  };

  const updateResources = (key: keyof LessonNoteResources, value: string[]) => {
    setNote((prev) => ({
      ...prev,
      resources: {
        ...prev.resources,
        [key]: value,
      },
    }));
  };

  const updateCoreCompetencies = (value: string[]) => {
    setNote((prev) => ({
      ...prev,
      coreCompetencies: value,
    }));
  };

  const updatePlan = (index: number, next: LessonNoteDailyPlan) => {
    setNote((prev) => ({
      ...prev,
      dailyPlans: prev.dailyPlans.map((plan, idx) => (idx === index ? next : plan)),
    }));
  };

  return (
    <Card className="border-borderColorPrimary bg-backgroundSecondary">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lesson Note</p>
            <CardTitle className="text-xl text-foreground">{note.title}</CardTitle>
            <CardDescription className="text-xs">
              {note.header.subject} - {note.header.classGroup} - Week {note.header.weekNumber}
            </CardDescription>
          </div>
          {onBack ? (
            <Button variant="outline" size="sm" onClick={onBack}>
              Back to Lesson Notes
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Lesson Header</h3>
          <LessonNoteHeaderTable data={note.header} onUpdate={updateHeader} />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Curriculum Links</h3>
          <LessonNoteCurriculumSection data={note.curriculumLinks} onUpdate={updateCurriculum} />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Resources and Competencies</h3>
          <LessonNoteResourcesSection
            data={note.resources}
            coreCompetencies={note.coreCompetencies}
            onUpdateResource={updateResources}
            onUpdateCoreCompetencies={updateCoreCompetencies}
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Daily Plans</h3>
          <LessonNoteDailyPlansTable plans={note.dailyPlans} onUpdatePlan={updatePlan} />
        </div>
      </CardContent>
    </Card>
  );
}
