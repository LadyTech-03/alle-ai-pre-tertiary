import { EditableCell } from "./EditableCell";
import { LessonNoteResources } from "./types";

interface LessonNoteResourcesSectionProps {
  data: LessonNoteResources;
  coreCompetencies: string[];
  onUpdateResource: (key: keyof LessonNoteResources, value: string[]) => void;
  onUpdateCoreCompetencies: (value: string[]) => void;
}

const spanClass: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
};

export function LessonNoteResourcesSection({
  data,
  coreCompetencies,
  onUpdateResource,
  onUpdateCoreCompetencies,
}: LessonNoteResourcesSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-borderColorPrimary">
      <div className="grid grid-cols-6">
        <div className={`border border-borderColorPrimary bg-muted/40 p-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground ${spanClass[1]}`}>
          References
        </div>
        <div className={`border border-borderColorPrimary p-2 ${spanClass[5]}`}>
          <EditableCell
            value={data.references}
            list
            onSave={(value) => onUpdateResource("references", value as string[])}
            placeholder="Add reference materials"
          />
        </div>
      </div>
      <div className="grid grid-cols-6">
        <div className={`border border-borderColorPrimary bg-muted/40 p-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground ${spanClass[1]}`}>
          Teaching / Learning Resources
        </div>
        <div className={`border border-borderColorPrimary p-2 ${spanClass[2]}`}>
          <EditableCell
            value={data.teachingLearningMaterials}
            list
            onSave={(value) => onUpdateResource("teachingLearningMaterials", value as string[])}
            placeholder="Add resources"
          />
        </div>
        <div className={`border border-borderColorPrimary bg-muted/40 p-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground ${spanClass[1]}`}>
          Core Competencies
        </div>
        <div className={`border border-borderColorPrimary p-2 ${spanClass[2]}`}>
          <EditableCell
            value={coreCompetencies}
            list
            onSave={(value) => onUpdateCoreCompetencies(value as string[])}
            placeholder="Add competencies"
          />
        </div>
      </div>
    </div>
  );
}
