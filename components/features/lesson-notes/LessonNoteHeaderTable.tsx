import type { ReactNode } from "react";
import { EditableCell } from "./EditableCell";
import { LessonNoteHeaderData } from "./types";
import { cn } from "@/lib/utils";

interface LessonNoteHeaderTableProps {
  data: LessonNoteHeaderData;
  onUpdate: (key: keyof LessonNoteHeaderData, value: string) => void;
}

const spanClass: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
};

const labelStyles = "bg-muted/40 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";
const cellStyles = "border border-borderColorPrimary p-2";

const HeaderCell = ({ children, span = 1 }: { children: ReactNode; span?: number }) => (
  <div className={cn(cellStyles, labelStyles, spanClass[span])}>{children}</div>
);

const ValueCell = ({ children, span = 1 }: { children: ReactNode; span?: number }) => (
  <div className={cn(cellStyles, spanClass[span])}>{children}</div>
);

export function LessonNoteHeaderTable({ data, onUpdate }: LessonNoteHeaderTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-borderColorPrimary">
      <div className="grid grid-cols-6">
        <HeaderCell>Week Ending</HeaderCell>
        <ValueCell span={5}>
          <EditableCell
            value={data.weekEnding}
            onSave={(value) => onUpdate("weekEnding", value as string)}
            placeholder="Enter week ending"
          />
        </ValueCell>
      </div>
      <div className="grid grid-cols-6">
        <HeaderCell>Class</HeaderCell>
        <ValueCell>
          <EditableCell
            value={data.classGroup}
            onSave={(value) => onUpdate("classGroup", value as string)}
            placeholder="Class"
          />
        </ValueCell>
        <HeaderCell>Class Size</HeaderCell>
        <ValueCell>
          <EditableCell
            value={data.classSize}
            onSave={(value) => onUpdate("classSize", value as string)}
            placeholder="Class size"
          />
        </ValueCell>
        <HeaderCell>Duration</HeaderCell>
        <ValueCell>
          <EditableCell
            value={data.duration}
            onSave={(value) => onUpdate("duration", value as string)}
            placeholder="Duration"
          />
        </ValueCell>
      </div>
      <div className="grid grid-cols-6">
        <HeaderCell>Subject</HeaderCell>
        <ValueCell span={5}>
          <EditableCell
            value={data.subject}
            onSave={(value) => onUpdate("subject", value as string)}
            placeholder="Subject"
          />
        </ValueCell>
      </div>
      <div className="grid grid-cols-6">
        <HeaderCell>Week Number</HeaderCell>
        <ValueCell>
          <EditableCell
            value={data.weekNumber}
            onSave={(value) => onUpdate("weekNumber", value as string)}
            placeholder="Week"
          />
        </ValueCell>
        <HeaderCell>Teacher Name</HeaderCell>
        <ValueCell>
          <EditableCell
            value={data.teacherName}
            onSave={(value) => onUpdate("teacherName", value as string)}
            placeholder="Teacher name"
          />
        </ValueCell>
        <HeaderCell>School</HeaderCell>
        <ValueCell>
          <EditableCell
            value={data.school}
            onSave={(value) => onUpdate("school", value as string)}
            placeholder="School"
          />
        </ValueCell>
      </div>
      <div className="grid grid-cols-6">
        <HeaderCell>District</HeaderCell>
        <ValueCell span={5}>
          <EditableCell
            value={data.district}
            onSave={(value) => onUpdate("district", value as string)}
            placeholder="District"
          />
        </ValueCell>
      </div>
    </div>
  );
}



