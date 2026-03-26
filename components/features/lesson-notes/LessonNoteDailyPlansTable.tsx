import { EditableCell } from "./EditableCell";
import { LessonNoteDailyPlan } from "./types";

interface LessonNoteDailyPlansTableProps {
  plans: LessonNoteDailyPlan[];
  onUpdatePlan: (index: number, next: LessonNoteDailyPlan) => void;
}

const sectionTitleStyles = "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";

export function LessonNoteDailyPlansTable({ plans, onUpdatePlan }: LessonNoteDailyPlansTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-borderColorPrimary">
      <div className="grid grid-cols-[160px_1fr_1.4fr_1fr] border-b border-borderColorPrimary bg-muted/40 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <div className="border-r border-borderColorPrimary p-2">Day / Date</div>
        <div className="border-r border-borderColorPrimary p-2">Phase 1: Starter</div>
        <div className="border-r border-borderColorPrimary p-2">Phase 2: Main</div>
        <div className="p-2">Phase 3: Reflection</div>
      </div>
      {plans.map((plan, index) => (
        <div
          key={`${plan.day}-${index}`}
          className="grid grid-cols-[160px_1fr_1.4fr_1fr] border-b border-borderColorPrimary"
        >
          <div className="border-r border-borderColorPrimary p-3">
            <div className="space-y-3">
              <div>
                <EditableCell
                  value={plan.day}
                  onSave={(value) =>
                    onUpdatePlan(index, { ...plan, day: value as string })
                  }
                  placeholder="Day"
                />
              </div>
              {/* <div>
                <p className={sectionTitleStyles}>Strand</p>
                <EditableCell
                  value={plan.strand}
                  onSave={(value) =>
                    onUpdatePlan(index, { ...plan, strand: value as string })
                  }
                  placeholder="Strand"
                />
              </div> */}
              {/* <div>
                <p className={sectionTitleStyles}>Sub-strand</p>
                <EditableCell
                  value={plan.subStrand}
                  onSave={(value) =>
                    onUpdatePlan(index, { ...plan, subStrand: value as string })
                  }
                  placeholder="Sub-strand"
                />
              </div> */}
            </div>
          </div>
          <div className="border-r border-borderColorPrimary p-3">
            <EditableCell
              value={plan.phases.starter}
              multiline
              onSave={(value) =>
                onUpdatePlan(index, {
                  ...plan,
                  phases: { ...plan.phases, starter: value as string },
                })
              }
              placeholder="Add starter activities"
            />
          </div>
          <div className="border-r border-borderColorPrimary p-3">
            <div className="space-y-3">
              <div>
                <p className={sectionTitleStyles}>Main</p>
                <EditableCell
                  value={plan.phases.main}
                  multiline
                  onSave={(value) =>
                    onUpdatePlan(index, {
                      ...plan,
                      phases: { ...plan.phases, main: value as string },
                    })
                  }
                  placeholder="Add main lesson content"
                />
              </div>
              <div>
                <p className={sectionTitleStyles}>Key Points</p>
                <EditableCell
                  value={plan.phases.keyPoints}
                  multiline
                  onSave={(value) =>
                    onUpdatePlan(index, {
                      ...plan,
                      phases: { ...plan.phases, keyPoints: value as string },
                    })
                  }
                  placeholder="Add key points"
                />
              </div>
              <div>
                <p className={sectionTitleStyles}>Content Details</p>
                <EditableCell
                  value={plan.phases.contentDetails}
                  multiline
                  onSave={(value) =>
                    onUpdatePlan(index, {
                      ...plan,
                      phases: { ...plan.phases, contentDetails: value as string },
                    })
                  }
                  placeholder="Add content details"
                />
              </div>
            </div>
          </div>
          <div className="p-3">
            <EditableCell
              value={plan.phases.reflection}
              multiline
              onSave={(value) =>
                onUpdatePlan(index, {
                  ...plan,
                  phases: { ...plan.phases, reflection: value as string },
                })
              }
              placeholder="Add reflection notes"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
