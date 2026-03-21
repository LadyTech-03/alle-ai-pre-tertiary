export interface LessonNoteHeaderData {
  classGroup: string;
  subject: string;
  weekNumber: string;
  weekEnding: string;
  classSize: string;
  duration: string;
  teacherName: string;
  school: string;
  district: string;
}

export interface LessonNoteCurriculumLinks {
  strands: string[];
  subStrands: string[];
  contentStandards: string[];
  indicators: string[];
}

export interface LessonNoteResources {
  references: string[];
  teachingLearningMaterials: string[];
}

export interface LessonNoteDailyPlanPhases {
  starter: string;
  main: string;
  keyPoints: string;
  contentDetails: string;
  reflection: string;
}

export interface LessonNoteDailyPlan {
  day: string;
  strand: string;
  subStrand: string;
  phases: LessonNoteDailyPlanPhases;
}

export interface LessonNoteData {
  id: number;
  title: string;
  header: LessonNoteHeaderData;
  curriculumLinks: LessonNoteCurriculumLinks;
  resources: LessonNoteResources;
  coreCompetencies: string[];
  dailyPlans: LessonNoteDailyPlan[];
}
