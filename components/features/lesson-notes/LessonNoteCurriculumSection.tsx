import { EditableCell } from "./EditableCell";
import { LessonNoteCurriculumLinks } from "./types";

interface LessonNoteCurriculumSectionProps {
  data: LessonNoteCurriculumLinks;
  onUpdate: (key: keyof LessonNoteCurriculumLinks, value: string[]) => void;
}

export function LessonNoteCurriculumSection({ data, onUpdate }: LessonNoteCurriculumSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-borderColorPrimary">
      <div className="grid grid-cols-[180px_1fr]">
        <div className="border border-borderColorPrimary bg-muted/40 p-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Strands
        </div>
        <div className="border border-borderColorPrimary p-2">
          <EditableCell
            value={data.strands}
            list
            onSave={(value) => onUpdate("strands", value as string[])}
            placeholder="Add strands"
          />
        </div>
      </div>
      <div className="grid grid-cols-[180px_1fr]">
        <div className="border border-borderColorPrimary bg-muted/40 p-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Sub-strands
        </div>
        <div className="border border-borderColorPrimary p-2">
          <EditableCell
            value={data.subStrands}
            list
            onSave={(value) => onUpdate("subStrands", value as string[])}
            placeholder="Add sub-strands"
          />
        </div>
      </div>
      <div className="grid grid-cols-[180px_1fr]">
        <div className="border border-borderColorPrimary bg-muted/40 p-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Content Standards
        </div>
        <div className="border border-borderColorPrimary p-2">
          <EditableCell
            value={data.contentStandards}
            list
            onSave={(value) => onUpdate("contentStandards", value as string[])}
            placeholder="Add content standards"
          />
        </div>
      </div>
      <div className="grid grid-cols-[180px_1fr]">
        <div className="border border-borderColorPrimary bg-muted/40 p-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Indicators
        </div>
        <div className="border border-borderColorPrimary p-2">
          <EditableCell
            value={data.indicators}
            list
            onSave={(value) => onUpdate("indicators", value as string[])}
            placeholder="Add indicators"
          />
        </div>
      </div>
    </div>
  );
}
